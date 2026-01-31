import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-secret, x-cron-secret',
};

const INTERNAL_SECRET = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const CRON_SECRET = 'beat-cron-internal'; // Internal cron authentication

interface EngagementPattern {
  preferredHours: number[];
  avgResponseTime: number;
  engagementRate: number;
  preferredChannels: string[];
  responsiveCategories: string[];
  ignoredCategories: string[];
}

interface UserModelUpdate {
  persona?: Record<string, any>;
  communication_preferences?: Record<string, any>;
  engagement_patterns?: Record<string, any>;
  health_priorities?: Record<string, any>;
  pain_points?: Record<string, any>;
  success_patterns?: Record<string, any>;
}

// Analyze interaction outcomes to learn patterns
async function analyzeEngagementPatterns(supabase: any, userId: string): Promise<EngagementPattern> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: outcomes, error } = await supabase
    .from('interaction_outcomes')
    .select('*')
    .eq('user_id', userId)
    .gte('delivered_at', thirtyDaysAgo.toISOString());

  if (error || !outcomes || outcomes.length === 0) {
    return {
      preferredHours: [9, 10, 11, 18, 19, 20], // Default morning/evening
      avgResponseTime: 0,
      engagementRate: 0,
      preferredChannels: ['app'],
      responsiveCategories: [],
      ignoredCategories: []
    };
  }

  // Analyze which hours get engagement
  const hourEngagement: Record<number, { engaged: number; total: number }> = {};
  const categoryEngagement: Record<string, { engaged: number; total: number }> = {};
  const channelEngagement: Record<string, { engaged: number; total: number }> = {};
  
  let totalResponseTime = 0;
  let responseCount = 0;
  let totalEngaged = 0;

  for (const outcome of outcomes) {
    const hour = new Date(outcome.delivered_at).getHours();
    const engaged = outcome.engagement_type && outcome.engagement_type !== 'ignored';
    
    // Track by hour
    if (!hourEngagement[hour]) hourEngagement[hour] = { engaged: 0, total: 0 };
    hourEngagement[hour].total++;
    if (engaged) hourEngagement[hour].engaged++;

    // Track by category from context
    const category = outcome.context?.category || 'general';
    if (!categoryEngagement[category]) categoryEngagement[category] = { engaged: 0, total: 0 };
    categoryEngagement[category].total++;
    if (engaged) categoryEngagement[category].engaged++;

    // Track by channel
    const channel = outcome.context?.channel || 'app';
    if (!channelEngagement[channel]) channelEngagement[channel] = { engaged: 0, total: 0 };
    channelEngagement[channel].total++;
    if (engaged) channelEngagement[channel].engaged++;

    // Track response times
    if (outcome.time_to_engage_seconds && engaged) {
      totalResponseTime += outcome.time_to_engage_seconds;
      responseCount++;
    }

    if (engaged) totalEngaged++;
  }

  // Find preferred hours (top 6 by engagement rate, with minimum 2 interactions)
  const preferredHours = Object.entries(hourEngagement)
    .filter(([_, stats]) => stats.total >= 2)
    .sort((a, b) => (b[1].engaged / b[1].total) - (a[1].engaged / a[1].total))
    .slice(0, 6)
    .map(([hour]) => parseInt(hour));

  // Find responsive vs ignored categories
  const responsiveCategories = Object.entries(categoryEngagement)
    .filter(([_, stats]) => stats.total >= 3 && (stats.engaged / stats.total) > 0.5)
    .map(([cat]) => cat);
  
  const ignoredCategories = Object.entries(categoryEngagement)
    .filter(([_, stats]) => stats.total >= 3 && (stats.engaged / stats.total) < 0.2)
    .map(([cat]) => cat);

  // Find preferred channels
  const preferredChannels = Object.entries(channelEngagement)
    .filter(([_, stats]) => stats.total >= 2)
    .sort((a, b) => (b[1].engaged / b[1].total) - (a[1].engaged / a[1].total))
    .slice(0, 3)
    .map(([channel]) => channel);

  return {
    preferredHours: preferredHours.length > 0 ? preferredHours : [9, 10, 18, 19],
    avgResponseTime: responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0,
    engagementRate: outcomes.length > 0 ? Math.round((totalEngaged / outcomes.length) * 100) : 0,
    preferredChannels: preferredChannels.length > 0 ? preferredChannels : ['app'],
    responsiveCategories,
    ignoredCategories
  };
}

// Analyze health logging patterns to infer priorities
async function analyzeHealthPriorities(supabase: any, userId: string): Promise<Record<string, any>> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [bpLogs, sugarLogs, behaviorLogs, mealLogs] = await Promise.all([
    supabase.from('bp_logs').select('id').eq('user_id', userId).gte('measured_at', thirtyDaysAgo.toISOString()),
    supabase.from('sugar_logs').select('id').eq('user_id', userId).gte('measured_at', thirtyDaysAgo.toISOString()),
    supabase.from('behavior_logs').select('id').eq('user_id', userId).gte('log_date', thirtyDaysAgo.toISOString().split('T')[0]),
    supabase.from('meal_logs').select('id').eq('user_id', userId).gte('logged_at', thirtyDaysAgo.toISOString())
  ]);

  const counts = {
    bp: bpLogs.data?.length || 0,
    sugar: sugarLogs.data?.length || 0,
    behavior: behaviorLogs.data?.length || 0,
    meals: mealLogs.data?.length || 0
  };

  // Sort by engagement
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  
  return {
    primary: sorted[0]?.[0] || 'bp',
    secondary: sorted[1]?.[0] || 'sugar',
    loggingFrequency: counts,
    mostActive: sorted[0]?.[0],
    leastActive: sorted[sorted.length - 1]?.[0]
  };
}

// Analyze what nudge/action patterns led to positive outcomes
async function analyzeSuccessPatterns(supabase: any, userId: string): Promise<Record<string, any>> {
  const { data: actions, error } = await supabase
    .from('agent_action_log')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error || !actions || actions.length === 0) {
    return { patterns: [], successfulActions: [] };
  }

  // Cross-reference with outcomes
  const { data: outcomes } = await supabase
    .from('interaction_outcomes')
    .select('*')
    .eq('user_id', userId)
    .in('interaction_type', ['nudge', 'agent_action']);

  const outcomeMap = new Map();
  outcomes?.forEach((o: any) => {
    if (o.interaction_id) outcomeMap.set(o.interaction_id, o);
  });

  // Find which action types led to engagement
  const actionSuccess: Record<string, { successful: number; total: number }> = {};
  
  for (const action of actions) {
    const type = action.action_type;
    if (!actionSuccess[type]) actionSuccess[type] = { successful: 0, total: 0 };
    actionSuccess[type].total++;

    // Check if there was a positive outcome
    // Look for activity in the hour following the action
    const actionTime = new Date(action.created_at);
    const hourLater = new Date(actionTime.getTime() + 60 * 60 * 1000);
    
    // Check if user logged something after this action
    const { data: followupActivity } = await supabase
      .from('bp_logs')
      .select('id')
      .eq('user_id', userId)
      .gte('measured_at', actionTime.toISOString())
      .lte('measured_at', hourLater.toISOString())
      .limit(1);

    if (followupActivity && followupActivity.length > 0) {
      actionSuccess[type].successful++;
    }
  }

  const successfulActions = Object.entries(actionSuccess)
    .filter(([_, stats]) => stats.total >= 3 && (stats.successful / stats.total) > 0.3)
    .map(([type, stats]) => ({
      type,
      successRate: Math.round((stats.successful / stats.total) * 100),
      total: stats.total
    }));

  return {
    patterns: successfulActions,
    bestPerformingAction: successfulActions[0]?.type || null
  };
}

// Detect pain points from interaction patterns
async function detectPainPoints(supabase: any, userId: string): Promise<Record<string, any>> {
  const painPoints: Record<string, any> = {};

  // Check for ignored nudges pattern
  const { data: recentNudges } = await supabase
    .from('ai_nudges')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  const { data: nudgeOutcomes } = await supabase
    .from('interaction_outcomes')
    .select('*')
    .eq('user_id', userId)
    .eq('interaction_type', 'nudge')
    .order('delivered_at', { ascending: false })
    .limit(20);

  const ignoredCount = nudgeOutcomes?.filter((o: any) => o.engagement_type === 'ignored').length || 0;
  if (ignoredCount > 10) {
    painPoints.nudgeFatigue = {
      detected: true,
      ignoredCount,
      recommendation: 'Reduce nudge frequency'
    };
  }

  // Check for broken streaks
  const { data: streaks } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId);

  const mainStreak = streaks?.find((s: any) => s.type === 'main');
  if (mainStreak && mainStreak.count < 3) {
    painPoints.streakStruggles = {
      detected: true,
      currentStreak: mainStreak.count,
      recommendation: 'Consider simpler check-in reminders'
    };
  }

  return painPoints;
}

// Update user model with learnings
async function updateUserModel(supabase: any, userId: string, updates: UserModelUpdate) {
  const { data: existing } = await supabase
    .from('user_model')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existing) {
    // Merge with existing data
    const merged = {
      persona: { ...existing.persona, ...updates.persona },
      communication_preferences: { ...existing.communication_preferences, ...updates.communication_preferences },
      engagement_patterns: { ...existing.engagement_patterns, ...updates.engagement_patterns },
      health_priorities: { ...existing.health_priorities, ...updates.health_priorities },
      pain_points: { ...existing.pain_points, ...updates.pain_points },
      success_patterns: { ...existing.success_patterns, ...updates.success_patterns },
      last_analyzed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await supabase
      .from('user_model')
      .update(merged)
      .eq('user_id', userId);
  } else {
    await supabase
      .from('user_model')
      .insert({
        user_id: userId,
        ...updates,
        last_analyzed_at: new Date().toISOString()
      });
  }
}

// Store learned memories
async function storeLearnedMemories(supabase: any, userId: string, learnings: Record<string, any>) {
  const memories = [];

  if (learnings.engagement?.preferredHours?.length > 0) {
    memories.push({
      user_id: userId,
      memory_type: 'pattern',
      key: 'preferred_notification_hours',
      value: learnings.engagement.preferredHours,
      source: 'learned',
      confidence: Math.min(0.9, learnings.engagement.engagementRate / 100 + 0.3)
    });
  }

  if (learnings.engagement?.responsiveCategories?.length > 0) {
    memories.push({
      user_id: userId,
      memory_type: 'preference',
      key: 'responsive_nudge_categories',
      value: learnings.engagement.responsiveCategories,
      source: 'learned',
      confidence: 0.8
    });
  }

  if (learnings.engagement?.ignoredCategories?.length > 0) {
    memories.push({
      user_id: userId,
      memory_type: 'preference',
      key: 'ignored_nudge_categories',
      value: learnings.engagement.ignoredCategories,
      source: 'learned',
      confidence: 0.8
    });
  }

  if (learnings.priorities?.primary) {
    memories.push({
      user_id: userId,
      memory_type: 'fact',
      key: 'primary_health_focus',
      value: { metric: learnings.priorities.primary, frequency: learnings.priorities.loggingFrequency[learnings.priorities.primary] },
      source: 'learned',
      confidence: 0.85
    });
  }

  // Upsert all memories
  for (const memory of memories) {
    await supabase.rpc('remember_user_fact', {
      p_user_id: memory.user_id,
      p_memory_type: memory.memory_type,
      p_key: memory.key,
      p_value: memory.value,
      p_source: memory.source,
      p_confidence: memory.confidence
    });
  }
}

// Main learning analysis for a user
async function analyzeUser(supabase: any, userId: string) {
  console.log(`[agent-learning] Analyzing user ${userId}`);

  const [engagement, priorities, successPatterns, painPoints] = await Promise.all([
    analyzeEngagementPatterns(supabase, userId),
    analyzeHealthPriorities(supabase, userId),
    analyzeSuccessPatterns(supabase, userId),
    detectPainPoints(supabase, userId)
  ]);

  const learnings = {
    engagement,
    priorities,
    successPatterns,
    painPoints,
    analyzedAt: new Date().toISOString()
  };

  // Update user model
  await updateUserModel(supabase, userId, {
    engagement_patterns: engagement,
    health_priorities: priorities,
    success_patterns: successPatterns,
    pain_points: painPoints
  });

  // Store individual memories
  await storeLearnedMemories(supabase, userId, learnings);

  console.log(`[agent-learning] Analysis complete for user ${userId}`);
  return learnings;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication - internal or cron calls allowed
    const internalSecret = req.headers.get('x-internal-secret');
    const cronSecret = req.headers.get('x-cron-secret');
    const isAuthorized = (internalSecret && internalSecret === INTERNAL_SECRET) || 
                         (cronSecret && cronSecret === CRON_SECRET);
    
    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json().catch(() => ({}));
    const { userId, mode = 'single' } = body;

    if (mode === 'batch') {
      // Analyze all active users (for weekly cron)
      const { data: activeUsers } = await supabase
        .from('profiles')
        .select('id')
        .eq('onboarding_completed', true);

      const results = [];
      for (const user of activeUsers || []) {
        try {
          const result = await analyzeUser(supabase, user.id);
          results.push({ userId: user.id, success: true, learnings: result });
        } catch (error: any) {
          results.push({ userId: user.id, success: false, error: error.message });
        }
      }

      return new Response(
        JSON.stringify({ mode: 'batch', analyzed: results.length, results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (userId) {
      // Analyze single user
      const result = await analyzeUser(supabase, userId);
      return new Response(
        JSON.stringify({ success: true, userId, learnings: result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'userId required for single mode' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error('[agent-learning] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Learning analysis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
