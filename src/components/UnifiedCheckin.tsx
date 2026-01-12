import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Sun, Moon, Heart, Droplet, Pill, Brain, Users, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";
import confetti from "canvas-confetti";

interface UnifiedCheckinProps {
  isOpen: boolean;
  onClose: () => void;
  type?: "morning" | "evening" | "auto";
}

const SLEEP_QUALITY_OPTIONS = ["excellent", "good", "fair", "poor", "very_poor"] as const;
const MOOD_OPTIONS = [
  { value: 1, emoji: "😢", label: "Low" },
  { value: 2, emoji: "😕", label: "Below Average" },
  { value: 3, emoji: "😐", label: "Neutral" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😊", label: "Great" },
];

export const UnifiedCheckin = ({ isOpen, onClose, type = "auto" }: UnifiedCheckinProps) => {
  const queryClient = useQueryClient();
  
  // Determine ritual type based on time if auto
  const getAutoType = () => {
    const hour = new Date().getHours();
    return hour < 14 ? "morning" : "evening";
  };
  
  const ritualType = type === "auto" ? getAutoType() : type;
  const isMorning = ritualType === "morning";

  // Form state
  const [step, setStep] = useState(1);
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [fastingSugar, setFastingSugar] = useState("");
  const [sleepQuality, setSleepQuality] = useState<string>("");
  const [medsTaken, setMedsTaken] = useState<boolean | null>(null);
  const [moodScore, setMoodScore] = useState<number>(3);
  const [socialInteractions, setSocialInteractions] = useState<number>(0);
  const [leftHome, setLeftHome] = useState<boolean | null>(null);
  const [notes, setNotes] = useState("");

  const totalSteps = isMorning ? 4 : 5;
  const progress = (step / totalSteps) * 100;

  const submitCheckin = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const now = new Date();
      const today = now.toISOString().split("T")[0];

      // Log BP if provided
      if (systolic && diastolic) {
        await supabase.from("bp_logs").insert({
          user_id: user.id,
          systolic: parseInt(systolic),
          diastolic: parseInt(diastolic),
          heart_rate: heartRate ? parseInt(heartRate) : null,
          measured_at: now.toISOString(),
          ritual_type: ritualType,
        });
      }

      // Log sugar if provided (morning only)
      if (isMorning && fastingSugar) {
        await supabase.from("sugar_logs").insert({
          user_id: user.id,
          glucose_mg_dl: parseInt(fastingSugar),
          measurement_type: "fasting",
          measured_at: now.toISOString(),
          ritual_type: ritualType,
        });
      }

      // Log behavior
      await supabase.from("behavior_logs").insert({
        user_id: user.id,
        log_date: today,
        ritual_type: ritualType,
        sleep_quality: sleepQuality || null,
        meds_taken: medsTaken,
        mood_score: moodScore,
        social_interaction_count: socialInteractions > 0 ? socialInteractions : null,
        notes: notes || null,
      });

      // Log social wellness for evening
      if (!isMorning && (socialInteractions > 0 || leftHome !== null)) {
        const { data: existing } = await supabase
          .from("social_wellness_logs")
          .select("id")
          .eq("user_id", user.id)
          .eq("log_date", today)
          .single();

        if (existing) {
          await supabase.from("social_wellness_logs").update({
            social_interactions: socialInteractions,
            mood_score: moodScore,
            left_home: leftHome,
          }).eq("id", existing.id);
        } else {
          await supabase.from("social_wellness_logs").insert({
            user_id: user.id,
            log_date: today,
            social_interactions: socialInteractions,
            mood_score: moodScore,
            left_home: leftHome,
          });
        }
      }

      // Update streak
      await supabase.rpc("update_or_create_streak", {
        p_user_id: user.id,
        p_type: ritualType,
      });

      // Calculate heart score
      await supabase.functions.invoke("calculate-heart-score", {
        body: { userId: user.id },
      });

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rituals"] });
      queryClient.invalidateQueries({ queryKey: ["ritual-status"] });
      queryClient.invalidateQueries({ queryKey: ["heart-score"] });
      queryClient.invalidateQueries({ queryKey: ["streaks"] });
      queryClient.invalidateQueries({ queryKey: ["social-wellness"] });

      // Celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      haptic.success();
      toast.success(`${isMorning ? "Morning" : "Evening"} check-in complete! 🎉`);
      
      // Reset and close
      resetForm();
      onClose();
    },
    onError: (error) => {
      console.error("Check-in error:", error);
      toast.error("Failed to save check-in");
    },
  });

  const resetForm = () => {
    setStep(1);
    setSystolic("");
    setDiastolic("");
    setHeartRate("");
    setFastingSugar("");
    setSleepQuality("");
    setMedsTaken(null);
    setMoodScore(3);
    setSocialInteractions(0);
    setLeftHome(null);
    setNotes("");
  };

  const canProceed = () => {
    switch (step) {
      case 1: // Vitals
        return true; // Optional
      case 2: // Sleep (morning) or Mood (evening)
        return true; // Optional
      case 3: // Medications
        return true; // Optional
      case 4: // Morning: Submit, Evening: Social
        return true;
      case 5: // Evening: Submit
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      haptic.light();
      setStep(step + 1);
    } else {
      submitCheckin.mutate();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      haptic.light();
      setStep(step - 1);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            {isMorning ? <Sun className="h-5 w-5 text-orange-500" /> : <Moon className="h-5 w-5 text-indigo-500" />}
            {isMorning ? "Morning" : "Evening"} Check-in
          </SheetTitle>
          <Progress value={progress} className="h-2" />
        </SheetHeader>

        <div className="space-y-6 py-4 overflow-y-auto max-h-[calc(85vh-150px)]">
          {/* Step 1: Vitals */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <Heart className="h-12 w-12 text-red-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">Blood Pressure</h3>
                <p className="text-sm text-muted-foreground">Enter your BP reading (optional)</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Systolic (top)</Label>
                  <Input
                    type="number"
                    placeholder="120"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    className="text-center text-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Diastolic (bottom)</Label>
                  <Input
                    type="number"
                    placeholder="80"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    className="text-center text-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Heart Rate (optional)</Label>
                <Input
                  type="number"
                  placeholder="72"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  className="text-center"
                />
              </div>

              {isMorning && (
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplet className="h-5 w-5 text-blue-500" />
                    <Label>Fasting Blood Sugar (mg/dL)</Label>
                  </div>
                  <Input
                    type="number"
                    placeholder="100"
                    value={fastingSugar}
                    onChange={(e) => setFastingSugar(e.target.value)}
                    className="text-center text-xl"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Sleep (Morning) or Mood (Evening) */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              {isMorning ? (
                <>
                  <div className="text-center mb-6">
                    <Moon className="h-12 w-12 text-indigo-500 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold">How did you sleep?</h3>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {SLEEP_QUALITY_OPTIONS.map((quality) => (
                      <button
                        key={quality}
                        onClick={() => setSleepQuality(quality)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          sleepQuality === quality
                            ? "border-primary bg-primary/10"
                            : "border-border/50 hover:border-primary/30"
                        }`}
                      >
                        <span className="text-2xl">
                          {quality === "excellent" ? "😴" : 
                           quality === "good" ? "😊" : 
                           quality === "fair" ? "😐" : 
                           quality === "poor" ? "😩" : "😵"}
                        </span>
                        <p className="text-xs mt-1 capitalize">{quality.replace("_", " ")}</p>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <Brain className="h-12 w-12 text-purple-500 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold">How are you feeling?</h3>
                  </div>

                  <div className="flex justify-between px-4">
                    {MOOD_OPTIONS.map((mood) => (
                      <button
                        key={mood.value}
                        onClick={() => setMoodScore(mood.value)}
                        className={`p-4 rounded-xl transition-all ${
                          moodScore === mood.value
                            ? "bg-primary/10 ring-2 ring-primary scale-110"
                            : "hover:bg-muted"
                        }`}
                      >
                        <span className="text-3xl">{mood.emoji}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Medications */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <Pill className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">
                  {isMorning ? "Morning medications?" : "Evening medications?"}
                </h3>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setMedsTaken(true)}
                  className={`flex-1 max-w-[140px] p-6 rounded-xl border-2 transition-all ${
                    medsTaken === true
                      ? "border-green-500 bg-green-500/10"
                      : "border-border/50 hover:border-green-500/50"
                  }`}
                >
                  <Check className={`h-8 w-8 mx-auto mb-2 ${medsTaken === true ? "text-green-500" : "text-muted-foreground"}`} />
                  <p className="font-medium">Yes</p>
                </button>
                <button
                  onClick={() => setMedsTaken(false)}
                  className={`flex-1 max-w-[140px] p-6 rounded-xl border-2 transition-all ${
                    medsTaken === false
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-border/50 hover:border-orange-500/50"
                  }`}
                >
                  <span className={`text-2xl block mb-2 ${medsTaken === false ? "" : "opacity-50"}`}>⏳</span>
                  <p className="font-medium">Not yet</p>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Social (Evening only) or Notes (Morning) */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              {isMorning ? (
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold">Any notes?</h3>
                    <p className="text-sm text-muted-foreground">Optional</p>
                  </div>
                  <textarea
                    className="w-full h-24 p-3 rounded-lg border border-border/50 bg-background resize-none"
                    placeholder="How are you feeling today?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <Users className="h-12 w-12 text-pink-500 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold">Social connections today?</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                      <span>Social interactions</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSocialInteractions(Math.max(0, socialInteractions - 1))}
                          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold">{socialInteractions}</span>
                        <button
                          onClick={() => setSocialInteractions(socialInteractions + 1)}
                          className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                      <span>Did you go outside today?</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setLeftHome(true)}
                          className={`px-4 py-2 rounded-lg transition-all ${
                            leftHome === true ? "bg-green-500 text-white" : "bg-muted"
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setLeftHome(false)}
                          className={`px-4 py-2 rounded-lg transition-all ${
                            leftHome === false ? "bg-muted-foreground text-white" : "bg-muted"
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 5: Notes (Evening) */}
          {step === 5 && !isMorning && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold">Any notes?</h3>
                <p className="text-sm text-muted-foreground">Optional</p>
              </div>
              <textarea
                className="w-full h-24 p-3 rounded-lg border border-border/50 bg-background resize-none"
                placeholder="How was your day?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-4 border-t">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <Button 
            className="flex-1 gap-2" 
            onClick={handleNext}
            disabled={submitCheckin.isPending}
          >
            {step === totalSteps ? (
              <>
                <Check className="h-4 w-4" />
                Complete
              </>
            ) : (
              <>
                {canProceed() ? "Next" : "Skip"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
