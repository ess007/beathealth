import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Shield, Heart, Zap, Clock, Star, CheckCircle2, ArrowRight, Check, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

        {/* Comparison Table Section */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-primary font-semibold text-sm uppercase tracking-wide">Why Beat?</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
                Built Different From{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Day One
                </span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Unlike generic health trackers, Beat is purpose-built for Indian families managing heart health.
              </p>
            </div>
            
            <div className="max-w-5xl mx-auto overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left p-4 md:p-6 font-bold text-lg">Feature</th>
                    <th className="text-center p-4 md:p-6">
                      <div className="flex flex-col items-center gap-2">
                        <Logo size="sm" showText={false} />
                        <span className="font-bold text-lg text-primary">Beat</span>
                      </div>
                    </th>
                    <th className="text-center p-4 md:p-6 text-muted-foreground font-medium">Traditional Apps</th>
                  </tr>
                </thead>
                <tbody>
                  <ComparisonRow 
                    feature="Daily HeartScore"
                    beat={true}
                    traditional={false}
                    description="One number that tells you everything about your heart health"
                  />
                  <ComparisonRow 
                    feature="Family Dashboard"
                    beat={true}
                    traditional={false}
                    description="Remote monitoring for caregivers and loved ones"
                  />
                  <ComparisonRow 
                    feature="AI Health Coach (Pulse)"
                    beat={true}
                    traditional="Limited"
                    description="Medical-grade coaching aware of your conditions"
                  />
                  <ComparisonRow 
                    feature="2-Minute Rituals"
                    beat={true}
                    traditional={false}
                    description="Morning & evening check-ins designed for consistency"
                  />
                  <ComparisonRow 
                    feature="Senior-Friendly Design"
                    beat={true}
                    traditional="Rarely"
                    description="Large text, Hindi support, one-action-per-screen"
                  />
                  <ComparisonRow 
                    feature="WhatsApp Integration"
                    beat={true}
                    traditional={false}
                    description="Reminders and summaries on your favorite platform"
                  />
                  <ComparisonRow 
                    feature="Medication Tracking"
                    beat={true}
                    traditional={true}
                    description="Smart reminders tied to your ritual times"
                  />
                  <ComparisonRow 
                    feature="Doctor Reports (PDF)"
                    beat={true}
                    traditional="Sometimes"
                    description="Professional 30-day summaries ready to share"
                  />
                  <ComparisonRow 
                    feature="Works Offline"
                    beat={true}
                    traditional={false}
                    description="View past 7 days of data without internet"
                  />
                  <ComparisonRow 
                    feature="Price"
                    beat="Free"
                    traditional="Varies"
                    description="Core features free forever, premium at ₹199/month"
                  />
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-primary font-semibold text-sm uppercase tracking-wide">Questions?</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
                Everything You Need to Know
              </h2>
              <p className="text-xl text-muted-foreground">
                Common questions about Beat, HeartScore, and how we help families stay healthy.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="item-1" className="bg-card border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="text-lg font-semibold">What is HeartScore and how is it calculated?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                    HeartScore is your daily health score out of 100—like a credit score for your heart. It's calculated using a weighted average of four key factors: your blood pressure readings (30%), blood sugar levels (30%), lifestyle habits like sleep and steps (30%), and consistency of logging (10%). The AI analyzes your data daily and provides a simple, actionable score that shows how well you're managing your cardiovascular and metabolic health.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="bg-card border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="text-lg font-semibold">Is Beat really free? What does the premium plan include?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                    Yes! Beat's core features are completely free forever—including blood pressure tracking, sugar logging, HeartScore calculation, medication reminders, and family dashboard access. Our Beat Coach Premium plan (₹199/month with 7-day free trial) adds AI-powered daily health nudges, personalized weekly health plans, unlimited PDF report generation for doctors, and priority support from our health coaching team.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="bg-card border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="text-lg font-semibold">How does the Family Dashboard work? Who can see my data?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                    You're in complete control of your health data. The Family Dashboard lets you grant specific family members permission to view your blood pressure, sugar readings, and HeartScore remotely. You can set view-only access or allow them to send gentle nudges when they're concerned. You can add or remove family members and change their permissions anytime. They'll never see your data without your explicit approval, and you can revoke access instantly.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="bg-card border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="text-lg font-semibold">Is my health data private and secure?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                    Absolutely. Beat uses bank-level encryption to protect your health data. All your information is stored securely in compliance with India's Digital Personal Data Protection (DPDP) Act. We never sell your personal health information to third parties. Your data is backed up automatically, and you can export or delete your data anytime from your account settings. Only you control who sees your health information through the Family Dashboard permissions system.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="bg-card border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="text-lg font-semibold">Does Beat work offline? What if I have poor internet?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                    Yes! Beat is a Progressive Web App (PWA) that works seamlessly even with intermittent connectivity. You can view your past 7 days of blood pressure logs, sugar readings, HeartScores, and insights when offline. Any new data you log is saved locally and automatically syncs to the cloud when you reconnect. This makes Beat perfect for users in areas with unreliable internet connections.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6" className="bg-card border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="text-lg font-semibold">Who should use Beat? Is it only for seniors?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                    Beat is designed for Indian adults aged 40-70 managing hypertension, diabetes, or heart disease risk—but anyone concerned about their cardiovascular health can benefit. It's also perfect for adult children and caregivers who want to monitor and support elderly parents remotely. The app is senior-friendly with large text, Hindi support, and simple workflows, but younger users managing chronic conditions find it just as valuable for consistent health tracking.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7" className="bg-card border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="text-lg font-semibold">Can I connect my BP monitor or fitness tracker to Beat?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                    We support integration with Google Fit, Apple Health, and other popular fitness platforms to automatically sync your step count, heart rate, and sleep data. For blood pressure monitors and glucose meters, we're working on direct Bluetooth connections with major brands. Currently, you can manually log readings in under 30 seconds using our simple morning and evening ritual flows, or use the "fetch latest reading" feature for compatible devices.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8" className="bg-card border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="text-lg font-semibold">What makes Pulse AI Coach different from generic chatbots?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                    Pulse isn't a generic AI chatbot—it's a medical-grade health coach that knows your complete health profile. It has access to your BP history, sugar trends, medication schedule, health conditions (diabetes, hypertension), and current readings. This means Pulse gives you contextually aware advice specific to YOUR situation, not generic tips. It can detect concerning patterns, suggest lifestyle adjustments, and help you understand what's affecting your HeartScore. Plus, it includes built-in safety guardrails—it will never diagnose conditions or replace your doctor's advice.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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

const ComparisonRow = ({ 
  feature, 
  beat, 
  traditional, 
  description 
}: { 
  feature: string; 
  beat: boolean | string; 
  traditional: boolean | string; 
  description: string;
}) => (
  <tr className="border-b border-border hover:bg-muted/30 transition-colors">
    <td className="p-4 md:p-6">
      <div className="font-medium text-foreground mb-1">{feature}</div>
      <div className="text-sm text-muted-foreground hidden md:block">{description}</div>
    </td>
    <td className="p-4 md:p-6 text-center">
      {typeof beat === 'boolean' ? (
        beat ? (
          <Check className="w-6 h-6 text-secondary mx-auto" aria-label="Yes" />
        ) : (
          <X className="w-6 h-6 text-muted-foreground mx-auto" aria-label="No" />
        )
      ) : (
        <span className="font-semibold text-primary">{beat}</span>
      )}
    </td>
    <td className="p-4 md:p-6 text-center">
      {typeof traditional === 'boolean' ? (
        traditional ? (
          <Check className="w-6 h-6 text-muted-foreground mx-auto" aria-label="Yes" />
        ) : (
          <X className="w-6 h-6 text-muted-foreground mx-auto" aria-label="No" />
        )
      ) : (
        <span className="text-muted-foreground">{traditional}</span>
      )}
    </td>
  </tr>
);

export default Landing;
