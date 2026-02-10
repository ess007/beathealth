export const DistanceTicker = () => {
  return (
    <section className="py-5 border-y border-landing-border bg-landing-card/50 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center justify-center gap-6 sm:gap-10 text-sm text-landing-muted">
        <span className="flex items-center gap-2 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-landing-primary animate-pulse" />
          Delhi ↔ Bangalore
        </span>
        <span className="hidden sm:inline w-px h-4 bg-landing-border" />
        <span className="flex items-center gap-2 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-landing-coral animate-pulse" />
          Mumbai ↔ Pune
        </span>
        <span className="hidden sm:inline w-px h-4 bg-landing-border" />
        <span className="hidden md:flex items-center gap-2 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-landing-secondary animate-pulse" />
          Chennai ↔ Hyderabad
        </span>
        <span className="hidden md:inline w-px h-4 bg-landing-border" />
        <span className="hidden lg:flex items-center gap-2 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-landing-primary animate-pulse" />
          Kolkata ↔ Lucknow
        </span>
      </div>
    </section>
  );
};
