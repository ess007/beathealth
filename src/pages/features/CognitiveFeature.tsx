import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Brain, Clock, TrendingUp, AlertTriangle, Shield, Check, Activity } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

const CognitiveFeature = () => {
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
          
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-8">
            <Brain className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Cognitive Monitoring: Catch Changes <span className="text-primary">Early</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Early detection of cognitive changes can make a huge difference. Beat's gentle brain health checks help identify patterns before they become problems.
          </p>
          
          <Button size="lg" onClick={() => navigate("/auth")} className="rounded-full h-12 px-8">
            Start Brain Health Tracking <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why Cognitive Monitoring Matters</h2>
          
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-card rounded-2xl border border-border p-6">
              <p className="text-4xl font-bold text-primary mb-2">5.8M</p>
              <p className="text-sm text-muted-foreground">Indians live with dementia, expected to triple by 2050</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6">
              <p className="text-4xl font-bold text-primary mb-2">70%</p>
              <p className="text-sm text-muted-foreground">Of dementia cases go undiagnosed in India</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6">
              <p className="text-4xl font-bold text-primary mb-2">10 yrs</p>
              <p className="text-sm text-muted-foreground">Early detection can add quality years to life</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Two Types of Monitoring</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-2xl border border-border p-8">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Passive Monitoring</h3>
              <p className="text-muted-foreground mb-4">
                Beat quietly observes patterns in how you use the app, without any extra effort from you.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Time to complete check-ins</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Navigation patterns</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Typing speed changes</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Consistency of routines</li>
              </ul>
            </div>
            
            <div className="bg-card rounded-2xl border border-border p-8">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Active Assessments</h3>
              <p className="text-muted-foreground mb-4">
                Optional weekly brain health games that take just 2-3 minutes.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Word recall tests</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Pattern matching</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Simple arithmetic</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Clock drawing analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">What You Get</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, title: "Trend Tracking", desc: "See how your cognitive scores change over weeks and months", color: "from-emerald-500 to-teal-500" },
              { icon: AlertTriangle, title: "Early Alerts", desc: "Family caregivers notified if consistent decline is detected", color: "from-orange-500 to-rose-500" },
              { icon: Shield, title: "Privacy First", desc: "Your cognitive data is encrypted and only shared with your permission", color: "from-violet-500 to-indigo-500" },
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

      {/* Risk Levels */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Understanding Results</h2>
          
          <div className="space-y-4">
            {[
              { level: "Normal", color: "bg-emerald-500", desc: "Your cognitive patterns are within expected range. Keep doing what you're doing!" },
              { level: "Mild Concern", color: "bg-yellow-500", desc: "Some patterns warrant attention. We recommend trying brain exercises more regularly." },
              { level: "Moderate Concern", color: "bg-orange-500", desc: "Consider discussing with your doctor at your next visit. This is not a diagnosis." },
              { level: "Recommend Evaluation", color: "bg-red-500", desc: "We strongly suggest scheduling a professional cognitive assessment with your doctor." },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-card rounded-xl border border-border p-4">
                <div className={`w-4 h-4 rounded-full ${item.color} flex-shrink-0`} />
                <div>
                  <h3 className="font-semibold">{item.level}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6">
            <h3 className="font-semibold text-purple-600 mb-3">Important Information</h3>
            <p className="text-sm text-muted-foreground">
              Beat's cognitive monitoring is a screening tool only and is not intended to diagnose any medical condition including dementia, Alzheimer's disease, or any other cognitive impairment. 
              Only qualified healthcare professionals can make clinical diagnoses. If you have concerns about your cognitive health, please consult a neurologist or geriatric specialist. 
              This tool is meant to encourage early professional evaluation, not replace it.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Your Brain Health Matters</h2>
          <p className="text-lg opacity-90 mb-8">Start tracking today. Knowledge is power.</p>
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

export default CognitiveFeature;
