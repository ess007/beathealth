import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Not authenticated");
    }

    const { memberId, message, category } = await req.json();

    if (!memberId || !message) {
      throw new Error("Missing required fields: memberId and message");
    }

    // Verify caregiver has permission to nudge this member
    const { data: familyLink, error: linkError } = await supabase
      .from("family_links")
      .select("can_nudge")
      .eq("caregiver_id", user.id)
      .eq("member_id", memberId)
      .single();

    if (linkError || !familyLink) {
      throw new Error("You don't have permission to send nudges to this family member");
    }

    if (!familyLink.can_nudge) {
      throw new Error("Nudge permission is disabled for this family member");
    }

    // Create AI nudge for the family member
    const { error: nudgeError } = await supabase.rpc("create_ai_nudge", {
      target_user_id: memberId,
      nudge_text: message,
      category: category || "family_reminder",
      delivered_via: "family_app",
    });

    if (nudgeError) throw nudgeError;

    // Log the action in audit log
    const { error: auditError } = await supabase.from("audit_logs").insert({
      actor_id: user.id,
      target_user_id: memberId,
      action: "send_nudge",
      resource_type: "ai_nudges",
      metadata: { message, category },
    });

    if (auditError) {
      console.error("Failed to log audit trail:", auditError);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Nudge sent successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending family nudge:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
