import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ECGLine } from "./ECGLine";

export const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-landing-primary via-landing-primary to-landing-coral" />
      
      {/* ECG line decoration */}
      <div className="absolute inset-0 flex items-center opacity-10 pointer-events-none">
        <ECGLine className="h-48" animated={false} />
      </div>

      {/* Subtle grain overlay */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        {/* Headline */}
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Stop worrying.
          <br />
          Start knowing.
        </h2>

        {/* Subhead */}
        <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          Join 50,000+ families taking control of their health. Free to start. No credit card needed.
        </p>

        {/* CTA */}
        <Button
          size="lg"
          onClick={() => navigate("/auth")}
          className="h-14 px-10 rounded-full text-base font-semibold bg-white text-landing-primary hover:bg-white/90 shadow-xl shadow-black/20 hover:scale-[1.02] transition-all"
        >
          Get Beat Free
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>

        {/* Final ECG flourish */}
        <div className="mt-12 flex justify-center">
          <svg className="w-32 h-8 text-white/30" viewBox="0 0 120 30">
            <path
              d="M 0 15 L 30 15 L 40 15 L 45 5 L 50 25 L 55 0 L 60 30 L 65 15 L 70 15 L 80 15 L 90 15 L 100 15 L 120 15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Pulsing dot at the end */}
            <circle cx="120" cy="15" r="3" fill="currentColor" className="animate-pulse" />
          </svg>
        </div>
      </div>
    </section>
  );
};
