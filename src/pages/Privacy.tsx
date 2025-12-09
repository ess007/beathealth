import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, Eye, Trash2, Download, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Eye,
      title: "Information We Collect",
      content: `We collect information you provide directly to us, including:
      
• **Account Information**: Name, email, phone number, and password when you create an account.
• **Health Data**: Blood pressure readings, blood sugar levels, weight, medications, sleep quality, stress levels, and activity data that you choose to log.
• **Profile Information**: Date of birth, gender, health conditions (diabetes, hypertension, heart disease), and health goals.
• **Device Information**: Device type, operating system, and app version for troubleshooting and optimization.
• **Usage Data**: How you interact with Beat, including features used and time spent in the app.`
    },
    {
      icon: Lock,
      title: "How We Use Your Information",
      content: `We use the information we collect to:
      
• **Provide Health Insights**: Calculate your HeartScore, generate personalized health recommendations, and track your progress over time.
• **Power AI Features**: Our AI Coach uses your health data to provide personalized advice and daily nudges.
• **Enable Family Features**: Share health summaries with family members you've authorized.
• **Send Reminders**: Medication reminders, ritual prompts, and weekly health summaries via WhatsApp or push notifications.
• **Improve Our Service**: Analyze aggregate usage patterns to improve Beat's features and user experience.
• **Communicate With You**: Send important updates about your account and our services.`
    },
    {
      icon: Shield,
      title: "Data Security",
      content: `We take the security of your health data seriously:
      
• **Encryption**: All data is encrypted in transit (TLS 1.3) and at rest (AES-256).
• **Access Controls**: Strict role-based access controls limit who can view your data.
• **Secure Infrastructure**: We use industry-leading cloud providers with SOC 2 Type II certification.
• **Regular Audits**: We conduct regular security audits and penetration testing.
• **No Data Sales**: We never sell your personal health information to third parties.`
    },
    {
      icon: Trash2,
      title: "Data Retention & Deletion",
      content: `You have control over your data:
      
• **Retention Period**: We retain your health data as long as your account is active, or as needed to provide services.
• **Account Deletion**: You can request complete deletion of your account and all associated data at any time through the app settings.
• **Data Export**: You can export all your health data in a standard format before deletion.
• **Deletion Timeline**: Upon request, we delete your data within 30 days, except where legally required to retain.`
    },
    {
      icon: Download,
      title: "Your Rights (DPDP Act Compliance)",
      content: `Under India's Digital Personal Data Protection Act, you have the right to:
      
• **Access**: Request a copy of all personal data we hold about you.
• **Correction**: Request correction of any inaccurate personal data.
• **Erasure**: Request deletion of your personal data.
• **Portability**: Receive your data in a structured, machine-readable format.
• **Withdraw Consent**: Withdraw your consent for data processing at any time.
• **Grievance Redressal**: File a complaint with our Data Protection Officer.

To exercise these rights, contact us at privacy@beathealth.in`
    },
    {
      icon: Bell,
      title: "Third-Party Services",
      content: `We may share data with trusted third parties:
      
• **Cloud Infrastructure**: Supabase (database hosting, authentication)
• **Payment Processing**: Razorpay (subscription payments - we don't store card details)
• **Messaging**: WhatsApp Business API (health reminders and summaries)
• **Analytics**: Aggregate, anonymized usage analytics to improve our service

We ensure all third parties meet our privacy and security standards.`
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
              <Shield className="w-4 h-4" />
              Your Privacy Matters
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">
              Last updated: December 2024
            </p>
          </div>

          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-lg text-muted-foreground">
              At Beat, we understand that your health data is deeply personal. This Privacy Policy explains how we collect, use, protect, and share your information when you use our app and services. We are committed to protecting your privacy and complying with India's Digital Personal Data Protection (DPDP) Act.
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

          {/* Contact Section */}
          <div className="mt-12 bg-muted/50 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Questions About Your Privacy?</h2>
            <p className="text-muted-foreground mb-6">
              Contact our Data Protection Officer for any privacy-related concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate("/contact")} variant="outline">
                Contact Us
              </Button>
              <Button onClick={() => window.location.href = 'mailto:privacy@beathealth.in'}>
                Email: privacy@beathealth.in
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
            <button onClick={() => navigate("/terms")} className="hover:text-primary transition-colors">Terms</button>
            <button onClick={() => navigate("/contact")} className="hover:text-primary transition-colors">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Privacy;
