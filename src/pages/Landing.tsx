import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Shield, Heart, Zap, Clock, Star, CheckCircle2, ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Card } from "@/components/ui/card";

const Landing = () => {

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
      "ratingValue": "4.7",
      "ratingCount": "287"
    },
    "description": "Track blood pressure, sugar levels, and daily habits. Get your daily HeartScore. Built for Indian families managing heart health."
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Hero Section - Redesigned */}
      <header>
        <section className="relative overflow-hidden min-h-[90vh] flex items-center" role="banner">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" aria-hidden="true"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(226,57,70,0.1),transparent_50%)]" aria-hidden="true"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(46,196,182,0.08),transparent_50%)]" aria-hidden="true"></div>
          
          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Column - Hero Copy */}
                <div className="space-y-8 animate-fade-in">
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                    <Heart className="w-4 h-4" aria-hidden="true" />
                    <span>Trusted by 2,500+ Indian families</span>
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1]">
                    Your Heart's
                    <span className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mt-2">
                      Daily Credit Score
                    </span>
                  </h1>
                  
                  <p className="text-xl md:text-2xl text-foreground/80 leading-relaxed max-w-xl">
                    Track what matters. BP, sugar, habits—all in one place. Get your HeartScore every morning, like checking your bank balance.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button 
                      size="lg" 
                      className="gradient-primary text-white shadow-glow hover:shadow-elevated transition-all h-16 px-10 text-lg group"
                      onClick={() => {
                        window.location.href = "/auth";
                      }}
                      aria-label="Start Free Today - Sign up for Beat"
                    >
                      Start Free Today
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="h-16 px-10 text-lg border-2 hover:bg-muted/50"
                      onClick={() => {
                        window.location.href = "/app/home";
                      }}
                      aria-label="View Demo of the Beat app"
                    >
                      View Demo
                    </Button>
                  </div>
                  
                  {/* Social Proof */}
                  <div className="flex items-center gap-6 pt-4">
                    <div className="flex -space-x-2">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background" />
                      ))}
                    </div>
                    <div>
                      <div className="flex gap-1 mb-1">
                        {[1,2,3,4,5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-accent text-accent" aria-hidden="true" />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">4.7/5 from 287 users</p>
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Hero Visual */}
                <div className="relative animate-scale-in lg:block hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl" aria-hidden="true"></div>
                  <Card className="relative p-8 shadow-elevated bg-card/80 backdrop-blur-sm border-2">
                    <div className="space-y-6">
                      <div className="flex items-center justify-center mb-4">
                        <Logo size="lg" showText={true} />
                      </div>
                      <div className="text-xs text-muted-foreground text-center">Today</div>
                      
                      <div className="text-center space-y-2">
                        <div className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                          87
                        </div>
                        <p className="text-sm text-muted-foreground">Your HeartScore</p>
                        <p className="text-xs text-secondary font-medium">↑ 12 points this week</p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-secondary">✓</div>
                          <p className="text-xs text-muted-foreground mt-1">BP Normal</p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-secondary">✓</div>
                          <p className="text-xs text-muted-foreground mt-1">Sugar OK</p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-accent">🔥</div>
                          <p className="text-xs text-muted-foreground mt-1">7 Day Streak</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </header>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30 border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">2,500+</div>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">78%</div>
              <p className="text-sm text-muted-foreground">Better Control</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">45K+</div>
              <p className="text-sm text-muted-foreground">Health Logs</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">4.7★</div>
              <p className="text-sm text-muted-foreground">User Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Redesigned */}
      <main>
        <section className="py-24" aria-labelledby="features-heading">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
              <span className="text-primary font-semibold text-sm uppercase tracking-wide">How It Works</span>
              <h2 id="features-heading" className="text-4xl md:text-5xl font-bold mt-4 mb-6">
                Health Tracking That Actually{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Works
                </span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Designed for busy Indian families. Simple enough for seniors, powerful enough for everyone.
              </p>
            </div>
          
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              <FeatureCard
                icon={<Heart className="w-10 h-10" aria-hidden="true" />}
                title="Daily HeartScore"
                description="One number that tells you everything. Like a credit score, but for your heart health."
                gradient="from-primary to-primary/60"
              />
              <FeatureCard
                icon={<Users className="w-10 h-10" aria-hidden="true" />}
                title="Family Dashboard"
                description="Check on mom's BP from anywhere. Get alerts when something's off. Stay connected."
                gradient="from-secondary to-secondary/60"
              />
              <FeatureCard
                icon={<Clock className="w-10 h-10" aria-hidden="true" />}
                title="2-Minute Rituals"
                description="Morning with chai, evening after dinner. Log your health in less time than brewing tea."
                gradient="from-accent to-accent/60"
              />
              <FeatureCard
                icon={<Zap className="w-10 h-10" aria-hidden="true" />}
                title="Smart Insights"
                description="AI notices patterns you'd miss. Get personalized tips that actually help."
                gradient="from-primary to-accent"
              />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-primary font-semibold text-sm uppercase tracking-wide">Loved By Families</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
                Real People, Real Results
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <TestimonialCard
                quote="My BP dropped 20 points in 3 months. The daily reminders and family support made all the difference."
                author="Rajesh M."
                role="Managing Hypertension"
                rating={5}
              />
              <TestimonialCard
                quote="I can check Dad's numbers from Bangalore while he's in Delhi. Finally, peace of mind for our whole family."
                author="Priya S."
                role="Family Caregiver"
                rating={5}
              />
              <TestimonialCard
                quote="The HeartScore makes health tracking so simple. My 68-year-old mother uses it every single day."
                author="Amit K."
                role="Son & Developer"
                rating={5}
              />
            </div>
          </div>
        </section>

      {/* Final CTA Section */}
      <section className="py-24 relative overflow-hidden" aria-labelledby="cta-heading">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-secondary opacity-95" aria-hidden="true"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" aria-hidden="true"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span>Free forever. No credit card required.</span>
            </div>
            
            <h2 id="cta-heading" className="text-4xl md:text-6xl font-bold text-white leading-tight">
              Take Control of Your
              <span className="block mt-2">Heart Health Today</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Join 2,500+ families who've already improved their health with Beat. Start your journey in 60 seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 h-16 px-12 text-lg font-semibold shadow-elevated group"
                onClick={() => {
                  window.location.href = "/auth";
                }}
                aria-label="Get Started Free with Beat"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-8 pt-8 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <Logo size="sm" showText={true} />
              </div>
              
              <div className="flex gap-6 text-sm text-muted-foreground">
                <button className="hover:text-foreground transition-colors">Privacy</button>
                <button className="hover:text-foreground transition-colors">Terms</button>
                <button className="hover:text-foreground transition-colors">Contact</button>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
              <p>© 2024 Beat. Keep Your Beat Strong. Made with ❤️ for Indian families.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  gradient 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  gradient: string;
}) => (
  <article className="group relative bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated">
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} aria-hidden="true"></div>
    <div className="relative z-10">
      <div className={`mb-6 w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} p-3 text-white flex items-center justify-center`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </article>
);

const TestimonialCard = ({
  quote,
  author,
  role,
  rating
}: {
  quote: string;
  author: string;
  role: string;
  rating: number;
}) => (
  <Card className="p-8 hover:shadow-elevated transition-all duration-300 bg-card border-2">
    <div className="flex gap-1 mb-4">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-accent text-accent" aria-hidden="true" />
      ))}
    </div>
    <blockquote className="text-foreground/90 mb-6 leading-relaxed text-lg">
      "{quote}"
    </blockquote>
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent"></div>
      <div>
        <div className="font-semibold">{author}</div>
        <div className="text-sm text-muted-foreground">{role}</div>
      </div>
    </div>
  </Card>
);

export default Landing;
