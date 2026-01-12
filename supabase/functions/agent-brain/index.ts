import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const requestSchema = z.object({
  userId: z.string().uuid(),
  triggerType: z.enum(['scheduled', 'bp_logged', 'sugar_logged', 'morning_analysis', 'evening_analysis', 'streak_check', 'manual']),
  triggerPayload: z.record(z.any()).optional().default({}),
});

// L2 Agent Tool Definitions
const agentTools = [
  // READ TOOLS
  {
    type: "function",
    function: {
      name: "get_health_summary",
      description: "Get comprehensive health summary including latest BP, sugar, streaks, and heart score",
      parameters: { type: "object", properties: {}, required: [] }
    }
  },
  {
    type: "function",
    function: {
      name: "get_recent_trends",
      description: "Analyze BP and sugar trends over the past 7 days",
      parameters: { type: "object", properties: {}, required: [] }
    }
  },
  {
    type: "function",
    function: {
      name: "check_streak_risk",
      description: "Check if user's streak is at risk of breaking",
      parameters: { type: "object", properties: {}, required: [] }
    }
  },
  // AUTONOMOUS WRITE TOOLS (L2 specific)
  {
    type: "function",
    function: {
      name: "auto_send_nudge",
      description: "Send a proactive nudge to the user",
      parameters: {
        type: "object",
        properties: {
          message: { type: "string", description: "The nudge message" },
          category: { type: "string", enum: ["motivation", "health_alert", "celebration", "reminder", "insight"] },
          urgency: { type: "string", enum: ["low", "normal", "high"] }
        },
        required: ["message", "category"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "auto_celebrate",
      description: "Trigger a celebration for an achievement",
      parameters: {
        type: "object",
        properties: {
          achievement_type: { type: "string", description: "Type of achievement" },
          message: { type: "string", description: "Celebration message" }
        },
        required: ["achievement_type", "message"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "auto_adjust_goal",
      description: "Automatically adjust a health goal based on progress",
      parameters: {
        type: "object",
        properties: {
          goal_type: { type: "string", description: "Type of goal (bp, sugar, steps, weight)" },
          new_target: { type: "number", description: "New target value" },
          reason: { type: "string", description: "Reason for adjustment" }
        },
        required: ["goal_type", "new_target", "reason"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "schedule_followup",
      description: "Schedule a follow-up check for the user",
      parameters: {
        type: "object",
        properties: {
          check_type: { type: "string", description: "Type of check to schedule" },
          delay_hours: { type: "number", description: "Hours to wait before check" },
          message: { type: "string", description: "Message to show at followup" }
        },
        required: ["check_type", "delay_hours"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "escalate_concern",
      description: "Flag a health concern for user attention",
      parameters: {
        type: "object",
        properties: {
          concern_type: { type: "string", enum: ["bp_trend", "sugar_trend", "missed_meds", "streak_at_risk", "irregular_pattern"] },
          severity: { type: "string", enum: ["info", "warning", "urgent"] },
          recommendation: { type: "string", description: "Recommended action" }
        },
        required: ["concern_type", "severity", "recommendation"]
      }
    }
  }
];

// Fetch user's full health context
async function getUserContext(supabase: any, userId: string) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const today = now.toISOString().split('T')[0];

  const [profile, bpLogs, sugarLogs, streaks, heartScores, goals, preferences, recentActions] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('bp_logs').select('*').eq('user_id', userId).gte('measured_at', sevenDaysAgo).order('measured_at', { ascending: false }),
    supabase.from('sugar_logs').select('*').eq('user_id', userId).gte('measured_at', sevenDaysAgo).order('measured_at', { ascending: false }),
    supabase.from('streaks').select('*').eq('user_id', userId),
    supabase.from('heart_scores').select('*').eq('user_id', userId).order('score_date', { ascending: false }).limit(7),
    supabase.from('health_goals').select('*').eq('user_id', userId).eq('status', 'active'),
    supabase.from('agent_preferences').select('*').eq('user_id', userId).single(),
    supabase.from('agent_action_log').select('*').eq('user_id', userId).gte('created_at', sevenDaysAgo).order('created_at', { ascending: false }).limit(20)
  ]);

  // Calculate trends
  const bpTrend = analyzeBPTrend(bpLogs.data || []);
  const sugarTrend = analyzeSugarTrend(sugarLogs.data || []);
  const mainStreak = streaks.data?.find((s: any) => s.type === 'main');
  const latestHeartScore = heartScores.data?.[0];

  return {
    profile: profile.data,
    preferences: preferences.data || { autonomy_level: 'balanced', auto_nudge_enabled: true, auto_celebrate_enabled: true, auto_escalate_enabled: true, auto_goal_adjust_enabled: false, max_nudges_per_day: 5 },
    health: {
      latestBP: bpLogs.data?.[0],
      latestSugar: sugarLogs.data?.[0],
      bpTrend,
      sugarTrend,
      mainStreak: mainStreak?.count || 0,
      lastStreakLog: mainStreak?.last_logged_at,
      heartScore: latestHeartScore?.heart_score,
      activeGoals: goals.data || []
    },
    recentActions: recentActions.data || [],
    today,
    currentHour: now.getHours()
  };
}

function analyzeBPTrend(logs: any[]) {
  if (logs.length < 3) return { trend: 'insufficient_data', average: null };
  const recent = logs.slice(0, 5);
  const avgSystolic = recent.reduce((sum, l) => sum + l.systolic, 0) / recent.length;
  const avgDiastolic = recent.reduce((sum, l) => sum + l.diastolic, 0) / recent.length;
  
  // Compare first half to second half
  const mid = Math.floor(recent.length / 2);
  const firstHalf = recent.slice(0, mid);
  const secondHalf = recent.slice(mid);
  const firstAvg = firstHalf.reduce((sum, l) => sum + l.systolic, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, l) => sum + l.systolic, 0) / secondHalf.length;
  
  let trend = 'stable';
  if (firstAvg - secondAvg > 5) trend = 'improving';
  else if (secondAvg - firstAvg > 5) trend = 'worsening';
  
  const status = avgSystolic < 120 && avgDiastolic < 80 ? 'normal' :
                 avgSystolic < 140 && avgDiastolic < 90 ? 'elevated' : 'high';
  
  return { trend, average: { systolic: Math.round(avgSystolic), diastolic: Math.round(avgDiastolic) }, status, count: logs.length };
}

function analyzeSugarTrend(logs: any[]) {
  if (logs.length < 3) return { trend: 'insufficient_data', average: null };
  const fastingLogs = logs.filter(l => l.measurement_type === 'fasting');
  if (fastingLogs.length < 2) return { trend: 'insufficient_data', average: null };
  
  const avgFasting = fastingLogs.reduce((sum, l) => sum + l.glucose_mg_dl, 0) / fastingLogs.length;
  const status = avgFasting < 100 ? 'normal' : avgFasting < 126 ? 'pre_diabetic' : 'diabetic_range';
  
  return { trend: 'stable', average: Math.round(avgFasting), status, count: logs.length };
}

// Check guardrails before allowing action
async function checkGuardrails(supabase: any, userId: string, actionType: string, preferences: any): Promise<{ allowed: boolean; reason?: string }> {
  if (actionType === 'auto_nudge' && !preferences.auto_nudge_enabled) {
    return { allowed: false, reason: 'Auto-nudge disabled by user' };
  }
  if (actionType === 'auto_celebrate' && !preferences.auto_celebrate_enabled) {
    return { allowed: false, reason: 'Auto-celebrate disabled by user' };
  }
  if (actionType === 'auto_goal_adjust' && !preferences.auto_goal_adjust_enabled) {
    return { allowed: false, reason: 'Auto goal adjustment disabled by user' };
  }
  if (actionType === 'escalate_concern' && !preferences.auto_escalate_enabled) {
    return { allowed: false, reason: 'Auto-escalation disabled by user' };
  }

  // Check quiet hours
  const now = new Date();
  const currentHour = now.getHours();
  const quietStart = parseInt(preferences.quiet_hours_start?.split(':')[0] || '22');
  const quietEnd = parseInt(preferences.quiet_hours_end?.split(':')[0] || '7');
  
  const inQuietHours = (quietStart > quietEnd) 
    ? (currentHour >= quietStart || currentHour < quietEnd)
    : (currentHour >= quietStart && currentHour < quietEnd);
  
  if (inQuietHours && actionType !== 'escalate_concern') {
    return { allowed: false, reason: 'User is in quiet hours' };
  }

  // Check daily limits for nudges
  if (actionType === 'auto_nudge') {
    const { data: count } = await supabase.rpc('get_agent_nudge_count_today', { p_user_id: userId });
    if (count >= preferences.max_nudges_per_day) {
      return { allowed: false, reason: `Daily nudge limit reached (${preferences.max_nudges_per_day})` };
    }
  }

  // Check weekly limits for goal adjustments
  if (actionType === 'auto_goal_adjust') {
    const { data: count } = await supabase.rpc('get_agent_goal_adjustments_this_week', { p_user_id: userId });
    if (count >= preferences.max_goal_adjustments_per_week) {
      return { allowed: false, reason: `Weekly goal adjustment limit reached (${preferences.max_goal_adjustments_per_week})` };
    }
  }

  return { allowed: true };
}

// Execute agent tool
async function executeAgentTool(supabase: any, userId: string, toolName: string, args: any, preferences: any, triggerType: string): Promise<{ success: boolean; result?: any; error?: string; actionId?: string }> {
  // Check guardrails for write operations
  if (['auto_nudge', 'auto_celebrate', 'auto_goal_adjust', 'escalate_concern'].includes(toolName)) {
    const guardrailCheck = await checkGuardrails(supabase, userId, toolName, preferences);
    if (!guardrailCheck.allowed) {
      return { success: false, error: guardrailCheck.reason };
    }
  }

  let result: any;
  let actionPayload = args;

  switch (toolName) {
    case 'get_health_summary':
      const context = await getUserContext(supabase, userId);
      return { success: true, result: context.health };

    case 'get_recent_trends':
      const trendContext = await getUserContext(supabase, userId);
      return { success: true, result: { bp: trendContext.health.bpTrend, sugar: trendContext.health.sugarTrend } };

    case 'check_streak_risk':
      const { data: streak } = await supabase.from('streaks').select('*').eq('user_id', userId).eq('type', 'main').single();
      const lastLogged = streak?.last_logged_at ? new Date(streak.last_logged_at) : null;
      const hoursSinceLog = lastLogged ? (Date.now() - lastLogged.getTime()) / (1000 * 60 * 60) : 999;
      return { success: true, result: { atRisk: hoursSinceLog > 20, hoursSinceLog: Math.round(hoursSinceLog), currentStreak: streak?.count || 0 } };

    case 'auto_send_nudge':
      const { error: nudgeError } = await supabase.from('ai_nudges').insert({
        user_id: userId,
        nudge_text: args.message,
        category: args.category,
        delivered_via: 'agent'
      });
      if (nudgeError) return { success: false, error: nudgeError.message };
      result = { sent: true, message: args.message };
      break;

    case 'auto_celebrate':
      // Check if achievement already exists
      const { data: existingAchievement } = await supabase.from('achievements')
        .select('id').eq('user_id', userId).eq('badge_type', args.achievement_type).single();
      
      if (!existingAchievement) {
        await supabase.from('achievements').insert({
          user_id: userId,
          badge_type: args.achievement_type,
          metadata: { message: args.message, source: 'agent' }
        });
      }
      
      // Also send a celebration nudge
      await supabase.from('ai_nudges').insert({
        user_id: userId,
        nudge_text: args.message,
        category: 'celebration',
        delivered_via: 'agent'
      });
      result = { celebrated: true, achievement: args.achievement_type };
      break;

    case 'auto_adjust_goal':
      const { data: goal } = await supabase.from('health_goals')
        .select('*').eq('user_id', userId).eq('goal_type', args.goal_type).eq('status', 'active').single();
      
      if (!goal) return { success: false, error: `No active ${args.goal_type} goal found` };
      
      const previousTarget = goal.target_value;
      await supabase.from('health_goals').update({ 
        target_value: args.new_target,
        notes: `Auto-adjusted by agent: ${args.reason}. Previous target: ${previousTarget}`
      }).eq('id', goal.id);
      
      result = { adjusted: true, goalType: args.goal_type, previousTarget, newTarget: args.new_target };
      actionPayload = { ...args, previousTarget };
      break;

    case 'schedule_followup':
      const scheduledFor = new Date(Date.now() + args.delay_hours * 60 * 60 * 1000);
      await supabase.from('agent_scheduled_tasks').insert({
        user_id: userId,
        task_type: args.check_type,
        scheduled_for: scheduledFor.toISOString(),
        priority: 5,
        payload: { message: args.message, original_trigger: triggerType }
      });
      result = { scheduled: true, scheduledFor: scheduledFor.toISOString() };
      break;

    case 'escalate_concern':
      await supabase.from('ai_nudges').insert({
        user_id: userId,
        nudge_text: `⚠️ ${args.severity.toUpperCase()}: ${args.recommendation}`,
        category: 'health_alert',
        delivered_via: 'agent'
      });
      result = { escalated: true, severity: args.severity };
      break;

    default:
      return { success: false, error: `Unknown tool: ${toolName}` };
  }

  // Log the action for transparency
  const { data: actionLog } = await supabase.from('agent_action_log').insert({
    user_id: userId,
    action_type: toolName,
    action_payload: actionPayload,
    trigger_reason: `Triggered by ${triggerType} analysis`,
    trigger_type: triggerType,
    status: 'completed'
  }).select('id').single();

  return { success: true, result, actionId: actionLog?.id };
}

// Main agent brain function
async function analyzeAndAct(supabase: any, userId: string, triggerType: string, triggerPayload: any = {}) {
  console.log(`[Agent Brain] Starting analysis for user ${userId}, trigger: ${triggerType}`);
  
  const context = await getUserContext(supabase, userId);
  const { preferences, health, profile, currentHour, recentActions } = context;
  
  // Build system prompt based on autonomy level
  const autonomyInstructions = {
    minimal: "You are in OBSERVATION mode. Only call get_* functions to gather info. DO NOT take any auto_* actions. Simply report your observations.",
    balanced: "You are in BALANCED mode. You can send nudges, celebrate achievements, and escalate concerns. DO NOT adjust goals automatically. Be thoughtful and sparing with actions.",
    full: "You are in FULL AUTONOMY mode. You can take any action that would benefit the user's health journey. Be proactive but respectful. Max 1-2 actions per trigger."
  };

  const systemPrompt = `You are Beat's L2 Health Agent. You proactively monitor and support the user's health journey.

AUTONOMY LEVEL: ${preferences.autonomy_level}
${autonomyInstructions[preferences.autonomy_level as keyof typeof autonomyInstructions] || autonomyInstructions.balanced}

USER PROFILE:
- Name: ${profile?.full_name || 'User'}
- Has Diabetes: ${profile?.has_diabetes ? 'Yes' : 'No'}
- Has Hypertension: ${profile?.has_hypertension ? 'Yes' : 'No'}
- Current Time: ${currentHour}:00

HEALTH STATUS:
- Current Streak: ${health.mainStreak} days
- Latest Heart Score: ${health.heartScore || 'Not calculated'}
- BP Trend: ${JSON.stringify(health.bpTrend)}
- Sugar Trend: ${JSON.stringify(health.sugarTrend)}
- Active Goals: ${health.activeGoals.length}

RECENT AGENT ACTIONS (last 7 days): ${recentActions.length} actions taken
${recentActions.slice(0, 5).map((a: any) => `- ${a.action_type}: ${a.trigger_reason}`).join('\n')}

TRIGGER: ${triggerType}
TRIGGER DATA: ${JSON.stringify(triggerPayload)}

GUIDELINES:
1. Be concise and actionable
2. Avoid duplicate actions (check recent actions)
3. Personalize messages using user's name
4. For health alerts, be caring but not alarming
5. Celebrate milestones genuinely
6. If streak is at risk (>20hrs since log), prioritize reminder

Analyze the situation and decide what actions (if any) to take.`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze the current situation and decide what actions to take based on the ${triggerType} trigger.` }
        ],
        tools: agentTools,
        tool_choice: "auto"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Agent Brain] AI API error: ${response.status} - ${errorText}`);
      return { success: false, error: `AI API error: ${response.status}` };
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;

    if (!message) {
      return { success: false, error: 'No response from AI' };
    }

    const actionResults: any[] = [];

    // Handle tool calls
    if (message.tool_calls && message.tool_calls.length > 0) {
      console.log(`[Agent Brain] Processing ${message.tool_calls.length} tool calls`);
      
      for (const toolCall of message.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments || '{}');
        
        console.log(`[Agent Brain] Executing tool: ${toolName}`, toolArgs);
        
        const toolResult = await executeAgentTool(supabase, userId, toolName, toolArgs, preferences, triggerType);
        actionResults.push({ tool: toolName, ...toolResult });
      }
    }

    return {
      success: true,
      reasoning: message.content,
      actions: actionResults,
      context: {
        healthScore: health.heartScore,
        streak: health.mainStreak,
        bpStatus: health.bpTrend.status,
        sugarStatus: health.sugarTrend.status
      }
    };

  } catch (error: any) {
    console.error(`[Agent Brain] Error:`, error);
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse and validate input
    const body = await req.json();
    const validated = requestSchema.parse(body);
    const { userId, triggerType, triggerPayload } = validated;

    console.log(`[Agent Brain] Request for user ${userId}, trigger: ${triggerType}`);

    const result = await analyzeAndAct(supabase, userId, triggerType, triggerPayload);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('[Agent Brain] Request error:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid input',
          details: error.errors 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
