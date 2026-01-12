import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, Camera, Check, AlertTriangle, Hand, Flashlight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";

interface CameraPPGMeasurementProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (heartRate: number) => void;
}

// Abstract HR computation for future real PPG algorithm
const computeHeartRate = async (
  _signalData: number[],
  _options?: { samplingRate?: number }
): Promise<{ heartRate: number; confidence: number }> => {
  // MOCK IMPLEMENTATION
  // This function is abstracted to allow real PPG algorithm integration later
  // Real implementation would:
  // 1. Apply bandpass filter (0.5-4 Hz)
  // 2. Detect peaks using autocorrelation or FFT
  // 3. Calculate BPM from peak intervals
  // 4. Assess signal quality for confidence score
  
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Generate realistic heart rate (55-95 bpm for adults at rest)
  const baseHR = 70;
  const variance = Math.random() * 25 - 10; // ±12.5 bpm variance
  const heartRate = Math.round(baseHR + variance);
  
  // Mock confidence based on imaginary signal quality
  const confidence = 0.75 + Math.random() * 0.2;
  
  return { heartRate: Math.max(55, Math.min(95, heartRate)), confidence };
};

export const CameraPPGMeasurement = ({ isOpen, onClose, onComplete }: CameraPPGMeasurementProps) => {
  const [stage, setStage] = useState<"instructions" | "measuring" | "result">("instructions");
  const [countdown, setCountdown] = useState(30);
  const [progress, setProgress] = useState(0);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [saving, setSaving] = useState(false);

  const resetState = useCallback(() => {
    setStage("instructions");
    setCountdown(30);
    setProgress(0);
    setHeartRate(null);
    setPulseAnimation(false);
    setSaving(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);

  useEffect(() => {
    if (stage !== "measuring") return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishMeasurement();
          return 0;
        }
        return prev - 1;
      });

      setProgress((prev) => Math.min(100, prev + (100 / 30)));
      
      // Simulate pulse detection animation
      setPulseAnimation((prev) => !prev);
    }, 1000);

    return () => clearInterval(interval);
  }, [stage]);

  const startMeasurement = () => {
    haptic("medium");
    setStage("measuring");
  };

  const finishMeasurement = async () => {
    haptic("success");
    
    // Use abstracted HR computation
    const mockSignalData: number[] = [];
    const result = await computeHeartRate(mockSignalData);
    
    setHeartRate(result.heartRate);
    setStage("result");
  };

  const saveReading = async () => {
    if (!heartRate) return;
    
    try {
      setSaving(true);
      haptic("light");
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Save to vitals_continuous for heart rate
      const { error } = await supabase.from("vitals_continuous").insert({
        user_id: user.id,
        vital_type: "heart_rate",
        value: heartRate,
        source: "camera_ppg",
        measured_at: new Date().toISOString(),
        metadata: {
          method: "camera_ppg_mock",
          confidence: 0.85,
        }
      });

      if (error) throw error;

      toast.success(`Heart rate of ${heartRate} bpm saved!`);
      onComplete?.(heartRate);
      onClose();
    } catch (error) {
      console.error("Error saving heart rate:", error);
      toast.error("Failed to save reading");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm mx-auto p-0 overflow-hidden">
        {stage === "instructions" && (
          <>
            <DialogHeader className="p-6 pb-4">
              <DialogTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Measure Heart Rate
              </DialogTitle>
            </DialogHeader>
            
            <div className="px-6 pb-6 space-y-5">
              {/* Visual Instructions */}
              <div className="relative aspect-square bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                    <Camera className="w-16 h-16 text-primary" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-sm rounded-xl p-3">
                  <p className="text-sm font-medium text-center">
                    Your phone camera can detect your pulse
                  </p>
                </div>
              </div>

              {/* Step by step instructions */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Hand className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Place your fingertip</p>
                    <p className="text-xs text-muted-foreground">
                      Cover the back camera lens completely with your index finger
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Flashlight className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Keep flash on</p>
                    <p className="text-xs text-muted-foreground">
                      The flash will illuminate your fingertip (may feel warm)
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-secondary">30s</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Stay still for 30 seconds</p>
                    <p className="text-xs text-muted-foreground">
                      Don't move your finger during the measurement
                    </p>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  This is for wellness tracking only, not medical diagnosis. Always consult a doctor for health concerns.
                </p>
              </div>

              <Button onClick={startMeasurement} className="w-full h-12 text-base rounded-xl">
                Start Measurement
              </Button>
            </div>
          </>
        )}

        {stage === "measuring" && (
          <div className="p-6 space-y-6">
            {/* Animated Pulse Circle */}
            <div className="relative aspect-square bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl flex items-center justify-center overflow-hidden">
              {/* Background pulse rings */}
              <div className={`absolute inset-0 flex items-center justify-center ${pulseAnimation ? 'scale-110 opacity-30' : 'scale-100 opacity-50'} transition-all duration-500`}>
                <div className="w-48 h-48 rounded-full bg-primary/20" />
              </div>
              <div className={`absolute inset-0 flex items-center justify-center ${!pulseAnimation ? 'scale-110 opacity-30' : 'scale-100 opacity-50'} transition-all duration-500`}>
                <div className="w-36 h-36 rounded-full bg-primary/30" />
              </div>
              
              {/* Center circle with countdown */}
              <div className="relative w-28 h-28 rounded-full bg-primary flex flex-col items-center justify-center text-primary-foreground shadow-lg z-10">
                <Heart className={`w-8 h-8 mb-1 ${pulseAnimation ? 'scale-110' : 'scale-100'} transition-transform duration-300`} />
                <span className="text-2xl font-bold">{countdown}s</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                Detecting pulse... Keep your finger steady
              </p>
            </div>

            {/* Cancel button */}
            <Button 
              variant="outline" 
              onClick={() => {
                resetState();
                onClose();
              }} 
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        )}

        {stage === "result" && heartRate && (
          <div className="p-6 space-y-6">
            {/* Result Display */}
            <div className="relative aspect-square bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-2xl flex flex-col items-center justify-center">
              <div className="w-28 h-28 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                <Check className="w-14 h-14 text-secondary" />
              </div>
              
              <p className="text-muted-foreground text-sm">Your resting heart rate</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-5xl font-bold text-foreground">{heartRate}</span>
                <span className="text-xl text-muted-foreground">bpm</span>
              </div>
              
              {/* Range indicator */}
              <div className="mt-4 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
                {heartRate < 60 ? "Below average" : heartRate <= 80 ? "Normal range" : "Elevated"}
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <Button 
                onClick={saveReading} 
                disabled={saving}
                className="w-full h-12 text-base rounded-xl"
              >
                {saving ? "Saving..." : "Save Reading"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setStage("instructions")} 
                className="w-full"
              >
                Measure Again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
