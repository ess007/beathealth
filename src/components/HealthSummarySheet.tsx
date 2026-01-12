import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Heart, Activity, Droplets, Flame, TrendingUp, Calendar, Clock } from "lucide-react";
import { useHeartScore } from "@/hooks/useHeartScore";
import { useStreaks } from "@/hooks/useStreaks";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface HealthSummarySheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HealthSummarySheet = ({ isOpen, onClose }: HealthSummarySheetProps) => {
  const { todayScore, history: weeklyScores } = useHeartScore();
  const { mainStreakCount } = useStreaks();
  const { language } = useLanguage();

  const { data: latestVitals } = useQuery({
    queryKey: ["latest-vitals"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const today = new Date().toISOString().split("T")[0];

      const [bpData, sugarData] = await Promise.all([
        supabase
          .from("bp_logs")
          .select("systolic, diastolic, heart_rate, measured_at")
          .eq("user_id", user.id)
          .order("measured_at", { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from("sugar_logs")
          .select("glucose_mg_dl, measurement_type, measured_at")
          .eq("user_id", user.id)
          .order("measured_at", { ascending: false })
          .limit(1)
          .single(),
      ]);

      return {
        bp: bpData.data,
        sugar: sugarData.data,
      };
    },
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-secondary";
    if (score >= 70) return "text-score-good";
    if (score >= 60) return "text-score-moderate";
    return "text-primary";
  };

  const score = todayScore?.heart_score || 0;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            {language === 'hi' ? 'स्वास्थ्य सारांश' : 'Health Summary'}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4 overflow-y-auto max-h-[calc(85vh-100px)] pb-6">
          {/* HeartScore */}
          <Card className="p-5 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Heart className={`w-10 h-10 ${getScoreColor(score)}`} fill="currentColor" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">HeartScore</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</span>
                  <span className="text-lg text-muted-foreground">/100</span>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500/10">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-bold text-orange-600">{mainStreakCount}</span>
              </div>
            </div>
          </Card>

          {/* Latest Vitals */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  {language === 'hi' ? 'रक्तचाप' : 'Blood Pressure'}
                </span>
              </div>
              {latestVitals?.bp ? (
                <>
                  <p className="text-2xl font-bold">
                    {latestVitals.bp.systolic}/{latestVitals.bp.diastolic}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(latestVitals.bp.measured_at), "h:mm a")}
                  </p>
                  {latestVitals.bp.heart_rate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ❤️ {latestVitals.bp.heart_rate} bpm
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {language === 'hi' ? 'कोई डेटा नहीं' : 'No data yet'}
                </p>
              )}
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">
                  {language === 'hi' ? 'शुगर' : 'Blood Sugar'}
                </span>
              </div>
              {latestVitals?.sugar ? (
                <>
                  <p className="text-2xl font-bold">
                    {latestVitals.sugar.glucose_mg_dl}
                    <span className="text-sm font-normal text-muted-foreground ml-1">mg/dL</span>
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(latestVitals.sugar.measured_at), "h:mm a")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">
                    {latestVitals.sugar.measurement_type}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {language === 'hi' ? 'कोई डेटा नहीं' : 'No data yet'}
                </p>
              )}
            </Card>
          </div>

          {/* Weekly Trend */}
          {weeklyScores && weeklyScores.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium">
                  {language === 'hi' ? '7-दिन का ट्रेंड' : '7-Day Trend'}
                </span>
              </div>
              <div className="flex items-end gap-1 h-16">
                {weeklyScores.slice(-7).map((day, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-primary/20 rounded-t transition-all"
                    style={{ height: `${(day.heart_score / 100) * 100}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-muted-foreground">
                  {format(new Date(weeklyScores[0]?.score_date || new Date()), "MMM d")}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {language === 'hi' ? 'आज' : 'Today'}
                </span>
              </div>
            </Card>
          )}

          {/* Sub-scores breakdown */}
          {todayScore && (
            <Card className="p-4">
              <p className="text-sm font-medium mb-3">
                {language === 'hi' ? 'स्कोर विवरण' : 'Score Breakdown'}
              </p>
              <div className="space-y-3">
                {[
                  { label: language === 'hi' ? 'रक्तचाप' : 'BP Score', value: todayScore.bp_score || 0, color: 'bg-primary' },
                  { label: language === 'hi' ? 'शुगर' : 'Sugar Score', value: todayScore.sugar_score || 0, color: 'bg-blue-500' },
                  { label: language === 'hi' ? 'नियमितता' : 'Consistency', value: todayScore.consistency_score || 0, color: 'bg-violet-500' },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium">{item.value}/100</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* AI Insight */}
          {todayScore?.ai_explanation && (
            <Card className="p-4 bg-primary/5 border-primary/10">
              <p className="text-sm">
                <span className="font-semibold text-primary">💡</span>{" "}
                {todayScore.ai_explanation}
              </p>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
