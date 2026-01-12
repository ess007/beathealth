import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Logo } from "@/components/Logo";
import { haptic } from "@/lib/haptics";
import { 
  Heart, 
  Droplet, 
  Activity, 
  Sun, 
  Moon, 
  Watch, 
  Smartphone, 
  ArrowRight, 
  ArrowLeft,
  Check,
  User,
  Calendar,
  Sparkles
} from "lucide-react";

const Onboarding = () => {
  const { t, language, setLanguage } = useLanguage();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    has_hypertension: false,
    has_diabetes: false,
    has_heart_disease: false,
    morning_ritual_time: "08:00",
    evening_ritual_time: "20:00",
  });
  const [connectedDevices, setConnectedDevices] = useState<string[]>([]);

  const TOTAL_STEPS = 6;

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({
          ...formData,
          onboarding_completed: true,
          language: language,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Create initial streaks
      await supabase.from("streaks").insert({
        user_id: user.id,
        type: "daily_checkin",
        count: 0,
        last_logged_at: new Date().toISOString(),
      });

      // Add connected devices to data_sources
      for (const device of connectedDevices) {
        await supabase.from("data_sources").insert({
          user_id: user.id,
          type: device,
          status: "pending",
        });
      }

      toast.success(language === 'hi' ? "स्वागत है! चलिए शुरू करते हैं" : "Welcome! Let's get started");
      haptic('success');
      window.location.href = "/app/coach";
    } catch (error) {
      console.error("Onboarding error:", error);
      haptic('error');
      toast.error(language === 'hi' ? "कुछ गलत हुआ" : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    haptic('light');
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    haptic('light');
    if (step > 1) setStep(step - 1);
  };

  const toggleCondition = (condition: 'has_hypertension' | 'has_diabetes' | 'has_heart_disease') => {
    haptic('light');
    setFormData(prev => ({ ...prev, [condition]: !prev[condition] }));
  };

  const toggleDevice = (device: string) => {
    haptic('light');
    setConnectedDevices(prev => 
      prev.includes(device) 
        ? prev.filter(d => d !== device) 
        : [...prev, device]
    );
  };

  const renderStep = () => {
    switch (step) {
      // Step 1: Welcome & Language
      case 1:
        return (
          <div className="space-y-8 text-center animate-fade-in">
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl">
                <Logo size="lg" showText={false} />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {language === 'hi' ? 'नमस्ते! मैं Beat हूं 👋' : 'Namaste! I\'m Beat 👋'}
                </h1>
                <p className="text-muted-foreground text-lg">
                  {language === 'hi' ? 'आपका दिल का साथी' : 'Your heart health companion'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base">{language === 'hi' ? 'अपनी भाषा चुनें' : 'Choose your language'}</Label>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => { haptic('light'); setLanguage('en'); }}
                  className={`flex-1 max-w-[160px] p-4 rounded-2xl border-2 transition-all ${
                    language === 'en' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-2xl mb-2 block">🇬🇧</span>
                  <span className="font-semibold">English</span>
                </button>
                <button
                  onClick={() => { haptic('light'); setLanguage('hi'); }}
                  className={`flex-1 max-w-[160px] p-4 rounded-2xl border-2 transition-all ${
                    language === 'hi' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-2xl mb-2 block">🇮🇳</span>
                  <span className="font-semibold">हिंदी</span>
                </button>
              </div>
            </div>
          </div>
        );

      // Step 2: Personal Information
      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">
                {language === 'hi' ? 'आइए परिचय करें' : 'Let\'s get to know you'}
              </h2>
              <p className="text-muted-foreground">
                {language === 'hi' ? 'हम आपको क्या कहें?' : 'What should we call you?'}
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-base">{language === 'hi' ? 'आपका नाम' : 'Your name'}</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="h-14 text-lg rounded-xl"
                  placeholder={language === 'hi' ? 'राम शर्मा' : 'Enter your name'}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base">{language === 'hi' ? 'जन्म तिथि' : 'Date of birth'}</Label>
                <Input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="h-14 text-lg rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base">{language === 'hi' ? 'लिंग' : 'Gender'}</Label>
                <div className="flex gap-3">
                  {[
                    { value: 'male', label: language === 'hi' ? 'पुरुष' : 'Male', emoji: '👨' },
                    { value: 'female', label: language === 'hi' ? 'महिला' : 'Female', emoji: '👩' },
                    { value: 'other', label: language === 'hi' ? 'अन्य' : 'Other', emoji: '👤' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => { haptic('light'); setFormData({ ...formData, gender: option.value }); }}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                        formData.gender === option.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="text-2xl mb-1 block">{option.emoji}</span>
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      // Step 3: Health Conditions
      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">
                {language === 'hi' ? 'आपका स्वास्थ्य' : 'Your health profile'}
              </h2>
              <p className="text-muted-foreground">
                {language === 'hi' ? 'जो लागू हो उसे चुनें' : 'Select what applies to you'}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => toggleCondition('has_hypertension')}
                className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                  formData.has_hypertension
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  formData.has_hypertension ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <Activity className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-lg">
                    {language === 'hi' ? 'उच्च रक्तचाप' : 'High Blood Pressure'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'hi' ? 'हाइपरटेंशन' : 'Hypertension'}
                  </p>
                </div>
                {formData.has_hypertension && (
                  <Check className="w-6 h-6 text-primary" />
                )}
              </button>

              <button
                onClick={() => toggleCondition('has_diabetes')}
                className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                  formData.has_diabetes
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  formData.has_diabetes ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <Droplet className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-lg">
                    {language === 'hi' ? 'मधुमेह' : 'Diabetes'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'hi' ? 'शुगर की बीमारी' : 'Sugar management'}
                  </p>
                </div>
                {formData.has_diabetes && (
                  <Check className="w-6 h-6 text-primary" />
                )}
              </button>

              <button
                onClick={() => toggleCondition('has_heart_disease')}
                className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                  formData.has_heart_disease
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  formData.has_heart_disease ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <Heart className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-lg">
                    {language === 'hi' ? 'हृदय रोग' : 'Heart Disease'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'hi' ? 'दिल की कोई समस्या' : 'Any heart condition'}
                  </p>
                </div>
                {formData.has_heart_disease && (
                  <Check className="w-6 h-6 text-primary" />
                )}
              </button>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-4">
              {language === 'hi' 
                ? 'यह जानकारी सुरक्षित है और आपकी सेहत को बेहतर समझने में मदद करती है'
                : 'This helps us personalize your experience. Your data is secure.'}
            </p>
          </div>
        );

      // Step 4: Device Connection
      case 4:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                <Watch className="w-8 h-8 text-secondary" />
              </div>
              <h2 className="text-2xl font-bold">
                {language === 'hi' ? 'डिवाइस जोड़ें' : 'Connect your devices'}
              </h2>
              <p className="text-muted-foreground">
                {language === 'hi' ? 'ऑटो सिंक के लिए (वैकल्पिक)' : 'For auto-sync (optional)'}
              </p>
            </div>

            <div className="space-y-3">
              {[
                { id: 'bp_monitor', icon: Activity, label: language === 'hi' ? 'BP मॉनिटर' : 'BP Monitor', desc: 'Omron, Dr. Morepen' },
                { id: 'glucometer', icon: Droplet, label: language === 'hi' ? 'ग्लूकोमीटर' : 'Glucometer', desc: 'Accu-Chek, OneTouch' },
                { id: 'wearable_generic', icon: Watch, label: language === 'hi' ? 'स्मार्टवॉच' : 'Smartwatch', desc: 'Apple, Samsung, Fitbit' },
                { id: 'health_connect', icon: Smartphone, label: 'Health Connect', desc: 'Android' },
              ].map((device) => (
                <button
                  key={device.id}
                  onClick={() => toggleDevice(device.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                    connectedDevices.includes(device.id)
                      ? 'border-secondary bg-secondary/10'
                      : 'border-border hover:border-secondary/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    connectedDevices.includes(device.id) ? 'bg-secondary text-secondary-foreground' : 'bg-muted'
                  }`}>
                    <device.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">{device.label}</p>
                    <p className="text-xs text-muted-foreground">{device.desc}</p>
                  </div>
                  {connectedDevices.includes(device.id) && (
                    <Check className="w-5 h-5 text-secondary" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={nextStep}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground py-2"
            >
              {language === 'hi' ? 'बाद में जोड़ें →' : 'Skip for now →'}
            </button>
          </div>
        );

      // Step 5: Ritual Times
      case 5:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-8 h-8 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold">
                {language === 'hi' ? 'आपकी दिनचर्या' : 'Your daily rhythm'}
              </h2>
              <p className="text-muted-foreground">
                {language === 'hi' ? 'हम आपको सही समय पर याद दिलाएंगे' : 'We\'ll remind you at the right times'}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Sun className="w-7 h-7 text-orange-500" />
                </div>
                <div className="flex-1">
                  <Label className="text-base font-semibold">
                    {language === 'hi' ? 'सुबह का समय' : 'Morning ritual'}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {language === 'hi' ? 'जब आप उठते हैं' : 'When you usually wake up'}
                  </p>
                </div>
                <Input
                  type="time"
                  value={formData.morning_ritual_time}
                  onChange={(e) => setFormData({ ...formData, morning_ritual_time: e.target.value })}
                  className="w-28 h-12 text-center rounded-xl"
                />
              </div>

              <div className="flex items-center gap-4 p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <div className="w-14 h-14 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <Moon className="w-7 h-7 text-indigo-500" />
                </div>
                <div className="flex-1">
                  <Label className="text-base font-semibold">
                    {language === 'hi' ? 'शाम का समय' : 'Evening ritual'}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {language === 'hi' ? 'जब आप आराम करते हैं' : 'When you wind down'}
                  </p>
                </div>
                <Input
                  type="time"
                  value={formData.evening_ritual_time}
                  onChange={(e) => setFormData({ ...formData, evening_ritual_time: e.target.value })}
                  className="w-28 h-12 text-center rounded-xl"
                />
              </div>
            </div>
          </div>
        );

      // Step 6: Ready to Go
      case 6:
        return (
          <div className="space-y-8 text-center animate-fade-in">
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center shadow-xl">
                <Sparkles className="w-12 h-12 text-secondary-foreground" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {language === 'hi' ? 'आप तैयार हैं! 🎉' : 'You\'re all set! 🎉'}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {language === 'hi' 
                    ? 'Beat आपके साथ है। बस मुझसे बात करें।'
                    : 'Beat is here for you. Just talk to me anytime.'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 text-left">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {language === 'hi' ? 'रोज़ाना चेक-इन करें' : 'Daily check-ins'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'hi' ? 'BP, शुगर, और मूड ट्रैक करें' : 'Track BP, sugar, and mood'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 text-left">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {language === 'hi' ? 'HeartScore देखें' : 'See your HeartScore'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'hi' ? 'आपकी सेहत का स्कोर' : 'Your daily health score'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 text-left">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {language === 'hi' ? 'Beat से पूछें' : 'Ask Beat anything'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'hi' ? 'सेहत के सवालों के जवाब' : 'Get personalized health guidance'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <CardContent className="p-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i + 1 === step 
                      ? 'w-6 bg-primary' 
                      : i + 1 < step 
                        ? 'w-2 bg-primary' 
                        : 'w-2 bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step Content */}
          {renderStep()}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={prevStep}
                className="h-14 rounded-xl"
                size="lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <Button
              onClick={nextStep}
              className="flex-1 h-14 rounded-xl text-base gap-2"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : step === TOTAL_STEPS ? (
                <>
                  {language === 'hi' ? 'शुरू करें' : 'Get Started'}
                  <Sparkles className="w-5 h-5" />
                </>
              ) : (
                <>
                  {language === 'hi' ? 'आगे' : 'Continue'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
