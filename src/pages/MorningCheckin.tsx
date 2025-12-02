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
import { haptic } from "@/lib/haptics";
import { useNavigate } from "react-router-dom";

const healthDataSchema = z.object({
  bpSystolic: z.number().int().min(40, "Systolic must be at least 40").max(300, "Systolic must be at most 300"),
  bpDiastolic: z.number().int().min(20, "Diastolic must be at least 20").max(200, "Diastolic must be at most 200"),
  fastingSugar: z.number().int().min(20, "Sugar must be at least 20").max(600, "Sugar must be at most 600").optional(),
  sleepQuality: z.number().int().min(0).max(4),
});

const MorningCheckin = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { calculateScore } = useHeartScore();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    bpSystolic: "",
    bpDiastolic: "",
    fastingSugar: "",
    sleepQuality: "2",
    medsTaken: false,
  });

  const handleNext = () => {
    haptic('light');
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    haptic('light');
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate("/app/home");
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
        fastingSugar: data.fastingSugar ? parseInt(data.fastingSugar) : undefined,
        sleepQuality: parseInt(data.sleepQuality),
      };

      // Only validate if BP data is provided
      if (data.bpSystolic && data.bpDiastolic) {
        const validation = healthDataSchema.safeParse(validationData);
        if (!validation.success) {
          const errors = validation.error.errors.map(e => e.message).join(", ");
          haptic('error');
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
          ritual_type: "morning",
        });
      }

      // Save Sugar (validate separately if provided)
      if (data.fastingSugar) {
        const sugarValue = parseInt(data.fastingSugar);
        if (sugarValue < 20 || sugarValue > 600) {
          toast.error("Sugar reading must be between 20 and 600 mg/dL");
          return;
        }
        await supabase.from("sugar_logs").insert({
          user_id: user.id,
          glucose_mg_dl: sugarValue,
          measured_at: now,
          measurement_type: "fasting",
          ritual_type: "morning",
        });
      }

      // Save Behavior (sleep, meds)
      await supabase.from("behavior_logs").insert({
        user_id: user.id,
        log_date: new Date().toISOString().split("T")[0],
        ritual_type: "morning",
        sleep_quality: ["very_poor", "poor", "fair", "good", "excellent"][parseInt(data.sleepQuality)] as any,
        meds_taken: data.medsTaken,
      });

      // Update streak for morning ritual
      try {
        await supabase.rpc('update_or_create_streak', {
          p_user_id: user.id,
          p_type: 'morning_ritual'
        });
        
        // Check if both rituals are now complete
        const today = new Date().toISOString().split("T")[0];
        const { data: eveningLog } = await supabase
          .from("behavior_logs")
          .select("*")
          .eq("user_id", user.id)
          .eq("log_date", today)
          .eq("ritual_type", "evening")
          .single();
        
        // If both complete, update daily checkin streak
        if (eveningLog) {
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

      haptic('success');
      toast.success(t("checkin.completedSuccess") + " 🎉");
      
      // Delay navigation to show toast and confetti
      setTimeout(() => {
        navigate("/app/home");
      }, 1000);
    } catch (error) {
      console.error("Error saving morning ritual:", error);
      haptic('error');
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
            <span className="font-semibold text-sm md:text-base">{t("ritual.morning")}</span>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-8 max-w-2xl">
        <div className="mb-6 md:mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-xs md:text-sm text-muted-foreground">
              {t("checkin.step")} {step} {t("checkin.of")} 4
            </span>
            <span className="text-xs md:text-sm font-medium">{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary transition-smooth"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        <Card className="p-8 shadow-elevated">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{t("checkin.bloodPressure")}</h2>
                <p className="text-muted-foreground">{t("checkin.enterMorningBP")}</p>
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
                <h2 className="text-2xl font-bold mb-2">{t("checkin.fastingSugar")}</h2>
                <p className="text-muted-foreground">{t("checkin.enterSugar")}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sugar">{t("checkin.fastingSugar")} ({t("checkin.optional")})</Label>
                <Input
                  id="sugar"
                  type="number"
                  placeholder="100"
                  value={data.fastingSugar}
                  onChange={(e) => setData({ ...data, fastingSugar: e.target.value })}
                  className="h-14 text-xl text-center"
                />
                <p className="text-xs text-muted-foreground text-center">{t("checkin.mgdL")}</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{t("checkin.sleepQuality")}</h2>
                <p className="text-muted-foreground">{t("checkin.howDidYouSleep")}</p>
              </div>
              <div className="space-y-4">
                <input
                  type="range"
                  min="0"
                  max="4"
                  value={data.sleepQuality}
                  onChange={(e) => setData({ ...data, sleepQuality: e.target.value })}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-sm">
                  <span className={data.sleepQuality === "0" ? "font-bold text-primary" : "text-muted-foreground"}>
                    {t("checkin.veryPoor")}
                  </span>
                  <span className={data.sleepQuality === "1" ? "font-bold text-primary" : "text-muted-foreground"}>
                    {t("checkin.poor")}
                  </span>
                  <span className={data.sleepQuality === "2" ? "font-bold text-primary" : "text-muted-foreground"}>
                    {t("checkin.fair")}
                  </span>
                  <span className={data.sleepQuality === "3" ? "font-bold text-primary" : "text-muted-foreground"}>
                    {t("checkin.good")}
                  </span>
                  <span className={data.sleepQuality === "4" ? "font-bold text-primary" : "text-muted-foreground"}>
                    {t("checkin.excellent")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
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
            {step < 4 ? (
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

export default MorningCheckin;
