import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles, Shield, MessageCircle, FileText, Phone, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Logo } from "@/components/Logo";

const Subscription = () => {
  const { language } = useLanguage();
  const { subscription, isPremium, isBasic, createCheckout, isCreatingCheckout } = useSubscription();

  const plans = [
    {
      id: "free",
      name: language === "hi" ? "फ्री" : "Free",
      price: "₹0",
      period: language === "hi" ? "/हमेशा" : "/forever",
      description: language === "hi" ? "शुरुआत के लिए बेहतरीन" : "Perfect to get started",
      features: [
        { text: language === "hi" ? "बीपी और शुगर लॉगिंग" : "BP & Sugar logging", included: true },
        { text: language === "hi" ? "बेसिक इनसाइट्स" : "Basic insights", included: true },
        { text: language === "hi" ? "स्ट्रीक ट्रैकिंग" : "Streak tracking", included: true },
        { text: language === "hi" ? "दैनिक AI कोचिंग" : "Daily AI coaching", included: false },
        { text: language === "hi" ? "PDF रिपोर्ट" : "PDF reports", included: false },
        { text: language === "hi" ? "फैमिली डैशबोर्ड" : "Family dashboard", included: false },
        { text: language === "hi" ? "प्राथमिकता सहायता" : "Priority support", included: false },
      ],
      current: !isPremium && !isBasic,
      popular: false,
    },
    {
      id: "basic",
      name: language === "hi" ? "बेसिक" : "Basic",
      price: "₹99",
      period: language === "hi" ? "/महीना" : "/month",
      description: language === "hi" ? "परिवार के लिए" : "For families",
      features: [
        { text: language === "hi" ? "बीपी और शुगर लॉगिंग" : "BP & Sugar logging", included: true },
        { text: language === "hi" ? "एडवांस्ड इनसाइट्स" : "Advanced insights", included: true },
        { text: language === "hi" ? "स्ट्रीक ट्रैकिंग" : "Streak tracking", included: true },
        { text: language === "hi" ? "फैमिली डैशबोर्ड" : "Family dashboard", included: true },
        { text: language === "hi" ? "वीकली समरी" : "Weekly summary", included: true },
        { text: language === "hi" ? "दैनिक AI कोचिंग" : "Daily AI coaching", included: false },
        { text: language === "hi" ? "PDF रिपोर्ट" : "PDF reports", included: false },
      ],
      current: isBasic,
      popular: false,
    },
    {
      id: "premium",
      name: language === "hi" ? "बीट प्रीमियम" : "Beat Premium",
      price: "₹199",
      period: language === "hi" ? "/महीना" : "/month",
      description: language === "hi" ? "पूर्ण स्वास्थ्य कोच" : "Complete health coach",
      features: [
        { text: language === "hi" ? "सभी बेसिक फीचर्स" : "All Basic features", included: true },
        { text: language === "hi" ? "दैनिक AI कोचिंग" : "Daily AI coaching", included: true },
        { text: language === "hi" ? "PDF रिपोर्ट एक्सपोर्ट" : "PDF report export", included: true },
        { text: language === "hi" ? "एडवांस्ड इनसाइट्स" : "Advanced insights", included: true },
        { text: language === "hi" ? "प्राथमिकता कोच क्यू" : "Priority coach queue", included: true },
        { text: language === "hi" ? "मासिक टेलीकंसल्ट" : "Monthly teleconsult", included: true },
        { text: language === "hi" ? "24/7 सहायता" : "24/7 support", included: true },
      ],
      current: isPremium,
      popular: true,
    },
  ];

  const benefits = [
    {
      icon: Sparkles,
      title: language === "hi" ? "AI दैनिक नज" : "AI Daily Nudge",
      description: language === "hi" ? "व्यक्तिगत स्वास्थ्य सुझाव" : "Personalized health tips",
    },
    {
      icon: FileText,
      title: language === "hi" ? "PDF रिपोर्ट" : "PDF Reports",
      description: language === "hi" ? "डॉक्टर के साथ साझा करें" : "Share with your doctor",
    },
    {
      icon: MessageCircle,
      title: language === "hi" ? "असीमित AI चैट" : "Unlimited AI Chat",
      description: language === "hi" ? "कभी भी सवाल पूछें" : "Ask questions anytime",
    },
    {
      icon: Phone,
      title: language === "hi" ? "टेलीकंसल्ट" : "Teleconsult",
      description: language === "hi" ? "मासिक डॉक्टर कॉल" : "Monthly doctor call",
    },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-6">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3 text-gradient-primary">
            {language === "hi" ? "बीट प्रीमियम" : "Beat Premium"}
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {language === "hi" 
              ? "अपने स्वास्थ्य को AI-पावर्ड कोचिंग, PDF रिपोर्ट और प्राथमिकता सहायता के साथ अगले स्तर पर ले जाएं"
              : "Take your health to the next level with AI-powered coaching, PDF reports, and priority support"}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="text-center p-4 rounded-2xl bg-muted/50 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{benefit.title}</h3>
              <p className="text-xs text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan, index) => (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg animate-in fade-in slide-in-from-bottom-4 ${
                plan.popular ? "border-primary shadow-lg scale-105 md:scale-110" : ""
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
              )}
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-xl">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  {plan.popular && (
                    <Badge className="bg-primary text-primary-foreground">
                      {language === "hi" ? "लोकप्रिय" : "Popular"}
                    </Badge>
                  )}
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        feature.included ? "bg-emerald-100 text-emerald-600" : "bg-muted text-muted-foreground"
                      }`}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className={feature.included ? "" : "text-muted-foreground line-through"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {plan.current ? (
                  <Button variant="outline" className="w-full" disabled>
                    <Check className="w-4 h-4 mr-2" />
                    {language === "hi" ? "वर्तमान प्लान" : "Current Plan"}
                  </Button>
                ) : (
                  <Button 
                    className={`w-full ${plan.popular ? "bg-gradient-to-r from-primary to-accent" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => createCheckout(plan.id as any)}
                    disabled={isCreatingCheckout}
                  >
                    {isCreatingCheckout ? (
                      language === "hi" ? "लोड हो रहा..." : "Loading..."
                    ) : plan.id === "premium" ? (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        {language === "hi" ? "7 दिन मुफ्त ट्राई करें" : "Start 7-day Free Trial"}
                      </>
                    ) : (
                      language === "hi" ? "अपग्रेड करें" : "Upgrade"
                    )}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Trust Section */}
        <div className="text-center p-8 bg-muted/30 rounded-3xl">
          <Shield className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
          <h3 className="font-semibold text-lg mb-2">
            {language === "hi" ? "100% सुरक्षित भुगतान" : "100% Secure Payment"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {language === "hi" 
              ? "Razorpay द्वारा संचालित। UPI, कार्ड और नेट बैंकिंग स्वीकृत। कभी भी रद्द करें।"
              : "Powered by Razorpay. UPI, Cards & Net Banking accepted. Cancel anytime."}
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 opacity-50">
            <Logo size="sm" showText={false} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Subscription;
