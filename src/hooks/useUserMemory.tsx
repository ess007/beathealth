import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UserMemory {
  id: string;
  user_id: string;
  memory_type: 'preference' | 'fact' | 'pattern' | 'context';
  key: string;
  value: any;
  confidence: number;
  source: 'explicit' | 'inferred' | 'learned';
  created_at: string;
  updated_at: string;
  accessed_at: string;
  access_count: number;
}

export interface UserModel {
  user_id: string;
  persona: Record<string, any>;
  communication_preferences: Record<string, any>;
  engagement_patterns: Record<string, any>;
  health_priorities: Record<string, any>;
  pain_points: Record<string, any>;
  success_patterns: Record<string, any>;
  last_analyzed_at: string | null;
  updated_at: string;
}

export interface InteractionOutcome {
  id: string;
  user_id: string;
  interaction_type: 'nudge' | 'chat' | 'agent_action' | 'notification' | 'checkin';
  interaction_id: string | null;
  delivered_at: string;
  engaged_at: string | null;
  engagement_type: 'opened' | 'clicked' | 'completed' | 'dismissed' | 'ignored' | null;
  time_to_engage_seconds: number | null;
  context: Record<string, any>;
  created_at: string;
}

export function useUserMemory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all memories for the current user
  const { data: memories, isLoading: memoriesLoading } = useQuery({
    queryKey: ["user-memories", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("user_memory")
        .select("*")
        .eq("user_id", user.id)
        .order("access_count", { ascending: false });
      if (error) throw error;
      return data as UserMemory[];
    },
    enabled: !!user?.id
  });

  // Fetch user model
  const { data: userModel, isLoading: modelLoading } = useQuery({
    queryKey: ["user-model", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("user_model")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as UserModel | null;
    },
    enabled: !!user?.id
  });

  // Fetch interaction outcomes (last 30 days)
  const { data: outcomes, isLoading: outcomesLoading } = useQuery({
    queryKey: ["interaction-outcomes", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await supabase
        .from("interaction_outcomes")
        .select("*")
        .eq("user_id", user.id)
        .gte("delivered_at", thirtyDaysAgo.toISOString())
        .order("delivered_at", { ascending: false });
      if (error) throw error;
      return data as InteractionOutcome[];
    },
    enabled: !!user?.id
  });

  // Remember a fact/preference mutation
  const rememberMutation = useMutation({
    mutationFn: async ({ 
      memoryType, 
      key, 
      value, 
      source = 'explicit',
      confidence = 1.0 
    }: { 
      memoryType: UserMemory['memory_type']; 
      key: string; 
      value: any;
      source?: UserMemory['source'];
      confidence?: number;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("user_memory")
        .upsert({
          user_id: user.id,
          memory_type: memoryType,
          key,
          value,
          source,
          confidence,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,memory_type,key'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-memories"] });
    }
  });

  // Log interaction outcome mutation
  const logOutcomeMutation = useMutation({
    mutationFn: async ({
      interactionType,
      interactionId,
      context = {}
    }: {
      interactionType: InteractionOutcome['interaction_type'];
      interactionId?: string;
      context?: Record<string, any>;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("interaction_outcomes")
        .insert({
          user_id: user.id,
          interaction_type: interactionType,
          interaction_id: interactionId || null,
          delivered_at: new Date().toISOString(),
          context
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interaction-outcomes"] });
    }
  });

  // Mark interaction as engaged
  const markEngagedMutation = useMutation({
    mutationFn: async ({
      outcomeId,
      engagementType
    }: {
      outcomeId: string;
      engagementType: NonNullable<InteractionOutcome['engagement_type']>;
    }) => {
      // Get the original outcome to calculate time
      const { data: outcome, error: fetchError } = await supabase
        .from("interaction_outcomes")
        .select("delivered_at")
        .eq("id", outcomeId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const deliveredAt = new Date(outcome.delivered_at);
      const now = new Date();
      const timeToEngage = Math.round((now.getTime() - deliveredAt.getTime()) / 1000);
      
      const { data, error } = await supabase
        .from("interaction_outcomes")
        .update({
          engaged_at: now.toISOString(),
          engagement_type: engagementType,
          time_to_engage_seconds: timeToEngage
        })
        .eq("id", outcomeId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interaction-outcomes"] });
    }
  });

  // Delete a memory
  const forgetMutation = useMutation({
    mutationFn: async (memoryId: string) => {
      const { error } = await supabase
        .from("user_memory")
        .delete()
        .eq("id", memoryId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-memories"] });
    }
  });

  // Get memories by type
  const getMemoriesByType = (type: UserMemory['memory_type']) => {
    return memories?.filter(m => m.memory_type === type) || [];
  };

  // Get a specific memory value
  const recall = (type: UserMemory['memory_type'], key: string) => {
    const memory = memories?.find(m => m.memory_type === type && m.key === key);
    return memory?.value;
  };

  // Calculate engagement stats
  const engagementStats = {
    totalInteractions: outcomes?.length || 0,
    engaged: outcomes?.filter(o => o.engagement_type && o.engagement_type !== 'ignored').length || 0,
    ignored: outcomes?.filter(o => o.engagement_type === 'ignored').length || 0,
    avgResponseTime: outcomes?.filter(o => o.time_to_engage_seconds)
      .reduce((sum, o) => sum + (o.time_to_engage_seconds || 0), 0) / 
      (outcomes?.filter(o => o.time_to_engage_seconds).length || 1),
    engagementRate: outcomes?.length 
      ? (outcomes.filter(o => o.engagement_type && o.engagement_type !== 'ignored').length / outcomes.length) * 100 
      : 0
  };

  return {
    // Data
    memories,
    userModel,
    outcomes,
    engagementStats,
    
    // Loading states
    isLoading: memoriesLoading || modelLoading || outcomesLoading,
    
    // Helper functions
    getMemoriesByType,
    recall,
    
    // Mutations
    remember: rememberMutation.mutateAsync,
    logOutcome: logOutcomeMutation.mutateAsync,
    markEngaged: markEngagedMutation.mutateAsync,
    forget: forgetMutation.mutateAsync,
    
    // Mutation states
    isRemembering: rememberMutation.isPending,
    isLogging: logOutcomeMutation.isPending
  };
}
