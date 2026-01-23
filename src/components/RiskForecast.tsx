import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  AlertTriangle, 
  TrendingDown, 
  Activity,
  Loader2,
  RefreshCw,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface RiskData {
  risks: {
    current: {
      cardiovascular: number;
      diabeticComplications: number;
      kidneyDisease: number;
      stroke: number;
    };
    projected: {
      cardiovascular: number;
      diabeticComplications: number;
      kidneyDisease: number;
      stroke: number;
    };
  };
  actions: Array<{
    category: string;
    action: string;
    priority: string;
    impact: string;
  }>;
  dataQuality: {
    bpReadings: number;
    glucoseReadings: number;
    activityDays: number;
    medicationAdherence: number;
  };
}

const RISK_CONFIG = [
  { 
    key: "cardiovascular", 
    label: "Cardiovascular", 
    icon: Heart,
    color: "text-primary",
    bgColor: "bg-primary/10"
  },
  { 
    key: "diabeticComplications", 
    label: "Diabetic Complications", 
    icon: Activity,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10"
  },
  { 
    key: "kidneyDisease", 
    label: "Kidney Disease", 
    icon: AlertTriangle,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10"
  },
  { 
    key: "stroke", 
    label: "Stroke", 
    icon: TrendingDown,
    color: "text-red-500",
    bgColor: "bg-red-500/10"
  },
];

const getRiskLevel = (risk: number) => {
  if (risk < 10) return { label: "Low", color: "text-secondary", bg: "bg-secondary/20" };
  if (risk < 20) return { label: "Moderate", color: "text-amber-500", bg: "bg-amber-500/20" };
  if (risk < 30) return { label: "Elevated", color: "text-orange-500", bg: "bg-orange-500/20" };
  return { label: "High", color: "text-primary", bg: "bg-primary/20" };
};

export const RiskForecast = () => {
  const { language } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  const { data: riskData, isLoading, refetch } = useQuery({
    queryKey: ["risk-forecast"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("forecast-complication-risk");
      if (error) throw error;
      return data as RiskData;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success(language === "hi" ? "जोखिम पूर्वानुमान अपडेट हुआ" : "Risk forecast updated");
    } catch (error) {
      toast.error(language === "hi" ? "अपडेट करने में त्रुटि" : "Failed to update forecast");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-muted-foreground">
              {language === "hi" ? "जोखिम का विश्लेषण हो रहा है..." : "Analyzing health risks..."}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!riskData?.risks) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground mb-3">
            {language === "hi" 
              ? "जोखिम विश्लेषण के लिए अधिक डेटा की आवश्यकता है" 
              : "More health data needed for risk analysis"}
          </p>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            {language === "hi" ? "पुनः प्रयास करें" : "Try Again"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            {language === "hi" ? "10-वर्षीय जोखिम पूर्वानुमान" : "10-Year Risk Forecast"}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {language === "hi" 
            ? "आपके स्वास्थ्य डेटा के आधार पर AI द्वारा विश्लेषित" 
            : "AI-powered analysis based on your health data"}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Risk Cards */}
        <div className="grid grid-cols-2 gap-3">
          {RISK_CONFIG.map(({ key, label, icon: Icon, color, bgColor }) => {
            const current = riskData.risks.current[key as keyof typeof riskData.risks.current] || 0;
            const projected = riskData.risks.projected[key as keyof typeof riskData.risks.projected] || 0;
            const riskLevel = getRiskLevel(current);
            const improving = projected < current;

            return (
              <div 
                key={key}
                className={`p-3 rounded-xl border ${bgColor} border-border/50`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-xs font-medium truncate">{label}</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className={`text-xl font-bold ${color}`}>
                    {current.toFixed(1)}%
                  </span>
                  {improving && (
                    <span className="text-xs text-secondary flex items-center gap-0.5 mb-1">
                      <TrendingDown className="w-3 h-3" />
                      {(current - projected).toFixed(1)}%
                    </span>
                  )}
                </div>
                <Progress 
                  value={current} 
                  className="h-1.5 mt-2" 
                />
                <div className={`inline-flex mt-2 px-1.5 py-0.5 rounded text-[10px] font-medium ${riskLevel.bg} ${riskLevel.color}`}>
                  {riskLevel.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mitigation Actions */}
        {riskData.actions && riskData.actions.length > 0 && (
          <Collapsible open={actionsOpen} onOpenChange={setActionsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between h-10 px-3">
                <span className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-secondary" />
                  {language === "hi" ? "जोखिम कम करने के उपाय" : "Risk Reduction Actions"}
                </span>
                {actionsOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              {riskData.actions.slice(0, 4).map((action, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/30"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    action.priority === "high" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{action.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {action.category} • {action.impact}
                    </p>
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Data Quality Indicator */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/30">
          {language === "hi" ? "विश्लेषण में उपयोग:" : "Analysis based on:"}{" "}
          {riskData.dataQuality?.bpReadings || 0} BP, {riskData.dataQuality?.glucoseReadings || 0} glucose readings
        </div>
      </CardContent>
    </Card>
  );
};
