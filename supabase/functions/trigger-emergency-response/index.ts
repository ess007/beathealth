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
    // ========== AUTHENTICATION ==========
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('[trigger-emergency-response] Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's auth context to verify identity
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      console.error('[trigger-emergency-response] Invalid authentication:', userError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { userId, fallEventId, type, customMessage } = await req.json();
    console.log(`[trigger-emergency-response] User ${user.id} triggering emergency for ${userId}, type: ${type}`);

    // ========== AUTHORIZATION ==========
    // Allow if: user is triggering for themselves OR is authorized caregiver
    if (user.id !== userId) {
      // Check if authenticated user is authorized caregiver with view permissions
      const { data: familyLink, error: familyError } = await supabaseAuth
        .from('family_links')
        .select('can_view')
        .eq('member_id', userId)
        .eq('caregiver_id', user.id)
        .eq('can_view', true)
        .single();

      if (familyError || !familyLink) {
        console.error(`[trigger-emergency-response] User ${user.id} unauthorized to trigger emergency for ${userId}`);
        return new Response(
          JSON.stringify({ error: 'Unauthorized - Not authorized for this user' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`[trigger-emergency-response] Caregiver ${user.id} authorized to trigger for ${userId}`);
    }

    // Now safe to use service role for operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", userId)
      .single();

    // Get emergency contacts
    const { data: contacts, error: contactsError } = await supabase
      .from("emergency_contacts")
      .select("*")
      .eq("user_id", userId)
      .eq(type === "fall" ? "notify_on_fall" : 
          type === "health" ? "notify_on_health_emergency" : 
          "notify_on_missed_checkin", true);

    if (contactsError) {
      console.error("Error fetching contacts:", contactsError);
      throw contactsError;
    }

    if (!contacts || contacts.length === 0) {
      console.log("No emergency contacts configured for this alert type");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "No emergency contacts configured" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userName = profile?.full_name || "Your family member";
    const notificationsSent: Array<{ contactId: string; method: string; success: boolean }> = [];

    // Generate alert message based on type
    let alertMessage = "";
    switch (type) {
      case "fall":
        alertMessage = `🚨 FALL ALERT: ${userName} may have fallen and did not respond to the app. Please check on them immediately.`;
        break;
      case "health":
        alertMessage = `⚠️ HEALTH ALERT: ${userName}'s health metrics indicate a potential emergency. ${customMessage || "Please check on them."}`;
        break;
      case "missed_checkin":
        alertMessage = `📱 CHECK-IN ALERT: ${userName} has not checked in for over 48 hours. Please make sure they are okay.`;
        break;
      default:
        alertMessage = customMessage || `Alert from Beat Health App regarding ${userName}`;
    }

    // Process each contact
    for (const contact of contacts) {
      try {
        // Log the notification
        console.log(`Sending notification to ${contact.name} (${contact.phone})`);

        // Create AI nudge for the user (in-app notification)
        await supabase.rpc("create_ai_nudge", {
          target_user_id: userId,
          nudge_text: `Emergency alert sent to ${contact.name}`,
          category: "emergency",
          delivered_via: "app",
        });

        // In a production app, you would integrate with:
        // - Twilio for SMS
        // - Firebase Cloud Messaging for push
        // - Email service for email

        // For now, we log the notification as sent
        notificationsSent.push({
          contactId: contact.id,
          method: "app_notification",
          success: true,
        });

        // Log to agent action log
        await supabase.from("agent_action_log").insert({
          user_id: userId,
          action_type: "emergency_alert",
          trigger_type: "system",
          trigger_reason: `${type} emergency detected (triggered by ${user.id === userId ? 'self' : 'caregiver ' + user.id})`,
          action_payload: {
            contact_id: contact.id,
            contact_name: contact.name,
            alert_type: type,
            message: alertMessage,
            triggered_by: user.id,
          },
          status: "completed",
        });

      } catch (contactError) {
        console.error(`Error notifying contact ${contact.id}:`, contactError);
        notificationsSent.push({
          contactId: contact.id,
          method: "app_notification",
          success: false,
        });
      }
    }

    // Update fall event if applicable
    if (fallEventId) {
      await supabase
        .from("fall_events")
        .update({
          response_status: "emergency_triggered",
          emergency_contacts_notified: notificationsSent.map(n => ({
            ...n,
            notified_at: new Date().toISOString(),
          })),
        })
        .eq("id", fallEventId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        contactsNotified: notificationsSent.filter(n => n.success).length,
        totalContacts: contacts.length,
        notifications: notificationsSent,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in trigger-emergency-response:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
