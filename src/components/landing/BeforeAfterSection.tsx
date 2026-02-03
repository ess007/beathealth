import { X, Check } from "lucide-react";
import { ECGPulse } from "./ECGLine";

export const BeforeAfterSection = () => {
  const beforeItems = [
    "Did Appa take his medicine?",
    "What was his BP yesterday?",
    "I should call... but it's late",
    "The doctor asked for 3 months of readings. We have none.",
  ];

  const afterItems = [
    "Appa's HeartScore is 84. All good.",
    "He logged 122/78 at 7 AM. Better than last week.",
    "The app will nudge him if he forgets.",
    "PDF report ready. Sent to Dr. Sharma.",
  ];

  return (
    <section className="py-24 bg-landing-bg">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-landing-primary mb-4">
            <ECGPulse className="w-16 h-6" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-landing-text mb-4">
            The old way was <span className="text-landing-primary">exhausting</span>.
          </h2>
        </div>

        {/* Before/After panels */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* Before */}
          <div className="relative bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-3xl p-8 border border-red-200/50 dark:border-red-800/30">
            <div className="absolute top-6 right-6">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                <X className="w-5 h-5 text-red-500" />
              </div>
            </div>
            
            <h3 className="font-serif text-2xl font-bold text-landing-text mb-6">
              Before Beat
            </h3>
            
            <div className="space-y-4">
              {beforeItems.map((item, i) => (
                <div 
                  key={i}
                  className="flex items-start gap-3 bg-white/60 dark:bg-white/5 rounded-xl p-4 border border-red-100 dark:border-red-900/30"
                >
                  <span className="text-red-400 mt-0.5">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <p className="text-landing-muted italic text-sm lg:text-base">"{item}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* After */}
          <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-3xl p-8 border border-landing-secondary/30">
            <div className="absolute top-6 right-6">
              <div className="w-10 h-10 rounded-full bg-landing-secondary/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-landing-secondary" />
              </div>
            </div>
            
            <h3 className="font-serif text-2xl font-bold text-landing-text mb-6">
              With Beat
            </h3>
            
            <div className="space-y-4">
              {afterItems.map((item, i) => (
                <div 
                  key={i}
                  className="flex items-start gap-3 bg-white/60 dark:bg-white/5 rounded-xl p-4 border border-landing-secondary/30"
                >
                  <span className="text-landing-secondary mt-0.5">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <p className="text-landing-text font-medium text-sm lg:text-base">"{item}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
