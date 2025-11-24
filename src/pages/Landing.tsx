import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, CheckCircle2, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useNavigate } from "react-router-dom";

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

  // Simulated Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoadingMore) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setArticles((prev) => [
            ...prev,
            {
              title: "Walking: Speed vs Distance",
              category: "Fitness",
              color: "text-blue-500",
              img: "https://images.unsplash.com/photo-1552674605-46d536d2348c?auto=format&fit=crop&w=500&q=80",
              desc: "Should you walk faster or longer? New research reveals the ideal pace.",
            },
            {
              title: "Sleep Debt & Monday Spikes",
              category: "Sleep",
              color: "text-indigo-500",
              img: "https://images.unsplash.com/photo-1541781777621-af13b2caa5e3?auto=format&fit=crop&w=500&q=80",
              desc: "Why catching up on sleep on weekends might actually hurt your heart.",
            },
            {
              title: "White Coat Syndrome",
              category: "Medical",
              color: "text-rose-500",
              img: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&w=500&q=80",
              desc: "High BP only at the doctor? It might be anxiety, but it's still risky.",
            },
          ]);
          setIsLoadingMore(false);
        }, 1500);
      }
    });

    if (loadTriggerRef.current) {
      observer.observe(loadTriggerRef.current);
    }

    return () => observer.disconnect();
  }, [isLoadingMore]);

  return (
    <div className="min-h-screen bg-[#FDF2F4] dark:bg-[#030712] text-slate-900 dark:text-slate-100 transition-colors duration-500 font-sans selection:bg-rose-500 selection:text-white">
      {/* Noise Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Dynamic Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-rose-400/30 dark:bg-rose-600/20 rounded-full blur-[100px] animate-blob mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] bg-orange-300/30 dark:bg-orange-600/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] bg-pink-300/30 dark:bg-pink-900/20 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed w-full z-40 top-0 border-b border-transparent transition-all duration-300 bg-white/70 dark:bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
              <div className="relative w-9 h-9 flex items-center justify-center">
                <div className="absolute inset-0 bg-[#E11D48] rounded-xl transform rotate-3 group-hover:rotate-6 transition-transform"></div>
                <span className="relative text-white font-bold text-lg italic font-serif">B</span>
              </div>
              <span className="font-bold text-xl tracking-tight">Beat</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1 p-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-full border border-white/20 dark:border-white/10 shadow-sm">
              {["Features", "Method", "Stories"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="px-5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#E11D48] dark:hover:text-white transition-colors rounded-full hover:bg-white/50 dark:hover:bg-white/5"
                >
                  {item}
                </a>
              ))}
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>

              <Button
                onClick={() => navigate("/auth")}
                className="group relative px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold rounded-full overflow-hidden"
              >
                <span className="relative z-10 group-hover:text-rose-200 dark:group-hover:text-rose-600 transition-colors">
                  Get Started
                </span>
                <div className="absolute inset-0 bg-[#E11D48] dark:bg-rose-100 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-slate-800 dark:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-20 left-0 w-full bg-white/95 dark:bg-[#0B101B]/95 backdrop-blur-md p-6 md:hidden shadow-xl border-t border-slate-200 dark:border-slate-800 flex flex-col gap-4">
            {["Features", "Method", "Stories"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <Button onClick={() => navigate("/auth")} className="w-full bg-[#E11D48] text-white">
              Get Started
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
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-md text-xs font-semibold mb-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span className="text-slate-700 dark:text-slate-300">The #1 Heart App in India</span>
              </div>

              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tighter text-slate-900 dark:text-white leading-[1] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                Your heart <br />
                <span className="font-serif italic font-light bg-clip-text text-transparent bg-gradient-to-r from-[#E11D48] to-[#F97316] dark:from-[#FB7185] dark:to-[#FDA4AF] pr-4">
                  deserves clarity.
                </span>
              </h1>

              <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 font-light animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                Stop guessing. We turn your blood pressure, sugar, and habits into a single, daily{" "}
                <strong className="text-slate-900 dark:text-white font-semibold">HeartScore™</strong>. It's health,
                decoded.
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="h-14 rounded-full px-8 text-base bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
                >
                  Download Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="ghost" size="lg" className="h-14 rounded-full px-8 text-base" asChild>
                  <a href="#how-it-works">How it works</a>
                </Button>
              </div>
            </div>

            {/* 3D Interactive Card */}
            <div
              className="flex-1 relative w-full flex justify-center lg:justify-end"
              ref={tiltContainerRef}
              style={{ perspective: "1000px" }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-rose-500/20 to-orange-500/20 rounded-full blur-[100px] -z-10"></div>

              <div
                id="hero-card"
                ref={heroCardRef}
                className="relative w-[340px] bg-white dark:bg-[#0B101B] rounded-[3rem] shadow-2xl border border-white/50 dark:border-white/10 p-2 z-20 select-none cursor-default transition-transform duration-100 ease-out"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="h-8 flex justify-center items-start mb-2 px-6 pt-3">
                  <div className="w-20 h-5 bg-black rounded-full absolute top-3"></div>
                </div>

                <div className="bg-slate-50 dark:bg-[#151b2b] rounded-[2.5rem] h-[640px] overflow-hidden relative border border-slate-100 dark:border-white/5 flex flex-col">
                  <div className="p-6 pt-8 pb-10 bg-white dark:bg-[#1A2030] rounded-b-[2.5rem] shadow-sm z-10">
                    <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">
                          RK
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                            Good Morning
                          </div>
                          <div className="text-sm font-bold text-slate-800 dark:text-white">Ravi Kumar</div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center relative">
                      <div className="text-5xl font-bold text-slate-900 dark:text-white tracking-tighter mb-1">87</div>
                      <div className="text-xs text-rose-500 font-bold bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-full inline-block">
                        Excellent
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="bg-white dark:bg-[#1A2030] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 text-xl">
                        🫀
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-slate-400 font-medium">Blood Pressure</div>
                        <div className="text-base font-bold text-slate-800 dark:text-white">118/78</div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-[#1A2030] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 text-xl">
                        🩸
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-slate-400 font-medium">Sugar (Fasting)</div>
                        <div className="text-base font-bold text-slate-800 dark:text-white">92 mg/dL</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -right-8 top-1/4 bg-white/80 dark:bg-[#1A2030]/80 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce z-30 border border-white/20">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-700 dark:text-white">BP Normalized</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="py-10 border-y border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/30 overflow-hidden">
        <div className="relative w-full overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#FDF2F4] dark:from-[#030712] to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#FDF2F4] dark:from-[#030712] to-transparent z-10"></div>
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
              <span key={i} className="text-xl font-bold text-slate-400 dark:text-slate-600 opacity-70">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid with Spotlight */}
      <section className="py-32 relative" id="features">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Designed for <span className="font-serif italic text-rose-500">real life.</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl">
              Traditional medical apps are ugly and confusing. Beat is built to be used before your morning chai, in
              less than 30 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]" id="features-grid">
            <div className="spotlight-card md:col-span-2 group relative bg-white dark:bg-[#0B101B] rounded-[2rem] border border-slate-200 dark:border-white/5 p-8 flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/10 transition-colors overflow-hidden">
              {/* Spotlight overlay handled by CSS/JS */}
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 mb-6">
                  <CheckCircle2 />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">The HeartScore™ Algorithm</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                  We process 50+ biomarkers into a single, understandable score from 0-100. It's like a credit score for
                  your body.
                </p>
              </div>
            </div>

            <div className="spotlight-card md:col-span-1 relative bg-slate-900 dark:bg-[#151b2b] rounded-[2rem] p-8 flex flex-col justify-between overflow-hidden text-white">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Family Dashboard</h3>
                <p className="text-slate-400 text-sm">Monitor parents remotely. Get alerts for sudden spikes.</p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[60px] opacity-20"></div>
            </div>

            <div className="spotlight-card md:col-span-1 relative bg-white dark:bg-[#0B101B] rounded-[2rem] border border-slate-200 dark:border-white/5 p-8 flex flex-col justify-end hover:border-slate-300 dark:hover:border-white/10 transition-colors">
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Smart Insights</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  "Your BP is usually higher on Mondays." We find patterns you miss.
                </p>
              </div>
            </div>

            <div className="spotlight-card md:col-span-2 relative bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/30 rounded-[2rem] border border-slate-200 dark:border-white/5 p-8 flex items-center hover:border-rose-200 dark:hover:border-rose-900/50 transition-colors">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Connects with everything</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Omron, Apple Health, Google Fit, AccuChek. We sync with your existing devices instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Health Hub / Infinite Feed */}
      <section className="py-24 relative" id="health-feed">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Health Hub</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Latest tips for a stronger heart.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {articles.map((article, i) => (
              <article
                key={i}
                className="group bg-white dark:bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-white/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="relative overflow-hidden h-56">
                  <div
                    className={`absolute top-4 left-4 z-10 ${article.color} bg-white/90 dark:bg-black/80 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}
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
                  <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white mb-3">{article.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {article.desc}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {/* Load Trigger */}
          <div ref={loadTriggerRef} className="flex justify-center mt-12 h-20">
            {isLoadingMore && (
              <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
        </div>
      </section>

      {/* Experts / Medical Board */}
      <section className="py-24 relative" id="experts">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12">
            Backed by <span className="font-serif italic text-rose-500">top cardiologists.</span>
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
                className="group bg-white/60 dark:bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-slate-200 dark:border-white/10 w-64 hover:-translate-y-2 transition-transform"
              >
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-4 border-2 border-rose-100 dark:border-rose-900/50">
                  <img src={expert.img} alt={expert.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <h3 className="font-bold font-serif text-lg text-slate-900 dark:text-white">{expert.name}</h3>
                <p className="text-xs text-rose-500 font-bold uppercase tracking-wider mb-2">{expert.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-24 bg-white/50 dark:bg-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border bg-white dark:bg-[#0B101B] rounded-2xl px-4">
              <AccordionTrigger className="hover:no-underline font-semibold">
                Is my health data secure?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-400">
                Yes. We use bank-grade 256-bit encryption. Your health data is stored locally on your device and
                encrypted in the cloud. We are HIPAA and GDPR compliant.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border bg-white dark:bg-[#0B101B] rounded-2xl px-4">
              <AccordionTrigger className="hover:no-underline font-semibold">Do I need a smartwatch?</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-400">
                No! While we sync with Apple Watch and other devices, you can manually enter your BP and sugar readings
                using our simple input interface.
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
      <footer className="bg-[#030712] border-t border-white/5 pt-16 pb-8 text-slate-400">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-white">Beat</span>
          </div>
          <div className="text-sm">&copy; 2024 Beat Health Inc.</div>
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
      `}</style>
    </div>
  );
};

export default Landing;
