import { useEffect, useRef, useState } from "react";
import { ECGPulse } from "./ECGLine";

interface Factor {
  name: string;
  percentage: string;
  icon: string;
  color: string;
}

const factors: Factor[] = [
  { name: "Blood Pressure", percentage: "25%", icon: "🫀", color: "bg-red-100 dark:bg-red-900/30 text-red-600" },
  { name: "Blood Sugar", percentage: "25%", icon: "🩸", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
  { name: "Daily Rituals", percentage: "20%", icon: "☀️", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600" },
  { name: "Social Wellness", percentage: "15%", icon: "👥", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
  { name: "Environment", percentage: "10%", icon: "🌿", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" },
  { name: "Cognitive Health", percentage: "5%", icon: "🧠", color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600" },
];

export const HeartScoreOrbit = () => {
  const [score, setScore] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [showFactors, setShowFactors] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateScore();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const animateScore = () => {
    const duration = 1500;
    const targetScore = 87;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out curve
      const eased = 1 - Math.pow(1 - progress, 3);
      setScore(Math.floor(eased * targetScore));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Show factors after score animation
        setTimeout(() => setShowFactors(true), 200);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <section ref={sectionRef} className="py-24 bg-landing-card">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-landing-primary mb-4">
            <ECGPulse className="w-16 h-6" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-landing-text mb-4">
            One number. <span className="text-landing-primary">Complete clarity.</span>
          </h2>
          <p className="text-landing-muted text-lg max-w-2xl mx-auto">
            HeartScore combines everything that matters into one 0-100 score. Higher is better. No medical jargon.
          </p>
        </div>

        {/* Score Display */}
        <div className="flex flex-col items-center">
          {/* Main score circle */}
          <div className="relative mb-12">
            {/* Outer ring with gradient */}
            <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-landing-primary/10 to-landing-coral/10 flex items-center justify-center border-4 border-landing-primary/20 relative overflow-hidden">
              {/* Progress ring */}
              <svg 
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="hsl(var(--landing-primary) / 0.1)"
                  strokeWidth="4"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${(score / 100) * 289} 289`}
                  className="transition-all duration-100"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--landing-primary))" />
                    <stop offset="100%" stopColor="hsl(var(--landing-coral))" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Score number */}
              <div className="text-center z-10">
                <p className="text-6xl sm:text-7xl font-bold text-landing-text font-mono tabular-nums">
                  {score}
                </p>
                <p className="text-sm text-landing-muted font-medium">HeartScore™</p>
              </div>
            </div>

            {/* Pulsing glow */}
            {hasAnimated && (
              <div className="absolute inset-0 rounded-full bg-landing-primary/20 animate-ping opacity-20" />
            )}
          </div>

          {/* Contributing factors */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 w-full max-w-4xl">
            {factors.map((factor, i) => (
              <div
                key={factor.name}
                className={`bg-landing-bg rounded-2xl p-4 text-center border border-landing-border transition-all duration-500 ${
                  showFactors 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl ${factor.color} flex items-center justify-center text-2xl mx-auto mb-3`}>
                  {factor.icon}
                </div>
                <p className="text-xs text-landing-muted mb-1">{factor.name}</p>
                <p className="text-lg font-bold text-landing-text font-mono">{factor.percentage}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
