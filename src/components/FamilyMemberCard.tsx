import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Activity, Droplet, Check, X, Bell } from "lucide-react";
import { useHeartScore } from "@/hooks/useHeartScore";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FamilyMemberCardProps {
  memberId: string;
  memberName: string;
  memberEmail: string;
  relationship: string;
  canNudge: boolean;
  onRemove?: () => void;
}

const FamilyMemberCard = ({
  memberId,
  memberName,
  memberEmail,
  relationship,
  canNudge,
  onRemove,
}: FamilyMemberCardProps) => {
  const { todayScore } = useHeartScore(memberId);

  // Fetch today's ritual completion
  const { data: todayRituals } = useQuery({
    queryKey: ["rituals", memberId, "today"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("behavior_logs")
        .select("*")
        .eq("user_id", memberId)
        .eq("log_date", today);

      if (error) throw error;
      return data;
    },
  });

  // Fetch latest BP reading
  const { data: latestBP } = useQuery({
    queryKey: ["bp", memberId, "latest"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bp_logs")
        .select("*")
        .eq("user_id", memberId)
        .order("measured_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Fetch latest sugar reading
  const { data: latestSugar } = useQuery({
    queryKey: ["sugar", memberId, "latest"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sugar_logs")
        .select("*")
        .eq("user_id", memberId)
        .order("measured_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const score = todayScore?.heart_score || 0;
  const morningDone = todayRituals?.some((r) => r.ritual_type === "morning");
  const eveningDone = todayRituals?.some((r) => r.ritual_type === "evening");

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-score-excellent";
    if (score >= 70) return "text-score-good";
    if (score >= 60) return "text-score-moderate";
    return "text-score-poor";
  };

  const getBPStatus = (systolic: number, diastolic: number) => {
    if (systolic >= 140 || diastolic >= 90) return { label: "High", variant: "destructive" as const };
    if (systolic >= 130 || diastolic >= 80) return { label: "Elevated", variant: "secondary" as const };
    return { label: "Normal", variant: "outline" as const };
  };

  const getSugarStatus = (glucose: number, type: string) => {
    if (type === "fasting") {
      if (glucose >= 126) return { label: "High", variant: "destructive" as const };
      if (glucose >= 100) return { label: "Elevated", variant: "secondary" as const };
      return { label: "Normal", variant: "outline" as const };
    } else {
      if (glucose >= 200) return { label: "High", variant: "destructive" as const };
      if (glucose >= 140) return { label: "Elevated", variant: "secondary" as const };
      return { label: "Normal", variant: "outline" as const };
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-1">
            {memberName || memberEmail.split("@")[0]}
          </h3>
          <p className="text-sm text-muted-foreground capitalize">{relationship}</p>
        </div>
        <div className="flex items-center gap-2">
          {canNudge && (
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="w-4 h-4" />
            </Button>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-destructive"
              onClick={onRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* HeartScore */}
      <div className="flex items-center gap-4 mb-4 p-4 bg-muted/50 rounded-lg">
        <Heart className={`w-10 h-10 ${getScoreColor(score)}`} fill="currentColor" />
        <div>
          <div className="text-sm text-muted-foreground">HeartScore</div>
          <div className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}/100</div>
        </div>
      </div>

      {/* Latest Readings */}
      <div className="space-y-3 mb-4">
        {latestBP && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                BP: {latestBP.systolic}/{latestBP.diastolic}
              </span>
            </div>
            <Badge variant={getBPStatus(latestBP.systolic, latestBP.diastolic).variant}>
              {getBPStatus(latestBP.systolic, latestBP.diastolic).label}
            </Badge>
          </div>
        )}

        {latestSugar && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                Sugar: {latestSugar.glucose_mg_dl} mg/dL
              </span>
            </div>
            <Badge variant={getSugarStatus(latestSugar.glucose_mg_dl, latestSugar.measurement_type).variant}>
              {getSugarStatus(latestSugar.glucose_mg_dl, latestSugar.measurement_type).label}
            </Badge>
          </div>
        )}
      </div>

      {/* Ritual Status */}
      <div className="flex gap-2">
        <Badge
          variant={morningDone ? "default" : "outline"}
          className="flex-1 justify-center"
        >
          {morningDone ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
          Morning
        </Badge>
        <Badge
          variant={eveningDone ? "default" : "outline"}
          className="flex-1 justify-center"
        >
          {eveningDone ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
          Evening
        </Badge>
      </div>
    </Card>
  );
};

export default FamilyMemberCard;
