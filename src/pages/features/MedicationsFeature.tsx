import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Pill, AlertTriangle, Clock, Bell, Shield, Check, FileText } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

const MedicationsFeature = () => {
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
          
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-8">
            <Pill className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Drug Safety: Prevent Dangerous <span className="text-primary">Interactions</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Taking multiple medications? Beat checks for 500+ known drug interactions and alerts you before they can harm you. Your safety net for polypharmacy.
          </p>
          
          <Button size="lg" onClick={() => navigate("/auth")} className="rounded-full h-12 px-8">
            Check Your Medications <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why Drug Interactions Matter</h2>
          
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-card rounded-2xl border border-border p-6">
              <p className="text-4xl font-bold text-primary mb-2">1.5M</p>
              <p className="text-sm text-muted-foreground">Indians hospitalized yearly due to adverse drug interactions</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6">
              <p className="text-4xl font-bold text-primary mb-2">67%</p>
              <p className="text-sm text-muted-foreground">Of adults 65+ take 5 or more medications daily</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6">
              <p className="text-4xl font-bold text-primary mb-2">80%</p>
              <p className="text-sm text-muted-foreground">Of interactions are preventable with proper screening</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How Beat Keeps You Safe</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: AlertTriangle, title: "Interaction Alerts", desc: "Instant warnings when you add a medication that conflicts with your current prescriptions", color: "from-red-500 to-orange-500" },
              { icon: Shield, title: "Severity Levels", desc: "Color-coded alerts: Major (red), Moderate (yellow), Minor (blue) interactions", color: "from-emerald-500 to-teal-500" },
              { icon: Clock, title: "Timing Recommendations", desc: "Suggestions for optimal medication timing to minimize interactions", color: "from-blue-500 to-cyan-500" },
              { icon: Bell, title: "Smart Reminders", desc: "Customizable reminders for each medication at the right time", color: "from-purple-500 to-pink-500" },
              { icon: FileText, title: "PDF Reports", desc: "Generate comprehensive medication lists to share with your doctor", color: "from-orange-500 to-rose-500" },
              { icon: Pill, title: "500+ Medications", desc: "Extensive database covering common Indian medications and generics", color: "from-violet-500 to-indigo-500" },
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

      {/* Common Interactions */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Common Interactions We Catch</h2>
          
          <div className="space-y-4">
            {[
              { drugs: "Amlodipine + Simvastatin", severity: "Major", desc: "High-dose simvastatin with amlodipine increases risk of muscle damage" },
              { drugs: "Metformin + Alcohol", severity: "Major", desc: "Can cause dangerous lactic acidosis and low blood sugar" },
              { drugs: "Aspirin + Blood Thinners", severity: "Major", desc: "Significantly increases bleeding risk" },
              { drugs: "Losartan + Potassium", severity: "Moderate", desc: "May cause dangerously high potassium levels" },
              { drugs: "Atenolol + Diabetes Meds", severity: "Moderate", desc: "Can mask symptoms of low blood sugar" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-card rounded-xl border border-border p-4">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${item.severity === "Major" ? "bg-red-500" : "bg-yellow-500"}`} />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{item.drugs}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${item.severity === "Major" ? "bg-red-500/10 text-red-600" : "bg-yellow-500/10 text-yellow-600"}`}>
                  {item.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              "Automatic checking when you add medications",
              "Drug-condition interaction warnings",
              "Drug-food interaction alerts",
              "AI-enhanced reconciliation",
              "Proactive safety notifications",
              "Shareable medication list for doctors",
              "Family visibility for caregivers",
              "Offline access to your medication data",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 bg-card rounded-xl border border-border p-4">
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6">
            <h3 className="font-semibold text-emerald-600 mb-3">Medical Disclaimer</h3>
            <p className="text-sm text-muted-foreground">
              Beat's drug interaction checker is for informational purposes only and should not replace professional medical advice. 
              Always consult your doctor or pharmacist before making any changes to your medications. 
              The database may not include all possible interactions. When in doubt, ask your healthcare provider.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Take Control of Your Medications</h2>
          <p className="text-lg opacity-90 mb-8">Check for interactions today. It could save your life.</p>
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

export default MedicationsFeature;
