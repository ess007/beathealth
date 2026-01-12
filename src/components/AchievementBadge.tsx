import { Award, Flame, Heart, Activity, Target } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { ThemedEmoji, ThemedIcon } from "./ThemedIcon";

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
    variant: "warning" as const,
    bgColor: "bg-amber-50 dark:bg-amber-950/50",
    emoji: "🔥",
  },
  "30_day_streak": {
    icon: Flame,
    title: "30-Day Champion",
    description: "Completed daily rituals for 30 days straight",
    variant: "danger" as const,
    bgColor: "bg-red-50 dark:bg-red-950/50",
    emoji: "🏆",
  },
  bp_control_month: {
    icon: Heart,
    title: "BP Master",
    description: "Maintained healthy blood pressure for a month",
    variant: "primary" as const,
    bgColor: "bg-primary/5 dark:bg-primary/10",
    emoji: "❤️",
  },
  sugar_control_month: {
    icon: Activity,
    title: "Sugar Champion",
    description: "Maintained healthy blood sugar for a month",
    variant: "secondary" as const,
    bgColor: "bg-secondary/5 dark:bg-secondary/10",
    emoji: "⭐",
  },
  first_ritual: {
    icon: Target,
    title: "Getting Started",
    description: "Completed your first ritual",
    variant: "success" as const,
    bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
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
        <ThemedIcon icon={Icon} size="sm" variant={config.variant} />
        <span className="text-sm font-medium">{config.title}</span>
      </div>
    );
  }

  return (
    <Card className={cn(
      "p-6 text-center relative overflow-hidden shadow-elevated",
      config.bgColor
    )}>
      <div className="absolute top-3 right-3">
        <ThemedEmoji emoji={config.emoji} size="lg" />
      </div>
      
      <div className="flex justify-center mb-4">
        <ThemedIcon 
          icon={Icon} 
          size="xl" 
          variant={config.variant} 
          withGlow 
          className="w-20 h-20 rounded-full shadow-lg bg-background"
        />
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
