import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, WifiOff, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ECGLine } from "./ECGLine";
import { Logo } from "@/components/Logo";

export const HeroSection = () => {
  const navigate = useNavigate();
  const phoneRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 3D tilt effect on phone mockup
  useEffect(() => {
    const phone = phoneRef.current;
    const container = containerRef.current;
    if (!phone || !container) return;

    const handleMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      phone.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotate(12deg)`;
    };

    const handleLeave = () => {
      phone.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) rotate(12deg)`;
    };

    container.addEventListener("mousemove", handleMove);
    container.addEventListener("mouseleave", handleLeave);

    return () => {
      container.removeEventListener("mousemove", handleMove);
      container.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
      {/* ECG Background Animation */}
      <div className="absolute inset-0 flex items-center pointer-events-none opacity-20">
        <ECGLine className="h-32" animated />
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-landing-card border border-landing-border text-xs font-medium text-landing-muted mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute h-full w-full rounded-full bg-landing-primary opacity-75" />
                <span className="relative rounded-full h-2 w-2 bg-landing-primary" />
              </span>
              Caring for 50,000+ Indian families
            </div>

            {/* Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] mb-6 text-landing-text">
              One heartbeat.
              <br />
              <span className="text-landing-primary">Two cities.</span>
            </h1>

            {/* Subhead */}
            <p className="text-lg lg:text-xl text-landing-muted mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Your parents' BP, sugar, and heart health — tracked daily, shared instantly. 
              Whether they're in Delhi and you're in Bangalore, you'll always know they're okay.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-10">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")} 
                className="h-14 rounded-full px-8 text-base font-semibold bg-landing-primary hover:bg-landing-primary/90 text-white shadow-lg shadow-landing-primary/25 hover:shadow-xl hover:shadow-landing-primary/30 transition-all hover:scale-[1.02]"
              >
                Start Free Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-14 rounded-full px-8 text-base font-semibold border-landing-border text-landing-text hover:bg-landing-card"
              >
                See How It Works
              </Button>
            </div>

            {/* Trust Stamps */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-landing-muted">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-landing-secondary/10 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-landing-secondary" />
                </div>
                <span>Bank-grade security</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-landing-secondary/10 flex items-center justify-center">
                  <WifiOff className="w-4 h-4 text-landing-secondary" />
                </div>
                <span>Works offline</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-landing-primary/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-landing-primary" />
                </div>
                <span>Built for India</span>
              </div>
            </div>
          </div>

          {/* Phone Artifact */}
          <div 
            ref={containerRef}
            className="relative flex justify-center order-1 lg:order-2"
            style={{ perspective: "1200px" }}
          >
            {/* ECG Line behind phone */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[150%] opacity-40">
                <ECGLine className="h-24" animated />
              </div>
            </div>

            {/* Phone mockup */}
            <div
              ref={phoneRef}
              className="relative w-[280px] sm:w-[320px] lg:w-[360px] transition-transform duration-200 ease-out"
              style={{ transform: "rotate(12deg)" }}
            >
              {/* Phone frame */}
              <div className="bg-landing-text dark:bg-gray-900 rounded-[3rem] p-3 shadow-2xl shadow-black/20">
                <div className="bg-landing-card rounded-[2.5rem] overflow-hidden border border-landing-border">
                  {/* Status bar */}
                  <div className="h-8 bg-landing-card flex items-center justify-center">
                    <div className="w-24 h-6 bg-landing-text/10 rounded-full" />
                  </div>

                  {/* App Content */}
                  <div className="p-4 space-y-4 min-h-[500px] lg:min-h-[560px]">
                    {/* App Header */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-landing-primary to-landing-coral flex items-center justify-center text-white font-bold text-lg">
                        RK
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-landing-muted">Good Morning</p>
                        <p className="font-semibold text-landing-text">Ravi Kumar</p>
                      </div>
                      <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-500/10">
                        <span>🔥</span>
                        <span className="text-sm font-bold text-orange-600">12</span>
                      </div>
                    </div>

                    {/* HeartScore Card */}
                    <div className="bg-gradient-to-br from-landing-primary/5 to-landing-coral/5 rounded-2xl p-5 border border-landing-primary/20">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-landing-primary to-landing-coral flex items-center justify-center shadow-lg shadow-landing-primary/30">
                          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-landing-muted font-medium">HeartScore™</p>
                          <p className="text-4xl font-bold text-landing-text font-mono tabular-nums">87</p>
                        </div>
                        <span className="text-xs font-bold text-landing-secondary bg-landing-secondary/10 px-3 py-1.5 rounded-full">
                          Excellent
                        </span>
                      </div>

                      {/* Score breakdown */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white/60 dark:bg-white/10 rounded-xl p-3 text-center">
                          <p className="text-[10px] text-landing-muted uppercase tracking-wider">BP</p>
                          <p className="text-lg font-bold text-landing-secondary font-mono">85</p>
                        </div>
                        <div className="bg-white/60 dark:bg-white/10 rounded-xl p-3 text-center">
                          <p className="text-[10px] text-landing-muted uppercase tracking-wider">Sugar</p>
                          <p className="text-lg font-bold text-landing-secondary font-mono">88</p>
                        </div>
                        <div className="bg-white/60 dark:bg-white/10 rounded-xl p-3 text-center">
                          <p className="text-[10px] text-landing-muted uppercase tracking-wider">Ritual</p>
                          <p className="text-lg font-bold text-landing-secondary font-mono">90</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-2">
                      <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-landing-border flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl">
                          🫀
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] text-landing-muted">Blood Pressure</p>
                          <p className="font-bold text-landing-text font-mono">118/78 mmHg</p>
                        </div>
                        <span className="text-[11px] text-landing-secondary font-semibold bg-landing-secondary/10 px-2 py-1 rounded-full">
                          Normal
                        </span>
                      </div>

                      <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-landing-border flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xl">
                          🩸
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] text-landing-muted">Fasting Sugar</p>
                          <p className="font-bold text-landing-text font-mono">92 mg/dL</p>
                        </div>
                        <span className="text-[11px] text-landing-secondary font-semibold bg-landing-secondary/10 px-2 py-1 rounded-full">
                          Optimal
                        </span>
                      </div>
                    </div>

                    {/* Rituals */}
                    <div>
                      <p className="text-[10px] font-bold text-landing-muted uppercase tracking-widest mb-2">
                        Today's Rituals
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-landing-secondary/10 border border-landing-secondary/30 rounded-xl p-3 text-center">
                          <p className="text-2xl mb-1">☀️</p>
                          <p className="text-xs font-bold text-landing-secondary">Morning</p>
                          <p className="text-[10px] text-landing-secondary">✓ Complete</p>
                        </div>
                        <div className="bg-landing-card border border-landing-border rounded-xl p-3 text-center">
                          <p className="text-2xl mb-1">🌙</p>
                          <p className="text-xs font-bold text-landing-text">Evening</p>
                          <p className="text-[10px] text-landing-muted">Pending</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
