import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Quick reply mappings
const quickReplies: Record<string, { route: string | null; response: string }> = {
  "log bp": { route: "/app/checkin/morning", response: "Opening BP logging... 📊" },
  "log sugar": { route: "/app/checkin/morning", response: "Opening sugar logging... 🩸" },
  "my streak": { route: "/app/home", response: "Checking your streak... 🔥" },
  "family report": { route: "/app/family", response: "Loading family dashboard... 👨‍👩‍👧‍👦" },
  "coach": { route: "/app/coach", response: "Connecting to Beat AI Coach... 🤖" },
  "help": { route: null, response: "Available commands:\n• Log BP\n• Log Sugar\n• My Streak\n• Family Report\n• Coach\n\nReply with any command to continue!" },
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle webhook verification (GET request)
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    const verifyToken = Deno.env.get("WHATSAPP_VERIFY_TOKEN") || "beat_health_verify";

    if (mode === "subscribe" && token === verifyToken) {
      console.log("Webhook verified successfully");
      return new Response(challenge, { status: 200 });
    }

    return new Response("Forbidden", { status: 403 });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    console.log("WhatsApp webhook received:", JSON.stringify(body, null, 2));

    // Extract message data
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) {
      console.log("No messages in webhook payload");
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const message = messages[0];
    const from = message.from; // Phone number
    const messageText = message.text?.body?.toLowerCase().trim() || "";

    console.log(`Message from ${from}: ${messageText}`);

    // Find user by phone
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("id, full_name")
      .eq("phone", `+${from}`)
      .single();

    if (!profile) {
      console.log(`User not found for phone: ${from}`);
      // Could send a registration message here
      return new Response(JSON.stringify({ status: "user_not_found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Process quick reply
    const quickReply = quickReplies[messageText];
    let responseMessage = "";

    if (quickReply) {
      responseMessage = quickReply.response;
      
      // Log the event
      await supabaseClient.from("events").insert({
        type: "whatsapp_quick_reply",
        user_id: profile.id,
        payload_json: {
          command: messageText,
          route: quickReply.route,
        },
      });
    } else {
      // Default response
      responseMessage = `Hi ${profile.full_name || "there"}! 👋\n\nHere's what I can help with:\n• Log BP\n• Log Sugar\n• My Streak\n• Family Report\n• Coach\n\nReply with any command!`;
    }

    // Send response via WhatsApp API
    const whatsappToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

    if (whatsappToken && phoneNumberId) {
      await fetch(
        `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${whatsappToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: from,
            type: "text",
            text: { body: responseMessage },
          }),
        }
      );
    }

    return new Response(
      JSON.stringify({ status: "processed", userId: profile.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing WhatsApp webhook:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
