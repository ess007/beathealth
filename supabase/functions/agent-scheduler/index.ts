import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-secret',
};

// Internal secret for cron job validation
const INTERNAL_SECRET = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ========== AUTHENTICATION ==========
    // This function should only be called by:
    // 1. Internal cron jobs with x-internal-secret header
    // 2. Supabase service role (via pg_cron)
    
    const internalSecret = req.headers.get('x-internal-secret');
    const authHeader = req.headers.get('authorization');
    
    let isAuthorized = false;

    // Check for internal secret
    if (internalSecret && INTERNAL_SECRET && internalSecret === INTERNAL_SECRET) {
      isAuthorized = true;
      console.log('[Agent Scheduler] Authenticated via internal secret');
    }
    
    // Check for service role key in Authorization header
    if (authHeader && INTERNAL_SECRET) {
      const token = authHeader.replace('Bearer ', '');
      // Accept both anon key (from pg_cron with net.http_post) and service role
      if (token === INTERNAL_SECRET || token === Deno.env.get('SUPABASE_ANON_KEY')) {
        isAuthorized = true;
        console.log('[Agent Scheduler] Authenticated via Authorization header');
      }
    }

    if (!isAuthorized) {
      console.error('[Agent Scheduler] Unauthorized access attempt');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - This endpoint is for internal use only' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const now = new Date().toISOString();
    
    // Fetch pending tasks that are due
    const { data: tasks, error: fetchError } = await supabase
      .from('agent_scheduled_tasks')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .lt('attempts', 3)
      .order('priority', { ascending: true })
      .order('scheduled_for', { ascending: true })
      .limit(50);

    if (fetchError) {
      console.error('[Agent Scheduler] Fetch error:', fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[Agent Scheduler] Processing ${tasks?.length || 0} pending tasks`);

    const results: any[] = [];

    for (const task of tasks || []) {
      try {
        // Mark as processing
        await supabase.from('agent_scheduled_tasks')
          .update({ status: 'processing', attempts: task.attempts + 1 })
          .eq('id', task.id);

        // Call agent-brain with internal secret for authentication
        const brainResponse = await supabase.functions.invoke('agent-brain', {
          body: {
            userId: task.user_id,
            triggerType: task.task_type,
            triggerPayload: task.payload
          },
          headers: {
            'x-internal-secret': INTERNAL_SECRET!
          }
        });

        if (brainResponse.error) {
          throw new Error(brainResponse.error.message);
        }

        // Mark as completed
        await supabase.from('agent_scheduled_tasks')
          .update({ 
            status: 'completed', 
            completed_at: new Date().toISOString(),
            result: brainResponse.data
          })
          .eq('id', task.id);

        results.push({ taskId: task.id, success: true, result: brainResponse.data });
        console.log(`[Agent Scheduler] Task ${task.id} completed successfully`);
      } catch (taskError: any) {
        console.error(`[Agent Scheduler] Task ${task.id} failed:`, taskError);
        
        const newStatus = task.attempts + 1 >= task.max_attempts ? 'failed' : 'pending';
        
        await supabase.from('agent_scheduled_tasks')
          .update({ 
            status: newStatus,
            error_message: taskError.message
          })
          .eq('id', task.id);

        results.push({ taskId: task.id, success: false, error: taskError.message });
      }
    }

    // Also schedule daily analysis for active users who haven't had one today
    const today = new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();
    
    // Run daily analysis at 8 AM and 8 PM
    if (currentHour === 8 || currentHour === 20) {
      const { data: activeUsers } = await supabase
        .from('profiles')
        .select('id')
        .eq('onboarding_completed', true);

      for (const user of activeUsers || []) {
        // Check if already scheduled today for this type
        const analysisType = currentHour === 8 ? 'morning_analysis' : 'evening_analysis';
        const { data: existing } = await supabase
          .from('agent_scheduled_tasks')
          .select('id')
          .eq('user_id', user.id)
          .eq('task_type', analysisType)
          .gte('created_at', `${today}T00:00:00`)
          .single();

        if (!existing) {
          await supabase.from('agent_scheduled_tasks').insert({
            user_id: user.id,
            task_type: analysisType,
            scheduled_for: new Date().toISOString(),
            priority: 7,
            payload: { scheduled_by: 'daily_cron' }
          });
        }
      }
    }

    return new Response(JSON.stringify({ 
      processed: results.length,
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('[Agent Scheduler] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
