import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ECGLine } from "./ECGLine";

export const HeroSection = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const opacity = Math.max(0, 1 - scrollY / 600);
  const translateY = scrollY * 0.15;

  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
      {/* ECG Background — multiple layers for depth */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[20%] left-0 right-0 opacity-[0.07]"
          style={{ transform: `translateY(${translateY * 0.5}px)` }}
        >
          <ECGLine className="h-24" animated />
        </div>
        <div
          className="absolute top-[45%] left-0 right-0 opacity-[0.12]"
          style={{ transform: `translateY(${translateY * 0.3}px)` }}
        >
          <ECGLine className="h-32" animated />
        </div>
        <div
          className="absolute top-[70%] left-0 right-0 opacity-[0.05]"
          style={{ transform: `translateY(${translateY * 0.7}px)` }}
        >
          <ECGLine className="h-20" animated={false} />
        </div>
      </div>

      {/* Content */}
      <div
        className="relative z-10 max-w-5xl mx-auto px-6 text-center"
        style={{ opacity, transform: `translateY(${translateY}px)` }}
      >
        {/* Minimal badge — no false numbers */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-landing-card/80 backdrop-blur-sm border border-landing-border text-xs font-medium text-landing-muted mb-10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute h-full w-full rounded-full bg-landing-primary opacity-75" />
            <span className="relative rounded-full h-2 w-2 bg-landing-primary" />
          </span>
          Built for Indian families
        </div>

        {/* Headline — massive, serif, iconic */}
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight leading-[0.95] mb-8 text-landing-text">
          One heartbeat.
          <br />
          <span className="text-landing-primary">Two cities.</span>
        </h1>

        {/* ECG divider between headline and subhead */}
        <div className="flex justify-center mb-8">
          <svg
            className="w-40 h-8 text-landing-primary/40"
            viewBox="0 0 160 30"
          >
            <path
              d="M 0 15 L 40 15 L 55 15 L 62 5 L 70 25 L 78 2 L 86 28 L 94 15 L 105 15 L 160 15"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Subhead */}
        <p className="text-base sm:text-lg lg:text-xl text-landing-muted mb-12 max-w-2xl mx-auto leading-relaxed">
          Your parents' BP, sugar, and heart health — tracked daily, shared
          instantly. Whether they're in Delhi and you're in Bangalore, you'll
          always know they're okay.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="h-14 rounded-full px-10 text-base font-semibold bg-landing-primary hover:bg-landing-primary/90 text-white shadow-lg shadow-landing-primary/25 hover:shadow-xl hover:shadow-landing-primary/30 transition-all hover:scale-[1.02]"
          >
            Start Free Today
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-14 rounded-full px-10 text-base font-semibold border-landing-border text-landing-text hover:bg-landing-card"
          >
            See How It Works
          </Button>
        </div>

        {/* Trust stamps — no false numbers, value-based */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-landing-muted">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-landing-secondary" />
            100% Offline capable
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-landing-secondary" />
            Bank-grade encryption
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-landing-primary" />
            Made in India
          </span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-landing-muted/50"
        style={{ opacity: Math.max(0, 1 - scrollY / 200) }}
      >
        <span className="text-[10px] uppercase tracking-[0.2em] font-medium">
          Scroll
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-landing-muted/30 to-transparent animate-pulse" />
      </div>
    </section>
  );
};
