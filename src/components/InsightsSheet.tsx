import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, Heart, Droplet, Moon, Brain } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts";

interface InsightsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InsightsSheet = ({ isOpen, onClose }: InsightsSheetProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();

  // Fetch 7-day BP data
  const { data: bpData } = useQuery({
    queryKey: ["bp-trends", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const startDate = startOfDay(subDays(new Date(), 6));
      const { data } = await supabase
        .from("bp_logs")
        .select("systolic, diastolic, measured_at")
        .eq("user_id", user.id)
        .gte("measured_at", startDate.toISOString())
        .order("measured_at", { ascending: true });
      return data || [];
    },
    enabled: !!user?.id && isOpen,
  });

  // Fetch 7-day sugar data
  const { data: sugarData } = useQuery({
    queryKey: ["sugar-trends", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const startDate = startOfDay(subDays(new Date(), 6));
      const { data } = await supabase
        .from("sugar_logs")
        .select("glucose_mg_dl, measured_at, measurement_type")
        .eq("user_id", user.id)
        .gte("measured_at", startDate.toISOString())
        .order("measured_at", { ascending: true });
      return data || [];
    },
    enabled: !!user?.id && isOpen,
  });

  // Fetch behavior logs for sleep and mood
  const { data: behaviorData } = useQuery({
    queryKey: ["behavior-trends", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const startDate = format(subDays(new Date(), 6), "yyyy-MM-dd");
      const { data } = await supabase
        .from("behavior_logs")
        .select("sleep_quality, mood_score, log_date")
        .eq("user_id", user.id)
        .gte("log_date", startDate)
        .order("log_date", { ascending: true });
      return data || [];
    },
    enabled: !!user?.id && isOpen,
  });

  // Process data for charts
  const chartBPData = bpData?.reduce((acc: any[], log) => {
    const date = format(new Date(log.measured_at), "EEE");
    const existing = acc.find((d) => d.date === date);
    if (existing) {
      existing.systolic = log.systolic;
      existing.diastolic = log.diastolic;
    } else {
      acc.push({ date, systolic: log.systolic, diastolic: log.diastolic });
    }
    return acc;
  }, []) || [];

  const chartSugarData = sugarData?.map((log) => ({
    date: format(new Date(log.measured_at), "EEE"),
    glucose: log.glucose_mg_dl,
    type: log.measurement_type,
  })) || [];

  // Calculate averages
  const avgBP = bpData && bpData.length > 0 ? {
    systolic: Math.round(bpData.reduce((sum, log) => sum + log.systolic, 0) / bpData.length),
    diastolic: Math.round(bpData.reduce((sum, log) => sum + log.diastolic, 0) / bpData.length),
  } : null;

  const avgSugar = sugarData && sugarData.length > 0 
    ? Math.round(sugarData.reduce((sum, log) => sum + log.glucose_mg_dl, 0) / sugarData.length)
    : null;

  const sleepQualityMap: Record<string, number> = {
    excellent: 5, good: 4, fair: 3, poor: 2, very_poor: 1,
  };

  const avgSleep = behaviorData && behaviorData.length > 0
    ? (behaviorData.reduce((sum, log) => sum + (sleepQualityMap[log.sleep_quality || 'fair'] || 3), 0) / behaviorData.length).toFixed(1)
    : null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {language === "hi" ? "स्वास्थ्य रुझान" : "Health Trends"}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 pb-8">
          {/* Weekly Averages */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 text-center border-red-500/20 bg-red-500/5">
              <Heart className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground mb-1">Avg BP</p>
              <p className="text-lg font-bold text-red-600">
                {avgBP ? `${avgBP.systolic}/${avgBP.diastolic}` : "--"}
              </p>
            </Card>
            <Card className="p-4 text-center border-blue-500/20 bg-blue-500/5">
              <Droplet className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground mb-1">Avg Sugar</p>
              <p className="text-lg font-bold text-blue-600">
                {avgSugar ? `${avgSugar}` : "--"}
              </p>
            </Card>
            <Card className="p-4 text-center border-indigo-500/20 bg-indigo-500/5">
              <Moon className="h-6 w-6 text-indigo-500 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground mb-1">Sleep Score</p>
              <p className="text-lg font-bold text-indigo-600">
                {avgSleep ? `${avgSleep}/5` : "--"}
              </p>
            </Card>
          </div>

          {/* BP Trend Chart */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              Blood Pressure (7 days)
            </h3>
            {chartBPData.length > 0 ? (
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartBPData}>
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={[60, 180]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="systolic" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="diastolic" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No BP data this week</p>
            )}
          </Card>

          {/* Sugar Trend Chart */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Droplet className="h-4 w-4 text-blue-500" />
              Blood Sugar (7 days)
            </h3>
            {chartSugarData.length > 0 ? (
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartSugarData}>
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={[60, 200]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="glucose" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No sugar data this week</p>
            )}
          </Card>

          {/* AI Insight */}
          <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Beat's Insight</h4>
                <p className="text-sm text-muted-foreground">
                  {avgBP && avgBP.systolic > 130 
                    ? "Your BP has been elevated this week. Consider reducing salt intake and taking short walks."
                    : avgSugar && avgSugar > 140
                    ? "Blood sugar levels are slightly high. Try to include more fiber-rich foods in your diet."
                    : "You're doing great! Keep up with your daily rituals for consistent health tracking."}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};
