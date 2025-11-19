import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Button } from "@/components/ui/button";
import { Type, Contrast } from "lucide-react";

export const AccessibilityControls = () => {
  const { textSize, highContrast, setTextSize, setHighContrast } = useAccessibility();

  return (
    <div className="flex gap-2">
      <Button
        variant={textSize === "large" ? "default" : "outline"}
        size="icon"
        onClick={() => setTextSize(textSize === "normal" ? "large" : "normal")}
        title="Toggle text size"
      >
        <Type className="h-5 w-5" />
      </Button>
      
      <Button
        variant={highContrast ? "default" : "outline"}
        size="icon"
        onClick={() => setHighContrast(!highContrast)}
        title="Toggle high contrast"
      >
        <Contrast className="h-5 w-5" />
      </Button>
    </div>
  );
};