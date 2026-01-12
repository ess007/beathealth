import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    console.log(`Analyzing cognitive health for user: ${userId}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get cognitive assessments (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const { data: assessments } = await supabase
      .from("cognitive_assessments")
      .select("*")
      .eq("user_id", userId)
      .gte("assessment_date", threeMonthsAgo.toISOString().split("T")[0])
      .order("assessment_date", { ascending: true });

    // Get cognitive patterns
    const { data: patterns } = await supabase
      .from("cognitive_patterns")
      .select("*")
      .eq("user_id", userId)
      .order("analyzed_at", { ascending: false })
      .limit(10);

    // Get user profile for context
    const { data: profile } = await supabase
      .from("profiles")
      .select("date_of_birth, has_diabetes, has_hypertension, has_heart_disease")
      .eq("id", userId)
      .single();

    // Calculate age
    let age = 0;
    if (profile?.date_of_birth) {
      const birthDate = new Date(profile.date_of_birth);
      age = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    }

    // Analyze trends
    const analysis = {
      assessmentCount: assessments?.length || 0,
      averageScore: 0,
      trend: "stable" as "improving" | "stable" | "declining",
      concernLevel: "normal" as "normal" | "mild" | "moderate" | "consult_doctor",
      riskFactors: [] as string[],
      recommendations: [] as string[],
    };

    if (assessments && assessments.length > 0) {
      // Calculate average score as percentage
      const scores = assessments.map(a => (a.score / a.max_score) * 100);
      analysis.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

      // Determine trend
      if (assessments.length >= 3) {
        const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
        const secondHalf = scores.slice(Math.floor(scores.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        if (secondAvg > firstAvg + 5) {
          analysis.trend = "improving";
        } else if (secondAvg < firstAvg - 10) {
          analysis.trend = "declining";
        }
      }

      // Determine concern level
      if (analysis.averageScore < 50) {
        analysis.concernLevel = "consult_doctor";
      } else if (analysis.averageScore < 65 || analysis.trend === "declining") {
        analysis.concernLevel = "moderate";
      } else if (analysis.averageScore < 75) {
        analysis.concernLevel = "mild";
      }
    }

    // Identify risk factors
    if (age >= 65) {
      analysis.riskFactors.push("Age over 65");
    }
    if (profile?.has_diabetes) {
      analysis.riskFactors.push("Diabetes (can affect cognitive function)");
    }
    if (profile?.has_hypertension) {
      analysis.riskFactors.push("Hypertension (can affect brain health)");
    }
    if (profile?.has_heart_disease) {
      analysis.riskFactors.push("Heart disease (reduced blood flow to brain)");
    }

    // Generate recommendations using AI if significant patterns exist
    if (assessments && assessments.length >= 3 && LOVABLE_API_KEY) {
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `You are a health AI assistant analyzing cognitive health patterns. 
                Provide 3-4 brief, practical recommendations to support brain health.
                Focus on lifestyle factors like exercise, sleep, social engagement, and mental stimulation.
                Keep recommendations culturally appropriate for Indian seniors.
                Do NOT diagnose or suggest medication changes.`,
              },
              {
                role: "user",
                content: `Cognitive assessment data:
                - Age: ${age}
                - Average score: ${analysis.averageScore}%
                - Trend: ${analysis.trend}
                - Risk factors: ${analysis.riskFactors.join(", ") || "None identified"}
                - Number of assessments: ${analysis.assessmentCount}
                
                Provide 3-4 specific recommendations for maintaining/improving cognitive health.`,
              },
            ],
          }),
        });

        const aiData = await response.json();
        const recommendations = aiData.choices?.[0]?.message?.content;

        if (recommendations) {
          // Parse recommendations into array
          analysis.recommendations = recommendations
            .split(/\d+\./)
            .filter((r: string) => r.trim())
            .map((r: string) => r.trim())
            .slice(0, 4);
        }
      } catch (aiError) {
        console.error("AI analysis error:", aiError);
      }
    }

    // Default recommendations if AI fails
    if (analysis.recommendations.length === 0) {
      analysis.recommendations = [
        "Daily 30-minute walks can improve brain blood flow",
        "Engage in social activities to maintain cognitive connections",
        "Try puzzles, reading, or learning new skills regularly",
        "Maintain consistent sleep schedule of 7-8 hours",
      ];
    }

    // Save analysis
    const { error: saveError } = await supabase
      .from("cognitive_patterns")
      .insert({
        user_id: userId,
        pattern_type: "comprehensive_analysis",
        current_value: analysis,
        deviation_percent: analysis.trend === "declining" ? -10 : analysis.trend === "improving" ? 10 : 0,
      });

    if (saveError) {
      console.error("Error saving analysis:", saveError);
    }

    // Alert family if concerning
    if (analysis.concernLevel === "consult_doctor" || analysis.concernLevel === "moderate") {
      // Check if family members should be notified
      const { data: familyLinks } = await supabase
        .from("family_links")
        .select("caregiver_id")
        .eq("member_id", userId)
        .eq("can_view", true);

      if (familyLinks && familyLinks.length > 0) {
        // Create nudge for family
        for (const link of familyLinks) {
          await supabase.rpc("create_ai_nudge", {
            target_user_id: link.caregiver_id,
            nudge_text: `Your family member's cognitive health check shows ${analysis.concernLevel === "consult_doctor" ? "concerning" : "slight"} changes. Consider checking in with them.`,
            category: "family_alert",
            delivered_via: "app",
          });
        }
      }
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-cognitive-health:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
