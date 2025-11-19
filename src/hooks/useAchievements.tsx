import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAchievements = (userId?: string) => {
  const queryClient = useQueryClient();

  const { data: achievements, isLoading } = useQuery({
    queryKey: ["achievements", userId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;

      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", targetUserId)
        .order("earned_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId || true,
  });

  const checkAndAwardBadges = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check streaks
      const { data: streaks } = await supabase
        .from("streaks")
        .select("*")
        .eq("user_id", user.id)
        .eq("type", "daily_checkin")
        .single();

      const newBadges: string[] = [];

      // Check for 7-day streak
      if (streaks && streaks.count >= 7) {
        const { data: existing } = await supabase
          .from("achievements")
          .select("id")
          .eq("user_id", user.id)
          .eq("badge_type", "7_day_streak")
          .single();

        if (!existing) {
          await supabase.from("achievements").insert({
            user_id: user.id,
            badge_type: "7_day_streak",
          });
          newBadges.push("7-Day Warrior");
        }
      }

      // Check for 30-day streak
      if (streaks && streaks.count >= 30) {
        const { data: existing } = await supabase
          .from("achievements")
          .select("id")
          .eq("user_id", user.id)
          .eq("badge_type", "30_day_streak")
          .single();

        if (!existing) {
          await supabase.from("achievements").insert({
            user_id: user.id,
            badge_type: "30_day_streak",
          });
          newBadges.push("30-Day Champion");
        }
      }

      // Check BP control for past 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: bpLogs } = await supabase
        .from("bp_logs")
        .select("systolic, diastolic")
        .eq("user_id", user.id)
        .gte("measured_at", thirtyDaysAgo.toISOString());

      if (bpLogs && bpLogs.length >= 20) {
        const allHealthy = bpLogs.every(
          (log) => log.systolic < 130 && log.diastolic < 80
        );

        if (allHealthy) {
          const { data: existing } = await supabase
            .from("achievements")
            .select("id")
            .eq("user_id", user.id)
            .eq("badge_type", "bp_control_month")
            .single();

          if (!existing) {
            await supabase.from("achievements").insert({
              user_id: user.id,
              badge_type: "bp_control_month",
            });
            newBadges.push("BP Master");
          }
        }
      }

      // Check sugar control for past 30 days
      const { data: sugarLogs } = await supabase
        .from("sugar_logs")
        .select("glucose_mg_dl, measurement_type")
        .eq("user_id", user.id)
        .gte("measured_at", thirtyDaysAgo.toISOString());

      if (sugarLogs && sugarLogs.length >= 20) {
        const allHealthy = sugarLogs.every((log) => {
          if (log.measurement_type === "fasting") {
            return log.glucose_mg_dl < 100;
          }
          return log.glucose_mg_dl < 140;
        });

        if (allHealthy) {
          const { data: existing } = await supabase
            .from("achievements")
            .select("id")
            .eq("user_id", user.id)
            .eq("badge_type", "sugar_control_month")
            .single();

          if (!existing) {
            await supabase.from("achievements").insert({
              user_id: user.id,
              badge_type: "sugar_control_month",
            });
            newBadges.push("Sugar Champion");
          }
        }
      }

      return newBadges;
    },
    onSuccess: (newBadges) => {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      if (newBadges.length > 0) {
        toast.success(`🎉 New achievement${newBadges.length > 1 ? 's' : ''} unlocked: ${newBadges.join(", ")}!`);
      }
    },
    onError: (error) => {
      console.error("Error checking achievements:", error);
    },
  });

  const shareBadge = useMutation({
    mutationFn: async (achievementId: string) => {
      const { error } = await supabase
        .from("achievements")
        .update({ shared: true })
        .eq("id", achievementId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      toast.success("Achievement shared with your family!");
    },
    onError: (error) => {
      console.error("Error sharing achievement:", error);
      toast.error("Failed to share achievement");
    },
  });

  return {
    achievements: achievements || [],
    isLoading,
    checkAndAwardBadges: checkAndAwardBadges.mutate,
    shareBadge: shareBadge.mutate,
  };
};
