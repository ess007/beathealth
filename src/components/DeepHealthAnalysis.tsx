import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, 
  Heart, Activity, Pill, Zap, ChevronRight, Loader2 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AnalysisResult {
  conditions: string[];
  trends: any;
  analysis: {
    overallRiskLevel: string;
    riskScores: {
      cardiovascular: number;
      diabeticComplications: number;
      kidneyDisease: number;
      stroke: number;
    };
    crossConditionImpacts: Array<{ impact: string; severity: string }>;
    prioritizedRecommendations: Array<{
      priority: number;
      action: string;
      expectedImpact: string;
      timeframe: string;
    }>;
    warningFlags: string[];
    positiveFindings: string[];
  };
}

const riskColors: Record<string, string> = {
  low: "text-green-600 bg-green-500/10",
  moderate: "text-yellow-600 bg-yellow-500/10",
  high: "text-orange-600 bg-orange-500/10",
  critical: "text-red-600 bg-red-500/10",
};

const getRiskColor = (score: number) => {
  if (score < 30) return "bg-green-500";
  if (score < 50) return "bg-yellow-500";
  if (score < 70) return "bg-orange-500";
  return "bg-red-500";
};

export const DeepHealthAnalysis = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const runAnalysis = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase.functions.invoke("reasoning-engine", {
        body: {
          userId: user.id,
          analysisType: "full",
        },
      });
      
      if (error) throw error;
      return data as AnalysisResult;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success(
        language === "hi" 
          ? "गहन विश्लेषण पूरा हुआ!" 
          : "Deep analysis complete!"
      );
    },
    onError: (error: any) => {
      console.error("Analysis error:", error);
      toast.error(
        language === "hi" 
          ? "विश्लेषण में त्रुटि हुई" 
          : "Failed to run analysis"
      );
    },
  });

  if (!result && !runAnalysis.isPending) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-bold text-lg mb-2">
            {language === "hi" ? "गहन स्वास्थ्य विश्लेषण" : "Deep Health Analysis"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
            {language === "hi" 
              ? "AI-संचालित बहु-स्थिति विश्लेषण जो आपके सभी स्वास्थ्य डेटा को समझता है" 
              : "AI-powered multi-condition analysis that understands all your health data together"}
          </p>
          <Button
            onClick={() => runAnalysis.mutate()}
            className="gap-2"
          >
            <Zap className="w-4 h-4" />
            {language === "hi" ? "विश्लेषण शुरू करें" : "Run Analysis"}
          </Button>
        </div>
      </Card>
    );
  }

  if (runAnalysis.isPending) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="font-medium">
            {language === "hi" ? "विश्लेषण हो रहा है..." : "Analyzing your health data..."}
          </p>
          <p className="text-sm text-muted-foreground">
            {language === "hi" 
              ? "सभी स्थितियों और रुझानों की जांच" 
              : "Checking all conditions and trends"}
          </p>
        </div>
      </Card>
    );
  }

  if (!result) return null;

  const { analysis, conditions, trends } = result;

  return (
    <div className="space-y-4">
      {/* Overall Risk */}
      <Card className={`p-4 ${riskColors[analysis.overallRiskLevel] || riskColors.moderate}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-background/50 flex items-center justify-center">
              {analysis.overallRiskLevel === "low" || analysis.overallRiskLevel === "moderate" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-xs opacity-75">
                {language === "hi" ? "समग्र जोखिम" : "Overall Risk"}
              </p>
              <p className="font-bold capitalize">{analysis.overallRiskLevel}</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-background/50">
            {conditions.length} {language === "hi" ? "स्थितियां" : "conditions"}
          </Badge>
        </div>
      </Card>

      {/* Risk Scores */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          {language === "hi" ? "जोखिम स्कोर" : "Risk Scores"}
        </h4>
        <div className="space-y-3">
          {Object.entries(analysis.riskScores).map(([key, score]) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="font-medium">{score}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${getRiskColor(score)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Warning Flags */}
      {analysis.warningFlags && analysis.warningFlags.length > 0 && (
        <Card className="p-4 border-orange-500/30 bg-orange-500/5">
          <h4 className="font-semibold mb-2 flex items-center gap-2 text-orange-600">
            <AlertTriangle className="w-4 h-4" />
            {language === "hi" ? "चेतावनी" : "Warnings"}
          </h4>
          <ul className="space-y-1.5">
            {analysis.warningFlags.map((flag, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-orange-500">•</span>
                {flag}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Positive Findings */}
      {analysis.positiveFindings && analysis.positiveFindings.length > 0 && (
        <Card className="p-4 border-green-500/30 bg-green-500/5">
          <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-600">
            <TrendingUp className="w-4 h-4" />
            {language === "hi" ? "अच्छी बातें" : "Positive Findings"}
          </h4>
          <ul className="space-y-1.5">
            {analysis.positiveFindings.map((finding, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-green-500">✓</span>
                {finding}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Pill className="w-4 h-4 text-primary" />
          {language === "hi" ? "सिफारिशें" : "Recommendations"}
        </h4>
        <div className="space-y-3">
          {analysis.prioritizedRecommendations?.slice(0, 5).map((rec, i) => (
            <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {rec.priority}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{rec.action}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {rec.expectedImpact} • {rec.timeframe}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          ))}
        </div>
      </Card>

      {/* Run Again */}
      <Button
        variant="outline"
        onClick={() => runAnalysis.mutate()}
        className="w-full"
        disabled={runAnalysis.isPending}
      >
        {language === "hi" ? "फिर से विश्लेषण करें" : "Run Analysis Again"}
      </Button>
    </div>
  );
};
