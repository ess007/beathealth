import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schemas
const messageSchema = z.object({
  from: z.string().regex(/^\d{10,15}$/, "Invalid phone number format"),
  text: z.object({
    body: z.string().max(1000, "Message too long")
  }).optional()
});

const webhookPayloadSchema = z.object({
  entry: z.array(z.object({
    changes: z.array(z.object({
      value: z.object({
        messages: z.array(messageSchema).optional()
      })
    }))
  }))
});

// Quick reply mappings
const quickReplies: Record<string, { route: string | null; response: string }> = {
  "log bp": { route: "/app/checkin/morning", response: "Opening BP logging... 📊" },
  "log sugar": { route: "/app/checkin/morning", response: "Opening sugar logging... 🩸" },
  "my streak": { route: "/app/home", response: "Checking your streak... 🔥" },
  "family report": { route: "/app/family", response: "Loading family dashboard... 👨‍👩‍👧‍👦" },
  "coach": { route: "/app/coach", response: "Connecting to Beat AI Coach... 🤖" },
  "help": { route: null, response: "Available commands:\n• Log BP\n• Log Sugar\n• My Streak\n• Family Report\n• Coach\n\nReply with any command to continue!" },
};

// Uniform response to prevent user enumeration
const GENERIC_RESPONSE = "Thanks for your message! 👋\n\nTo use Beat Health via WhatsApp, please ensure you've registered with your phone number in the Beat app.\n\nAvailable commands:\n• Log BP\n• Log Sugar\n• My Streak\n• Family Report\n• Coach";

// Simple in-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per phone

function checkRateLimit(phoneNumber: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(phoneNumber);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(phoneNumber, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  record.count++;
  return true;
}

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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Parse and validate the request body
    const rawBody = await req.text();
    let body: unknown;
    
    try {
      body = JSON.parse(rawBody);
    } catch {
      console.error("Invalid JSON in webhook payload");
      // Log suspicious request
      await supabaseClient.from("events").insert({
        type: "whatsapp_security_event",
        payload_json: {
          event: "invalid_json",
          ip: req.headers.get("x-forwarded-for") || "unknown",
          timestamp: new Date().toISOString()
        },
      });
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate payload structure
    const validationResult = webhookPayloadSchema.safeParse(body);
    if (!validationResult.success) {
      console.error("Invalid webhook payload structure:", validationResult.error.message);
      // Log suspicious request
      await supabaseClient.from("events").insert({
        type: "whatsapp_security_event",
        payload_json: {
          event: "invalid_payload_structure",
          ip: req.headers.get("x-forwarded-for") || "unknown",
          timestamp: new Date().toISOString()
        },
      });
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("WhatsApp webhook received");

    // Extract message data
    const entry = validationResult.data.entry?.[0];
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

    // Apply rate limiting per phone number
    if (!checkRateLimit(from)) {
      console.log(`Rate limit exceeded for phone: ${from.substring(0, 4)}****`);
      // Log rate limit event
      await supabaseClient.from("events").insert({
        type: "whatsapp_security_event",
        payload_json: {
          event: "rate_limit_exceeded",
          phone_hash: await hashPhone(from),
          timestamp: new Date().toISOString()
        },
      });
      // Return 200 to prevent retry storms
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log message (without revealing phone number)
    console.log(`Processing message from phone ending in ${from.slice(-4)}`);

    // Find user by phone - use uniform timing to prevent timing attacks
    const startTime = Date.now();
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("id, full_name")
      .eq("phone", `+${from}`)
      .single();

    // Ensure minimum response time to prevent timing attacks
    const elapsed = Date.now() - startTime;
    if (elapsed < 100) {
      await new Promise(resolve => setTimeout(resolve, 100 - elapsed));
    }

    // Get WhatsApp API credentials
    const whatsappToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

    // SECURITY: Always return uniform response regardless of user existence
    // This prevents user enumeration attacks
    if (!profile) {
      console.log("User not found - sending generic response");
      
      // Log security event without revealing phone
      await supabaseClient.from("events").insert({
        type: "whatsapp_security_event",
        payload_json: {
          event: "user_not_found",
          phone_hash: await hashPhone(from),
          timestamp: new Date().toISOString()
        },
      });

      // Still send a response to avoid enumeration
      if (whatsappToken && phoneNumberId) {
        await sendWhatsAppMessage(whatsappToken, phoneNumberId, from, GENERIC_RESPONSE);
      }

      // Return same status code regardless of user existence
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Process quick reply for authenticated user
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
      // Personalized response for registered users
      responseMessage = `Hi ${profile.full_name || "there"}! 👋\n\nHere's what I can help with:\n• Log BP\n• Log Sugar\n• My Streak\n• Family Report\n• Coach\n\nReply with any command!`;
    }

    // Send response via WhatsApp API
    if (whatsappToken && phoneNumberId) {
      await sendWhatsAppMessage(whatsappToken, phoneNumberId, from, responseMessage);
    }

    // Return uniform response (don't reveal user ID in response)
    return new Response(
      JSON.stringify({ status: "ok" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing WhatsApp webhook:", error);
    
    // Log error without exposing details
    await supabaseClient.from("events").insert({
      type: "whatsapp_security_event",
      payload_json: {
        event: "processing_error",
        timestamp: new Date().toISOString()
      },
    });

    // Always return 200 to prevent retry storms and info leakage
    return new Response(
      JSON.stringify({ status: "ok" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function to send WhatsApp messages
async function sendWhatsAppMessage(
  token: string,
  phoneNumberId: string,
  to: string,
  message: string
): Promise<void> {
  try {
    await fetch(
      `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to,
          type: "text",
          text: { body: message },
        }),
      }
    );
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
  }
}

// Helper to hash phone numbers for logging (privacy-preserving)
async function hashPhone(phone: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(phone + "beat_salt_2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.slice(0, 8).map(b => b.toString(16).padStart(2, "0")).join("");
}
