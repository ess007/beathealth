import { ECGPulse } from "./ECGLine";

export const FamilyConnection = () => {
  return (
    <section className="py-24 bg-landing-bg">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-landing-primary mb-4">
            <ECGPulse className="w-16 h-6" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-landing-text mb-4">
            They log. <span className="text-landing-primary">You know.</span>
          </h2>
        </div>

        {/* Split view */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Parent side */}
          <div className="relative">
            <div className="bg-landing-card rounded-3xl p-6 lg:p-8 border border-landing-border shadow-xl">
              {/* Location header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-landing-primary to-landing-coral flex items-center justify-center text-white text-xl">
                  👵
                </div>
                <div>
                  <p className="font-semibold text-landing-text">Amma in Delhi</p>
                  <p className="text-sm text-landing-muted">7:42 AM IST</p>
                </div>
              </div>

              {/* Mock device screen */}
              <div className="bg-landing-bg rounded-2xl p-5 border border-landing-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl">
                    🫀
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-landing-muted">Just logged</p>
                    <p className="font-bold text-landing-text font-mono">BP: 124/82 mmHg</p>
                  </div>
                </div>
                
                <div className="bg-landing-secondary/10 rounded-xl p-3 border border-landing-secondary/20">
                  <p className="text-sm text-landing-secondary font-medium">
                    ✓ Morning check-in complete
                  </p>
                </div>
              </div>

              {/* Timestamp receipt */}
              <div className="mt-4 flex items-center justify-between text-xs text-landing-muted">
                <span>Logged at 7:42:15 AM</span>
                <span className="font-mono">📍 New Delhi</span>
              </div>
            </div>

            {/* Connection line (visible on desktop) */}
            <div className="hidden md:block absolute top-1/2 -right-6 lg:-right-8 w-12 lg:w-16 h-0.5 bg-gradient-to-r from-landing-primary to-landing-coral" />
            <div className="hidden md:flex absolute top-1/2 -right-3 lg:-right-4 -translate-y-1/2 w-6 h-6 rounded-full bg-landing-primary items-center justify-center">
              <span className="text-white text-xs">→</span>
            </div>
          </div>

          {/* Child side */}
          <div className="relative">
            <div className="bg-landing-card rounded-3xl p-6 lg:p-8 border border-landing-border shadow-xl">
              {/* Location header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-landing-secondary to-teal-400 flex items-center justify-center text-white text-xl">
                  👨
                </div>
                <div>
                  <p className="font-semibold text-landing-text">You in Bangalore</p>
                  <p className="text-sm text-landing-muted">7:43 AM IST</p>
                </div>
              </div>

              {/* Mock notification */}
              <div className="bg-landing-bg rounded-2xl p-5 border border-landing-border">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-landing-primary/10 flex items-center justify-center text-xl flex-shrink-0">
                    🔔
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-landing-muted mb-1">Beat Health</p>
                    <p className="font-semibold text-landing-text text-sm mb-2">
                      Amma's BP is normal today
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-landing-primary font-bold">HeartScore: 87</span>
                      <span className="text-landing-secondary font-semibold">(+2)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Peace of mind message */}
              <div className="mt-4 bg-gradient-to-r from-landing-secondary/10 to-landing-secondary/5 rounded-xl p-4 border border-landing-secondary/20">
                <p className="text-sm text-landing-text">
                  <span className="text-landing-secondary font-semibold">Peace of mind:</span> Amma is doing well. No action needed.
                </p>
              </div>

              {/* Timestamp */}
              <div className="mt-4 flex items-center justify-between text-xs text-landing-muted">
                <span>Received at 7:43:02 AM</span>
                <span className="font-mono">📍 Bangalore</span>
              </div>
            </div>
          </div>
        </div>

        {/* Connection stat */}
        <div className="text-center mt-12">
          <p className="text-landing-muted text-sm">
            <span className="font-mono text-landing-primary font-bold">47 seconds</span> from log to notification.
            <span className="text-landing-text font-medium"> That's the Beat difference.</span>
          </p>
        </div>
      </div>
    </section>
  );
};
