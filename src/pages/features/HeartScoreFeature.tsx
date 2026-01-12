import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Heart, Activity, Droplets, Calendar, Brain, Users, TrendingUp, Check } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

const HeartScoreFeature = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed w-full z-40 top-0 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size="sm" showText={true} />
          </Link>
          <Button onClick={() => navigate("/auth")} className="rounded-full">
            Get Started <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 lg:pt-36 lg:pb-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-8">
            <Heart className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            HeartScore™: Your Health in <span className="text-primary">One Number</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Stop drowning in confusing health data. HeartScore combines your BP, sugar, habits, and more into a single 0-100 score that tells you exactly how you're doing.
          </p>
          
          <Button size="lg" onClick={() => navigate("/auth")} className="rounded-full h-12 px-8">
            Calculate Your HeartScore <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How HeartScore Works</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Activity, title: "Blood Pressure (25%)", desc: "Your systolic and diastolic readings throughout the day", color: "text-rose-500" },
              { icon: Droplets, title: "Blood Sugar (25%)", desc: "Fasting and random glucose levels", color: "text-purple-500" },
              { icon: Calendar, title: "Daily Rituals (20%)", desc: "Completing morning and evening check-ins", color: "text-blue-500" },
              { icon: Users, title: "Social Wellness (15%)", desc: "Social interactions and emotional wellbeing", color: "text-emerald-500" },
              { icon: TrendingUp, title: "Environment (10%)", desc: "Air quality and temperature factors", color: "text-orange-500" },
              { icon: Brain, title: "Cognitive Health (5%)", desc: "Brain health assessments and patterns", color: "text-violet-500" },
            ].map((item, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-6">
                <item.icon className={`w-8 h-8 ${item.color} mb-4`} />
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Score Ranges */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Understanding Your Score</h2>
          
          <div className="space-y-4">
            {[
              { range: "80-100", label: "Excellent", color: "bg-emerald-500", desc: "Your heart health is in great shape! Keep doing what you're doing." },
              { range: "70-79", label: "Good", color: "bg-green-500", desc: "You're on the right track. Small improvements can push you to excellent." },
              { range: "60-69", label: "Fair", color: "bg-yellow-500", desc: "There's room for improvement. Focus on consistency and lifestyle changes." },
              { range: "50-59", label: "Needs Work", color: "bg-orange-500", desc: "Pay attention to your readings. Consider consulting your doctor." },
              { range: "0-49", label: "Critical", color: "bg-red-500", desc: "Please consult a healthcare provider. Your readings need attention." },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-card rounded-xl border border-border p-4">
                <div className={`w-16 h-16 rounded-xl ${item.color} flex items-center justify-center text-white font-bold`}>
                  {item.range.split("-")[0]}+
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.label} ({item.range})</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">What Makes HeartScore Special</h2>
          
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              "AI-powered personalized insights",
              "Updates in real-time as you log",
              "Historical trend tracking",
              "Shareable PDF reports for doctors",
              "Family dashboard visibility",
              "Hindi language support",
              "Offline capable",
              "No medical jargon",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 bg-card rounded-xl border border-border p-4">
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Know Your HeartScore?</h2>
          <p className="text-lg opacity-90 mb-8">Free to start. No credit card needed.</p>
          <Button size="lg" variant="secondary" className="rounded-full h-12 px-8" onClick={() => navigate("/auth")}>
            Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <Logo size="sm" showText={true} />
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-primary">Privacy</Link>
            <Link to="/terms" className="hover:text-primary">Terms</Link>
            <Link to="/contact" className="hover:text-primary">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default HeartScoreFeature;
