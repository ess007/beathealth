import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export type PlanType = "free" | "basic" | "premium";

interface Subscription {
  id: string;
  user_id: string;
  plan_type: PlanType;
  status: string;
  razorpay_subscription_id: string | null;
  razorpay_customer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const queryClient = useQueryClient();
  const [checkoutPlan, setCheckoutPlan] = useState<"basic" | "premium" | null>(null);

  const { data: subscription, isLoading, refetch } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching subscription:", error);
        return null;
      }

      return data as Subscription | null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const isPremium = subscription?.plan_type === "premium" && subscription?.status === "active";
  const isBasic = subscription?.plan_type === "basic" && subscription?.status === "active";
  const isFree = !subscription || subscription?.plan_type === "free";

  const canAccessFeature = (feature: string): boolean => {
    // Premium-only features (₹199/month) - AI coaching, PDF reports, advanced insights, priority support, teleconsult, whatsapp summaries
    const premiumFeatures = ["ai_coach", "pdf_reports", "advanced_insights", "priority_support", "teleconsult", "whatsapp_summary", "priority_nudges", "correlation_insights"];
    // Basic features (₹99/month) - Family dashboard, weekly summaries, goal tracking, trend charts, data export
    const basicFeatures = ["family_dashboard", "weekly_summary", "goal_tracking", "trend_charts", "data_export"];
    // Free features (always accessible) - BP/Sugar logging, basic insights, streaks, medication reminders, rituals
    const freeFeatures = ["bp_logging", "sugar_logging", "streak_tracking", "basic_insights", "medication_reminders", "rituals", "basic_heartscore"];

    // Premium users get everything
    if (isPremium) return true;
    
    // Basic users get basic + free features
    if (isBasic && !premiumFeatures.includes(feature)) return true;
    
    // Free users get free features only
    if (freeFeatures.includes(feature)) return true;

    return false;
  };

  const openCheckout = (planType: "basic" | "premium") => {
    setCheckoutPlan(planType);
  };

  const closeCheckout = () => {
    setCheckoutPlan(null);
  };

  const onCheckoutSuccess = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["subscription"] });
  };

  // Legacy mutation for backwards compatibility
  const createCheckout = useMutation({
    mutationFn: async (planType: PlanType) => {
      if (planType === "free") return;
      openCheckout(planType as "basic" | "premium");
    },
  });

  return {
    subscription,
    isLoading,
    isPremium,
    isBasic,
    isFree,
    canAccessFeature,
    // New checkout flow
    checkoutPlan,
    openCheckout,
    closeCheckout,
    onCheckoutSuccess,
    refetch,
    // Legacy
    createCheckout: (planType: PlanType) => {
      if (planType !== "free") openCheckout(planType as "basic" | "premium");
    },
    isCreatingCheckout: false,
  };
};
