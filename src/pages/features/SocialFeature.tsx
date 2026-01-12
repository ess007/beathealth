import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, UserCheck, Heart, MessageCircle, Users, Activity, Sun, Check, TrendingUp } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

const SocialFeature = () => {
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
          
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center mx-auto mb-8">
            <UserCheck className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Social Wellness: Stay <span className="text-primary">Connected</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Loneliness is as harmful to health as smoking 15 cigarettes a day. Beat helps you stay connected with loved ones and tracks your social wellbeing.
          </p>
          
          <Button size="lg" onClick={() => navigate("/auth")} className="rounded-full h-12 px-8">
            Start Tracking Wellness <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why Social Wellness Matters</h2>
          
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-card rounded-2xl border border-border p-6">
              <p className="text-4xl font-bold text-primary mb-2">45%</p>
              <p className="text-sm text-muted-foreground">Of seniors in India report feeling lonely regularly</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6">
              <p className="text-4xl font-bold text-primary mb-2">29%</p>
              <p className="text-sm text-muted-foreground">Higher mortality risk from chronic loneliness</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6">
              <p className="text-4xl font-bold text-primary mb-2">2x</p>
              <p className="text-sm text-muted-foreground">Risk of heart disease with social isolation</p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Track */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">What Beat Tracks</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Users, title: "Social Interactions", desc: "How many meaningful conversations you have each day", color: "from-blue-500 to-cyan-500" },
              { icon: Sun, title: "Going Outside", desc: "Whether you left home today—fresh air matters", color: "from-orange-500 to-yellow-500" },
              { icon: Heart, title: "Mood Score", desc: "Daily emotional check-in to track wellbeing", color: "from-rose-500 to-pink-500" },
              { icon: MessageCircle, title: "Connection Types", desc: "Family calls, friend visits, community events", color: "from-purple-500 to-violet-500" },
              { icon: Activity, title: "Loneliness Patterns", desc: "Identifying days when you feel most isolated", color: "from-emerald-500 to-teal-500" },
              { icon: TrendingUp, title: "Weekly Trends", desc: "See how your social wellness changes over time", color: "from-indigo-500 to-blue-500" },
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

      {/* Interventions */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How Beat Helps</h2>
          
          <div className="space-y-6">
            {[
              { trigger: "3+ days of low social scores", action: "Gentle suggestion to call a family member or take a walk" },
              { trigger: "Week of isolation detected", action: "Alert sent to designated caregiver (with your permission)" },
              { trigger: "Consistently indoors", action: "Weather-appropriate activity suggestions" },
              { trigger: "Low mood detected", action: "Recommend local community events or support groups" },
              { trigger: "High loneliness scores", action: "Increased check-in frequency from Beat's AI coach" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 bg-card rounded-xl border border-border p-6">
                <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-violet-500 font-bold">{i + 1}</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">When: {item.trigger}</h3>
                  <p className="text-sm text-muted-foreground">Then: {item.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Activities */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Suggested Activities</h2>
          
          <p className="text-center text-muted-foreground mb-8">
            Based on your health conditions, weather, and preferences, Beat suggests activities to boost your social wellness.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "Morning walk with a neighbor",
              "Video call with grandchildren",
              "Visit to local temple or community center",
              "Tea with a friend",
              "Join a laughter yoga group",
              "Attend a health talk at the hospital",
              "Play cards with family",
              "Garden or balcony time with spouse",
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-3 bg-card rounded-xl border border-border p-4">
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="font-medium">{activity}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Family Integration */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <Users className="w-12 h-12 text-violet-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-4">For Family Caregivers</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              The Family Dashboard shows your parent's social wellness trends. See if they've been going outside, 
              talking to people, and staying emotionally healthy. Get notified if they seem isolated so you can 
              reach out with a simple phone call.
            </p>
            <Button variant="outline" onClick={() => navigate("/features/family")} className="rounded-full">
              Learn about Family Dashboard <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Connection is Medicine</h2>
          <p className="text-lg opacity-90 mb-8">Start tracking your social wellness today. It's free.</p>
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

export default SocialFeature;
