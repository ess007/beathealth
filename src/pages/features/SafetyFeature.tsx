import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, AlertTriangle, Phone, Shield, Clock, Bell, Users, Check, Smartphone } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

const SafetyFeature = () => {
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
          
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center mx-auto mb-8">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Fall Detection & Emergency Response: <span className="text-primary">Peace of Mind</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Falls are the #1 cause of injury for adults over 65. Beat's fall detection automatically alerts your family when you need help most.
          </p>
          
          <Button size="lg" onClick={() => navigate("/auth")} className="rounded-full h-12 px-8">
            Enable Fall Detection <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How Fall Detection Works</h2>
          
          <div className="space-y-6">
            {[
              { icon: Smartphone, title: "Phone detects sudden movement", desc: "Using your phone's motion sensors, Beat detects the signature pattern of a fall—sudden acceleration followed by stillness" },
              { icon: Clock, title: "30-second confirmation window", desc: "Your phone vibrates and asks if you're okay. If you respond, no alert is sent" },
              { icon: Bell, title: "Automatic family notification", desc: "If you don't respond, your emergency contacts are immediately notified with your location" },
              { icon: Phone, title: "Emergency services prompt", desc: "If no response after 5 minutes, Beat displays emergency services number for quick calling" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 bg-card rounded-xl border border-border p-6">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Emergency Contacts Setup</h2>
          
          <div className="bg-card rounded-2xl border border-border p-8">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">Who to Add</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Spouse or partner</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Adult children</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Nearby neighbors</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Primary doctor</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Trusted friends</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Notification Options</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Bell className="w-4 h-4 text-orange-500" /> Push notifications</li>
                  <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-blue-500" /> SMS alerts</li>
                  <li className="flex items-center gap-2"><Users className="w-4 h-4 text-emerald-500" /> Family dashboard alert</li>
                  <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-violet-500" /> Location sharing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Safety Features</h2>
          
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              "Works even without internet (queues alerts)",
              "Battery-efficient background monitoring",
              "False positive prevention algorithms",
              "Location sharing with emergency contacts",
              "Medical history accessible to responders",
              "Integration with health data",
              "Customizable sensitivity levels",
              "24/7 monitoring when enabled",
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
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6">
            <h3 className="font-semibold text-orange-600 mb-3">Important Notice</h3>
            <p className="text-sm text-muted-foreground">
              Beat's fall detection is designed to provide an additional layer of safety but is not a substitute for professional medical monitoring or emergency services. 
              No fall detection system is 100% accurate. Always call emergency services (112) if you or someone you know needs immediate medical attention. 
              Fall detection requires the phone to be carried on the person to work effectively.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Safety for You and Your Loved Ones</h2>
          <p className="text-lg opacity-90 mb-8">Enable fall detection today. Peace of mind is priceless.</p>
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

export default SafetyFeature;
