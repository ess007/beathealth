import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mail, Phone, MapPin, MessageCircle, Clock, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      value: "support@beathealth.in",
      description: "For general inquiries and support",
      action: () => window.location.href = 'mailto:support@beathealth.in'
    },
    {
      icon: Phone,
      title: "Call Us",
      value: "+91 80-4567-8900",
      description: "Mon-Sat, 9 AM - 6 PM IST",
      action: () => window.location.href = 'tel:+918045678900'
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      value: "+91 98765-43210",
      description: "Quick responses on WhatsApp",
      action: () => window.open('https://wa.me/919876543210', '_blank')
    },
    {
      icon: MapPin,
      title: "Office",
      value: "Bangalore, India",
      description: "HSR Layout, Sector 3",
      action: undefined
    }
  ];

  const faqs = [
    {
      question: "How do I reset my password?",
      answer: "Go to Settings > Account > Change Password, or use 'Forgot Password' on the login screen."
    },
    {
      question: "Can I export my health data?",
      answer: "Yes! Go to Profile > Settings > Export Data to download all your health records as a PDF or CSV."
    },
    {
      question: "How do I cancel my subscription?",
      answer: "Go to Profile > Subscription > Manage Plan > Cancel. You'll retain access until the billing period ends."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use bank-level encryption and comply with DPDP Act. Read our Privacy Policy for details."
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

      {/* Hero Section */}
      <section className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <MessageCircle className="w-4 h-4" />
            We're Here to Help
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions about Beat? Our team is ready to help you on your health journey.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactInfo.map((info, index) => (
              <Card 
                key={index} 
                className={`border-0 bg-gradient-to-br from-card to-muted/30 ${info.action ? 'cursor-pointer hover:shadow-lg' : ''} transition-all duration-300`}
                onClick={info.action}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <info.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-1">{info.title}</h3>
                  <p className="text-primary font-medium mb-1">{info.value}</p>
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & FAQs */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50">
              <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name *</label>
                    <Input
                      required
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <Input
                      required
                      type="email"
                      placeholder="you@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <Input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject *</label>
                    <Input
                      required
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message *</label>
                  <Textarea
                    required
                    rows={5}
                    placeholder="Tell us more about your inquiry..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Send Message
                    </span>
                  )}
                </Button>
              </form>
              <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>We typically respond within 24 hours</span>
              </div>
            </div>

            {/* FAQs */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-muted/50 rounded-xl p-5">
                    <h3 className="font-bold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground text-sm">{faq.answer}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Need immediate help?</strong> Check out our{" "}
                  <button onClick={() => navigate("/#faq")} className="text-primary hover:underline">
                    full FAQ section
                  </button>{" "}
                  on the homepage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
            <button onClick={() => navigate("/terms")} className="hover:text-primary transition-colors">Terms</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
