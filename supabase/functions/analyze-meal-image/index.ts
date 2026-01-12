import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { imageBase64, description, mealType } = await req.json();

    if (!imageBase64 && !description) {
      throw new Error('Either image or description is required');
    }

    // Build the prompt
    const systemPrompt = `You are an expert Indian nutritionist AI. Analyze the meal and provide detailed nutritional information.

Focus on Indian foods: roti, chapati, paratha, dal, rice, sabzi, curry, biryani, dosa, idli, sambar, chole, paneer, etc.

For each food item, estimate:
- Name (in English, with Hindi/regional name if applicable)
- Portion size (e.g., "2 medium", "1 cup", "150g")
- Calories
- Carbohydrates (grams)
- Protein (grams)  
- Fat (grams)
- Glycemic index category (low/medium/high)

Also calculate:
- Total glycemic load (GL) for the meal
- A brief health tip relevant to the user's health (diabetes/BP management)

Respond ONLY with valid JSON in this exact format:
{
  "items": [
    {
      "name": "Roti (Chapati)",
      "portion": "2 medium",
      "calories": 160,
      "carbs": 32,
      "protein": 5,
      "fat": 1,
      "glycemicIndex": "medium"
    }
  ],
  "totalCalories": 450,
  "totalCarbs": 65,
  "glycemicLoad": 18,
  "healthTip": "Adding more vegetables to your meal can help reduce blood sugar spikes."
}`;

    const userContent: any[] = [];
    
    if (imageBase64) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: imageBase64,
        },
      });
    }
    
    userContent.push({
      type: "text",
      text: `Analyze this ${mealType} meal.${description ? ` Description: ${description}` : ''} Provide detailed nutritional breakdown.`,
    });

    console.log('Calling Lovable AI for meal analysis...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    console.log('AI response:', content);

    // Parse the JSON response
    let analysis;
    try {
      // Extract JSON from potential markdown code blocks
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Provide fallback response
      analysis = {
        items: [{
          name: description || 'Unidentified meal',
          portion: '1 serving',
          calories: 300,
          carbs: 40,
          protein: 10,
          fat: 10,
          glycemicIndex: 'medium',
        }],
        totalCalories: 300,
        totalCarbs: 40,
        glycemicLoad: 15,
        healthTip: 'For better blood sugar control, try pairing carbs with protein and fiber.',
      };
    }

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in analyze-meal-image:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to analyze meal' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
