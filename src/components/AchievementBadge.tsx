import { Award, Flame, Heart, Activity, Target } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface AchievementBadgeProps {
  type: string;
  earnedAt: string;
  shared?: boolean;
  onShare?: () => void;
  size?: "small" | "large";
}

const badgeConfig = {
  "7_day_streak": {
    icon: Flame,
    title: "7-Day Warrior",
    description: "Completed daily rituals for 7 days straight",
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    emoji: "🔥",
  },
  "30_day_streak": {
    icon: Flame,
    title: "30-Day Champion",
    description: "Completed daily rituals for 30 days straight",
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950",
    emoji: "🏆",
  },
  bp_control_month: {
    icon: Heart,
    title: "BP Master",
    description: "Maintained healthy blood pressure for a month",
    color: "text-pink-500",
    bgColor: "bg-pink-50 dark:bg-pink-950",
    emoji: "❤️",
  },
  sugar_control_month: {
    icon: Activity,
    title: "Sugar Champion",
    description: "Maintained healthy blood sugar for a month",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    emoji: "⭐",
  },
  first_ritual: {
    icon: Target,
    title: "Getting Started",
    description: "Completed your first ritual",
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950",
    emoji: "🎯",
  },
};

export const AchievementBadge = ({ 
  type, 
  earnedAt, 
  shared = false, 
  onShare,
  size = "large" 
}: AchievementBadgeProps) => {
  const config = badgeConfig[type as keyof typeof badgeConfig] || badgeConfig.first_ritual;
  const Icon = config.icon;
  const date = new Date(earnedAt).toLocaleDateString();

  if (size === "small") {
    return (
      <div 
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg",
          config.bgColor
        )}
        title={config.description}
      >
        <Icon className={cn("h-5 w-5", config.color)} />
        <span className="text-sm font-medium">{config.title}</span>
      </div>
    );
  }

  return (
    <Card className={cn(
      "p-6 text-center relative overflow-hidden shadow-elevated",
      config.bgColor
    )}>
      <div className="absolute top-2 right-2 text-3xl opacity-20">
        {config.emoji}
      </div>
      
      <div className="flex justify-center mb-4">
        <div className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center",
          "bg-background shadow-lg"
        )}>
          <Icon className={cn("h-10 w-10", config.color)} />
        </div>
      </div>

      <h3 className="text-xl font-bold mb-2">{config.title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{config.description}</p>
      <p className="text-xs text-muted-foreground mb-4">Earned on {date}</p>

      {onShare && (
        <Button
          variant="outline"
          size="sm"
          onClick={onShare}
          disabled={shared}
          className="w-full"
        >
          {shared ? "Shared with Family" : "Share with Family"}
        </Button>
      )}
    </Card>
  );
};
