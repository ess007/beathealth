import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { userId, nudgeType = "morning" } = await req.json();

    console.log(`Generating ${nudgeType} nudge for user ${userId}`);

    // Get user's recent health data
    const [bpResult, sugarResult, behaviorResult, streakResult] = await Promise.all([
      supabaseClient
        .from("bp_logs")
        .select("systolic, diastolic, measured_at")
        .eq("user_id", userId)
        .order("measured_at", { ascending: false })
        .limit(7),
      supabaseClient
        .from("sugar_logs")
        .select("glucose_mg_dl, measured_at")
        .eq("user_id", userId)
        .order("measured_at", { ascending: false })
        .limit(7),
      supabaseClient
        .from("behavior_logs")
        .select("sleep_hours, stress_level, log_date")
        .eq("user_id", userId)
        .order("log_date", { ascending: false })
        .limit(7),
      supabaseClient
        .from("streaks")
        .select("count, type")
        .eq("user_id", userId)
        .eq("type", "daily_checkin")
        .single(),
    ]);

    const bpLogs = bpResult.data || [];
    const sugarLogs = sugarResult.data || [];
    const behaviorLogs = behaviorResult.data || [];
    const streak = streakResult.data;

    // Generate personalized nudge based on data
    let nudgeText = "";
    let category = "motivation";

    if (nudgeType === "morning") {
      if (streak && streak.count >= 7) {
        nudgeText = `🔥 Amazing! You're on a ${streak.count}-day streak. Keep the momentum going with your morning check-in today!`;
        category = "streak";
      } else if (bpLogs.length > 0) {
        const lastBp = bpLogs[0];
        if (lastBp.systolic > 140 || lastBp.diastolic > 90) {
          nudgeText = "☀️ Good morning! Your recent BP was a bit elevated. Remember to take your medications and start your day with some gentle stretching.";
          category = "health_alert";
        } else {
          nudgeText = "☀️ Good morning! Your BP has been looking great. Let's keep that trend going with today's morning ritual.";
          category = "motivation";
        }
      } else {
        nudgeText = "☀️ Good morning! A new day, a new opportunity to track your health. Start with your morning check-in!";
        category = "motivation";
      }
    } else {
      // Evening nudge
      if (behaviorLogs.length > 0 && behaviorLogs[0].stress_level === "high") {
        nudgeText = "🌙 Time to wind down. Your recent stress levels have been high. Try some deep breathing before bed tonight.";
        category = "wellness";
      } else if (streak && streak.count > 0) {
        nudgeText = `🌙 Don't forget your evening check-in to maintain your ${streak.count}-day streak! You've got this.`;
        category = "streak";
      } else {
        nudgeText = "🌙 How was your day? Complete your evening ritual to track your progress and sleep better tonight.";
        category = "motivation";
      }
    }

    // Save the nudge
    const { error: insertError } = await supabaseClient.rpc("create_ai_nudge", {
      target_user_id: userId,
      nudge_text: nudgeText,
      category,
      delivered_via: "app",
    });

    if (insertError) {
      console.error("Error saving nudge:", insertError);
    }

    console.log(`Nudge generated: ${nudgeText}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        nudge: {
          text: nudgeText,
          category,
          type: nudgeType,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating nudge:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
