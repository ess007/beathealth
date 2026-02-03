import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { DistanceTicker } from "@/components/landing/DistanceTicker";
import { BeforeAfterSection } from "@/components/landing/BeforeAfterSection";
import { HeartScoreOrbit } from "@/components/landing/HeartScoreOrbit";
import { FamilyConnection } from "@/components/landing/FamilyConnection";
import { DayTimeline } from "@/components/landing/DayTimeline";
import { TestimonialReceipt } from "@/components/landing/TestimonialReceipt";
import { PricingBook } from "@/components/landing/PricingBook";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";

const Landing = () => {
  return (
    <main className="min-h-screen bg-landing-bg text-landing-text font-sans antialiased landing-selection grain-overlay relative">
      {/* Subtle animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-15%] left-[-10%] w-[50vw] h-[50vw] bg-landing-primary/10 rounded-full blur-[120px] animate-blob mix-blend-multiply dark:mix-blend-screen opacity-40" />
        <div className="absolute top-[30%] right-[-15%] w-[40vw] h-[40vw] bg-landing-coral/10 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen opacity-40" />
        <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] bg-landing-secondary/10 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen opacity-40" />
      </div>

      {/* Navigation */}
      <LandingNav />

      {/* Hero: The Awakening */}
      <HeroSection />

      {/* Distance Ticker */}
      <DistanceTicker />

      {/* Before/After: The Transformation */}
      <BeforeAfterSection />

      {/* HeartScore: The Pulse */}
      <HeartScoreOrbit />

      {/* Family Proof: The Connection */}
      <FamilyConnection />

      {/* Features: The System (Day Timeline) */}
      <DayTimeline />

      {/* Testimonials: The Proof */}
      <TestimonialReceipt />

      {/* Pricing: The Plans */}
      <PricingBook />

      {/* FAQ: The Answers */}
      <FAQSection />

      {/* Final CTA: The Invitation */}
      <FinalCTA />

      {/* Footer: The Studio */}
      <LandingFooter />
    </main>
  );
};

export default Landing;
