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
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
  });

  // Set up real-time subscription for heart score updates
  useEffect(() => {
    if (!currentUserId) return;

    const heartScoreChannel = supabase
      .channel('heart-scores-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'heart_scores',
          filter: `user_id=eq.${currentUserId}`
        },
        (payload) => {
          console.log('HeartScore updated in real-time:', payload);
          queryClient.invalidateQueries({ queryKey: ["heartScore", "today", currentUserId] });
          queryClient.invalidateQueries({ queryKey: ["heartScore", "history", currentUserId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(heartScoreChannel);
    };
  }, [currentUserId, queryClient]);

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
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
  });

  return {
    todayScore,
    history,
    isLoading,
    calculateScore: calculateScore.mutate,
    isCalculating: calculateScore.isPending,
  };
};
