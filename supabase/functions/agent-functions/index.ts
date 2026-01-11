import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================
// BEAT AGENT FUNCTIONS API v1.0
// L1 Agent-Compatible Function Spec
// ============================================

// Input validation schemas for each function
const schemas = {
  get_health_summary: z.object({
    date: z.string().optional(),
  }),
  get_bp_history: z.object({
    start_date: z.string(),
    end_date: z.string(),
    limit: z.number().optional().default(30),
  }),
  get_sugar_history: z.object({
    start_date: z.string(),
    end_date: z.string(),
    measurement_type: z.enum(['fasting', 'random', 'post_meal']).optional(),
    limit: z.number().optional().default(30),
  }),
  get_goals: z.object({
    status: z.enum(['active', 'completed', 'abandoned']).optional().default('active'),
  }),
  get_achievements: z.object({}),
  get_family_members: z.object({}),
  log_bp: z.object({
    systolic: z.number().min(60).max(250),
    diastolic: z.number().min(40).max(150),
    heart_rate: z.number().min(30).max(200).optional(),
    ritual_type: z.enum(['morning', 'evening']).optional(),
    notes: z.string().max(500).optional(),
  }),
  log_sugar: z.object({
    glucose_mg_dl: z.number().min(20).max(600),
    measurement_type: z.enum(['fasting', 'random', 'post_meal']),
    ritual_type: z.enum(['morning', 'evening']).optional(),
    notes: z.string().max(500).optional(),
  }),
  log_behavior: z.object({
    ritual_type: z.enum(['morning', 'evening']),
    sleep_hours: z.number().min(0).max(24).optional(),
    sleep_quality: z.enum(['excellent', 'good', 'fair', 'poor', 'very_poor']).optional(),
    steps_count: z.number().min(0).optional(),
    meds_taken: z.boolean().optional(),
    stress_level: z.enum(['low', 'moderate', 'high', 'very_high']).optional(),
    notes: z.string().max(500).optional(),
  }),
  set_goal: z.object({
    goal_type: z.enum(['bp_systolic', 'bp_diastolic', 'sugar_fasting', 'steps', 'weight', 'sleep']),
    target_value: z.number(),
    target_date: z.string().optional(),
  }),
  send_nudge: z.object({
    recipient_id: z.string().uuid(),
    message: z.string().max(280),
  }),
};

// Request schema
const requestSchema = z.object({
  function: z.string(),
  parameters: z.record(z.any()).optional().default({}),
  confirm: z.boolean().optional().default(false), // For write operations requiring confirmation
});

// Function definitions with metadata
const functionMeta: Record<string, { 
  requiresConfirmation: boolean; 
  permission: string;
  description: string;
}> = {
  get_health_summary: { requiresConfirmation: false, permission: 'read:health_data', description: 'Get current health status' },
  get_bp_history: { requiresConfirmation: false, permission: 'read:bp_logs', description: 'Fetch blood pressure history' },
  get_sugar_history: { requiresConfirmation: false, permission: 'read:sugar_logs', description: 'Fetch blood sugar history' },
  get_goals: { requiresConfirmation: false, permission: 'read:health_goals', description: 'Get active health goals' },
  get_achievements: { requiresConfirmation: false, permission: 'read:achievements', description: 'Get earned achievements' },
  get_family_members: { requiresConfirmation: false, permission: 'read:family_links', description: 'Get linked family members' },
  log_bp: { requiresConfirmation: true, permission: 'write:bp_logs', description: 'Record blood pressure reading' },
  log_sugar: { requiresConfirmation: true, permission: 'write:sugar_logs', description: 'Record blood sugar reading' },
  log_behavior: { requiresConfirmation: true, permission: 'write:behavior_logs', description: 'Record daily check-in' },
  set_goal: { requiresConfirmation: true, permission: 'write:health_goals', description: 'Create or update a health goal' },
  send_nudge: { requiresConfirmation: true, permission: 'write:ai_nudges', description: 'Send a motivational nudge' },
};

// ============================================
// FUNCTION IMPLEMENTATIONS
// ============================================

async function getHealthSummary(supabase: any, userId: string, params: any) {
  const date = params.date || new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  const [heartScoreRes, bpRes, sugarRes, streakRes, goalsRes] = await Promise.all([
    supabase.from('heart_scores').select('*').eq('user_id', userId).order('score_date', { ascending: false }).limit(1),
    supabase.from('bp_logs').select('*').eq('user_id', userId).gte('measured_at', `${sevenDaysAgoStr}T00:00:00`).order('measured_at', { ascending: false }).limit(1),
    supabase.from('sugar_logs').select('*').eq('user_id', userId).gte('measured_at', `${sevenDaysAgoStr}T00:00:00`).order('measured_at', { ascending: false }).limit(1),
    supabase.from('streaks').select('*').eq('user_id', userId).eq('type', 'daily_checkin'),
    supabase.from('health_goals').select('*').eq('user_id', userId).eq('status', 'active'),
  ]);

  const latestHeartScore = heartScoreRes.data?.[0];
  const latestBP = bpRes.data?.[0];
  const latestSugar = sugarRes.data?.[0];
  const streak = streakRes.data?.[0];
  const goals = goalsRes.data || [];

  return {
    heart_score: latestHeartScore?.heart_score || null,
    bp: latestBP ? { systolic: latestBP.systolic, diastolic: latestBP.diastolic } : null,
    sugar: latestSugar ? { glucose_mg_dl: latestSugar.glucose_mg_dl, type: latestSugar.measurement_type } : null,
    streak_days: streak?.count || 0,
    goals: goals.map((g: any) => ({
      type: g.goal_type,
      target: g.target_value,
      current: g.current_value,
      progress: g.current_value && g.target_value ? Math.round((g.current_value / g.target_value) * 100) : 0,
    })),
    as_of: date,
  };
}

async function getBPHistory(supabase: any, userId: string, params: any) {
  const { start_date, end_date, limit } = schemas.get_bp_history.parse(params);

  const { data, error } = await supabase
    .from('bp_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('measured_at', `${start_date}T00:00:00`)
    .lte('measured_at', `${end_date}T23:59:59`)
    .order('measured_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  const readings = data || [];
  const avgSystolic = readings.length > 0 
    ? Math.round(readings.reduce((sum: number, r: any) => sum + r.systolic, 0) / readings.length) 
    : null;
  const avgDiastolic = readings.length > 0 
    ? Math.round(readings.reduce((sum: number, r: any) => sum + r.diastolic, 0) / readings.length) 
    : null;

  return {
    readings: readings.map((r: any) => ({
      id: r.id,
      systolic: r.systolic,
      diastolic: r.diastolic,
      heart_rate: r.heart_rate,
      measured_at: r.measured_at,
      ritual_type: r.ritual_type,
    })),
    average: avgSystolic && avgDiastolic ? { systolic: avgSystolic, diastolic: avgDiastolic } : null,
    count: readings.length,
  };
}

async function getSugarHistory(supabase: any, userId: string, params: any) {
  const { start_date, end_date, measurement_type, limit } = schemas.get_sugar_history.parse(params);

  let query = supabase
    .from('sugar_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('measured_at', `${start_date}T00:00:00`)
    .lte('measured_at', `${end_date}T23:59:59`)
    .order('measured_at', { ascending: false })
    .limit(limit);

  if (measurement_type) {
    query = query.eq('measurement_type', measurement_type);
  }

  const { data, error } = await query;
  if (error) throw error;

  const readings = data || [];
  const avgGlucose = readings.length > 0 
    ? Math.round(readings.reduce((sum: number, r: any) => sum + r.glucose_mg_dl, 0) / readings.length) 
    : null;

  return {
    readings: readings.map((r: any) => ({
      id: r.id,
      glucose_mg_dl: r.glucose_mg_dl,
      measurement_type: r.measurement_type,
      measured_at: r.measured_at,
    })),
    average_glucose: avgGlucose,
    count: readings.length,
  };
}

async function getGoals(supabase: any, userId: string, params: any) {
  const { status } = schemas.get_goals.parse(params);

  const { data, error } = await supabase
    .from('health_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return {
    goals: (data || []).map((g: any) => ({
      id: g.id,
      goal_type: g.goal_type,
      target_value: g.target_value,
      current_value: g.current_value,
      target_date: g.target_date,
      progress: g.current_value && g.target_value ? Math.round((g.current_value / g.target_value) * 100) : 0,
      status: g.status,
    })),
  };
}

async function getAchievements(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) throw error;

  return {
    achievements: (data || []).map((a: any) => ({
      id: a.id,
      badge_type: a.badge_type,
      earned_at: a.earned_at,
      shared: a.shared,
    })),
    total: data?.length || 0,
  };
}

async function getFamilyMembers(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('family_links')
    .select(`
      id,
      member_id,
      relationship,
      can_view,
      can_nudge,
      profiles:member_id (full_name, email)
    `)
    .eq('caregiver_id', userId);

  if (error) throw error;

  return {
    members: (data || []).map((f: any) => ({
      id: f.id,
      member_id: f.member_id,
      name: f.profiles?.full_name || 'Unknown',
      relationship: f.relationship,
      can_view: f.can_view,
      can_nudge: f.can_nudge,
    })),
  };
}

async function logBP(supabase: any, userId: string, params: any) {
  const validated = schemas.log_bp.parse(params);

  const { data, error } = await supabase
    .from('bp_logs')
    .insert({
      user_id: userId,
      systolic: validated.systolic,
      diastolic: validated.diastolic,
      heart_rate: validated.heart_rate,
      ritual_type: validated.ritual_type,
      notes: validated.notes,
      measured_at: new Date().toISOString(),
      source_type: 'agent',
    })
    .select()
    .single();

  if (error) throw error;

  // Check for alerts
  const triggersAlert = validated.systolic >= 180 || validated.diastolic >= 120;

  // Update streak
  await supabase.rpc('update_or_create_streak', { p_user_id: userId, p_type: 'daily_checkin' });

  return {
    success: true,
    log_id: data.id,
    triggers_alert: triggersAlert,
    message: triggersAlert 
      ? 'ALERT: Very high BP detected. Please seek medical attention if you have symptoms.'
      : 'Blood pressure logged successfully.',
  };
}

async function logSugar(supabase: any, userId: string, params: any) {
  const validated = schemas.log_sugar.parse(params);

  const { data, error } = await supabase
    .from('sugar_logs')
    .insert({
      user_id: userId,
      glucose_mg_dl: validated.glucose_mg_dl,
      measurement_type: validated.measurement_type,
      ritual_type: validated.ritual_type,
      notes: validated.notes,
      measured_at: new Date().toISOString(),
      source_type: 'agent',
    })
    .select()
    .single();

  if (error) throw error;

  const triggersAlert = validated.glucose_mg_dl >= 300 || validated.glucose_mg_dl <= 50;

  // Update streak
  await supabase.rpc('update_or_create_streak', { p_user_id: userId, p_type: 'daily_checkin' });

  return {
    success: true,
    log_id: data.id,
    triggers_alert: triggersAlert,
    message: triggersAlert 
      ? validated.glucose_mg_dl >= 300 
        ? 'ALERT: Very high blood sugar. Please monitor closely and consider medical advice.'
        : 'ALERT: Very low blood sugar. Please eat something immediately.'
      : 'Blood sugar logged successfully.',
  };
}

async function logBehavior(supabase: any, userId: string, params: any) {
  const validated = schemas.log_behavior.parse(params);
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('behavior_logs')
    .upsert({
      user_id: userId,
      log_date: today,
      ritual_type: validated.ritual_type,
      sleep_hours: validated.sleep_hours,
      sleep_quality: validated.sleep_quality,
      steps_count: validated.steps_count,
      meds_taken: validated.meds_taken,
      stress_level: validated.stress_level,
      notes: validated.notes,
    }, {
      onConflict: 'user_id,log_date,ritual_type',
    })
    .select()
    .single();

  if (error) throw error;

  // Update streak
  const { data: streakData } = await supabase.rpc('update_or_create_streak', { 
    p_user_id: userId, 
    p_type: 'daily_checkin' 
  });

  const { data: currentStreak } = await supabase
    .from('streaks')
    .select('count')
    .eq('user_id', userId)
    .eq('type', 'daily_checkin')
    .single();

  return {
    success: true,
    log_id: data.id,
    streak_updated: true,
    new_streak_count: currentStreak?.count || 1,
    message: `${validated.ritual_type === 'morning' ? 'Morning' : 'Evening'} check-in logged successfully!`,
  };
}

async function setGoal(supabase: any, userId: string, params: any) {
  const validated = schemas.set_goal.parse(params);

  // Check if goal of this type already exists
  const { data: existing } = await supabase
    .from('health_goals')
    .select('id')
    .eq('user_id', userId)
    .eq('goal_type', validated.goal_type)
    .eq('status', 'active')
    .single();

  let result;
  if (existing) {
    // Update existing goal
    const { data, error } = await supabase
      .from('health_goals')
      .update({
        target_value: validated.target_value,
        target_date: validated.target_date,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    result = data;
  } else {
    // Create new goal
    const { data, error } = await supabase
      .from('health_goals')
      .insert({
        user_id: userId,
        goal_type: validated.goal_type,
        target_value: validated.target_value,
        target_date: validated.target_date,
        status: 'active',
        start_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) throw error;
    result = data;
  }

  return {
    success: true,
    goal_id: result.id,
    message: existing 
      ? `Goal for ${validated.goal_type} updated to ${validated.target_value}`
      : `New goal for ${validated.goal_type} created: target ${validated.target_value}`,
  };
}

async function sendNudge(supabase: any, userId: string, params: any) {
  const validated = schemas.send_nudge.parse(params);

  // Verify the sender has permission to nudge this recipient
  const { data: link } = await supabase
    .from('family_links')
    .select('can_nudge')
    .eq('caregiver_id', userId)
    .eq('member_id', validated.recipient_id)
    .single();

  if (!link?.can_nudge) {
    throw new Error('You do not have permission to send nudges to this person');
  }

  // Create the nudge
  const { error } = await supabase.rpc('create_ai_nudge', {
    target_user_id: validated.recipient_id,
    nudge_text: validated.message,
    category: 'family_nudge',
    delivered_via: 'in_app',
  });

  if (error) throw error;

  return {
    success: true,
    message: 'Nudge sent successfully!',
  };
}

// ============================================
// MAIN HANDLER
// ============================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limit: 60 requests per minute
    const { data: rateLimitOk } = await supabase.rpc('check_rate_limit', {
      _user_id: user.id,
      _endpoint: 'agent-functions',
      _max_requests: 60,
      _window_seconds: 60
    });

    if (!rateLimitOk) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request
    const body = await req.json();
    const { function: funcName, parameters, confirm } = requestSchema.parse(body);

    // Validate function exists
    if (!functionMeta[funcName]) {
      return new Response(
        JSON.stringify({ 
          error: `Unknown function: ${funcName}`,
          available_functions: Object.keys(functionMeta),
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const meta = functionMeta[funcName];

    // Check confirmation for write operations
    if (meta.requiresConfirmation && !confirm) {
      return new Response(
        JSON.stringify({ 
          requires_confirmation: true,
          function: funcName,
          parameters,
          description: meta.description,
          message: `This action will ${meta.description.toLowerCase()}. Please confirm by setting confirm: true.`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Execute function
    let result;
    switch (funcName) {
      case 'get_health_summary':
        result = await getHealthSummary(supabase, user.id, parameters);
        break;
      case 'get_bp_history':
        result = await getBPHistory(supabase, user.id, parameters);
        break;
      case 'get_sugar_history':
        result = await getSugarHistory(supabase, user.id, parameters);
        break;
      case 'get_goals':
        result = await getGoals(supabase, user.id, parameters);
        break;
      case 'get_achievements':
        result = await getAchievements(supabase, user.id);
        break;
      case 'get_family_members':
        result = await getFamilyMembers(supabase, user.id);
        break;
      case 'log_bp':
        result = await logBP(supabase, user.id, parameters);
        break;
      case 'log_sugar':
        result = await logSugar(supabase, user.id, parameters);
        break;
      case 'log_behavior':
        result = await logBehavior(supabase, user.id, parameters);
        break;
      case 'set_goal':
        result = await setGoal(supabase, user.id, parameters);
        break;
      case 'send_nudge':
        result = await sendNudge(supabase, user.id, parameters);
        break;
      default:
        throw new Error(`Function ${funcName} not implemented`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        function: funcName,
        result,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Agent function error:", error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Invalid parameters", details: error.errors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});