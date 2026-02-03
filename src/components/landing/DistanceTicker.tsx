import { useEffect, useState } from "react";

export const DistanceTicker = () => {
  const [count, setCount] = useState(12847);

  // Slowly increment the count for visual effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-IN');
  };

  return (
    <section className="py-6 border-y border-landing-border bg-landing-card/50 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center justify-center gap-8 animate-marquee">
        <div className="flex items-center gap-3 text-landing-muted whitespace-nowrap">
          <span className="text-2xl">❤️</span>
          <span className="font-mono text-lg font-semibold text-landing-primary tabular-nums">
            {formatNumber(count)}
          </span>
          <span className="text-sm">families connected across</span>
          <span className="font-mono text-lg font-semibold text-landing-primary tabular-nums">847</span>
          <span className="text-sm">cities today</span>
        </div>
        
        <div className="w-px h-6 bg-landing-border" />
        
        <div className="flex items-center gap-4 text-sm text-landing-muted whitespace-nowrap">
          <span>Delhi ↔ Bangalore</span>
          <span>Mumbai ↔ Pune</span>
          <span>Chennai ↔ Hyderabad</span>
          <span>Kolkata ↔ Lucknow</span>
        </div>
      </div>
    </section>
  );
};
