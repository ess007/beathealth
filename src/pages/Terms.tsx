import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, AlertTriangle, CreditCard, Ban, Scale, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: FileText,
      title: "1. Acceptance of Terms",
      content: `By accessing or using the Beat mobile application and related services ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.

These Terms apply to all users of the Service, including members, family caregivers, and healthcare professionals. By creating an account, you confirm that you are at least 18 years old or have parental/guardian consent.`
    },
    {
      icon: AlertTriangle,
      title: "2. Medical Disclaimer",
      content: `**IMPORTANT**: Beat is a health tracking and wellness tool, NOT a medical device or substitute for professional medical advice.

• **Not Medical Advice**: The HeartScore, AI recommendations, and health insights provided by Beat are for informational purposes only and should not be considered medical advice, diagnosis, or treatment.

• **Consult Healthcare Providers**: Always seek the advice of your physician or qualified healthcare provider with any questions about your medical condition. Never disregard professional medical advice or delay seeking it because of something you read on Beat.

• **Emergency Situations**: If you think you may have a medical emergency, call your doctor or emergency services (112 in India) immediately. Beat is not designed for emergency situations.

• **Accuracy Limitations**: While we strive for accuracy, health data logged manually or from connected devices may contain errors. Do not make medical decisions based solely on Beat data.`
    },
    {
      icon: CreditCard,
      title: "3. Subscription & Payments",
      content: `Beat offers both free and premium subscription plans:

**Free Plan**
• Basic health logging (BP, sugar, activity)
• HeartScore calculation
• Family dashboard (view-only)

**Premium Plans**
• Basic Plan: ₹99/month - AI Coach, weekly reports, priority support
• Premium Plan: ₹199/month - All features, advanced analytics, teleconsult access

**Payment Terms**
• Payments are processed securely through Razorpay
• Subscriptions auto-renew unless cancelled
• Cancel anytime from your account settings
• Refunds are provided within 7 days of purchase if you're unsatisfied
• Prices may change with 30 days notice to existing subscribers`
    },
    {
      icon: Ban,
      title: "4. Prohibited Uses",
      content: `You agree NOT to use Beat to:

• Share false or misleading health information
• Attempt to access other users' health data without authorization
• Use the AI Coach to seek emergency medical advice
• Reverse engineer, decompile, or attempt to extract source code
• Use automated systems or bots to access the Service
• Violate any applicable laws or regulations
• Harass, abuse, or harm other users
• Upload malicious code or attempt to breach security measures
• Resell or commercially exploit the Service without permission
• Use the Service for any purpose other than personal health tracking

Violation of these terms may result in immediate account termination.`
    },
    {
      icon: Scale,
      title: "5. Limitation of Liability",
      content: `To the maximum extent permitted by law:

• Beat is provided "as is" without warranties of any kind, express or implied
• We do not warrant that the Service will be uninterrupted, error-free, or completely secure
• We are not liable for any health outcomes resulting from use of Beat
• Our total liability shall not exceed the amount you paid for the Service in the past 12 months
• We are not responsible for third-party services (Razorpay, WhatsApp) or their actions
• We are not liable for data loss due to technical failures or user error

**Indemnification**: You agree to indemnify Beat against any claims arising from your use of the Service or violation of these Terms.`
    },
    {
      icon: RefreshCw,
      title: "6. Changes & Termination",
      content: `**Changes to Terms**
• We may modify these Terms at any time
• Material changes will be notified via email or in-app notification
• Continued use after changes constitutes acceptance
• If you disagree with changes, you may terminate your account

**Account Termination**
• You may delete your account at any time from app settings
• We may suspend or terminate accounts that violate these Terms
• Upon termination, your right to use the Service ceases immediately
• We will delete your data within 30 days of account deletion (unless legally required to retain)

**Governing Law**
These Terms are governed by the laws of India. Any disputes shall be resolved in the courts of Bangalore, Karnataka.`
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <Logo size="sm" showText={true} />
            <Button onClick={() => navigate("/auth")} size="sm">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <FileText className="w-4 h-4" />
              Legal Agreement
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">
              Last updated: December 2024
            </p>
          </div>

          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-lg text-muted-foreground">
              Welcome to Beat! These Terms of Service govern your use of our health tracking application and related services. Please read these terms carefully before using Beat.
            </p>
          </div>

          <div className="space-y-8">
            {sections.map((section, index) => (
              <div key={index} className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-4">{section.title}</h2>
                    <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                      {section.content.split('**').map((part, i) => 
                        i % 2 === 1 ? <strong key={i} className="text-foreground">{part}</strong> : part
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Agreement Section */}
          <div className="mt-12 bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6">
              By clicking "Get Started", you agree to these Terms of Service and our Privacy Policy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate("/privacy")} variant="outline">
                Read Privacy Policy
              </Button>
              <Button onClick={() => navigate("/auth")}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>© 2024 Beat Health Inc.</span>
            <span className="hidden sm:inline">•</span>
            <span>Built by <a href="https://bwestudios.com" target="_blank" rel="noopener noreferrer" className="font-bold text-foreground hover:text-primary transition-colors">BWE Studio</a></span>
          </div>
          <div className="flex gap-6">
            <button onClick={() => navigate("/about")} className="hover:text-primary transition-colors">About</button>
            <button onClick={() => navigate("/privacy")} className="hover:text-primary transition-colors">Privacy</button>
            <button onClick={() => navigate("/contact")} className="hover:text-primary transition-colors">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Terms;
