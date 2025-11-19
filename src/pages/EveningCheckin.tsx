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

      // Save Sugar
      if (data.randomSugar) {
        await supabase.from("sugar_logs").insert({
          user_id: user.id,
          glucose_mg_dl: parseInt(data.randomSugar),
          measured_at: now,
          measurement_type: "random",
          ritual_type: "evening",
        });
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

      // Calculate HeartScore
      calculateScore(undefined);

      toast.success(t("checkin.completedSuccess"));
      window.location.href = "/app/home";
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
