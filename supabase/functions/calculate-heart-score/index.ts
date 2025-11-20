import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.83.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const scoreSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

interface BPLog {
  systolic: number;
  diastolic: number;
  measured_at: string;
}

interface SugarLog {
  glucose_mg_dl: number;
  measurement_type: string;
  measured_at: string;
}

interface BehaviorLog {
  log_date: string;
  meds_taken: boolean;
  ritual_type: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Get user from JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Validate and parse input
    const body = await req.json();
    const validated = scoreSchema.parse(body);
    const { date } = validated;
    const targetDate = date || new Date().toISOString().split("T")[0];

    console.log(`Calculating HeartScore for user ${user.id} on ${targetDate}`);

    // Check rate limit: 10 calculations per hour
    const { data: rateLimitOk, error: rateLimitError } = await supabase
      .rpc('check_rate_limit', {
        _user_id: user.id,
        _endpoint: 'calculate-heart-score',
        _max_requests: 10,
        _window_seconds: 3600
      });

    if (rateLimitError) {
      console.error("Rate limit check failed:", rateLimitError);
    } else if (!rateLimitOk) {
      return new Response(
        JSON.stringify({ error: "Too many HeartScore calculations. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch BP logs for the day
    const { data: bpLogs, error: bpError } = await supabase
      .from("bp_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("measured_at", `${targetDate}T00:00:00`)
      .lt("measured_at", `${targetDate}T23:59:59`)
      .order("measured_at", { ascending: false });

    if (bpError) throw bpError;

    // Fetch sugar logs for the day
    const { data: sugarLogs, error: sugarError } = await supabase
      .from("sugar_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("measured_at", `${targetDate}T00:00:00`)
      .lt("measured_at", `${targetDate}T23:59:59`)
      .order("measured_at", { ascending: false });

    if (sugarError) throw sugarError;

    // Fetch behavior logs for the day
    const { data: behaviorLogs, error: behaviorError } = await supabase
      .from("behavior_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_date", targetDate);

    if (behaviorError) throw behaviorError;

    // Calculate BP Score (0-100)
    let bpScore = 0;
    if (bpLogs && bpLogs.length > 0) {
      const avgSystolic = bpLogs.reduce((sum: number, log: BPLog) => sum + log.systolic, 0) / bpLogs.length;
      const avgDiastolic = bpLogs.reduce((sum: number, log: BPLog) => sum + log.diastolic, 0) / bpLogs.length;

      if (avgSystolic < 120 && avgDiastolic < 80) {
        bpScore = 100; // Optimal
      } else if (avgSystolic < 130 && avgDiastolic < 80) {
        bpScore = 90; // Normal
      } else if (avgSystolic < 140 || avgDiastolic < 90) {
        bpScore = 70; // Elevated
      } else if (avgSystolic < 160 || avgDiastolic < 100) {
        bpScore = 50; // Stage 1 Hypertension
      } else {
        bpScore = 30; // Stage 2 Hypertension
      }
    } else {
      bpScore = 50; // No data - neutral score
    }

    // Calculate Sugar Score (0-100)
    let sugarScore = 0;
    if (sugarLogs && sugarLogs.length > 0) {
      const fastingLogs = sugarLogs.filter((log: SugarLog) => log.measurement_type === "fasting");
      const randomLogs = sugarLogs.filter((log: SugarLog) => log.measurement_type === "random");

      let fastingScore = 50;
      let randomScore = 50;

      if (fastingLogs.length > 0) {
        const avgFasting = fastingLogs.reduce((sum: number, log: SugarLog) => sum + log.glucose_mg_dl, 0) / fastingLogs.length;
        if (avgFasting < 100) {
          fastingScore = 100; // Normal
        } else if (avgFasting < 126) {
          fastingScore = 70; // Pre-diabetic
        } else {
          fastingScore = 40; // Diabetic range
        }
      }

      if (randomLogs.length > 0) {
        const avgRandom = randomLogs.reduce((sum: number, log: SugarLog) => sum + log.glucose_mg_dl, 0) / randomLogs.length;
        if (avgRandom < 140) {
          randomScore = 100; // Normal
        } else if (avgRandom < 200) {
          randomScore = 70; // Elevated
        } else {
          randomScore = 40; // High
        }
      }

      sugarScore = Math.round((fastingScore + randomScore) / 2);
    } else {
      sugarScore = 50; // No data - neutral score
    }

    // Calculate Consistency Score (0-100)
    let consistencyScore = 0;
    if (behaviorLogs && behaviorLogs.length > 0) {
      const morningRitual = behaviorLogs.find((log: BehaviorLog) => log.ritual_type === "morning");
      const eveningRitual = behaviorLogs.find((log: BehaviorLog) => log.ritual_type === "evening");

      if (morningRitual) consistencyScore += 50;
      if (eveningRitual) consistencyScore += 50;

      // Bonus for medication adherence
      const medsTaken = behaviorLogs.filter((log: BehaviorLog) => log.meds_taken).length;
      if (medsTaken === behaviorLogs.length) {
        consistencyScore = Math.min(100, consistencyScore + 10);
      }
    } else {
      consistencyScore = 0; // No rituals completed
    }

    // Calculate final HeartScore (weighted average)
    const heartScore = Math.round(
      (bpScore * 0.30) + (sugarScore * 0.30) + (consistencyScore * 0.40)
    );

    console.log(`Scores: BP=${bpScore}, Sugar=${sugarScore}, Consistency=${consistencyScore}, Heart=${heartScore}`);

    // Generate AI explanation using Lovable AI
    const aiPrompt = `You are a health coach explaining a HeartScore to an Indian adult. The HeartScore is ${heartScore}/100.

Sub-scores:
- Blood Pressure Score: ${bpScore}/100 ${bpLogs && bpLogs.length > 0 ? `(Average: ${Math.round(bpLogs.reduce((s: number, l: BPLog) => s + l.systolic, 0) / bpLogs.length)}/${Math.round(bpLogs.reduce((s: number, l: BPLog) => s + l.diastolic, 0) / bpLogs.length)} mmHg)` : '(No data)'}
- Sugar Score: ${sugarScore}/100 ${sugarLogs && sugarLogs.length > 0 ? `(Average: ${Math.round(sugarLogs.reduce((s: number, l: SugarLog) => s + l.glucose_mg_dl, 0) / sugarLogs.length)} mg/dL)` : '(No data)'}
- Consistency Score: ${consistencyScore}/100 (${behaviorLogs?.length || 0} rituals completed)

Write a warm, encouraging 2-3 sentence explanation in simple English about what influenced their score today and one actionable tip for tomorrow. Be specific about the numbers. Keep it conversational and supportive.`;

    let aiExplanation = "Your HeartScore reflects your daily health habits. Keep logging your rituals!";

    try {
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are a supportive health coach for Indian adults." },
            { role: "user", content: aiPrompt }
          ],
          temperature: 0.7,
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        aiExplanation = aiData.choices?.[0]?.message?.content || aiExplanation;
      } else {
        console.error("AI explanation failed:", await aiResponse.text());
      }
    } catch (aiError) {
      console.error("Error generating AI explanation:", aiError);
    }

    // Store the HeartScore in the database
    const { data: heartScoreData, error: insertError } = await supabase
      .from("heart_scores")
      .upsert({
        user_id: user.id,
        score_date: targetDate,
        heart_score: heartScore,
        bp_score: bpScore,
        sugar_score: sugarScore,
        consistency_score: consistencyScore,
        ai_explanation: aiExplanation,
      }, {
        onConflict: "user_id,score_date"
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log("HeartScore saved successfully:", heartScoreData);

    return new Response(
      JSON.stringify({
        success: true,
        heartScore: heartScoreData,
        message: "HeartScore calculated successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error calculating HeartScore:", error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid input",
          details: error.errors
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
