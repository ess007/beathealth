import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";

const MorningCheckin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    bpSystolic: "",
    bpDiastolic: "",
    fastingSugar: "",
    sleepQuality: "3",
    medsTaken: false,
  });

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Save and complete
      toast.success("Morning ritual completed! 🎉");
      navigate("/app/home");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate("/app/home");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <span className="font-semibold">Morning Ritual</span>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Step {step} of 4</span>
            <span className="text-sm font-medium">{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary transition-smooth"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-8 shadow-elevated">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Blood Pressure</h2>
                <p className="text-muted-foreground">Enter your morning BP reading</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="systolic">Systolic (Top)</Label>
                  <Input
                    id="systolic"
                    type="number"
                    placeholder="120"
                    value={data.bpSystolic}
                    onChange={(e) => setData({ ...data, bpSystolic: e.target.value })}
                    className="h-14 text-xl text-center"
                  />
                  <p className="text-xs text-muted-foreground text-center">mmHg</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diastolic">Diastolic (Bottom)</Label>
                  <Input
                    id="diastolic"
                    type="number"
                    placeholder="80"
                    value={data.bpDiastolic}
                    onChange={(e) => setData({ ...data, bpDiastolic: e.target.value })}
                    className="h-14 text-xl text-center"
                  />
                  <p className="text-xs text-muted-foreground text-center">mmHg</p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Fasting Sugar</h2>
                <p className="text-muted-foreground">Your morning blood glucose level</p>
              </div>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="100"
                  value={data.fastingSugar}
                  onChange={(e) => setData({ ...data, fastingSugar: e.target.value })}
                  className="h-16 text-2xl text-center"
                />
                <p className="text-sm text-muted-foreground text-center">mg/dL</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Sleep Quality</h2>
                <p className="text-muted-foreground">How well did you sleep last night?</p>
              </div>
              <div className="space-y-4">
                {[
                  { value: "5", label: "Excellent", emoji: "😴" },
                  { value: "4", label: "Good", emoji: "🙂" },
                  { value: "3", label: "Fair", emoji: "😐" },
                  { value: "2", label: "Poor", emoji: "😟" },
                  { value: "1", label: "Very Poor", emoji: "😫" },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={data.sleepQuality === option.value ? "default" : "outline"}
                    className="w-full h-16 justify-start text-lg"
                    onClick={() => setData({ ...data, sleepQuality: option.value })}
                  >
                    <span className="text-2xl mr-3">{option.emoji}</span>
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Medications</h2>
                <p className="text-muted-foreground">Did you take your morning meds?</p>
              </div>
              <div className="space-y-4">
                <Button
                  variant={data.medsTaken ? "default" : "outline"}
                  className="w-full h-16 text-lg gradient-primary text-white"
                  onClick={() => setData({ ...data, medsTaken: true })}
                >
                  <Check className="w-6 h-6 mr-2" />
                  Yes, I took my medications
                </Button>
                <Button
                  variant={!data.medsTaken ? "default" : "outline"}
                  className="w-full h-16 text-lg"
                  onClick={() => setData({ ...data, medsTaken: false })}
                >
                  No, not yet
                </Button>
              </div>
            </div>
          )}

          <Button
            className="w-full h-14 gradient-primary text-white shadow-card mt-8"
            onClick={handleNext}
          >
            {step === 4 ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Complete Ritual
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </Card>
      </main>
    </div>
  );
};

export default MorningCheckin;
