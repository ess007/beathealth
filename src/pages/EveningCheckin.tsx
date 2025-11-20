import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useHeartScore } from "@/hooks/useHeartScore";
import { Logo } from "@/components/Logo";
import { z } from "zod";

const healthDataSchema = z.object({
  bpSystolic: z.number().int().min(40, "Systolic must be at least 40").max(300, "Systolic must be at most 300"),
  bpDiastolic: z.number().int().min(20, "Diastolic must be at least 20").max(200, "Diastolic must be at most 200"),
  randomSugar: z.number().int().min(20, "Sugar must be at least 20").max(600, "Sugar must be at most 600").optional(),
  stepsCount: z.number().int().min(0, "Steps must be at least 0").max(100000, "Steps must be reasonable").optional(),
  stressLevel: z.number().int().min(0).max(3),
});

const EveningCheckin = () => {
  const { t } = useLanguage();
  const { calculateScore } = useHeartScore();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    bpSystolic: "",
    bpDiastolic: "",
    randomSugar: "",
    stepsCount: "",
    stressLevel: "2",
    medsTaken: false,
  });

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      window.location.href = "/app/home";
    }
  };

  const handleComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Validate input data
      const validationData = {
        bpSystolic: data.bpSystolic ? parseInt(data.bpSystolic) : undefined,
        bpDiastolic: data.bpDiastolic ? parseInt(data.bpDiastolic) : undefined,
        randomSugar: data.randomSugar ? parseInt(data.randomSugar) : undefined,
        stepsCount: data.stepsCount ? parseInt(data.stepsCount) : undefined,
        stressLevel: parseInt(data.stressLevel),
      };

      // Only validate if BP data is provided
      if (data.bpSystolic && data.bpDiastolic) {
        const validation = healthDataSchema.safeParse(validationData);
        if (!validation.success) {
          const errors = validation.error.errors.map(e => e.message).join(", ");
          toast.error(errors);
          return;
        }
      }

      const now = new Date().toISOString();

      // Save BP
      if (data.bpSystolic && data.bpDiastolic) {
        await supabase.from("bp_logs").insert({
          user_id: user.id,
          systolic: parseInt(data.bpSystolic),
          diastolic: parseInt(data.bpDiastolic),
          measured_at: now,
          ritual_type: "evening",
        });
      }

      // Save Sugar (validate separately if provided)
      if (data.randomSugar) {
        const sugarValue = parseInt(data.randomSugar);
        if (sugarValue < 20 || sugarValue > 600) {
          toast.error("Sugar reading must be between 20 and 600 mg/dL");
          return;
        }
        await supabase.from("sugar_logs").insert({
          user_id: user.id,
          glucose_mg_dl: sugarValue,
          measured_at: now,
          measurement_type: "random",
          ritual_type: "evening",
        });
      }

      // Validate steps if provided
      if (data.stepsCount) {
        const stepsValue = parseInt(data.stepsCount);
        if (stepsValue < 0 || stepsValue > 100000) {
          toast.error("Steps count must be between 0 and 100,000");
          return;
        }
      }

      // Save Behavior (steps, stress, meds)
      await supabase.from("behavior_logs").insert({
        user_id: user.id,
        log_date: new Date().toISOString().split("T")[0],
        ritual_type: "evening",
        steps_count: data.stepsCount ? parseInt(data.stepsCount) : null,
        stress_level: ["low", "moderate", "high", "very_high"][parseInt(data.stressLevel)] as any,
        meds_taken: data.medsTaken,
      });

      // Update streak for evening ritual
      try {
        await supabase.rpc('update_or_create_streak', {
          p_user_id: user.id,
          p_type: 'evening_ritual'
        });
        
        // Check if both rituals are now complete
        const today = new Date().toISOString().split("T")[0];
        const { data: morningLog } = await supabase
          .from("behavior_logs")
          .select("*")
          .eq("user_id", user.id)
          .eq("log_date", today)
          .eq("ritual_type", "morning")
          .single();
        
        // If both complete, update daily checkin streak
        if (morningLog) {
          await supabase.rpc('update_or_create_streak', {
            p_user_id: user.id,
            p_type: 'daily_checkin'
          });
        }
      } catch (streakError) {
        console.error("Error updating streak:", streakError);
      }

      // Calculate HeartScore
      calculateScore(undefined);

      // Trigger confetti celebration
      const { default: confetti } = await import('canvas-confetti');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E63946', '#FF6B6B', '#2EC4B6'],
      });

      toast.success(t("checkin.completedSuccess") + " 🎉");
      
      // Delay navigation to show toast and confetti
      setTimeout(() => {
        window.location.href = "/app/home";
      }, 1000);
    } catch (error) {
      console.error("Error saving evening ritual:", error);
      toast.error("Failed to save data. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Logo size="sm" showText={false} />
            <span className="font-semibold text-sm md:text-base">{t("ritual.evening")}</span>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-8 max-w-2xl">
        <div className="mb-6 md:mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-xs md:text-sm text-muted-foreground">
              {t("checkin.step")} {step} {t("checkin.of")} 5
            </span>
            <span className="text-xs md:text-sm font-medium">{Math.round((step / 5) * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary transition-smooth"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        <Card className="p-8 shadow-elevated">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{t("checkin.bloodPressure")}</h2>
                <p className="text-muted-foreground">{t("checkin.enterEveningBP")}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="systolic">{t("checkin.systolic")}</Label>
                  <Input
                    id="systolic"
                    type="number"
                    placeholder="120"
                    value={data.bpSystolic}
                    onChange={(e) => setData({ ...data, bpSystolic: e.target.value })}
                    className="h-14 text-xl text-center"
                  />
                  <p className="text-xs text-muted-foreground text-center">{t("checkin.mmHg")}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diastolic">{t("checkin.diastolic")}</Label>
                  <Input
                    id="diastolic"
                    type="number"
                    placeholder="80"
                    value={data.bpDiastolic}
                    onChange={(e) => setData({ ...data, bpDiastolic: e.target.value })}
                    className="h-14 text-xl text-center"
                  />
                  <p className="text-xs text-muted-foreground text-center">{t("checkin.mmHg")}</p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{t("checkin.randomSugar")}</h2>
                <p className="text-muted-foreground">{t("checkin.enterSugar")}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sugar">{t("checkin.randomSugar")} ({t("checkin.optional")})</Label>
                <Input
                  id="sugar"
                  type="number"
                  placeholder="120"
                  value={data.randomSugar}
                  onChange={(e) => setData({ ...data, randomSugar: e.target.value })}
                  className="h-14 text-xl text-center"
                />
                <p className="text-xs text-muted-foreground text-center">{t("checkin.mgdL")}</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{t("checkin.stepsCount")}</h2>
                <p className="text-muted-foreground">{t("checkin.enterSteps")}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="steps">{t("checkin.stepsCount")}</Label>
                <Input
                  id="steps"
                  type="number"
                  placeholder="5000"
                  value={data.stepsCount}
                  onChange={(e) => setData({ ...data, stepsCount: e.target.value })}
                  className="h-14 text-xl text-center"
                />
                <p className="text-xs text-muted-foreground text-center">{t("checkin.steps")}</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{t("checkin.stressLevel")}</h2>
                <p className="text-muted-foreground">{t("checkin.howStressed")}</p>
              </div>
              <div className="space-y-4">
                <input
                  type="range"
                  min="0"
                  max="3"
                  value={data.stressLevel}
                  onChange={(e) => setData({ ...data, stressLevel: e.target.value })}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-sm">
                  <span className={data.stressLevel === "0" ? "font-bold text-primary" : "text-muted-foreground"}>
                    {t("checkin.low")}
                  </span>
                  <span className={data.stressLevel === "1" ? "font-bold text-primary" : "text-muted-foreground"}>
                    {t("checkin.moderate")}
                  </span>
                  <span className={data.stressLevel === "2" ? "font-bold text-primary" : "text-muted-foreground"}>
                    {t("checkin.high")}
                  </span>
                  <span className={data.stressLevel === "3" ? "font-bold text-primary" : "text-muted-foreground"}>
                    {t("checkin.veryHigh")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{t("checkin.medications")}</h2>
                <p className="text-muted-foreground">{t("checkin.didYouTakeMeds")}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={data.medsTaken ? "default" : "outline"}
                  size="lg"
                  onClick={() => setData({ ...data, medsTaken: true })}
                  className="h-20 text-lg"
                >
                  <Check className="w-6 h-6 mr-2" />
                  {t("checkin.yes")}
                </Button>
                <Button
                  variant={!data.medsTaken ? "default" : "outline"}
                  size="lg"
                  onClick={() => setData({ ...data, medsTaken: false })}
                  className="h-20 text-lg"
                >
                  {t("checkin.no")}
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-8">
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t("checkin.back")}
            </Button>
            {step < 5 ? (
              <Button onClick={handleNext} className="flex-1">
                {t("checkin.next")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="flex-1">
                <Check className="w-5 h-5 mr-2" />
                {t("checkin.complete")}
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default EveningCheckin;
