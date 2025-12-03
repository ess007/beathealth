import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1).max(2000)
  })).min(1).max(50),
  language: z.enum(['en', 'hi']).optional().default('en')
});

// Function to fetch user health data context
async function getUserHealthContext(supabase: any, userId: string) {
  const today = new Date().toISOString().split("T")[0];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

  try {
    const [profileRes, bpRes, sugarRes, heartScoreRes, streakRes, goalsRes] = await Promise.all([
      supabase.from("profiles").select("full_name, has_diabetes, has_hypertension, has_heart_disease, weight_kg, height_cm, date_of_birth, gender").eq("id", userId).single(),
      supabase.from("bp_logs").select("systolic, diastolic, heart_rate, measured_at").eq("user_id", userId).gte("measured_at", `${sevenDaysAgoStr}T00:00:00`).order("measured_at", { ascending: false }).limit(10),
      supabase.from("sugar_logs").select("glucose_mg_dl, measurement_type, measured_at").eq("user_id", userId).gte("measured_at", `${sevenDaysAgoStr}T00:00:00`).order("measured_at", { ascending: false }).limit(10),
      supabase.from("heart_scores").select("heart_score, bp_score, sugar_score, consistency_score, ai_explanation, score_date").eq("user_id", userId).order("score_date", { ascending: false }).limit(7),
      supabase.from("streaks").select("type, count, last_logged_at").eq("user_id", userId),
      supabase.from("health_goals").select("goal_type, target_value, current_value, status").eq("user_id", userId).eq("status", "active")
    ]);

    const profile = profileRes.data;
    const bpLogs = bpRes.data || [];
    const sugarLogs = sugarRes.data || [];
    const heartScores = heartScoreRes.data || [];
    const streaks = streakRes.data || [];
    const goals = goalsRes.data || [];

    // Calculate averages
    const avgBP = bpLogs.length > 0 ? {
      systolic: Math.round(bpLogs.reduce((sum: number, l: any) => sum + l.systolic, 0) / bpLogs.length),
      diastolic: Math.round(bpLogs.reduce((sum: number, l: any) => sum + l.diastolic, 0) / bpLogs.length)
    } : null;

    const avgSugar = sugarLogs.length > 0 ? 
      Math.round(sugarLogs.reduce((sum: number, l: any) => sum + l.glucose_mg_dl, 0) / sugarLogs.length) : null;

    const latestHeartScore = heartScores[0];
    const mainStreak = streaks.find((s: any) => s.type === 'daily_checkin');

    // Build context string
    let context = "USER HEALTH CONTEXT (Use this data to provide personalized, accurate advice):\n\n";

    if (profile) {
      context += `PROFILE:\n`;
      if (profile.full_name) context += `- Name: ${profile.full_name}\n`;
      if (profile.gender) context += `- Gender: ${profile.gender}\n`;
      if (profile.date_of_birth) {
        const age = Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        context += `- Age: ${age} years\n`;
      }
      if (profile.weight_kg) context += `- Weight: ${profile.weight_kg} kg\n`;
      if (profile.height_cm) context += `- Height: ${profile.height_cm} cm\n`;
      context += `- Has Hypertension: ${profile.has_hypertension ? 'Yes' : 'No'}\n`;
      context += `- Has Diabetes: ${profile.has_diabetes ? 'Yes' : 'No'}\n`;
      context += `- Has Heart Disease: ${profile.has_heart_disease ? 'Yes' : 'No'}\n\n`;
    }

    if (latestHeartScore) {
      context += `CURRENT HEARTSCORE (as of ${latestHeartScore.score_date}):\n`;
      context += `- Overall Score: ${latestHeartScore.heart_score}/100\n`;
      if (latestHeartScore.bp_score) context += `- BP Score: ${latestHeartScore.bp_score}/100\n`;
      if (latestHeartScore.sugar_score) context += `- Sugar Score: ${latestHeartScore.sugar_score}/100\n`;
      if (latestHeartScore.consistency_score) context += `- Consistency Score: ${latestHeartScore.consistency_score}/100\n`;
      if (latestHeartScore.ai_explanation) context += `- Analysis: ${latestHeartScore.ai_explanation}\n\n`;
    }

    if (bpLogs.length > 0) {
      const latestBP = bpLogs[0];
      context += `BLOOD PRESSURE (Last 7 days, ${bpLogs.length} readings):\n`;
      context += `- Latest: ${latestBP.systolic}/${latestBP.diastolic} mmHg`;
      if (latestBP.heart_rate) context += `, HR: ${latestBP.heart_rate} bpm`;
      context += `\n`;
      if (avgBP) context += `- 7-day Average: ${avgBP.systolic}/${avgBP.diastolic} mmHg\n`;
      
      // Classify BP
      if (avgBP) {
        let bpStatus = "Normal";
        if (avgBP.systolic >= 180 || avgBP.diastolic >= 120) bpStatus = "HYPERTENSIVE CRISIS - URGENT";
        else if (avgBP.systolic >= 140 || avgBP.diastolic >= 90) bpStatus = "High (Stage 2 Hypertension)";
        else if (avgBP.systolic >= 130 || avgBP.diastolic >= 80) bpStatus = "Elevated (Stage 1 Hypertension)";
        else if (avgBP.systolic < 90 || avgBP.diastolic < 60) bpStatus = "Low";
        context += `- Status: ${bpStatus}\n\n`;
      }
    }

    if (sugarLogs.length > 0) {
      const latestSugar = sugarLogs[0];
      const fastingLogs = sugarLogs.filter((l: any) => l.measurement_type === 'fasting');
      const avgFasting = fastingLogs.length > 0 ? 
        Math.round(fastingLogs.reduce((sum: number, l: any) => sum + l.glucose_mg_dl, 0) / fastingLogs.length) : null;

      context += `BLOOD SUGAR (Last 7 days, ${sugarLogs.length} readings):\n`;
      context += `- Latest: ${latestSugar.glucose_mg_dl} mg/dL (${latestSugar.measurement_type})\n`;
      if (avgSugar) context += `- Overall Average: ${avgSugar} mg/dL\n`;
      if (avgFasting) context += `- Fasting Average: ${avgFasting} mg/dL\n`;
      
      // Classify sugar
      if (avgFasting) {
        let sugarStatus = "Normal";
        if (avgFasting >= 126) sugarStatus = "Diabetic Range";
        else if (avgFasting >= 100) sugarStatus = "Pre-diabetic";
        context += `- Fasting Status: ${sugarStatus}\n\n`;
      }
    }

    if (mainStreak) {
      context += `CONSISTENCY:\n- Current Streak: ${mainStreak.count} days\n\n`;
    }

    if (goals.length > 0) {
      context += `ACTIVE HEALTH GOALS:\n`;
      goals.forEach((g: any) => {
        context += `- ${g.goal_type}: Target ${g.target_value}, Current ${g.current_value || 'Not set'}\n`;
      });
      context += `\n`;
    }

    return context;
  } catch (error) {
    console.error("Error fetching health context:", error);
    return "";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Missing authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract the JWT token from "Bearer <token>"
    const token = authHeader.replace("Bearer ", "");
    
    // Create Supabase client with service role key for admin operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Verify the user's JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message || "No user found");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Authenticated user:", user.id);

    // Check rate limit: 20 messages per minute
    const { data: rateLimitOk, error: rateLimitError } = await supabase
      .rpc('check_rate_limit', {
        _user_id: user.id,
        _endpoint: 'chat-copilot',
        _max_requests: 20,
        _window_seconds: 60
      });

    if (rateLimitError) {
      console.error("Rate limit check failed:", rateLimitError);
    } else if (!rateLimitOk) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate and parse input
    const body = await req.json();
    const validated = chatSchema.parse(body);
    const { messages, language } = validated;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user's health data for personalized context
    const healthContext = await getUserHealthContext(supabase, user.id);

    // Enhanced system prompt with health data context
    const systemPrompt = language === "hi" 
      ? `आप Beat ऐप के लिए एक विशेषज्ञ स्वास्थ्य कोच हैं। आप भारतीय वरिष्ठ नागरिकों (40-70 वर्ष) को उनके रक्तचाप, रक्त शर्करा और हृदय स्वास्थ्य का प्रबंधन करने में मदद करते हैं।

${healthContext}

महत्वपूर्ण दिशानिर्देश:
- उपयोगकर्ता के वास्तविक स्वास्थ्य डेटा के आधार पर व्यक्तिगत सलाह दें
- गर्मजोशी से, सरल हिंदी में बात करें
- कभी भी चिकित्सा निदान न करें
- यदि BP ≥180/120 या शुगर ≥300 है, तो तुरंत डॉक्टर से मिलने की सलाह दें
- व्यावहारिक, क्रियात्मक सुझाव दें
- भारतीय आहार और जीवनशैली के संदर्भ में सलाह दें
- प्रतिक्रियाएं संक्षिप्त रखें (120 शब्दों से कम)`
      : `You are an expert health coach for the Beat app. You help Indian seniors (aged 40-70) manage their blood pressure, blood sugar, and heart health.

${healthContext}

CRITICAL GUIDELINES:
- Provide personalized advice based on the user's ACTUAL health data shown above
- Reference their specific numbers when giving advice (e.g., "Your BP of 145/92 suggests...")
- Be warm, empathetic, and use simple language
- NEVER provide medical diagnoses - you give health coaching, not medical advice
- If BP ≥180/120 or Sugar ≥300, IMMEDIATELY recommend seeking emergency medical care
- Give practical, actionable tips relevant to Indian diet and lifestyle
- Keep responses concise (under 120 words)
- If HeartScore is low, focus on the weakest sub-score
- Acknowledge and celebrate improvements and streak maintenance
- Always end with encouragement

MEDICAL DISCLAIMER: Always remind users that this is health coaching guidance, not medical diagnosis. For serious symptoms or emergencies, they should consult their doctor immediately.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat copilot error:", error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: error.errors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});