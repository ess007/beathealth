import { ECGPulse } from "./ECGLine";

interface TimelineItem {
  time: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const timelineItems: TimelineItem[] = [
  {
    time: "7:00 AM",
    title: "Morning Ritual",
    description: "Appa wakes up, opens Beat. Logs fasting sugar (94 mg/dL) and BP (128/84). Takes 2 minutes.",
    icon: "☀️",
    color: "from-amber-500 to-orange-500",
  },
  {
    time: "8:30 AM",
    title: "Family Alert",
    description: "You get a gentle notification: 'Papa's morning check-in complete. BP slightly elevated but within range.'",
    icon: "🔔",
    color: "from-blue-500 to-cyan-500",
  },
  {
    time: "11:00 AM",
    title: "AI Pattern Recognition",
    description: "Beat notices: 'BP tends to spike on days after late dinners. Consider eating earlier.'",
    icon: "🤖",
    color: "from-purple-500 to-pink-500",
  },
  {
    time: "2:00 PM",
    title: "Drug Safety",
    description: "Amma adds a new prescription. Beat catches a potential interaction with her existing medication. Alert sent.",
    icon: "💊",
    color: "from-red-500 to-rose-500",
  },
  {
    time: "6:00 PM",
    title: "Evening Ritual",
    description: "Evening check-in. Log any symptoms, rate your day. HeartScore updates.",
    icon: "🌙",
    color: "from-indigo-500 to-violet-500",
  },
  {
    time: "9:00 PM",
    title: "Weekly Insight",
    description: "Sunday summary: 'This week's average HeartScore: 84. Up 3 points from last week. BP trending down.'",
    icon: "📊",
    color: "from-emerald-500 to-teal-500",
  },
];

export const DayTimeline = () => {
  return (
    <section className="py-24 bg-landing-card">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-landing-primary mb-4">
            <ECGPulse className="w-16 h-6" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-landing-text mb-4">
            A day with <span className="text-landing-primary">Beat</span>
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 sm:left-8 lg:left-1/2 lg:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-landing-primary via-landing-coral to-landing-secondary" />

          {/* Timeline items */}
          <div className="space-y-8 lg:space-y-12">
            {timelineItems.map((item, i) => (
              <div 
                key={i}
                className={`relative flex items-start gap-6 lg:gap-12 ${
                  i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                {/* Time badge (mobile: left, desktop: alternating) */}
                <div className="absolute left-0 sm:left-4 lg:left-1/2 lg:-translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-landing-primary to-landing-coral flex items-center justify-center text-white text-sm z-10">
                  {item.icon}
                </div>

                {/* Content card */}
                <div className={`ml-12 sm:ml-16 lg:ml-0 lg:w-5/12 ${i % 2 === 0 ? "lg:text-right lg:pr-12" : "lg:text-left lg:pl-12"}`}>
                  <div className={`bg-landing-bg rounded-2xl p-6 border border-landing-border hover:border-landing-primary/30 transition-colors inline-block w-full ${i % 2 === 0 ? "lg:ml-auto" : ""}`}>
                    {/* Time */}
                    <p className="font-mono text-sm text-landing-primary font-bold mb-2">
                      {item.time}
                    </p>
                    
                    {/* Title */}
                    <h3 className="font-semibold text-landing-text text-lg mb-2">
                      {item.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-landing-muted text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Empty space for desktop alternating layout */}
                <div className="hidden lg:block lg:w-5/12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
