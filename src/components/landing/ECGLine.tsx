import { useEffect, useRef, useState } from "react";

interface ECGLineProps {
  className?: string;
  animated?: boolean;
  color?: string;
  strokeWidth?: number;
  glowIntensity?: number;
  speed?: number;
  delay?: number;
}

export const ECGLine = ({
  className = "",
  animated = true,
  strokeWidth = 2.5,
  glowIntensity = 1,
  speed = 2,
  delay = 0,
}: ECGLineProps) => {
  const [dashOffset, setDashOffset] = useState(1200);

  useEffect(() => {
    if (!animated) return;

    const timeout = setTimeout(() => {
      setDashOffset(0);
    }, delay);

    return () => clearTimeout(timeout);
  }, [animated, delay]);

  // A single clean ECG heartbeat pattern repeated 3x across the width
  const ecgPath =
    "M 0 50 L 60 50 L 80 50 L 90 50 L 100 48 L 108 52 L 115 30 L 125 70 L 132 15 L 140 85 L 148 45 L 158 50 L 200 50 " +
    "L 260 50 L 280 50 L 290 50 L 300 48 L 308 52 L 315 30 L 325 70 L 332 15 L 340 85 L 348 45 L 358 50 L 400 50 " +
    "L 460 50 L 480 50 L 490 50 L 500 48 L 508 52 L 515 30 L 525 70 L 532 15 L 540 85 L 548 45 L 558 50 L 600 50";

  return (
    <svg
      className={`w-full ${className}`}
      viewBox="0 0 600 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`ecg-grad-${delay}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--landing-primary))" stopOpacity="0" />
          <stop offset="15%" stopColor="hsl(var(--landing-primary))" stopOpacity="0.8" />
          <stop offset="50%" stopColor="hsl(var(--landing-primary))" stopOpacity="1" />
          <stop offset="85%" stopColor="hsl(var(--landing-primary))" stopOpacity="0.8" />
          <stop offset="100%" stopColor="hsl(var(--landing-primary))" stopOpacity="0" />
        </linearGradient>
        <filter id={`ecg-glow-${delay}`} x="-20%" y="-100%" width="140%" height="300%">
          <feGaussianBlur stdDeviation={4 * glowIntensity} result="blur1" />
          <feGaussianBlur stdDeviation={8 * glowIntensity} result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Deep glow layer */}
      <path
        d={ecgPath}
        fill="none"
        stroke="hsl(var(--landing-primary))"
        strokeWidth={strokeWidth * 3}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.15 * glowIntensity}
        filter={`url(#ecg-glow-${delay})`}
        strokeDasharray="1200"
        strokeDashoffset={dashOffset}
        style={{
          transition: `stroke-dashoffset ${speed}s cubic-bezier(0.22, 1, 0.36, 1)`,
        }}
      />

      {/* Mid glow layer */}
      <path
        d={ecgPath}
        fill="none"
        stroke="hsl(var(--landing-primary))"
        strokeWidth={strokeWidth * 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.3 * glowIntensity}
        strokeDasharray="1200"
        strokeDashoffset={dashOffset}
        style={{
          transition: `stroke-dashoffset ${speed}s cubic-bezier(0.22, 1, 0.36, 1)`,
        }}
      />

      {/* Main crisp line */}
      <path
        d={ecgPath}
        fill="none"
        stroke={`url(#ecg-grad-${delay})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1200"
        strokeDashoffset={dashOffset}
        style={{
          transition: `stroke-dashoffset ${speed}s cubic-bezier(0.22, 1, 0.36, 1)`,
        }}
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
