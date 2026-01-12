import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Pill, Info, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Interaction {
  drug_a: string;
  drug_b: string;
  severity: string;
  description: string;
  recommendation: string;
}

interface InteractionCheckResult {
  interactions: Interaction[];
  summary: {
    major: number;
    moderate: number;
    minor: number;
    total: number;
  };
}

export const DrugInteractionWarning = () => {
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const { data: interactionData, refetch, isLoading } = useQuery({
    queryKey: ["drug-interactions"],
    queryFn: async (): Promise<InteractionCheckResult | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      setIsChecking(true);
      try {
        const { data, error } = await supabase.functions.invoke("check-drug-interactions", {
          body: { userId: user.id },
        });

        if (error) throw error;
        return data as InteractionCheckResult;
      } finally {
        setIsChecking(false);
      }
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "major":
        return "text-red-500 bg-red-500/10 border-red-500/30";
      case "moderate":
        return "text-orange-500 bg-orange-500/10 border-orange-500/30";
      case "minor":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
      default:
        return "text-muted-foreground bg-muted/10 border-border/30";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "major":
        return <XCircle className="h-4 w-4" />;
      case "moderate":
        return <AlertTriangle className="h-4 w-4" />;
      case "minor":
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const handleCheckInteractions = async () => {
    setIsChecking(true);
    try {
      await refetch();
      toast.success("Interaction check complete");
    } catch (error) {
      toast.error("Failed to check interactions");
    } finally {
      setIsChecking(false);
    }
  };

  // Don't show if no interactions
  if (!interactionData || interactionData.summary.total === 0) {
    return null;
  }

  const hasSerious = interactionData.summary.major > 0;

  return (
    <>
      <Card 
        className={`border-border/50 backdrop-blur-sm cursor-pointer transition-all hover:border-primary/30 ${
          hasSerious ? "bg-red-500/5 border-red-500/30" : "bg-orange-500/5 border-orange-500/30"
        }`}
        onClick={() => setShowDetailsDialog(true)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${hasSerious ? "bg-red-500/10" : "bg-orange-500/10"}`}>
                <AlertTriangle className={`h-5 w-5 ${hasSerious ? "text-red-500" : "text-orange-500"}`} />
              </div>
              <div>
                <p className={`font-medium ${hasSerious ? "text-red-600" : "text-orange-600"}`}>
                  Drug Interactions Found
                </p>
                <p className="text-sm text-muted-foreground">
                  {interactionData.summary.major > 0 && `${interactionData.summary.major} major, `}
                  {interactionData.summary.moderate > 0 && `${interactionData.summary.moderate} moderate`}
                  {interactionData.summary.minor > 0 && `, ${interactionData.summary.minor} minor`}
                </p>
              </div>
            </div>
            <Button size="sm" variant="ghost">
              View
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              Drug Interactions
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-2">
              {interactionData.summary.major > 0 && (
                <div className="p-3 rounded-lg bg-red-500/10 text-center">
                  <p className="text-2xl font-bold text-red-500">{interactionData.summary.major}</p>
                  <p className="text-xs text-red-600">Major</p>
                </div>
              )}
              {interactionData.summary.moderate > 0 && (
                <div className="p-3 rounded-lg bg-orange-500/10 text-center">
                  <p className="text-2xl font-bold text-orange-500">{interactionData.summary.moderate}</p>
                  <p className="text-xs text-orange-600">Moderate</p>
                </div>
              )}
              {interactionData.summary.minor > 0 && (
                <div className="p-3 rounded-lg bg-yellow-500/10 text-center">
                  <p className="text-2xl font-bold text-yellow-500">{interactionData.summary.minor}</p>
                  <p className="text-xs text-yellow-600">Minor</p>
                </div>
              )}
            </div>

            {/* Interactions List */}
            <div className="space-y-3">
              {interactionData.interactions.map((interaction, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${getSeverityColor(interaction.severity)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getSeverityIcon(interaction.severity)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          {interaction.drug_a} + {interaction.drug_b}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getSeverityColor(interaction.severity)}`}>
                          {interaction.severity}
                        </span>
                      </div>
                      <p className="text-sm">{interaction.description}</p>
                      <div className="p-2 rounded bg-background/50">
                        <p className="text-xs text-muted-foreground">
                          <strong>Recommendation:</strong> {interaction.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs text-muted-foreground">
                <strong>Important:</strong> This is for informational purposes only. 
                Always consult your doctor or pharmacist before making any changes to your medications.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 gap-2"
                onClick={handleCheckInteractions}
                disabled={isChecking}
              >
                {isChecking ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Recheck
              </Button>
              <Button 
                className="flex-1"
                onClick={() => setShowDetailsDialog(false)}
              >
                Got it
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
