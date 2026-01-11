import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface AgentAction {
  id: string;
  user_id: string;
  action_type: string;
  action_payload: Record<string, any>;
  trigger_reason: string;
  trigger_type: string;
  status: 'completed' | 'pending_review' | 'reverted' | 'failed';
  created_at: string;
  reverted_at?: string;
  revert_reason?: string;
}

export function useAgentActions(limit: number = 20) {
  const queryClient = useQueryClient();

  const { data: actions, isLoading, error } = useQuery({
    queryKey: ["agent-actions", limit],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("agent_action_log")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as AgentAction[];
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Real-time subscription for new actions
  useEffect(() => {
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('agent-actions-hook')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'agent_action_log',
          filter: `user_id=eq.${user.id}`
        }, () => {
          queryClient.invalidateQueries({ queryKey: ["agent-actions"] });
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtime();
  }, [queryClient]);

  const revertAction = useMutation({
    mutationFn: async ({ actionId, reason }: { actionId: string; reason?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get the action details first
      const { data: action, error: fetchError } = await supabase
        .from("agent_action_log")
        .select("*")
        .eq("id", actionId)
        .eq("user_id", user.id)
        .single();
      
      if (fetchError || !action) throw new Error("Action not found");
      if (action.status === 'reverted') throw new Error("Action already reverted");

      // Update action status
      const { error: updateError } = await supabase
        .from("agent_action_log")
        .update({
          status: 'reverted',
          reverted_at: new Date().toISOString(),
          revert_reason: reason || 'User requested revert'
        })
        .eq("id", actionId);
      
      if (updateError) throw updateError;

      // Reverse specific actions
      const payload = action.action_payload as Record<string, any> | null;
      if (action.action_type === 'auto_goal_adjust' && payload?.previousTarget) {
        await supabase
          .from("health_goals")
          .update({ target_value: payload.previousTarget })
          .eq("user_id", user.id)
          .eq("goal_type", payload.goal_type)
          .eq("status", "active");
      }

      return action;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-actions"] });
      queryClient.invalidateQueries({ queryKey: ["health-goals"] });
    }
  });

  const todayActionCount = actions?.filter(a => {
    const today = new Date().toISOString().split('T')[0];
    return a.created_at.startsWith(today) && a.status === 'completed';
  }).length || 0;

  const completedActions = actions?.filter(a => a.status === 'completed') || [];
  const revertedActions = actions?.filter(a => a.status === 'reverted') || [];

  return {
    actions,
    completedActions,
    revertedActions,
    todayActionCount,
    isLoading,
    error,
    revertAction: revertAction.mutate,
    isReverting: revertAction.isPending
  };
}
