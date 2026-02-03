import { useEffect, useRef, useState } from "react";

interface ECGLineProps {
  className?: string;
  animated?: boolean;
  pulseColor?: string;
}

export const ECGLine = ({ className = "", animated = true, pulseColor }: ECGLineProps) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (!animated) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const progress = Math.min(scrollY / 300, 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [animated]);

  // Flatline to heartbeat morphing paths
  const flatlinePath = "M 0 50 L 100 50 L 200 50 L 300 50 L 400 50 L 500 50 L 600 50";
  
  const heartbeatPath = "M 0 50 L 80 50 L 100 50 L 120 30 L 140 70 L 160 20 L 180 80 L 200 50 L 220 50 L 300 50 L 320 50 L 340 30 L 360 70 L 380 20 L 400 80 L 420 50 L 440 50 L 500 50 L 520 50 L 540 30 L 560 70 L 580 20 L 600 80 L 620 50";

  // Interpolate between paths based on scroll
  const interpolatePath = (progress: number) => {
    if (progress < 0.1) return flatlinePath;
    if (progress >= 1) return heartbeatPath;
    
    // Simple interpolation for demo - in production use proper path morphing
    const eased = Math.pow(progress, 2);
    const amplitude = eased * 30;
    
    return `M 0 50 L 80 50 L 100 50 L 120 ${50 - amplitude * 0.7} L 140 ${50 + amplitude * 0.7} L 160 ${50 - amplitude} L 180 ${50 + amplitude} L 200 50 L 220 50 L 300 50 L 320 50 L 340 ${50 - amplitude * 0.7} L 360 ${50 + amplitude * 0.7} L 380 ${50 - amplitude} L 400 ${50 + amplitude} L 420 50 L 440 50 L 500 50 L 520 50 L 540 ${50 - amplitude * 0.7} L 560 ${50 + amplitude * 0.7} L 580 ${50 - amplitude} L 600 ${50 + amplitude} L 620 50`;
  };

  return (
    <svg 
      className={`w-full ${className}`}
      viewBox="0 0 620 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ecg-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
          <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
        </linearGradient>
        <filter id="ecg-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Glow layer */}
      <path
        d={interpolatePath(scrollProgress)}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
        filter="url(#ecg-glow)"
        className={animated && scrollProgress >= 0.5 ? "animate-ecg-pulse" : ""}
      />
      
      {/* Main line */}
      <path
        ref={pathRef}
        d={interpolatePath(scrollProgress)}
        fill="none"
        stroke="url(#ecg-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated && scrollProgress >= 0.5 ? "animate-ecg-pulse" : ""}
      />
    </svg>
  );
};

// Standalone pulsing ECG for decorative use
export const ECGPulse = ({ className = "" }: { className?: string }) => {
  return (
    <svg 
      className={`${className}`}
      viewBox="0 0 120 40"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <path
        d="M 0 20 L 20 20 L 30 20 L 40 10 L 50 30 L 60 5 L 70 35 L 80 20 L 90 20 L 120 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-ecg-draw"
      />
    </svg>
  );
};
