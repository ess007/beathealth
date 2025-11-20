import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Heart, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface FamilyHealthSummaryProps {
  memberId: string;
  memberName?: string;
}

export const FamilyHealthSummary = ({ memberId, memberName }: FamilyHealthSummaryProps) => {
  // Fetch latest heart score
  const { data: latestScore } = useQuery({
    queryKey: ["familyMemberScore", memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("heart_scores")
        .select("*")
        .eq("user_id", memberId)
        .order("score_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Fetch recent BP logs
  const { data: recentBP } = useQuery({
    queryKey: ["familyMemberBP", memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bp_logs")
        .select("*")
        .eq("user_id", memberId)
        .order("measured_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  // Fetch recent sugar logs
  const { data: recentSugar } = useQuery({
    queryKey: ["familyMemberSugar", memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sugar_logs")
        .select("*")
        .eq("user_id", memberId)
        .order("measured_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  // Fetch active streak
  const { data: streak } = useQuery({
    queryKey: ["familyMemberStreak", memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("streaks")
        .select("*")
        .eq("user_id", memberId)
        .eq("type", "daily_checkin")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-score-excellent";
    if (score >= 60) return "text-score-good";
    if (score >= 40) return "text-score-moderate";
    return "text-score-poor";
  };

  const getTrend = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-secondary" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-4">
      {/* HeartScore Card */}
      {latestScore && (
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm text-muted-foreground mb-1">HeartScore</h4>
              <div className={`text-4xl font-bold ${getScoreColor(latestScore.heart_score)}`}>
                {latestScore.heart_score}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(latestScore.score_date).toLocaleDateString()}
              </p>
            </div>
            <Heart className="w-12 h-12 text-primary opacity-20" />
          </div>
        </Card>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* BP Status */}
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-2">Blood Pressure</div>
          {recentBP && recentBP.length > 0 ? (
            <div className="space-y-1">
              <div className="font-semibold text-sm">
                {recentBP[0].systolic}/{recentBP[0].diastolic}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(recentBP[0].measured_at).toLocaleDateString()}
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">No data</div>
          )}
        </Card>

        {/* Sugar Status */}
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-2">Blood Sugar</div>
          {recentSugar && recentSugar.length > 0 ? (
            <div className="space-y-1">
              <div className="font-semibold text-sm">
                {recentSugar[0].glucose_mg_dl} mg/dL
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(recentSugar[0].measured_at).toLocaleDateString()}
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">No data</div>
          )}
        </Card>
      </div>

      {/* Streak */}
      {streak && (
        <Card className="p-4 bg-accent/5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Current Streak</div>
              <div className="text-2xl font-bold text-accent">{streak.count} days 🔥</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
