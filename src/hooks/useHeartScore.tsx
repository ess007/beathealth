import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const useHeartScore = (userId?: string) => {
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      setCurrentUserId(userId);
    } else {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setCurrentUserId(user?.id || null);
      });
    }
  }, [userId]);

  // Fetch today's heart score
  const { data: todayScore, isLoading } = useQuery({
    queryKey: ["heartScore", "today", currentUserId],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      
      const { data, error } = await supabase
        .from("heart_scores")
        .select("*")
        .eq("user_id", currentUserId!)
        .eq("score_date", today)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!currentUserId,
  });

  // Calculate heart score mutation
  const calculateScore = useMutation({
    mutationFn: async (date?: string) => {
      const { data, error } = await supabase.functions.invoke(
        "calculate-heart-score",
        {
          body: { date },
        }
      );

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["heartScore"] });
      toast.success("HeartScore calculated!");
    },
    onError: (error) => {
      console.error("Error calculating HeartScore:", error);
      toast.error("Failed to calculate HeartScore");
    },
  });

  // Fetch heart score history (last 30 days)
  const { data: history } = useQuery({
    queryKey: ["heartScore", "history", currentUserId],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from("heart_scores")
        .select("*")
        .eq("user_id", currentUserId!)
        .gte("score_date", thirtyDaysAgo.toISOString().split("T")[0])
        .order("score_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!currentUserId,
  });

  return {
    todayScore,
    history,
    isLoading,
    calculateScore: calculateScore.mutate,
    isCalculating: calculateScore.isPending,
  };
};
