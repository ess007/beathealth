import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface HealthGoal {
  id: string;
  user_id: string;
  goal_type: 'bp_control' | 'weight_loss' | 'step_count' | 'sugar_control' | 'consistency';
  target_value: number;
  current_value: number | null;
  start_date: string;
  target_date: string | null;
  status: 'active' | 'completed' | 'abandoned';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useHealthGoals = (userId?: string) => {
  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useQuery({
    queryKey: ["health-goals", userId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;

      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from("health_goals")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as HealthGoal[];
    },
    enabled: !!userId || true,
  });

  const createGoal = useMutation({
    mutationFn: async (newGoal: {
      goal_type: string;
      target_value: number;
      target_date?: string;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("health_goals")
        .insert({
          user_id: user.id,
          ...newGoal,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-goals"] });
      toast.success("Goal created successfully!");
    },
    onError: (error) => {
      console.error("Error creating goal:", error);
      toast.error("Failed to create goal");
    },
  });

  const updateGoal = useMutation({
    mutationFn: async ({
      goalId,
      updates,
    }: {
      goalId: string;
      updates: Partial<HealthGoal>;
    }) => {
      const { data, error } = await supabase
        .from("health_goals")
        .update(updates)
        .eq("id", goalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-goals"] });
      toast.success("Goal updated!");
    },
    onError: (error) => {
      console.error("Error updating goal:", error);
      toast.error("Failed to update goal");
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from("health_goals")
        .delete()
        .eq("id", goalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-goals"] });
      toast.success("Goal deleted");
    },
    onError: (error) => {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal");
    },
  });

  return {
    goals: goals || [],
    isLoading,
    createGoal: createGoal.mutate,
    updateGoal: updateGoal.mutate,
    deleteGoal: deleteGoal.mutate,
  };
};
