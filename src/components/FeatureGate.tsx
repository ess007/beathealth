import { ReactNode } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Crown, Lock } from "lucide-react";

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  requiredTier?: "basic" | "premium";
}

export const FeatureGate = ({ feature, children, fallback, requiredTier = "premium" }: FeatureGateProps) => {
  const { canAccessFeature, createCheckout, isCreatingCheckout, isBasic } = useSubscription();

  if (canAccessFeature(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Determine which tier to show based on requiredTier or feature type
  const basicFeatures = ["family_dashboard", "weekly_summary", "goal_tracking", "trend_charts", "data_export"];
  const showBasicPlan = requiredTier === "basic" || basicFeatures.includes(feature);
  const targetPlan = showBasicPlan && !isBasic ? "basic" : "premium";
  const planName = targetPlan === "basic" ? "Basic (₹99/mo)" : "Premium (₹199/mo)";

  return (
    <Card className="p-6 text-center bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {targetPlan === "basic" ? "Basic Feature" : "Premium Feature"}
      </h3>
      <p className="text-muted-foreground mb-4">
        Upgrade to Beat {planName} to unlock this feature and get the most out of your health journey.
      </p>
      <Button
        onClick={() => createCheckout(targetPlan)}
        disabled={isCreatingCheckout}
        className="gap-2"
      >
        <Crown className="w-4 h-4" />
        {isCreatingCheckout ? "Loading..." : `Upgrade to ${planName}`}
      </Button>
    </Card>
  );
};
