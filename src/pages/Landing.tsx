import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Check, Heart, Users, TrendingUp, Shield, Clock, Brain, Phone, Star, Sun, Moon, Menu, X, AlertTriangle, Pill, Activity, UserCheck } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useNavigate, Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

const Landing = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroCardRef = useRef<HTMLDivElement>(null);
  const tiltContainerRef = useRef<HTMLDivElement>(null);

  // 3D Tilt Effect
  useEffect(() => {
    const card = heroCardRef.current;
    const container = tiltContainerRef.current;
    if (!card || !container) return;

    const handleMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleLeave = () => {
      card.style.transform = `rotateX(0deg) rotateY(0deg)`;
    };

    container.addEventListener("mousemove", handleMove);
    container.addEventListener("mouseleave", handleLeave);

    return () => {
      container.removeEventListener("mousemove", handleMove);
      container.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  const features = [
    {
      icon: Heart,
      title: "HeartScore™",
      description: "One number that tells you exactly how your heart is doing today. No medical jargon.",
      link: "/features/heartscore",
      color: "from-primary to-accent",
    },
    {
      icon: Users,
      title: "Family Dashboard",
      description: "Monitor your parents' health from anywhere. Get alerts when something's off.",
      link: "/features/family",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: AlertTriangle,
      title: "Fall Detection",
      description: "Automatic fall detection with emergency alerts to family. Peace of mind for everyone.",
      link: "/features/safety",
      color: "from-orange-500 to-rose-500",
    },
    {
      icon: Pill,
      title: "Drug Safety",
      description: "Catches dangerous drug interactions before they harm you. Works with 500+ medications.",
      link: "/features/medications",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Brain,
      title: "Cognitive Monitoring",
      description: "Early detection of memory changes. Weekly brain games that actually matter.",
      link: "/features/cognitive",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: UserCheck,
      title: "Social Wellness",
      description: "Tracks isolation and loneliness. Nudges you to stay connected with loved ones.",
      link: "/features/social",
      color: "from-violet-500 to-indigo-500",
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground font-sans">
      {/* Subtle Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] bg-accent/10 rounded-full blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed w-full z-40 top-0 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Logo size="sm" showText={true} />

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/features/heartscore" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</Link>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Pricing</a>
              <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Stories</a>
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full">
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button onClick={() => navigate("/auth")} className="rounded-full px-6">
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-background border-t border-border p-6 space-y-4">
            <Link to="/features/heartscore" className="block text-base font-medium">Features</Link>
            <a href="#pricing" className="block text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
            <a href="#testimonials" className="block text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>Stories</a>
            <Button onClick={() => navigate("/auth")} className="w-full">Get Started Free</Button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-16 lg:pt-40 lg:pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            {/* Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative rounded-full h-2 w-2 bg-primary" />
                </span>
                Built for Indian families
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
                Your parents' health,
                <br />
                <span className="text-primary">in your pocket.</span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                Beat helps adults 40-70 manage BP, diabetes, and heart health with daily 2-minute check-ins. 
                <strong className="text-foreground"> No more guessing if Amma took her medicines.</strong>
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Button size="lg" onClick={() => navigate("/auth")} className="h-12 rounded-full px-8">
                  Start Free Today <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button variant="outline" size="lg" className="h-12 rounded-full px-8" asChild>
                  <a href="#how-it-works">See How It Works</a>
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center lg:justify-start gap-6 mt-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Bank-grade Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Works Offline</span>
                </div>
              </div>
            </div>

            {/* Hero Card */}
            <div className="flex-1 relative" ref={tiltContainerRef} style={{ perspective: "1000px" }}>
              <div
                ref={heroCardRef}
                className="relative w-[300px] lg:w-[340px] mx-auto bg-card rounded-[2.5rem] shadow-2xl border border-border p-2 transition-transform duration-100"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="bg-muted rounded-[2rem] h-[500px] lg:h-[580px] overflow-hidden border border-border">
                  {/* App Header */}
                  <div className="p-4 bg-card border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">RK</div>
                      <div>
                        <p className="text-xs text-muted-foreground">Good Morning</p>
                        <p className="font-semibold text-sm">Ravi Kumar</p>
                      </div>
                      <div className="ml-auto flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/10">
                        <span className="text-orange-500">🔥</span>
                        <span className="text-sm font-bold text-orange-600">12</span>
                      </div>
                    </div>
                  </div>

                  {/* HeartScore */}
                  <div className="p-4">
                    <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-4 border border-primary/20">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <Heart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">HeartScore™</p>
                          <p className="text-3xl font-bold">87</p>
                        </div>
                        <span className="ml-auto text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">Excellent</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-card/60 rounded-lg p-2 text-center">
                          <p className="text-[10px] text-muted-foreground">BP</p>
                          <p className="text-sm font-bold text-emerald-500">85</p>
                        </div>
                        <div className="bg-card/60 rounded-lg p-2 text-center">
                          <p className="text-[10px] text-muted-foreground">Sugar</p>
                          <p className="text-sm font-bold text-emerald-500">88</p>
                        </div>
                        <div className="bg-card/60 rounded-lg p-2 text-center">
                          <p className="text-[10px] text-muted-foreground">Ritual</p>
                          <p className="text-sm font-bold text-emerald-500">90</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="px-4 space-y-2">
                    <div className="bg-card p-3 rounded-xl border border-border flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-lg">🫀</div>
                      <div className="flex-1">
                        <p className="text-[10px] text-muted-foreground">Blood Pressure</p>
                        <p className="text-sm font-bold">118/78 mmHg</p>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold">Normal</span>
                    </div>
                    <div className="bg-card p-3 rounded-xl border border-border flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-lg">🩸</div>
                      <div className="flex-1">
                        <p className="text-[10px] text-muted-foreground">Fasting Sugar</p>
                        <p className="text-sm font-bold">92 mg/dL</p>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold">Optimal</span>
                    </div>
                  </div>

                  {/* Rituals */}
                  <div className="p-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Today's Rituals</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-center">
                        <p className="text-lg mb-1">☀️</p>
                        <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">Morning</p>
                        <p className="text-[9px] text-emerald-600">✓ Complete</p>
                      </div>
                      <div className="bg-muted border border-border rounded-xl p-3 text-center">
                        <p className="text-lg mb-1">🌙</p>
                        <p className="text-[10px] font-bold">Evening</p>
                        <p className="text-[9px] text-muted-foreground">Pending</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Managing chronic conditions is <span className="text-primary">overwhelming</span>
          </h2>
          <div className="grid sm:grid-cols-3 gap-6 text-left">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <p className="text-3xl mb-3">😰</p>
              <h3 className="font-semibold mb-2">Scattered Data</h3>
              <p className="text-sm text-muted-foreground">BP readings in one app, sugar in a notebook, meds on paper. Nothing connects.</p>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border">
              <p className="text-3xl mb-3">😔</p>
              <h3 className="font-semibold mb-2">Worried Families</h3>
              <p className="text-sm text-muted-foreground">Children in metros can't check if parents in tier-2 cities took their medicines.</p>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border">
              <p className="text-3xl mb-3">🏥</p>
              <h3 className="font-semibold mb-2">Doctor Confusion</h3>
              <p className="text-sm text-muted-foreground">Doctors see you for 5 minutes. They can't track your daily patterns.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need in <span className="text-primary">one app</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built specifically for Indian adults managing BP, diabetes, and heart health. Works offline. Supports Hindi.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Link 
                key={i} 
                to={feature.link}
                className="group bg-card rounded-2xl border border-border p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                <span className="text-sm font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              2 minutes. Twice a day. <span className="text-primary">That's it.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Morning Check-in", desc: "Log BP, fasting sugar, and how you slept. Takes 30 seconds.", icon: "☀️" },
              { step: "2", title: "Get Your HeartScore", desc: "AI analyzes your data and gives you one number that matters.", icon: "❤️" },
              { step: "3", title: "Family Stays Updated", desc: "Your children can see your health status anytime, anywhere.", icon: "👨‍👩‍👧" },
            ].map((item, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-8 text-center">
                <p className="text-4xl mb-4">{item.icon}</p>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-16 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "2 min", label: "Daily check-in" },
              { number: "6", label: "Health factors tracked" },
              { number: "500+", label: "Drug interactions" },
              { number: "100%", label: "Offline capable" },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-3xl sm:text-4xl font-bold text-primary">{stat.number}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20" id="testimonials">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Families love <span className="text-primary">Beat</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Priya Sharma", role: "Daughter, Bangalore", quote: "My dad's BP dropped from 160/100 to 130/85 in 2 months. I can finally stop worrying about him in Delhi.", avatar: "PS" },
              { name: "Rajesh Kumar", role: "Type 2 Diabetes, Chennai", quote: "Beat showed me my sugar spikes after rice. Switched to roti and my HeartScore went from 65 to 82.", avatar: "RK" },
              { name: "Dr. Meera Patel", role: "General Physician, Mumbai", quote: "I recommend Beat to all my patients over 40. The PDF reports are more useful than any blood test.", avatar: "MP" },
            ].map((t, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-yellow-500 fill-yellow-500" />)}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">{t.avatar}</div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-muted/30" id="pricing">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, honest pricing</h2>
            <p className="text-muted-foreground">Start free. No credit card needed.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold mb-1">Beat Free</h3>
              <p className="text-3xl font-bold mb-4">₹0<span className="text-base font-normal text-muted-foreground">/mo</span></p>
              <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                {["BP & Sugar logging", "Basic HeartScore", "Morning & Evening rituals", "Medication reminders"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" />{f}</li>
                ))}
              </ul>
              <Button variant="outline" className="w-full rounded-full" onClick={() => navigate("/auth")}>Start Free</Button>
            </div>

            {/* Premium */}
            <div className="bg-card rounded-2xl border-2 border-primary p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>
              <h3 className="font-semibold mb-1 mt-2">Beat Coach</h3>
              <p className="text-3xl font-bold mb-1">₹199<span className="text-base font-normal text-muted-foreground">/mo</span></p>
              <p className="text-xs text-muted-foreground mb-4">7-day free trial</p>
              <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                {["Everything in Free", "AI Health Coach", "Family Dashboard", "Drug interaction alerts", "Fall detection", "PDF reports for doctors"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" />{f}</li>
                ))}
              </ul>
              <Button className="w-full rounded-full" onClick={() => navigate("/auth")}>Start Trial <ArrowRight className="ml-2 w-4 h-4" /></Button>
            </div>

            {/* Family */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold mb-1">Beat Family</h3>
              <p className="text-3xl font-bold mb-4">₹349<span className="text-base font-normal text-muted-foreground">/mo</span></p>
              <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                {["Everything in Coach", "Up to 5 family members", "Shared dashboard", "Priority support", "Teleconsult discounts"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-secondary" />{f}</li>
                ))}
              </ul>
              <Button variant="secondary" className="w-full rounded-full" onClick={() => navigate("/auth")}>Get Family</Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20" id="faq">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="space-y-4">
            {[
              { q: "What is HeartScore?", a: "HeartScore is a 0-100 score that combines your BP, sugar, daily habits, social wellness, and more into one easy-to-understand number. Higher is better." },
              { q: "Do I need special devices?", a: "No! You can manually enter readings. But we do sync with Omron BP monitors, Apple Health, Google Fit, and AccuChek." },
              { q: "Is my data secure?", a: "Yes. We use bank-grade encryption and are HIPAA compliant. Your data is never sold. You can export or delete it anytime." },
              { q: "Can my family see my data?", a: "Only if you invite them. You control exactly what they can see through granular permissions." },
              { q: "Does it work offline?", a: "Yes! Beat caches your data locally. New entries sync automatically when you're back online." },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-card rounded-2xl border border-border px-6">
                <AccordionTrigger className="hover:no-underline font-semibold">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Stop worrying. Start knowing.
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Take control of your family's health today. Free to start, no credit card needed.
          </p>
          <Button size="lg" variant="secondary" className="h-12 rounded-full px-8" onClick={() => navigate("/auth")}>
            Get Beat Free <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo size="sm" showText={true} className="mb-4" />
              <p className="text-sm text-muted-foreground">Daily heart health tracking for Indian families.</p>
            </div>
            <div>
              <p className="font-semibold mb-4">Features</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/features/heartscore" className="hover:text-primary">HeartScore</Link></li>
                <li><Link to="/features/family" className="hover:text-primary">Family Dashboard</Link></li>
                <li><Link to="/features/safety" className="hover:text-primary">Fall Detection</Link></li>
                <li><Link to="/features/medications" className="hover:text-primary">Drug Safety</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-4">Company</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary">About</Link></li>
                <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-primary">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-primary">Terms</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-4">Get Started</p>
              <Button onClick={() => navigate("/auth")} className="w-full rounded-full">Download Free</Button>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <Phone className="w-3 h-3" /> iOS & Android
              </p>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <span>© 2024 Beat Health. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <span>Made with ❤️ in India</span>
              <span>•</span>
              <span>Built by <a href="https://bwestudios.com" target="_blank" rel="noopener noreferrer" className="font-bold text-foreground hover:text-primary transition-colors">BWE Studio</a></span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Landing;
