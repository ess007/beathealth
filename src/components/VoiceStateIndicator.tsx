import { cn } from "@/lib/utils";
import { Mic, Volume2, Loader2 } from "lucide-react";
import type { VoiceState } from "@/hooks/useVoiceConversation";

interface VoiceStateIndicatorProps {
  state: VoiceState;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const VoiceStateIndicator = ({ state, className, size = "md" }: VoiceStateIndicatorProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const ringClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  if (state === "idle") return null;

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Animated rings */}
      {state === "listening" && (
        <>
          <div
            className={cn(
              "absolute rounded-full bg-primary/20 animate-ping",
              ringClasses[size]
            )}
            style={{ animationDuration: "1.5s" }}
          />
          <div
            className={cn(
              "absolute rounded-full bg-primary/10 animate-ping",
              ringClasses[size]
            )}
            style={{ animationDuration: "2s", animationDelay: "0.5s" }}
          />
        </>
      )}

      {state === "speaking" && (
        <>
          <div
            className={cn(
              "absolute rounded-full bg-accent/20 animate-pulse",
              ringClasses[size]
            )}
          />
          <div
            className={cn(
              "absolute rounded-full bg-accent/30",
              sizeClasses[size]
            )}
            style={{
              animation: "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          />
        </>
      )}

      {/* Center icon */}
      <div
        className={cn(
          "relative rounded-full flex items-center justify-center z-10",
          sizeClasses[size],
          state === "listening" && "bg-primary text-primary-foreground",
          state === "processing" && "bg-muted text-muted-foreground",
          state === "speaking" && "bg-accent text-accent-foreground"
        )}
      >
        {state === "listening" && <Mic className={cn("animate-pulse", iconSizes[size])} />}
        {state === "processing" && <Loader2 className={cn("animate-spin", iconSizes[size])} />}
        {state === "speaking" && <Volume2 className={cn(iconSizes[size])} />}
      </div>
    </div>
  );
};

// Compact inline indicator for the input area
interface VoiceStateBadgeProps {
  state: VoiceState;
  language?: "en" | "hi";
  onTap?: () => void;
}

export const VoiceStateBadge = ({ state, language = "en", onTap }: VoiceStateBadgeProps) => {
  if (state === "idle") return null;

  const labels = {
    listening: language === "hi" ? "सुन रहा हूं..." : "Listening...",
    processing: language === "hi" ? "सोच रहा हूं..." : "Thinking...",
    speaking: language === "hi" ? "टैप करें रोकने के लिए" : "Tap to stop",
  };

  const colors = {
    listening: "bg-primary/10 text-primary border-primary/30",
    processing: "bg-muted text-muted-foreground border-muted-foreground/30",
    speaking: "bg-accent/10 text-accent-foreground border-accent/30",
  };

  return (
    <button
      onClick={onTap}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
        colors[state],
        state === "speaking" && "active:scale-95 cursor-pointer"
      )}
    >
      {state === "listening" && <Mic className="w-3 h-3 animate-pulse" />}
      {state === "processing" && <Loader2 className="w-3 h-3 animate-spin" />}
      {state === "speaking" && <Volume2 className="w-3 h-3" />}
      <span>{labels[state]}</span>
    </button>
  );
};
