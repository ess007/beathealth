import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AgentPreferences {
  id: string;
  user_id: string;
  autonomy_level: 'minimal' | 'balanced' | 'full';
  auto_nudge_enabled: boolean;
  auto_goal_adjust_enabled: boolean;
  auto_celebrate_enabled: boolean;
  auto_escalate_enabled: boolean;
  max_nudges_per_day: number;
  max_goal_adjustments_per_week: number;
  quiet_hours_start: string;
  quiet_hours_end: string;
  preferred_nudge_times: Record<string, string>;
}

export function useAgentPreferences() {
  const queryClient = useQueryClient();

  const { data: preferences, isLoading, error } = useQuery({
    queryKey: ["agent-preferences"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("agent_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      // Return defaults if no preferences exist
      if (!data) {
        return {
          autonomy_level: 'balanced',
          auto_nudge_enabled: true,
          auto_goal_adjust_enabled: false,
          auto_celebrate_enabled: true,
          auto_escalate_enabled: true,
          max_nudges_per_day: 5,
          max_goal_adjustments_per_week: 2
        } as Partial<AgentPreferences>;
      }
      
      return data as AgentPreferences;
    }
  });

  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<AgentPreferences>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("agent_preferences")
        .upsert({
          user_id: user.id,
          ...updates
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-preferences"] });
    }
  });

  return {
    preferences,
    isLoading,
    error,
    updatePreferences: updatePreferences.mutate,
    isUpdating: updatePreferences.isPending
  };
}
