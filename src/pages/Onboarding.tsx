import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Logo } from "@/components/Logo";
import { haptic } from "@/lib/haptics";

const Onboarding = () => {
  const { t, language, setLanguage } = useLanguage();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    height_cm: "",
    weight_kg: "",
    has_hypertension: false,
    has_diabetes: false,
    has_heart_disease: false,
    morning_ritual_time: "08:00",
    evening_ritual_time: "20:00",
  });

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          ...formData,
          height_cm: formData.height_cm ? parseInt(formData.height_cm) : null,
          weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
          onboarding_completed: true,
          language: language,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Create initial daily check-in streak
      await supabase.from("streaks").insert({
        user_id: user.id,
        type: "daily_checkin",
        count: 0,
        last_logged_at: new Date().toISOString(),
      });

      toast.success(t("onboarding.success"));
      haptic('success');
      window.location.href = "/app/home";
    } catch (error) {
      console.error("Onboarding error:", error);
      haptic('error');
      toast.error(t("onboarding.error"));
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Logo size="lg" showText={false} className="mx-auto" />
              <h2 className="text-2xl font-bold">{t("onboarding.welcome")}</h2>
              <p className="text-muted-foreground">{t("onboarding.subtitle")}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>{t("onboarding.language")}</Label>
                <Select value={language} onValueChange={(value) => setLanguage(value as "en" | "hi")}>
                  <SelectTrigger className="h-14">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => setStep(2)} size="lg" className="w-full h-14">
                {t("onboarding.continue")}
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t("onboarding.basicInfo")}</h2>
              <p className="text-muted-foreground">{t("onboarding.basicInfoDesc")}</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>{t("onboarding.fullName")}</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="h-14"
                  placeholder={t("onboarding.namePlaceholder")}
                />
              </div>

              <div>
                <Label>{t("onboarding.dateOfBirth")}</Label>
                <Input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="h-14"
                />
              </div>

              <div>
                <Label>{t("onboarding.gender")}</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger className="h-14">
                    <SelectValue placeholder={t("onboarding.genderPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t("onboarding.male")}</SelectItem>
                    <SelectItem value="female">{t("onboarding.female")}</SelectItem>
                    <SelectItem value="other">{t("onboarding.other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("onboarding.height")}</Label>
                  <Input
                    type="number"
                    value={formData.height_cm}
                    onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                    className="h-14"
                    placeholder="165"
                  />
                </div>
                <div>
                  <Label>{t("onboarding.weight")}</Label>
                  <Input
                    type="number"
                    value={formData.weight_kg}
                    onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                    className="h-14"
                    placeholder="70"
                  />
                </div>
              </div>

              <Button onClick={() => setStep(3)} size="lg" className="w-full h-14">
                {t("onboarding.continue")}
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t("onboarding.healthGoals")}</h2>
              <p className="text-muted-foreground">{t("onboarding.healthGoalsDesc")}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <Checkbox
                  id="hypertension"
                  checked={formData.has_hypertension}
                  onCheckedChange={(checked) => setFormData({ ...formData, has_hypertension: checked as boolean })}
                />
                <Label htmlFor="hypertension" className="cursor-pointer">
                  {t("onboarding.hasHypertension")}
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <Checkbox
                  id="diabetes"
                  checked={formData.has_diabetes}
                  onCheckedChange={(checked) => setFormData({ ...formData, has_diabetes: checked as boolean })}
                />
                <Label htmlFor="diabetes" className="cursor-pointer">
                  {t("onboarding.hasDiabetes")}
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <Checkbox
                  id="heart_disease"
                  checked={formData.has_heart_disease}
                  onCheckedChange={(checked) => setFormData({ ...formData, has_heart_disease: checked as boolean })}
                />
                <Label htmlFor="heart_disease" className="cursor-pointer">
                  {t("onboarding.hasHeartDisease")}
                </Label>
              </div>

              <Button onClick={() => setStep(4)} size="lg" className="w-full h-14">
                {t("onboarding.continue")}
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t("onboarding.ritualTimes")}</h2>
              <p className="text-muted-foreground">{t("onboarding.ritualTimesDesc")}</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>{t("onboarding.morningTime")}</Label>
                <Input
                  type="time"
                  value={formData.morning_ritual_time}
                  onChange={(e) => setFormData({ ...formData, morning_ritual_time: e.target.value })}
                  className="h-14"
                />
              </div>

              <div>
                <Label>{t("onboarding.eveningTime")}</Label>
                <Input
                  type="time"
                  value={formData.evening_ritual_time}
                  onChange={(e) => setFormData({ ...formData, evening_ritual_time: e.target.value })}
                  className="h-14"
                />
              </div>

              <Button onClick={handleSubmit} size="lg" className="w-full h-14">
                {t("onboarding.finish")}
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-between items-center mb-4">
            <Logo size="md" />
            <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">{step}/4</span>
          </div>
          <CardDescription className="text-base">{t("app.tagline")}</CardDescription>
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  s === step ? "bg-primary w-6" : s < step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;