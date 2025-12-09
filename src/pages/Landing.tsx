import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, CheckCircle2, Sun, Moon, Menu, X, Check, Heart, Users, TrendingUp, Shield, Clock, Zap, Brain, Phone, Star } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";

const Landing = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Infinite Scroll State
  const [articles, setArticles] = useState<
    Array<{ title: string; category: string; color: string; img: string; desc: string }>
  >([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadTriggerRef = useRef<HTMLDivElement>(null);

  // 3D Tilt Ref
  const heroCardRef = useRef<HTMLDivElement>(null);
  const tiltContainerRef = useRef<HTMLDivElement>(null);

  // Handle 3D Tilt
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

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

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

  // Handle Spotlight Effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll(".spotlight-card");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty("--mouse-x", `${x}px`);
        (card as HTMLElement).style.setProperty("--mouse-y", `${y}px`);
      });
    };

    const grid = document.getElementById("features-grid");
    if (grid) {
      grid.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      if (grid) grid.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Initial Articles
  useEffect(() => {
    setArticles([
      {
        title: "Hidden Salt in Indian Diets",
        category: "Nutrition",
        color: "text-orange-500",
        img: "https://images.unsplash.com/photo-1596522354195-e84e9c0a5d30?auto=format&fit=crop&w=500&q=80",
        desc: "Pickles and papadums might be the reason your BP isn't dropping.",
      },
      {
        title: "What is Heart Rate Variability?",
        category: "Science",
        color: "text-purple-500",
        img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=500&q=80",
        desc: "Why tracking your HRV is more important than tracking your step count.",
      },
      {
        title: "Truth About 'Sugar-Free' Sweets",
        category: "Diabetes",
        color: "text-rose-500",
        img: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=500&q=80",
        desc: "Are diabetic-friendly mithais actually safe? We analyze the ingredients.",
      },
    ]);
  }, []);

  // Enhanced Infinite Scroll with more content variety
  useEffect(() => {
    const contentPool = [
      { title: "Walking: Speed vs Distance", category: "Fitness", color: "text-blue-500", img: "https://images.unsplash.com/photo-1552674605-46d536d2348c?auto=format&fit=crop&w=500&q=80", desc: "Should you walk faster or longer? New research reveals the ideal pace." },
      { title: "Sleep Debt & Monday Spikes", category: "Sleep", color: "text-indigo-500", img: "https://images.unsplash.com/photo-1541781777621-af13b2caa5e3?auto=format&fit=crop&w=500&q=80", desc: "Why catching up on sleep on weekends might actually hurt your heart." },
      { title: "White Coat Syndrome", category: "Medical", color: "text-rose-500", img: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&w=500&q=80", desc: "High BP only at the doctor? It might be anxiety, but it's still risky." },
      { title: "Omega-3 Myths Debunked", category: "Nutrition", color: "text-emerald-500", img: "https://images.unsplash.com/photo-1604909052743-94e838986d24?auto=format&fit=crop&w=500&q=80", desc: "Not all fish oil supplements are created equal. Here's what works." },
      { title: "Stress and Your Heart", category: "Mental Health", color: "text-purple-500", img: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=500&q=80", desc: "Chronic stress physically damages your cardiovascular system. Learn to manage it." },
      { title: "Indian Breakfast for BP Control", category: "Diet", color: "text-orange-500", img: "https://images.unsplash.com/photo-1589301760014-dd4447a0d0e6?auto=format&fit=crop&w=500&q=80", desc: "Poha, idli, or upma? We rank the healthiest traditional options." },
      { title: "Medication Timing Matters", category: "Medical", color: "text-rose-500", img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80", desc: "Taking your BP meds at night instead of morning could save your life." },
      { title: "Yoga for Heart Health", category: "Fitness", color: "text-blue-500", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=500&q=80", desc: "These 5 asanas specifically target cardiovascular wellness." }
    ];

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoadingMore) {
        setIsLoadingMore(true);
        setTimeout(() => {
          const randomArticles = contentPool
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
          setArticles((prev) => [...prev, ...randomArticles]);
          setIsLoadingMore(false);
        }, 1000);
      }
    });

    if (loadTriggerRef.current) {
      observer.observe(loadTriggerRef.current);
    }

    return () => observer.disconnect();
  }, [isLoadingMore, articles.length]);

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-500 font-sans selection:bg-primary selection:text-white">
      {/* Noise Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Dynamic Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary/20 rounded-full blur-[100px] animate-blob mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] bg-accent/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] bg-secondary/20 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed w-full z-40 top-0 border-b border-transparent transition-all duration-300 bg-background/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div onClick={() => { window.scrollTo(0, 0); navigate("/"); }} className="cursor-pointer">
              <Logo size="sm" showText={true} />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1 p-1 bg-card/50 backdrop-blur-md rounded-full border border-border shadow-sm">
              {[
                { label: "Features", href: "#features" },
                { label: "How It Works", href: "#how-it-works" },
                { label: "Pricing", href: "#pricing" },
                { label: "Testimonials", href: "#testimonials" }
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-5 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-muted"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>

              <Button
                onClick={() => navigate("/auth")}
                className="group relative px-6 py-2.5 text-sm font-semibold rounded-full overflow-hidden"
              >
                <span className="relative z-10">
                  Get Started
                </span>
                <div className="absolute inset-0 bg-primary/80 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-20 left-0 w-full bg-background/95 backdrop-blur-md p-6 md:hidden shadow-xl border-t border-border flex flex-col gap-4">
            {[
              { label: "Features", href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Pricing", href: "#pricing" },
              { label: "Testimonials", href: "#testimonials" }
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-base font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMobileMenuOpen(false);
                  document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {item.label}
              </a>
            ))}
            <Button onClick={() => { navigate("/auth"); setIsMobileMenuOpen(false); }} className="w-full">
              Get Started Free
            </Button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden perspective-1000">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
            {/* Content */}
            <div className="flex-1 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/40 border border-border backdrop-blur-md text-xs font-semibold mb-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-muted-foreground">The #1 Heart App in India</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 pr-4">
                <span className="font-heading">Your heart</span> <br />
                <span className="font-serif italic bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#FF8C7A] to-accent">
                  deserves clarity.
                </span>
              </h1>

              <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 font-light animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                Stop guessing. We turn your blood pressure, sugar, and habits into a single, daily{" "}
                <strong className="text-foreground font-semibold">HeartScore™</strong>. It's health,
                decoded.
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="h-14 rounded-full px-8 text-base"
                >
                  Download Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="ghost" size="lg" className="h-14 rounded-full px-8 text-base" asChild>
                  <a href="#how-it-works" onClick={(e) => { e.preventDefault(); document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}>How it works</a>
                </Button>
              </div>
            </div>

            {/* 3D Interactive Card */}
            <div
              className="flex-1 relative w-full flex justify-center lg:justify-end"
              ref={tiltContainerRef}
              style={{ perspective: "1000px" }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-[100px] -z-10"></div>

              <div
                id="hero-card"
                ref={heroCardRef}
                className="relative w-[340px] bg-card rounded-[3rem] shadow-2xl border border-border p-2 z-20 select-none cursor-default transition-transform duration-100 ease-out"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="h-8 flex justify-center items-start mb-2 px-6 pt-3">
                  <div className="w-20 h-5 bg-black dark:bg-white rounded-full absolute top-3"></div>
                </div>

                <div className="bg-muted rounded-[2.5rem] h-[640px] overflow-hidden relative border border-border flex flex-col">
                  {/* Dashboard Header */}
                  <div className="p-5 pt-6 pb-4 bg-card border-b border-border">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white">
                          RK
                        </div>
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            Good Morning
                          </div>
                          <div className="text-sm font-bold">Ravi Kumar</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-orange-500/15 border border-orange-500/30">
                        <span className="text-orange-600">🔥</span>
                        <span className="text-sm font-bold text-orange-700 dark:text-orange-400">12</span>
                      </div>
                    </div>
                  </div>

                  {/* HeartScore Card */}
                  <div className="p-4">
                    <div className="bg-gradient-to-br from-primary/5 via-card to-accent/5 rounded-2xl p-4 border border-primary/20 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Heart className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">HeartScore™</div>
                            <div className="text-2xl font-bold">87</div>
                          </div>
                        </div>
                        <div className="text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded-full">
                          Excellent
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-card/60 rounded-lg p-2 text-center">
                          <div className="text-[10px] text-muted-foreground">BP</div>
                          <div className="text-sm font-bold text-blue-500">85</div>
                        </div>
                        <div className="bg-card/60 rounded-lg p-2 text-center">
                          <div className="text-[10px] text-muted-foreground">Sugar</div>
                          <div className="text-sm font-bold text-purple-500">88</div>
                        </div>
                        <div className="bg-card/60 rounded-lg p-2 text-center">
                          <div className="text-[10px] text-muted-foreground">Ritual</div>
                          <div className="text-sm font-bold text-emerald-500">90</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="px-4 space-y-2">
                    <div className="bg-card p-3 rounded-xl border border-border flex items-center gap-3 shadow-sm">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-lg">
                        🫀
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] text-muted-foreground font-medium">Blood Pressure</div>
                        <div className="text-sm font-bold">118/78 mmHg</div>
                      </div>
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">Normal</div>
                    </div>
                    <div className="bg-card p-3 rounded-xl border border-border flex items-center gap-3 shadow-sm">
                      <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-lg">
                        🩸
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] text-muted-foreground font-medium">Fasting Sugar</div>
                        <div className="text-sm font-bold">92 mg/dL</div>
                      </div>
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">Optimal</div>
                    </div>
                  </div>

                  {/* Rituals */}
                  <div className="p-4 mt-auto">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Today's Rituals</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-emerald-600/15 border border-emerald-600/30 rounded-xl p-3 text-center">
                        <div className="text-lg mb-1">☀️</div>
                        <div className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300">Morning</div>
                        <div className="text-[9px] text-emerald-700 dark:text-emerald-400 font-medium">✓ Complete</div>
                      </div>
                      <div className="bg-muted border border-border rounded-xl p-3 text-center">
                        <div className="text-lg mb-1">🌙</div>
                        <div className="text-[10px] font-bold">Evening</div>
                        <div className="text-[9px] text-muted-foreground">Pending</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -right-8 top-1/4 bg-card/80 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce z-30 border border-border">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold">BP Normalized</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="py-10 border-y border-border bg-card/30 overflow-hidden">
        <div className="relative w-full overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10"></div>
          <div className="flex animate-marquee gap-16 items-center whitespace-nowrap min-w-full">
            {[
              "HealthDaily",
              "MedTech India",
              "Wellness Now",
              "The Family Doctor",
              "Apollo Clinic",
              "HealthDaily",
              "MedTech India",
            ].map((brand, i) => (
              <span key={i} className="text-xl font-bold text-foreground/50 dark:text-muted-foreground">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid with Spotlight */}
      <section className="py-24 md:py-32 relative" id="features">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Designed for <span className="font-serif italic text-primary">real life.</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Traditional medical apps are ugly and confusing. Beat is built to be used before your morning chai, in
              less than 30 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-auto md:auto-rows-[300px]" id="features-grid">
            {/* HeartScore - Large Card */}
            <div className="spotlight-card md:col-span-2 group relative bg-gradient-to-br from-primary/5 via-card to-accent/5 rounded-[2rem] border border-border p-6 md:p-8 flex flex-col justify-between hover:border-primary/50 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-primary/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl -z-10 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-7 h-7" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3">The HeartScore™ Algorithm</h3>
                <p className="text-muted-foreground max-w-sm text-sm md:text-base leading-relaxed">
                  We process 50+ biomarkers into a single, understandable score from 0-100. It's like a credit score for
                  your body.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Family Dashboard - Dark Card */}
            <div className="spotlight-card md:col-span-1 relative bg-gradient-to-br from-slate-900 to-slate-800 dark:from-[#151b2b] dark:to-[#0d1117] rounded-[2rem] p-6 md:p-8 flex flex-col justify-between overflow-hidden text-white group hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500 rounded-full blur-[80px] opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Family Dashboard</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Monitor parents remotely. Get instant alerts for sudden spikes in BP or sugar.</p>
              </div>
              <div className="mt-4 flex gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border-2 border-blue-400/50"></div>
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-400/50 -ml-3"></div>
                <div className="w-8 h-8 rounded-full bg-purple-500/20 border-2 border-purple-400/50 -ml-3"></div>
              </div>
            </div>

            {/* Smart Insights */}
            <div className="spotlight-card md:col-span-1 relative bg-card rounded-[2rem] border border-border p-6 md:p-8 flex flex-col justify-between hover:border-primary/50 transition-all duration-300 group hover:shadow-xl hover:shadow-purple-500/10 overflow-hidden">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-[60px] -z-10 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Smart Insights</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  "Your BP is usually higher on Mondays." We find patterns you miss.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                </div>
                <span className="text-xs font-medium text-muted-foreground">Pattern detected</span>
              </div>
            </div>

            {/* Device Connectivity - Wide Card */}
            <div className="spotlight-card md:col-span-2 relative bg-gradient-to-r from-emerald-500/10 via-card to-cyan-500/10 rounded-[2rem] border border-border p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6 hover:border-primary/50 transition-all duration-300 group hover:shadow-xl hover:shadow-emerald-500/10 overflow-hidden">
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-[80px] -z-10 group-hover:scale-125 transition-transform duration-500"></div>
              <div className="relative z-10 flex-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-2">Connects with everything</h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-md">
                  Omron, Apple Health, Google Fit, AccuChek. We sync with your existing devices instantly.
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                {['Apple Health', 'Google Fit', 'Omron'].map((device, i) => (
                  <div key={i} className="px-4 py-2 rounded-full bg-card/80 backdrop-blur border border-border text-xs font-medium shadow-sm">
                    {device}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-background to-muted/30 relative" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Three steps. <span className="font-serif italic text-primary">Two minutes daily.</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Getting healthier shouldn't be complicated. Beat fits into your morning chai routine.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: <Clock className="w-8 h-8" />, step: "Step 1", title: "Quick Morning Check-In", desc: "Log BP, sugar, and how you slept. Takes under 30 seconds.", color: "from-blue-500 to-cyan-500" },
              { icon: <Brain className="w-8 h-8" />, step: "Step 2", title: "Get Your HeartScore", desc: "Our AI analyzes 50+ data points instantly and gives you one number that matters.", color: "from-purple-500 to-pink-500" },
              { icon: <TrendingUp className="w-8 h-8" />, step: "Step 3", title: "Track & Improve", desc: "See patterns, set goals, share with family. Watch your score climb over time.", color: "from-orange-500 to-rose-500" }
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="relative bg-card rounded-3xl border border-border p-6 md:p-8 hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <div className={`w-14 md:w-16 h-14 md:h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-5 md:mb-6 shadow-lg`}>
                    {item.icon}
                  </div>
                  <div className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">{item.step}</div>
                  <h3 className="text-xl md:text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Stats Section */}
      <section className="py-16 md:py-20 border-y border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            {[
              { number: "50,000+", label: "Active Families", icon: <Users className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 text-primary" /> },
              { number: "4.7★", label: "App Store Rating", icon: <Star className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 text-yellow-500 fill-yellow-500" /> },
              { number: "2M+", label: "Health Readings", icon: <Heart className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 text-rose-500" /> },
              { number: "92%", label: "Improved in 30 Days", icon: <TrendingUp className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 text-emerald-500" /> }
            ].map((stat, i) => (
              <div key={i} className="group">
                {stat.icon}
                <div className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">{stat.number}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 md:py-32 bg-muted/30" id="comparison">
        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
              Not just another <span className="font-serif italic text-primary">health tracker</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Traditional apps track. Beat transforms.
            </p>
          </div>

          <div className="bg-card rounded-2xl md:rounded-3xl border border-border overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <div className="grid grid-cols-3 gap-px bg-border min-w-[340px]">
                <div className="bg-card p-3 md:p-6"></div>
                <div className="bg-muted p-2 md:p-6 text-center">
                  <div className="text-[9px] md:text-sm font-bold text-muted-foreground uppercase tracking-wider">Other Apps</div>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-2 md:p-6 text-center border-l-2 border-primary/30">
                  <div className="flex flex-col items-center gap-0.5 md:gap-1">
                    <Heart className="w-4 h-4 md:w-6 md:h-6 text-primary" />
                    <div className="text-[9px] md:text-sm font-bold text-primary uppercase tracking-wider">Beat</div>
                  </div>
                </div>
              </div>

              {[
                { feature: "Daily HeartScore", traditional: false, beat: true },
                { feature: "Family Dashboard", traditional: false, beat: true },
                { feature: "AI Health Coaching", traditional: false, beat: true },
                { feature: "Hindi Support", traditional: false, beat: true },
                { feature: "2-Minute Rituals", traditional: false, beat: true },
                { feature: "Offline Access", traditional: false, beat: true },
                { feature: "WhatsApp Integration", traditional: false, beat: true },
                { feature: "PDF Reports", traditional: "Paid", beat: true },
                { feature: "Med Reminders", traditional: true, beat: true },
                { feature: "BP/Sugar Logging", traditional: true, beat: true }
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-3 gap-px bg-border min-w-[340px]">
                  <div className="bg-card p-2.5 md:p-4 flex items-center">
                    <span className="text-[10px] md:text-sm font-medium">{row.feature}</span>
                  </div>
                  <div className="bg-muted p-2.5 md:p-4 flex items-center justify-center">
                    {row.traditional === true ? (
                      <Check className="w-3.5 h-3.5 md:w-5 md:h-5 text-muted-foreground" />
                    ) : row.traditional === false ? (
                      <X className="w-3.5 h-3.5 md:w-5 md:h-5 text-muted-foreground/30" />
                    ) : (
                      <span className="text-[9px] md:text-xs text-muted-foreground">{row.traditional}</span>
                    )}
                  </div>
                  <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-2.5 md:p-4 flex items-center justify-center">
                    {row.beat === true ? (
                      <Check className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary" />
                    ) : (
                      <span className="text-[9px] md:text-xs text-muted-foreground">{row.beat}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-10 md:mt-12">
            <Button size="lg" onClick={() => navigate("/auth")} className="h-12 md:h-14 px-6 md:px-8 rounded-full text-sm md:text-base">
              Start Free Today <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Health Hub / Infinite Feed */}
      <section className="py-24 relative bg-background" id="health-feed">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-serif font-bold">Health Hub</h2>
              <p className="text-muted-foreground mt-2">Latest tips for a stronger heart.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {articles.map((article, i) => (
              <article
                key={i}
                className="group bg-card backdrop-blur-md rounded-3xl overflow-hidden shadow-sm border border-border hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="relative overflow-hidden h-56">
                  <div
                    className={`absolute top-4 left-4 z-10 ${article.color} bg-background/90 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}
                  >
                    {article.category}
                  </div>
                  <img
                    src={article.img}
                    alt={article.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-serif font-bold text-xl mb-3">{article.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {article.desc}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {/* Load Trigger */}
          <div ref={loadTriggerRef} className="flex justify-center mt-12 h-20">
            {isLoadingMore && (
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
        </div>
      </section>

      {/* Experts / Medical Board */}
      <section className="py-24 relative bg-muted/30" id="experts">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold mb-12">
            Backed by <span className="italic text-primary">top cardiologists.</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              {
                name: "Dr. Arun Gupta",
                role: "Cardiologist, AIIMS",
                img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80",
              },
              {
                name: "Dr. Meera Rao",
                role: "Diabetologist",
                img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80",
              },
              {
                name: "Dr. Sanjay K.",
                role: "General Physician",
                img: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80",
              },
            ].map((expert, i) => (
              <div
                key={i}
                className="group bg-card/60 backdrop-blur-md p-6 rounded-3xl border border-border w-64 hover:-translate-y-2 transition-transform"
              >
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-4 border-2 border-primary/20">
                  <img src={expert.img} alt={expert.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <h3 className="font-bold font-serif text-lg">{expert.name}</h3>
                <p className="text-xs text-foreground font-bold uppercase tracking-wider mb-2">{expert.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-muted/30 to-background" id="testimonials">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 md:mb-6">
              Real stories from <span className="italic text-primary">real families</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Over 50,000 families trust Beat to keep their hearts healthy
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              { name: "Priya Sharma", role: "Daughter tracking her father's health", quote: "My dad's BP dropped from 160/100 to 130/85 in just 2 months. The family dashboard lets me check on him daily from Bangalore while he's in Delhi.", avatar: "PS", rating: 5 },
              { name: "Rajesh Kumar", role: "Type 2 Diabetes Patient", quote: "I finally understand my sugar patterns. Beat showed me that my post-lunch readings spike from rice. Switched to roti and my HeartScore went from 65 to 82.", avatar: "RK", rating: 5 },
              { name: "Dr. Meera Patel", role: "General Physician", quote: "I recommend Beat to all my patients over 40. The PDF reports they bring to consultations are more useful than any blood test. I can see behavioral patterns, not just numbers.", avatar: "MP", rating: 5 }
            ].map((testimonial, i) => (
              <div key={i} className="bg-card rounded-2xl md:rounded-3xl border border-border p-5 md:p-8 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl">
                <div className="flex gap-1 mb-3 md:mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed mb-5 md:mb-6 italic text-sm md:text-base">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm md:text-base">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-sm md:text-base">{testimonial.name}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-32 bg-background" id="pricing">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 md:mb-6">
              Start free. <span className="italic text-primary">Upgrade anytime.</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Core features are free forever. No credit card required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-muted rounded-2xl md:rounded-3xl border-2 border-border p-5 md:p-8">
              <div className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Free Forever</div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">Beat Free</h3>
              <div className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">₹0<span className="text-base md:text-lg font-normal text-muted-foreground">/month</span></div>
              
              <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                {["Daily BP & Sugar logging", "Basic HeartScore", "Morning & Evening rituals", "Streak tracking", "Medication reminders", "Basic insights"].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 md:gap-3">
                    <Check className="w-4 h-4 md:w-5 md:h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs md:text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" size="lg" onClick={() => navigate("/auth")} className="w-full rounded-full h-10 md:h-12 text-sm">Start Free</Button>
            </div>

            {/* Basic Plan */}
            <div className="bg-card rounded-2xl md:rounded-3xl border-2 border-secondary/50 p-5 md:p-8 shadow-lg">
              <div className="text-xs md:text-sm font-bold text-foreground uppercase tracking-wider mb-2">Starter</div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">Beat Basic</h3>
              <div className="text-3xl md:text-4xl font-bold mb-1">₹99<span className="text-base md:text-lg font-normal text-muted-foreground">/month</span></div>
              <div className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">Billed monthly</div>
              
              <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                {["Everything in Free, plus:", "Family dashboard access", "Weekly health summaries", "Goal tracking & progress", "Advanced trend charts", "Export health data"].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 md:gap-3">
                    {i === 0 ? <span className="text-xs md:text-sm font-semibold text-foreground">{feature}</span> : <><Check className="w-4 h-4 md:w-5 md:h-5 text-secondary mt-0.5 flex-shrink-0" /><span className="text-xs md:text-sm text-muted-foreground">{feature}</span></>}
                  </li>
                ))}
              </ul>
              <Button variant="secondary" size="lg" onClick={() => navigate("/auth")} className="w-full rounded-full h-10 md:h-12 text-sm">Get Basic</Button>
            </div>

            {/* Premium Plan */}
            <div className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 rounded-2xl md:rounded-3xl border-2 border-primary p-5 md:p-8 shadow-2xl">
              <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] md:text-xs font-bold px-3 md:px-4 py-1 rounded-full">MOST POPULAR</div>
              
              <div className="text-xs md:text-sm font-bold text-primary uppercase tracking-wider mb-2 mt-1">Premium</div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">Beat Coach</h3>
              <div className="text-3xl md:text-4xl font-bold mb-1">₹199<span className="text-base md:text-lg font-normal text-muted-foreground">/month</span></div>
              <div className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">7-day free trial • Cancel anytime</div>
              
              <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                {["Everything in Basic, plus:", "AI Beat Health Coach", "Advanced correlation insights", "PDF reports for doctors", "WhatsApp health summaries", "Priority family nudges", "Teleconsult discounts", "Priority support"].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 md:gap-3">
                    {i === 0 ? <span className="text-xs md:text-sm font-semibold text-foreground">{feature}</span> : <><Check className="w-4 h-4 md:w-5 md:h-5 text-primary mt-0.5 flex-shrink-0" /><span className="text-xs md:text-sm text-muted-foreground">{feature}</span></>}
                  </li>
                ))}
              </ul>
              <Button size="lg" onClick={() => navigate("/auth")} className="w-full rounded-full h-10 md:h-12 text-sm">Start Free Trial <ArrowRight className="ml-2 w-4 h-4" /></Button>
            </div>
          </div>

          <div className="text-center mt-8 md:mt-12 text-xs md:text-sm text-muted-foreground">
            <Shield className="w-4 h-4 md:w-5 md:h-5 inline mr-2" />
            30-day money-back guarantee • Secure payments via Razorpay
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-24 bg-muted/30" id="faq">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-serif font-bold text-center mb-12">
            Got questions? <span className="italic text-primary">We've got answers.</span>
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border bg-card rounded-2xl px-6 border-border">
              <AccordionTrigger className="hover:no-underline font-semibold text-left">
                What is HeartScore and how is it calculated?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                HeartScore is a proprietary algorithm that combines your blood pressure readings (30%), sugar levels (30%), lifestyle habits like sleep and activity (30%), and consistency of logging (10%) into a single score from 0-100. It's like a credit score for your cardiovascular health—higher is better. The algorithm adapts to your personal baseline over time.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border bg-card rounded-2xl px-6 border-border">
              <AccordionTrigger className="hover:no-underline font-semibold text-left">
                Is my health data secure and private?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Absolutely. We use bank-grade 256-bit AES encryption. Your health data is stored locally on your device and synced to encrypted cloud storage. We're HIPAA and DPDP (India) compliant. We never sell your data to third parties. You can export or delete your data anytime from Settings.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border bg-card rounded-2xl px-6 border-border">
              <AccordionTrigger className="hover:no-underline font-semibold text-left">
                Do I need a smartwatch or special devices?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                No! While Beat integrates with popular devices (Omron BP monitors, Apple Health, Google Fit, Fitbit), you can manually enter all readings. Most users start with manual entry and add device sync later. The app is designed for ease of use—manual logging takes under 30 seconds.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border bg-card rounded-2xl px-6 border-border">
              <AccordionTrigger className="hover:no-underline font-semibold text-left">
                Can family members see my health data?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Only if you grant them permission. The Family Dashboard lets you invite caregivers with granular permissions: view-only access, nudge/reminder privileges, or full edit access. You control who sees what, and you can revoke access anytime. Perfect for children monitoring aging parents remotely.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border bg-card rounded-2xl px-6 border-border">
              <AccordionTrigger className="hover:no-underline font-semibold text-left">
                What are the pricing tiers?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Beat offers 3 tiers: <strong>Free</strong> (₹0) includes BP/sugar logging, basic HeartScore, rituals, and medication reminders. <strong>Basic</strong> (₹99/month) adds family dashboard, weekly summaries, and goal tracking. <strong>Premium</strong> (₹199/month) includes everything plus AI Beat health coach, PDF reports for doctors, WhatsApp summaries, teleconsult discounts, and priority support. Start free—upgrade anytime.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border bg-card rounded-2xl px-6 border-border">
              <AccordionTrigger className="hover:no-underline font-semibold text-left">
                Does Beat work offline?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Yes! Beat is a Progressive Web App (PWA) that caches your last 7 days of data locally. You can view past readings, logs, and HeartScores without internet. New entries are queued and synced automatically when you reconnect. Perfect for users with intermittent connectivity.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="border bg-card rounded-2xl px-6 border-border">
              <AccordionTrigger className="hover:no-underline font-semibold text-left">
                Who should use Beat?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Beat is designed for Indian adults aged 40-70 managing hypertension, diabetes, or cardiovascular risk. It's also perfect for family caregivers monitoring aging parents, and for anyone wanting to prevent heart disease through daily habit tracking. If you check your BP or sugar regularly, Beat is for you.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="border bg-card rounded-2xl px-6 border-border">
              <AccordionTrigger className="hover:no-underline font-semibold text-left">
                How is Beat different from other health apps?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Unlike generic trackers, Beat is India-first: bilingual (English/Hindi), designed for Indian family dynamics, integrates with WhatsApp for daily nudges, and optimized for senior citizens with large buttons and simple rituals. The proprietary HeartScore algorithm turns complex data into one actionable number. Plus, it's free to start with no credit card required.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.4),black)]"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tighter">
            Your health, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">
              mastered.
            </span>
          </h2>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
            Join 50,000+ families. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-slate-200 h-14 px-8 text-lg rounded-full"
              onClick={() => navigate("/auth")}
            >
              Get the App
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#030712] border-t border-white/5 pt-16 pb-8 text-slate-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <Logo size="sm" showText={true} className="mb-4" />
              <p className="text-sm text-slate-400 leading-relaxed">
                Keep your beat strong. Daily heart and metabolic health tracking for Indian families.
              </p>
            </div>
            
            <div>
              <p className="font-bold text-white mb-4">Product</p>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-primary transition-colors" onClick={(e) => { e.preventDefault(); document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' }); }}>Features</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors" onClick={(e) => { e.preventDefault(); document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' }); }}>Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-primary transition-colors" onClick={(e) => { e.preventDefault(); document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}>How It Works</a></li>
                <li><button onClick={() => navigate("/app/coach")} className="hover:text-primary transition-colors text-left">Beat AI Coach</button></li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-white mb-4">Company</p>
              <ul className="space-y-2 text-sm">
                <li><a href="#testimonials" className="hover:text-primary transition-colors" onClick={(e) => { e.preventDefault(); document.querySelector('#testimonials')?.scrollIntoView({ behavior: 'smooth' }); }}>Testimonials</a></li>
                <li><a href="#experts" className="hover:text-primary transition-colors" onClick={(e) => { e.preventDefault(); document.querySelector('#experts')?.scrollIntoView({ behavior: 'smooth' }); }}>Medical Board</a></li>
                <li><a href="#faq" className="hover:text-primary transition-colors" onClick={(e) => { e.preventDefault(); document.querySelector('#faq')?.scrollIntoView({ behavior: 'smooth' }); }}>FAQ</a></li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-white mb-4">Get Started</p>
              <Button onClick={() => navigate("/auth")} className="w-full mb-4">
                Download Free
              </Button>
              <div className="flex gap-2 text-xs text-slate-400">
                <Phone className="w-4 h-4" />
                <span>Available on iOS & Android</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <span>&copy; 2024 Beat Health Inc. All rights reserved.</span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span>Built by <a href="https://bwestudios.com" target="_blank" rel="noopener noreferrer" className="font-bold text-white hover:text-primary transition-colors">BWE Studio</a></span>
            </div>
            <div className="flex gap-6">
              <button onClick={() => navigate("/about")} className="hover:text-primary transition-colors">About</button>
              <button onClick={() => navigate("/privacy")} className="hover:text-primary transition-colors">Privacy Policy</button>
              <button onClick={() => navigate("/terms")} className="hover:text-primary transition-colors">Terms of Service</button>
              <button onClick={() => navigate("/contact")} className="hover:text-primary transition-colors">Contact</button>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .spotlight-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.06), transparent 40%);
          z-index: 1;
          opacity: 0;
          transition: opacity 0.5s;
          pointer-events: none;
        }
        .spotlight-card:hover::before {
          opacity: 1;
        }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(30px, 10px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 20s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  );
};

export default Landing;