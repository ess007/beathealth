import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemedIconProps {
  icon: LucideIcon;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "accent" | "success" | "warning" | "danger" | "muted" | "dark";
  className?: string;
  withGlow?: boolean;
}

interface ThemedEmojiProps {
  emoji: string;
  size?: "sm" | "md" | "lg" | "xl";
  withBadge?: boolean;
  className?: string;
}

const iconSizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
};

const containerSizeClasses = {
  sm: "icon-container-sm",
  md: "icon-container-md",
  lg: "icon-container-lg",
  xl: "icon-container-xl",
};

const variantBgClasses = {
  primary: "icon-bg-primary",
  secondary: "icon-bg-secondary",
  accent: "icon-bg-accent",
  success: "bg-emerald-500/10 dark:bg-emerald-500/20",
  warning: "bg-amber-500/10 dark:bg-amber-500/20",
  danger: "bg-red-500/10 dark:bg-red-500/20",
  muted: "icon-bg-muted",
  dark: "icon-bg-dark",
};

const variantIconClasses = {
  primary: "icon-primary",
  secondary: "icon-secondary",
  accent: "icon-accent",
  success: "icon-success",
  warning: "icon-warning",
  danger: "icon-danger",
  muted: "text-muted-foreground",
  dark: "text-white",
};

export const ThemedIcon = ({
  icon: Icon,
  size = "md",
  variant = "primary",
  className = "",
  withGlow = false,
}: ThemedIconProps) => {
  return (
    <div
      className={cn(
        "icon-container",
        containerSizeClasses[size],
        variantBgClasses[variant],
        withGlow && "icon-glow",
        className
      )}
    >
      <Icon className={cn(iconSizeClasses[size], variantIconClasses[variant])} />
    </div>
  );
};

export const ThemedEmoji = ({
  emoji,
  size = "md",
  withBadge = false,
  className = "",
}: ThemedEmojiProps) => {
  const sizeClasses = {
    sm: withBadge ? "emoji-badge-sm" : "emoji-sm",
    md: withBadge ? "emoji-badge-md" : "emoji-md",
    lg: withBadge ? "emoji-badge-lg" : "emoji-lg",
    xl: withBadge ? "emoji-badge-xl" : "emoji-xl",
  };

  return (
    <span
      className={cn(
        withBadge ? "emoji-badge" : "emoji",
        sizeClasses[size],
        className
      )}
      role="img"
      aria-hidden="true"
    >
      {emoji}
    </span>
  );
};

// Preset themed icon containers for common use cases
export const IconContainerPresets = {
  // Health vitals
  heart: { variant: "primary" as const, icon: "Heart" },
  bp: { variant: "danger" as const, icon: "Activity" },
  sugar: { variant: "secondary" as const, icon: "Droplet" },
  
  // Actions
  success: { variant: "success" as const, icon: "Check" },
  warning: { variant: "warning" as const, icon: "AlertTriangle" },
  info: { variant: "primary" as const, icon: "Info" },
  
  // Features
  brain: { variant: "accent" as const, icon: "Brain" },
  family: { variant: "primary" as const, icon: "Users" },
  meds: { variant: "secondary" as const, icon: "Pill" },
};
