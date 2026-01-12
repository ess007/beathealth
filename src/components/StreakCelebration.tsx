import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Flame } from "lucide-react";
import { Card } from "./ui/card";
import { Logo } from "./Logo";

interface StreakCelebrationProps {
  show: boolean;
  streakCount: number;
  onClose: () => void;
}

export const StreakCelebration = ({ show, streakCount, onClose }: StreakCelebrationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      
      // Trigger confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#E63946', '#FF6B6B', '#2EC4B6'],
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#E63946', '#FF6B6B', '#2EC4B6'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      // Auto close after animation
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <Card className={`p-8 text-center shadow-elevated transform transition-all duration-500 ${isVisible ? 'scale-100' : 'scale-50'}`}>
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-black flex items-center justify-center">
              <Logo size="xl" showText={false} />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
              <Flame className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-2 text-primary">🎉 Streak Updated!</h2>
        <p className="text-4xl font-bold text-orange-500 mb-2">{streakCount}</p>
        <p className="text-lg text-muted-foreground">
          {streakCount === 1 ? 'day' : 'days'} strong! Keep going!
        </p>
      </Card>
    </div>
  );
};
