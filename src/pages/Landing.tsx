import { Button } from "@/components/ui/button";
import { Heart, Users, TrendingUp, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Beat",
    "applicationCategory": "HealthApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250"
    },
    "description": "Track blood pressure, sugar levels, and daily habits. Get your daily HeartScore. Built for Indian families managing heart health."
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Hero Section */}
      <header>
        <section className="relative overflow-hidden" role="banner">
          <div className="absolute inset-0 gradient-warm opacity-5" aria-hidden="true"></div>
          <div className="container mx-auto px-4 py-20 relative">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-block" aria-hidden="true">
                <Heart className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Keep Your Beat Strong
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                Your daily heart health score. Track BP, sugar, and habits. Built for Indian families who care.
              </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="gradient-primary text-white shadow-elevated h-14 px-8 text-lg"
                onClick={() => navigate("/auth")}
                aria-label="Start using Beat for free today"
              >
                Start Free Today
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 px-8 text-lg border-2"
                onClick={() => navigate("/app/home")}
                aria-label="View a demo of the Beat app"
              >
                View Demo
              </Button>
            </div>
          </div>
        </div>
        </section>
      </header>

      {/* Features Section */}
      <main>
        <section className="py-20" aria-labelledby="features-heading">
          <div className="container mx-auto px-4">
            <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-center mb-16">
              Why Beat Works for Indian Families
            </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Heart className="w-8 h-8 text-primary" aria-hidden="true" />}
              title="Daily HeartScore"
              description="Your health credit score. Track how you're doing, every single day."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-secondary" aria-hidden="true" />}
              title="Family Together"
              description="Parents, kids, grandparents. Everyone's health in one place."
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8 text-accent" aria-hidden="true" />}
              title="Simple Rituals"
              description="Morning with chai, evening after dinner. Two easy check-ins."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-primary" aria-hidden="true" />}
              title="Doctor Ready"
              description="Share reports with your doctor in seconds. No hassle."
            />
          </div>
        </div>
        </section>

      {/* CTA Section */}
      <section className="py-20 gradient-warm" aria-labelledby="cta-heading">
        <div className="container mx-auto px-4 text-center">
          <h2 id="cta-heading" className="text-3xl md:text-4xl font-bold text-white mb-6">
            Start Tracking Your HeartScore Today
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of families taking control of their heart health
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="h-14 px-8 text-lg shadow-elevated"
            onClick={() => navigate("/auth")}
            aria-label="Get started with Beat for free"
          >
            Get Started Free
          </Button>
        </div>
      </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 Beat. Keep Your Beat Strong.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <article className="bg-card p-6 rounded-2xl shadow-card hover:shadow-elevated transition-smooth border border-border">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </article>
);

export default Landing;
