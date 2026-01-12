import { useState, useEffect, useCallback } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  Footprints, Play, Pause, RotateCcw, Flame, Clock,
  TrendingUp, Activity, Heart, Zap
} from "lucide-react";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ActivitySession {
  id?: string;
  activityType: string;
  startedAt: Date;
  duration: number; // in seconds
  steps: number;
  calories: number;
  intensity: string;
  isActive: boolean;
}

const ACTIVITY_TYPES = [
  { id: 'walking', label: 'Walking', icon: Footprints, met: 3.5, color: 'text-green-500' },
  { id: 'running', label: 'Running', icon: Zap, met: 8.0, color: 'text-orange-500' },
  { id: 'cycling', label: 'Cycling', icon: Activity, met: 6.0, color: 'text-blue-500' },
  { id: 'yoga', label: 'Yoga', icon: Heart, met: 2.5, color: 'text-violet-500' },
];

const STEP_GOAL = 10000;

export const ActivityTracker = () => {
  const { user } = useAuth();
  const [session, setSession] = useState<ActivitySession | null>(null);
  const [todaySteps, setTodaySteps] = useState(0);
  const [todayCalories, setTodayCalories] = useState(0);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [accelerometerSupported, setAccelerometerSupported] = useState(false);
  const [stepBuffer, setStepBuffer] = useState<number[]>([]);

  // Check for accelerometer support
  useEffect(() => {
    if (typeof DeviceMotionEvent !== 'undefined' && 
        typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      setAccelerometerSupported(true);
    } else if ('DeviceMotionEvent' in window) {
      setAccelerometerSupported(true);
    }
  }, []);

  // Load today's stats
  useEffect(() => {
    if (!user) return;
    loadTodayStats();
  }, [user]);

  const loadTodayStats = async () => {
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('activity_sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('started_at', today.toISOString());

    if (data) {
      const totalSteps = data.reduce((sum, s) => sum + (s.steps_count || 0), 0);
      const totalCals = data.reduce((sum, s) => sum + (s.estimated_calories_burned || 0), 0);
      const totalMins = data.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
      
      setTodaySteps(totalSteps);
      setTodayCalories(totalCals);
      setTodayMinutes(totalMins);
    }
  };

  // Timer for active session
  useEffect(() => {
    if (!session?.isActive) return;

    const interval = setInterval(() => {
      setSession(prev => {
        if (!prev) return null;
        const newDuration = prev.duration + 1;
        const met = ACTIVITY_TYPES.find(a => a.id === prev.activityType)?.met || 3.5;
        const weight = 70; // Default weight, could be fetched from profile
        const caloriesPerSecond = (met * weight * 3.5) / (200 * 60);
        
        return {
          ...prev,
          duration: newDuration,
          calories: Math.round(caloriesPerSecond * newDuration),
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [session?.isActive]);

  // Step detection via device motion
  useEffect(() => {
    if (!session?.isActive || session.activityType !== 'walking') return;

    let lastMagnitude = 0;
    let stepThreshold = 12;
    let lastStepTime = 0;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc?.x || !acc?.y || !acc?.z) return;

      const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
      const now = Date.now();

      // Simple step detection
      if (magnitude > stepThreshold && 
          lastMagnitude <= stepThreshold && 
          now - lastStepTime > 250) { // Minimum 250ms between steps
        setSession(prev => prev ? { ...prev, steps: prev.steps + 1 } : null);
        lastStepTime = now;
      }

      lastMagnitude = magnitude;
    };

    // Request permission on iOS
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission()
        .then((permission: string) => {
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
          }
        });
    } else {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [session?.isActive, session?.activityType]);

  const startSession = async (activityType: string) => {
    haptic('light');
    
    setSession({
      activityType,
      startedAt: new Date(),
      duration: 0,
      steps: 0,
      calories: 0,
      intensity: 'moderate',
      isActive: true,
    });

    toast.success(`${activityType.charAt(0).toUpperCase() + activityType.slice(1)} session started!`);
  };

  const pauseSession = () => {
    haptic('light');
    setSession(prev => prev ? { ...prev, isActive: false } : null);
  };

  const resumeSession = () => {
    haptic('light');
    setSession(prev => prev ? { ...prev, isActive: true } : null);
  };

  const endSession = async () => {
    if (!session || !user) return;

    haptic('success');

    try {
      const { error } = await supabase.from('activity_sessions').insert({
        user_id: user.id,
        activity_type: session.activityType,
        duration_minutes: Math.round(session.duration / 60),
        intensity: session.intensity,
        estimated_calories_burned: session.calories,
        steps_count: session.steps,
        started_at: session.startedAt.toISOString(),
        ended_at: new Date().toISOString(),
        source: 'app_tracker',
      });

      if (error) throw error;

      toast.success('Activity saved!');
      setTodaySteps(prev => prev + session.steps);
      setTodayCalories(prev => prev + session.calories);
      setTodayMinutes(prev => prev + Math.round(session.duration / 60));
      setSession(null);

    } catch (error: any) {
      console.error('Save error:', error);
      toast.error('Failed to save activity');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const stepProgress = (todaySteps / STEP_GOAL) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center">
          <Footprints className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold">Activity Tracker</h3>
        <p className="text-sm text-muted-foreground">
          Track your movement and earn health points
        </p>
      </div>

      {/* Today's Stats */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">Today's Progress</h4>
          <Badge variant="outline">{Math.round(stepProgress)}% of goal</Badge>
        </div>

        <div className="space-y-3">
          {/* Step Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Steps</span>
              <span className="font-medium">{todaySteps.toLocaleString()} / {STEP_GOAL.toLocaleString()}</span>
            </div>
            <Progress value={stepProgress} className="h-3" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <Footprints className="w-5 h-5 mx-auto mb-1 text-green-500" />
              <p className="text-lg font-bold">{todaySteps.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Steps</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
              <p className="text-lg font-bold">{todayCalories}</p>
              <p className="text-xs text-muted-foreground">Calories</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              <p className="text-lg font-bold">{todayMinutes}</p>
              <p className="text-xs text-muted-foreground">Minutes</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Active Session */}
      {session && (
        <Card className="p-4 border-2 border-primary/50 bg-primary/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {session.isActive && (
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              )}
              <h4 className="font-semibold capitalize">{session.activityType}</h4>
            </div>
            <Badge variant={session.isActive ? "default" : "secondary"}>
              {session.isActive ? 'Active' : 'Paused'}
            </Badge>
          </div>

          {/* Timer Display */}
          <div className="text-center py-4">
            <p className="text-5xl font-bold font-mono text-primary">
              {formatDuration(session.duration)}
            </p>
          </div>

          {/* Session Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 rounded-lg bg-background/50">
              <p className="text-2xl font-bold">{session.steps}</p>
              <p className="text-xs text-muted-foreground">Steps</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background/50">
              <p className="text-2xl font-bold">{session.calories}</p>
              <p className="text-xs text-muted-foreground">Calories</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {session.isActive ? (
              <Button variant="outline" className="flex-1" onClick={pauseSession}>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            ) : (
              <Button variant="outline" className="flex-1" onClick={resumeSession}>
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
            )}
            <Button className="flex-1" onClick={endSession}>
              End & Save
            </Button>
          </div>
        </Card>
      )}

      {/* Activity Selection */}
      {!session && (
        <div className="space-y-3">
          <h4 className="font-medium">Start an Activity</h4>
          <div className="grid grid-cols-2 gap-3">
            {ACTIVITY_TYPES.map((activity) => (
              <Button
                key={activity.id}
                variant="outline"
                className="h-auto p-4 flex-col gap-2"
                onClick={() => startSession(activity.id)}
              >
                <activity.icon className={`w-8 h-8 ${activity.color}`} />
                <span className="font-medium">{activity.label}</span>
                <span className="text-xs text-muted-foreground">{activity.met} MET</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Accelerometer Note */}
      {!accelerometerSupported && (
        <Card className="p-3 bg-muted/50">
          <p className="text-xs text-muted-foreground text-center">
            📱 Step counting works best on mobile devices with motion sensors
          </p>
        </Card>
      )}

      {/* Tips */}
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <h5 className="font-medium text-sm mb-2">💡 Activity Tips</h5>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• 10,000 steps ≈ 5 miles ≈ 400-500 calories</li>
          <li>• Walking 30 min daily can lower BP by 4-9 mmHg</li>
          <li>• Post-meal walks help reduce blood sugar spikes</li>
        </ul>
      </div>
    </div>
  );
};

export default ActivityTracker;
