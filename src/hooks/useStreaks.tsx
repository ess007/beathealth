import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useStreaks = (userId?: string) => {
  const queryClient = useQueryClient();

  const { data: streaks, isLoading } = useQuery({
    queryKey: ["streaks", userId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;

      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from("streaks")
        .select("*")
        .eq("user_id", targetUserId);

      if (error) throw error;
      return data;
    },
    enabled: !!userId || true,
  });

  const updateStreak = useMutation({
    mutationFn: async ({ type }: { type: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if streak exists
      const { data: existing } = await supabase
        .from("streaks")
        .select("*")
        .eq("user_id", user.id)
        .eq("type", type)
        .single();

      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      if (existing) {
        const lastLogged = new Date(existing.last_logged_at);
        const isToday = lastLogged.toDateString() === now.toDateString();
        const wasYesterday = lastLogged.toDateString() === yesterday.toDateString();

        if (isToday) {
          // Already logged today, no change
          return existing;
        }

        const newCount = wasYesterday ? existing.count + 1 : 1;

        const { data, error } = await supabase
          .from("streaks")
          .update({
            count: newCount,
            last_logged_at: now.toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new streak
        const { data, error } = await supabase
          .from("streaks")
          .insert({
            user_id: user.id,
            type,
            count: 1,
            last_logged_at: now.toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streaks"] });
    },
    onError: (error) => {
      console.error("Error updating streak:", error);
      toast.error("Failed to update streak");
    },
  });

  const mainStreak = streaks?.find((s) => s.type === "daily_checkin");

  return {
    streaks,
    isLoading,
    updateStreak: updateStreak.mutate,
    mainStreakCount: mainStreak?.count || 0,
  };
};