import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create auth client to verify user
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify JWT and get claims
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('Auth claims error:', claimsError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authenticatedUserId = claimsData.claims.sub;

    // Parse request body
    const { userId, newMedication } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Authorization check: user can only check their own medications
    if (authenticatedUserId !== userId) {
      console.warn(`Unauthorized access attempt: ${authenticatedUserId} tried to access ${userId}`);
      return new Response(
        JSON.stringify({ error: 'You can only check interactions for your own medications' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Checking drug interactions for authenticated user:', userId);

    // Use service role key for database operations (after authentication verified)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's current medications
    const { data: medications, error: medsError } = await supabase
      .from('medications')
      .select('name, dosage, drug_class, drug_code')
      .eq('user_id', userId)
      .eq('active', true);

    if (medsError) throw medsError;

    if (!medications || medications.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          interactions: [],
          message: 'No medications to check' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all drug interactions from reference table
    const { data: interactions, error: intError } = await supabase
      .from('drug_interactions')
      .select('*');

    if (intError) throw intError;

    const foundInteractions: any[] = [];
    const medicationNames = medications.map(m => m.name.toLowerCase().trim());

    // Check each pair of medications
    for (let i = 0; i < medicationNames.length; i++) {
      for (let j = i + 1; j < medicationNames.length; j++) {
        const drugA = medicationNames[i];
        const drugB = medicationNames[j];

        // Look for interactions in both directions
        const match = interactions?.find(int => 
          (int.drug_a.toLowerCase().includes(drugA) || drugA.includes(int.drug_a.toLowerCase())) &&
          (int.drug_b.toLowerCase().includes(drugB) || drugB.includes(int.drug_b.toLowerCase()))
        ) || interactions?.find(int =>
          (int.drug_a.toLowerCase().includes(drugB) || drugB.includes(int.drug_a.toLowerCase())) &&
          (int.drug_b.toLowerCase().includes(drugA) || drugA.includes(int.drug_b.toLowerCase()))
        );

        if (match) {
          foundInteractions.push({
            drugs: [medications[i].name, medications[j].name],
            severity: match.severity,
            description: match.description,
            recommendation: match.recommendation,
            source: match.source,
          });
        }
      }
    }

    // If checking a new medication, check against all current ones
    if (newMedication) {
      const newMedLower = newMedication.toLowerCase().trim();
      
      for (const med of medications) {
        const existingMedLower = med.name.toLowerCase().trim();

        const match = interactions?.find(int => 
          (int.drug_a.toLowerCase().includes(newMedLower) || newMedLower.includes(int.drug_a.toLowerCase())) &&
          (int.drug_b.toLowerCase().includes(existingMedLower) || existingMedLower.includes(int.drug_b.toLowerCase()))
        ) || interactions?.find(int =>
          (int.drug_a.toLowerCase().includes(existingMedLower) || existingMedLower.includes(int.drug_a.toLowerCase())) &&
          (int.drug_b.toLowerCase().includes(newMedLower) || newMedLower.includes(int.drug_b.toLowerCase()))
        );

        if (match) {
          foundInteractions.push({
            drugs: [newMedication, med.name],
            severity: match.severity,
            description: match.description,
            recommendation: match.recommendation,
            source: match.source,
            isNewMedInteraction: true,
          });
        }
      }
    }

    // Sort by severity
    const severityOrder = { major: 0, moderate: 1, minor: 2 };
    foundInteractions.sort((a, b) => 
      (severityOrder[a.severity as keyof typeof severityOrder] || 3) - 
      (severityOrder[b.severity as keyof typeof severityOrder] || 3)
    );

    // Mark medications as checked
    await supabase
      .from('medications')
      .update({ interactions_checked: true })
      .eq('user_id', userId)
      .eq('active', true);

    return new Response(
      JSON.stringify({
        success: true,
        medicationCount: medications.length,
        interactions: foundInteractions,
        hasMajorInteractions: foundInteractions.some(i => i.severity === 'major'),
        hasModerateInteractions: foundInteractions.some(i => i.severity === 'moderate'),
        summary: foundInteractions.length > 0 
          ? `Found ${foundInteractions.length} interaction(s): ${foundInteractions.filter(i => i.severity === 'major').length} major, ${foundInteractions.filter(i => i.severity === 'moderate').length} moderate`
          : 'No known interactions found',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in check-drug-interactions:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Interaction check failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
