import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { useTutorial } from "@/hooks/useTutorial";
import { useLanguage } from "@/contexts/LanguageContext";

interface TutorialStep {
  title: string;
  description: string;
  highlightId?: string;
  position: "center" | "top" | "bottom";
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Welcome to Beat!",
    description: "Let's take a quick tour of your health dashboard. We'll show you how to track your heart health every day.",
    position: "center"
  },
  {
    title: "Your HeartScore",
    description: "This is your daily health score out of 100. It combines your blood pressure, sugar levels, and healthy habits. Tap the refresh button to calculate today's score.",
    highlightId: "heartscore-card",
    position: "top"
  },
  {
    title: "Daily Rituals",
    description: "Complete your morning and evening check-ins every day. Morning ritual includes BP, sugar, and sleep. Evening ritual tracks your activity and stress.",
    highlightId: "ritual-section",
    position: "top"
  },
  {
    title: "Your Streak",
    description: "Keep your streak alive by logging your health data every day. The longer your streak, the better you'll understand your health patterns!",
    highlightId: "streak-counter",
    position: "top"
  },
  {
    title: "Quick Actions",
    description: "Use these buttons to quickly log your morning or evening check-in. Just one tap to get started!",
    highlightId: "quick-actions",
    position: "bottom"
  },
  {
    title: "Bottom Navigation",
    description: "Navigate the app using these buttons: Home shows your dashboard, Check-in for daily rituals, Beat for AI health coach, Insights for trends, Family to connect with caregivers.",
    highlightId: "bottom-nav",
    position: "bottom"
  },
  {
    title: "You're All Set!",
    description: "That's it! Start by completing your first morning check-in. Remember, consistency is key to understanding your heart health.",
    position: "center"
  }
];

export const InteractiveTutorial = () => {
  const { currentStep, isActive, isLoading, nextStep, previousStep, skipTutorial, completeTutorial } = useTutorial();
  const { t } = useLanguage();

  if (isLoading || !isActive) return null;

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = async () => {
    if (isLastStep) {
      await completeTutorial();
    } else {
      await nextStep();
    }
  };

  // Highlight effect
  if (step.highlightId) {
    const element = document.getElementById(step.highlightId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("tutorial-highlight");
      setTimeout(() => element.classList.remove("tutorial-highlight"), 3000);
    }
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-40 animate-in fade-in" />
      
      {/* Tutorial Card */}
      <div className={`fixed z-50 w-[90%] max-w-md animate-in slide-in-from-bottom-10 ${
        step.position === "center" ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" :
        step.position === "top" ? "top-24 left-1/2 -translate-x-1/2" :
        "bottom-24 left-1/2 -translate-x-1/2"
      }`}>
        <Card className="p-6 shadow-2xl border-2 border-primary">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold">{step.title}</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={skipTutorial}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Description */}
          <p className="text-base text-foreground mb-6 leading-relaxed">
            {step.description}
          </p>

          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {!isFirstStep && (
              <Button
                variant="outline"
                onClick={previousStep}
                className="flex-1 h-12"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1 h-12 gradient-primary text-white"
            >
              {isLastStep ? "Get Started" : "Next"}
              {!isLastStep && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>

          {/* Skip Button */}
          {!isLastStep && (
            <Button
              variant="ghost"
              onClick={skipTutorial}
              className="w-full mt-3 text-muted-foreground"
            >
              Skip Tutorial
            </Button>
          )}
        </Card>
      </div>

      {/* CSS for highlight effect */}
      <style>{`
        @keyframes tutorial-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 hsl(var(--primary) / 0.5);
          }
          50% {
            box-shadow: 0 0 0 12px hsl(var(--primary) / 0);
          }
        }
        
        .tutorial-highlight {
          position: relative;
          z-index: 45;
          animation: tutorial-pulse 2s ease-in-out 3;
          border-radius: 8px;
        }
      `}</style>
    </>
  );
};
