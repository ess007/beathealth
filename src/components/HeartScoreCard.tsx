import { Card } from "@/components/ui/card";
import { Heart, TrendingUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeartScoreCardProps {
  score: number;
}

const HeartScoreCard = ({ score }: HeartScoreCardProps) => {
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
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    if (score >= 50) return "Needs Attention";
    return "Critical";
  };

  return (
    <Card className="p-8 shadow-elevated border-2 bg-gradient-to-br from-card via-card to-muted/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"></div>
      
      <div className="relative">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-1">Your HeartScore</h2>
            <p className="text-muted-foreground">Today's health snapshot</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Info className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-baseline gap-3">
            <span className={`text-7xl font-bold ${getScoreColor(score)}`}>
              {score}
            </span>
            <span className="text-3xl text-muted-foreground">/100</span>
          </div>
          <Heart className={`w-16 h-16 ${getScoreColor(score)}`} fill="currentColor" />
        </div>

        {/* Score Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{getScoreLabel(score)}</span>
            <span className="text-muted-foreground">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              +3 from yesterday
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getScoreGradient(score)} transition-smooth rounded-full`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* AI Insight */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <p className="text-sm leading-relaxed">
            <span className="font-semibold text-primary">💡 What moved your score:</span>{" "}
            Great job completing your morning ritual! Your BP reading was in the healthy range, 
            and your consistency is improving. Keep up with your evening check-in to maintain this momentum.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default HeartScoreCard;
