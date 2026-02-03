import { ECGPulse } from "./ECGLine";

interface Testimonial {
  name: string;
  location: string;
  quote: string;
  metric: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Priya Sharma",
    location: "Daughter in Bangalore, parents in Delhi",
    quote: "My dad's BP dropped from 160/100 to 130/85 in 2 months. I sleep better now.",
    metric: "HeartScore improved 45 → 78",
    avatar: "PS",
  },
  {
    name: "Rajesh Kumar",
    location: "Type 2 Diabetes, Chennai",
    quote: "Beat showed me my sugar spikes after rice. Simple switch to rotis. Now my HeartScore is 82.",
    metric: "Fasting sugar: 156 → 98 mg/dL",
    avatar: "RK",
  },
  {
    name: "Dr. Meera Patel",
    location: "Physician, Mumbai",
    quote: "I recommend Beat to every patient over 40. The PDF reports are more useful than most lab tests.",
    metric: "340+ patients using Beat",
    avatar: "MP",
  },
];

export const TestimonialReceipt = () => {
  return (
    <section className="py-24 bg-landing-bg overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-landing-primary mb-4">
            <ECGPulse className="w-16 h-6" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-landing-text mb-4">
            Real families. <span className="text-landing-primary">Real results.</span>
          </h2>
        </div>

        {/* Testimonial cards - horizontal scroll on mobile */}
        <div className="flex gap-6 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory lg:grid lg:grid-cols-3 lg:overflow-visible lg:mx-0 lg:px-0">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[300px] sm:w-[340px] lg:w-auto snap-center"
            >
              {/* Receipt card with thermal paper aesthetic */}
              <div className="bg-[#faf9f5] dark:bg-gray-900 rounded-t-2xl rounded-b-none overflow-hidden shadow-xl relative">
                {/* Subtle paper texture */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }} />
                
                <div className="p-6 relative">
                  {/* Receipt header */}
                  <div className="text-center border-b border-dashed border-gray-300 dark:border-gray-700 pb-4 mb-4">
                    <p className="font-mono text-xs text-landing-muted uppercase tracking-widest">Health Receipt</p>
                    <p className="font-mono text-[10px] text-landing-muted mt-1">
                      {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Quote */}
                  <p className="text-landing-text text-sm leading-relaxed mb-6 italic">
                    "{t.quote}"
                  </p>

                  {/* Metric stamp */}
                  <div className="bg-landing-secondary/10 rounded-xl p-3 border border-landing-secondary/20 mb-6">
                    <p className="font-mono text-xs text-landing-secondary font-bold text-center">
                      {t.metric}
                    </p>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-dashed border-gray-300 dark:border-gray-700">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-landing-primary to-landing-coral flex items-center justify-center text-white font-bold text-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-landing-text">{t.name}</p>
                      <p className="text-xs text-landing-muted">{t.location}</p>
                    </div>
                  </div>

                  {/* Verification stamp */}
                  <div className="absolute top-4 right-4 w-12 h-12 rounded-full border-2 border-landing-secondary/30 flex items-center justify-center rotate-12 opacity-50">
                    <span className="text-[8px] font-bold text-landing-secondary text-center leading-tight uppercase">
                      Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Torn edge effect */}
              <div className="h-4 bg-[#faf9f5] dark:bg-gray-900 relative">
                <svg 
                  className="absolute bottom-0 left-0 w-full text-[#faf9f5] dark:text-gray-900" 
                  viewBox="0 0 100 8" 
                  preserveAspectRatio="none"
                  height="8"
                >
                  <path 
                    d="M0,0 L5,8 L10,0 L15,8 L20,0 L25,8 L30,0 L35,8 L40,0 L45,8 L50,0 L55,8 L60,0 L65,8 L70,0 L75,8 L80,0 L85,8 L90,0 L95,8 L100,0" 
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
