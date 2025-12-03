import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  const { data: subscription, isLoading } = useQuery({
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
    // Premium-only features (₹199/month)
    const premiumFeatures = ["ai_coach", "pdf_reports", "advanced_insights", "priority_support", "teleconsult", "whatsapp_summary"];
    // Basic features (₹99/month)
    const basicFeatures = ["family_dashboard", "weekly_summary", "goal_tracking"];
    // Free features (always accessible)
    const freeFeatures = ["bp_logging", "sugar_logging", "streak_tracking", "basic_insights", "medication_reminders"];

    // Premium users get everything
    if (isPremium) return true;
    
    // Basic users get basic + free features
    if (isBasic && !premiumFeatures.includes(feature)) return true;
    
    // Free users get free features only
    if (freeFeatures.includes(feature)) return true;

    return false;
  };

  const createCheckout = useMutation({
    mutationFn: async (planType: PlanType) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { planType, userId: user.id, email: user.email },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error) => {
      console.error("Checkout error:", error);
      toast.error("Failed to create checkout session");
    },
  });

  return {
    subscription,
    isLoading,
    isPremium,
    isBasic,
    isFree,
    canAccessFeature,
    createCheckout: createCheckout.mutate,
    isCreatingCheckout: createCheckout.isPending,
  };
};
