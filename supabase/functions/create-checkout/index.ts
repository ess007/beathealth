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

    const { planType, userId, email } = await req.json();

    console.log(`Creating checkout for user ${userId}, plan: ${planType}`);

    // Get Razorpay credentials from secrets
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeyId || !razorpayKeySecret) {
      // For demo purposes, return a mock checkout URL if Razorpay is not configured
      console.log("Razorpay not configured, returning demo mode");
      
      // Update subscription to premium directly for demo
      await supabaseClient
        .from("subscriptions")
        .update({
          plan_type: planType,
          status: "active",
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("user_id", userId);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Demo mode: Subscription activated",
          checkoutUrl: null 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Plan pricing in paisa (INR * 100)
    const planPricing: Record<string, number> = {
      basic: 9900, // ₹99
      premium: 19900, // ₹199
    };

    const amount = planPricing[planType] || 19900;

    // Create Razorpay order
    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: `beat_${userId}_${Date.now()}`,
        notes: {
          user_id: userId,
          plan_type: planType,
          email,
        },
      }),
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.text();
      console.error("Razorpay order creation failed:", error);
      throw new Error("Failed to create payment order");
    }

    const order = await orderResponse.json();

    console.log(`Razorpay order created: ${order.id}`);

    return new Response(
      JSON.stringify({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: razorpayKeyId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating checkout:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
