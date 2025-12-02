import { ReactNode } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Crown, Lock } from "lucide-react";

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const FeatureGate = ({ feature, children, fallback }: FeatureGateProps) => {
  const { canAccessFeature, createCheckout, isCreatingCheckout } = useSubscription();

  if (canAccessFeature(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="p-6 text-center bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
      <p className="text-muted-foreground mb-4">
        Upgrade to Beat Premium to unlock this feature and get the most out of your health journey.
      </p>
      <Button
        onClick={() => createCheckout("premium")}
        disabled={isCreatingCheckout}
        className="gap-2"
      >
        <Crown className="w-4 h-4" />
        {isCreatingCheckout ? "Loading..." : "Upgrade to Premium"}
      </Button>
    </Card>
  );
};
