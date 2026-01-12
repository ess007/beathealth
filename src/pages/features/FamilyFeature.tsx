import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Users, Bell, Eye, Shield, Heart, MessageCircle, Check } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

const FamilyFeature = () => {
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
          
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-8">
            <Users className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Family Dashboard: Care for Parents <span className="text-primary">From Anywhere</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Living in Bangalore while your parents are in Delhi? Beat's Family Dashboard lets you monitor their health, get alerts, and send gentle nudges—all from your phone.
          </p>
          
          <Button size="lg" onClick={() => navigate("/auth")} className="rounded-full h-12 px-8">
            Connect Your Family <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need to Stay Connected</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Eye, title: "Real-time Monitoring", desc: "See your parent's BP, sugar, and HeartScore updated in real-time", color: "from-blue-500 to-cyan-500" },
              { icon: Bell, title: "Smart Alerts", desc: "Get notified immediately when readings are concerning", color: "from-orange-500 to-rose-500" },
              { icon: MessageCircle, title: "Gentle Nudges", desc: "Send reminder nudges for medications or check-ins", color: "from-purple-500 to-pink-500" },
              { icon: Heart, title: "HeartScore Tracking", desc: "Monitor their daily HeartScore trends over time", color: "from-rose-500 to-pink-500" },
              { icon: Shield, title: "Privacy Controls", desc: "They control exactly what you can see", color: "from-emerald-500 to-teal-500" },
              { icon: Users, title: "Multiple Members", desc: "Add up to 5 family members on the Family plan", color: "from-violet-500 to-indigo-500" },
            ].map((item, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How to Get Started</h2>
          
          <div className="space-y-6">
            {[
              { step: "1", title: "Your parent downloads Beat", desc: "They create their account and start logging their health data" },
              { step: "2", title: "They invite you as a caregiver", desc: "With one tap, they can add you to their family circle" },
              { step: "3", title: "You receive family access", desc: "Now you can see their dashboard and get alerts" },
              { step: "4", title: "Stay connected daily", desc: "Send nudges, celebrate streaks, and stay in the loop" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 bg-card rounded-xl border border-border p-6">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why Families Love Beat</h2>
          
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              "No more daily calls asking 'Did you take your medicine?'",
              "Instant alerts if BP or sugar spikes",
              "See patterns you'd never notice from calls",
              "Share PDF reports with their doctor",
              "Works even with limited tech skills",
              "Reduces anxiety for everyone",
              "Celebrate health wins together",
              "Hindi language support for parents",
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
          <h2 className="text-3xl font-bold mb-6">Stop Worrying. Start Knowing.</h2>
          <p className="text-lg opacity-90 mb-8">Join 50,000+ families caring for loved ones with Beat.</p>
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

export default FamilyFeature;
