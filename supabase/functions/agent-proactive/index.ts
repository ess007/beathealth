import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-secret, x-cron-secret',
};

const INTERNAL_SECRET = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const CRON_SECRET = 'beat-cron-internal'; // Internal cron authentication

interface OutreachDecision {
  shouldContact: boolean;
  reason: string | null;
  priority: 'low' | 'normal' | 'high' | 'critical';
  channel: 'app' | 'push' | 'whatsapp';
  message: string | null;
  optimalHour: number | null;
}

// Check if user is in quiet hours
function isInQuietHours(preferences: any): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const quietStart = parseInt(preferences?.quiet_hours_start?.split(':')[0] || '22');
  const quietEnd = parseInt(preferences?.quiet_hours_end?.split(':')[0] || '7');
  
  if (quietStart > quietEnd) {
    return currentHour >= quietStart || currentHour < quietEnd;
  }
  return currentHour >= quietStart && currentHour < quietEnd;
}

// Determine optimal outreach time based on engagement patterns
function getOptimalOutreachHour(userModel: any): number {
  const patterns = userModel?.engagement_patterns;
  if (patterns?.preferredHours?.length > 0) {
    return patterns.preferredHours[0];
  }
  // Default to 9 AM if no pattern
  return 9;
}

// Calculate streak risk
async function checkStreakRisk(supabase: any, userId: string): Promise<{ atRisk: boolean; hoursSinceLog: number; currentStreak: number }> {
  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'main')
    .single();

  const lastLogged = streak?.last_logged_at ? new Date(streak.last_logged_at) : null;
  const hoursSinceLog = lastLogged ? (Date.now() - lastLogged.getTime()) / (1000 * 60 * 60) : 999;
  
  return {
    atRisk: hoursSinceLog > 20, // At risk if more than 20 hours since last log
    hoursSinceLog: Math.round(hoursSinceLog),
    currentStreak: streak?.count || 0
  };
}

// Check for pending health alerts
async function checkHealthAlerts(supabase: any, userId: string): Promise<{ hasAlerts: boolean; alerts: any[] }> {
  const { data: alerts } = await supabase
    .from('health_alerts')
    .select('*')
    .eq('user_id', userId)
    .eq('resolved', false)
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    hasAlerts: (alerts?.length || 0) > 0,
    alerts: alerts || []
  };
}

// Check recent engagement to avoid spam
async function getRecentOutreach(supabase: any, userId: string): Promise<{ count: number; lastOutreach: Date | null }> {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const { data: recentNudges } = await supabase
    .from('ai_nudges')
    .select('created_at')
    .eq('user_id', userId)
    .gte('created_at', twentyFourHoursAgo.toISOString())
    .order('created_at', { ascending: false });

  return {
    count: recentNudges?.length || 0,
    lastOutreach: recentNudges?.[0]?.created_at ? new Date(recentNudges[0].created_at) : null
  };
}

// Main decision engine: should we reach out?
async function decideOutreach(supabase: any, userId: string): Promise<OutreachDecision> {
  // Fetch all context in parallel
  const [preferences, userModel, streakRisk, healthAlerts, recentOutreach, profile] = await Promise.all([
    supabase.from('agent_preferences').select('*').eq('user_id', userId).single(),
    supabase.from('user_model').select('*').eq('user_id', userId).single(),
    checkStreakRisk(supabase, userId),
    checkHealthAlerts(supabase, userId),
    getRecentOutreach(supabase, userId),
    supabase.from('profiles').select('full_name, has_diabetes, has_hypertension').eq('id', userId).single()
  ]);

  const prefs = preferences.data || { auto_nudge_enabled: true, max_nudges_per_day: 5 };
  const model = userModel.data;
  const userName = profile.data?.full_name?.split(' ')[0] || 'there';

  // Check if nudges are disabled
  if (!prefs.auto_nudge_enabled) {
    return { shouldContact: false, reason: 'Nudges disabled', priority: 'low', channel: 'app', message: null, optimalHour: null };
  }

  // Check daily limit
  if (recentOutreach.count >= prefs.max_nudges_per_day) {
    return { shouldContact: false, reason: 'Daily limit reached', priority: 'low', channel: 'app', message: null, optimalHour: null };
  }

  // Check quiet hours (except for critical alerts)
  const inQuietHours = isInQuietHours(prefs);

  // Priority 1: Critical health alerts
  const criticalAlerts = healthAlerts.alerts.filter((a: any) => a.severity === 'critical');
  if (criticalAlerts.length > 0) {
    return {
      shouldContact: true,
      reason: 'critical_health_alert',
      priority: 'critical',
      channel: 'push',
      message: `⚠️ ${userName}, you have an important health alert that needs attention.`,
      optimalHour: null // Send immediately
    };
  }

  // Don't send non-critical during quiet hours
  if (inQuietHours) {
    return { shouldContact: false, reason: 'Quiet hours', priority: 'low', channel: 'app', message: null, optimalHour: getOptimalOutreachHour(model) };
  }

  // Priority 2: Streak at risk
  if (streakRisk.atRisk && streakRisk.currentStreak >= 3) {
    // User has a meaningful streak about to break
    return {
      shouldContact: true,
      reason: 'streak_at_risk',
      priority: 'high',
      channel: 'push',
      message: `Hey ${userName}! 🔥 Your ${streakRisk.currentStreak}-day streak is waiting for you. A quick check-in keeps your momentum going!`,
      optimalHour: null // Send now
    };
  }

  // Priority 3: Warning-level health alerts
  const warningAlerts = healthAlerts.alerts.filter((a: any) => a.severity === 'warning');
  if (warningAlerts.length > 0) {
    return {
      shouldContact: true,
      reason: 'health_warning',
      priority: 'normal',
      channel: 'app',
      message: `${userName}, Beat noticed something worth checking. Take a moment to review your health insights.`,
      optimalHour: getOptimalOutreachHour(model)
    };
  }

  // Priority 4: Inactivity check (hasn't opened app in 3+ days)
  const { data: lastActivity } = await supabase
    .from('behavior_logs')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  const lastActivityDate = lastActivity?.[0]?.created_at ? new Date(lastActivity[0].created_at) : null;
  const daysSinceActivity = lastActivityDate ? (Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24) : 999;

  if (daysSinceActivity >= 3) {
    return {
      shouldContact: true,
      reason: 'inactivity',
      priority: 'normal',
      channel: 'push',
      message: `Hey ${userName}, Beat misses you! Your health journey is waiting. Just one quick check-in to get back on track? 💪`,
      optimalHour: getOptimalOutreachHour(model)
    };
  }

  // Priority 5: Proactive motivation (if engagement rate is good)
  const engagementRate = model?.engagement_patterns?.engagementRate || 0;
  if (engagementRate > 50 && recentOutreach.count === 0) {
    // Highly engaged user, hasn't heard from us today - send motivation
    const motivationalMessages = [
      `Good ${new Date().getHours() < 12 ? 'morning' : 'day'}, ${userName}! Ready to log your health data today?`,
      `${userName}, consistency is your superpower! Let's keep the momentum going.`,
      `Hey ${userName}! Your heart health journey continues today. We're cheering for you! ❤️`
    ];
    return {
      shouldContact: true,
      reason: 'proactive_motivation',
      priority: 'low',
      channel: 'app',
      message: motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)],
      optimalHour: getOptimalOutreachHour(model)
    };
  }

  return { shouldContact: false, reason: 'No action needed', priority: 'low', channel: 'app', message: null, optimalHour: null };
}

// Execute outreach
async function executeOutreach(supabase: any, userId: string, decision: OutreachDecision): Promise<{ success: boolean; nudgeId?: string }> {
  if (!decision.shouldContact || !decision.message) {
    return { success: false };
  }

  // Insert the nudge
  const { data: nudge, error } = await supabase
    .from('ai_nudges')
    .insert({
      user_id: userId,
      nudge_text: decision.message,
      category: decision.reason,
      delivered_via: decision.channel
    })
    .select('id')
    .single();

  if (error) {
    console.error(`[agent-proactive] Failed to create nudge for ${userId}:`, error);
    return { success: false };
  }

  // Log interaction outcome for learning
  await supabase.rpc('log_interaction_outcome', {
    p_user_id: userId,
    p_interaction_type: 'nudge',
    p_interaction_id: nudge.id,
    p_delivered_at: new Date().toISOString(),
    p_context: { reason: decision.reason, priority: decision.priority, channel: decision.channel }
  });

  // Log agent action
  await supabase.from('agent_action_log').insert({
    user_id: userId,
    action_type: 'proactive_outreach',
    action_payload: { nudgeId: nudge.id, reason: decision.reason, priority: decision.priority },
    trigger_reason: `Proactive outreach: ${decision.reason}`,
    trigger_type: 'scheduled',
    status: 'completed'
  });

  console.log(`[agent-proactive] Sent ${decision.priority} nudge to ${userId}: ${decision.reason}`);
  return { success: true, nudgeId: nudge.id };
}

// Process a single user
async function processUser(supabase: any, userId: string): Promise<{ success: boolean; skipped?: boolean; reason?: string | null; nudgeId?: string; error?: string }> {
  try {
    const decision = await decideOutreach(supabase, userId);
    
    if (decision.shouldContact) {
      const result = await executeOutreach(supabase, userId, decision);
      return { success: result.success, nudgeId: result.nudgeId };
    }
    
    return { success: true, skipped: true, reason: decision.reason };
  } catch (error: any) {
    console.error(`[agent-proactive] Error processing user ${userId}:`, error);
    return { success: false, error: error.message };
  }
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
      // Process all active users (for cron job)
      console.log('[agent-proactive] Starting batch processing...');
      
      const { data: activeUsers } = await supabase
        .from('profiles')
        .select('id')
        .eq('onboarding_completed', true);

      const results = {
        processed: 0,
        contacted: 0,
        skipped: 0,
        errors: 0
      };

      for (const user of activeUsers || []) {
        const result = await processUser(supabase, user.id);
        results.processed++;
        
        if (result.success && !result.skipped) {
          results.contacted++;
        } else if (result.skipped) {
          results.skipped++;
        } else {
          results.errors++;
        }
      }

      console.log(`[agent-proactive] Batch complete: ${results.contacted} contacted, ${results.skipped} skipped, ${results.errors} errors`);

      return new Response(
        JSON.stringify({ mode: 'batch', ...results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (userId) {
      // Process single user
      const result = await processUser(supabase, userId);
      return new Response(
        JSON.stringify({ userId, ...result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'userId required for single mode' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error('[agent-proactive] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Proactive outreach failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
