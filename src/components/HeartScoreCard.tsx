import { Card } from "@/components/ui/card";
import { Info, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHeartScore } from "@/hooks/useHeartScore";
import { useLanguage } from "@/contexts/LanguageContext";
import { Logo } from "@/components/Logo";

const HeartScoreCard = () => {
  const { todayScore, isLoading, calculateScore, isCalculating } = useHeartScore();
  const { t } = useLanguage();

  const score = todayScore?.heart_score || 0;
  const bpScore = todayScore?.bp_score || 0;
  const sugarScore = todayScore?.sugar_score || 0;
  const consistencyScore = todayScore?.consistency_score || 0;
  const aiExplanation = todayScore?.ai_explanation;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-score-excellent";
    if (score >= 70) return "text-score-good";
    if (score >= 60) return "text-score-moderate";
    if (score >= 50) return "text-score-poor";
    return "text-score-critical";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-score-excellent to-score-good";
    if (score >= 70) return "from-score-good to-score-moderate";
    if (score >= 60) return "from-score-moderate to-score-poor";
    return "from-score-poor to-score-critical";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return t("heartScore.excellent");
    if (score >= 70) return t("heartScore.good");
    if (score >= 60) return "Fair";
    if (score >= 50) return t("heartScore.needsWork");
    return "Critical";
  };

  if (isLoading) {
    return (
      <Card className="p-8 shadow-elevated border-2 bg-gradient-to-br from-card via-card to-muted/30">
        <div className="flex items-center justify-center h-48">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 shadow-elevated border-2 bg-gradient-to-br from-card via-card to-muted/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"></div>
      
      <div className="relative">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-1">{t("heartScore.title")}</h2>
            <p className="text-muted-foreground">Today's health snapshot</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => calculateScore(undefined)}
              disabled={isCalculating}
            >
              <RefreshCw className={`w-5 h-5 ${isCalculating ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Info className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-baseline gap-3">
            <span className={`text-7xl font-bold ${getScoreColor(score)}`}>
              {score}
            </span>
            <span className="text-3xl text-muted-foreground">/100</span>
          </div>
          <div className={getScoreColor(score)}>
            <Logo size="lg" showText={false} />
          </div>
        </div>

        {/* Score Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{getScoreLabel(score)}</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getScoreGradient(score)} transition-smooth rounded-full`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Sub-Scores */}
        {todayScore && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-sm text-muted-foreground mb-1">BP</div>
              <div className={`text-2xl font-bold ${getScoreColor(bpScore)}`}>{bpScore}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-sm text-muted-foreground mb-1">Sugar</div>
              <div className={`text-2xl font-bold ${getScoreColor(sugarScore)}`}>{sugarScore}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-sm text-muted-foreground mb-1">Ritual</div>
              <div className={`text-2xl font-bold ${getScoreColor(consistencyScore)}`}>{consistencyScore}</div>
            </div>
          </div>
        )}

        {/* AI Insight */}
        {aiExplanation ? (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <p className="text-sm leading-relaxed">
              <span className="font-semibold text-primary">💡 {t("heartScore.aiExplanation")}:</span>{" "}
              {aiExplanation}
            </p>
          </div>
        ) : !todayScore ? (
          <div className="bg-muted/50 border border-border rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Complete your morning or evening ritual to calculate today's HeartScore
            </p>
            <Button
              onClick={() => calculateScore(undefined)}
              disabled={isCalculating}
              variant="outline"
              size="sm"
            >
              {isCalculating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                "Calculate Score"
              )}
            </Button>
          </div>
        ) : null}
      </div>
    </Card>
  );
};

export default HeartScoreCard;
