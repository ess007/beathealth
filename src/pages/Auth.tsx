import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { ArrowRight, Loader2, Phone, Mail, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type AuthMode = "select" | "phone" | "email" | "otp";

const Auth = () => {
  const { language } = useLanguage();
  const [authMode, setAuthMode] = useState<AuthMode>("select");
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(language === "hi" ? "स्वागत है!" : "Welcome back!");
        window.location.href = "/app/home";
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/app/home` },
        });
        if (error) throw error;
        toast.success(language === "hi" ? "खाता बन गया! कृपया अपना ईमेल जांचें।" : "Account created! Please check your email.");
      }
    } catch (error: any) {
      toast.error(error.message || (language === "hi" ? "प्रमाणीकरण विफल" : "Authentication failed"));
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone.replace(/\D/g, "")}`;
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });
      if (error) throw error;
      toast.success(language === "hi" ? "OTP भेजा गया!" : "OTP sent!");
      setAuthMode("otp");
    } catch (error: any) {
      toast.error(error.message || (language === "hi" ? "OTP भेजने में विफल" : "Failed to send OTP"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone.replace(/\D/g, "")}`;
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: "sms",
      });
      if (error) throw error;
      toast.success(language === "hi" ? "सत्यापित! स्वागत है!" : "Verified! Welcome!");
      window.location.href = "/app/home";
    } catch (error: any) {
      toast.error(error.message || (language === "hi" ? "अमान्य OTP" : "Invalid OTP"));
    } finally {
      setLoading(false);
    }
  };

  const renderSelectMode = () => (
    <div className="space-y-4">
      <Button
        onClick={() => setAuthMode("phone")}
        variant="outline"
        className="w-full h-14 text-lg gap-3 border-2"
      >
        <Phone className="w-5 h-5" />
        {language === "hi" ? "फ़ोन नंबर से लॉगिन" : "Continue with Phone"}
      </Button>

      <Button
        onClick={() => setAuthMode("email")}
        variant="outline"
        className="w-full h-14 text-lg gap-3 border-2"
      >
        <Mail className="w-5 h-5" />
        {language === "hi" ? "ईमेल से लॉगिन" : "Continue with Email"}
      </Button>

      <p className="text-xs text-center text-muted-foreground pt-4">
        {language === "hi" 
          ? "जारी रखकर, आप हमारी शर्तों और गोपनीयता नीति से सहमत होते हैं"
          : "By continuing, you agree to our Terms & Privacy Policy"}
      </p>
    </div>
  );

  const renderPhoneMode = () => (
    <form onSubmit={handlePhoneAuth} className="space-y-6">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mb-2"
        onClick={() => setAuthMode("select")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {language === "hi" ? "वापस" : "Back"}
      </Button>

      <div className="space-y-2">
        <Label htmlFor="phone">
          {language === "hi" ? "फ़ोन नंबर" : "Phone Number"}
        </Label>
        <div className="flex">
          <div className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md text-sm font-medium">
            +91
          </div>
          <Input
            id="phone"
            type="tel"
            placeholder="9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            required
            className="h-14 text-lg rounded-l-none"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {language === "hi" 
            ? "हम आपको 6 अंकों का OTP भेजेंगे"
            : "We'll send you a 6-digit OTP"}
        </p>
      </div>

      <Button
        type="submit"
        className="w-full h-14 text-lg font-medium bg-gradient-to-r from-primary to-primary/90"
        disabled={loading || phone.length < 10}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <span className="flex items-center gap-2">
            {language === "hi" ? "OTP भेजें" : "Send OTP"}
            <ArrowRight className="w-4 h-4" />
          </span>
        )}
      </Button>
    </form>
  );

  const renderOtpMode = () => (
    <form onSubmit={handleVerifyOtp} className="space-y-6">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mb-2"
        onClick={() => setAuthMode("phone")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {language === "hi" ? "वापस" : "Back"}
      </Button>

      <div className="text-center mb-4">
        <p className="text-sm text-muted-foreground">
          {language === "hi" 
            ? `OTP भेजा गया: +91 ${phone}`
            : `OTP sent to: +91 ${phone}`}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="otp">
          {language === "hi" ? "OTP दर्ज करें" : "Enter OTP"}
        </Label>
        <Input
          id="otp"
          type="text"
          placeholder="000000"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          required
          className="h-14 text-2xl text-center tracking-[0.5em] font-mono"
          maxLength={6}
        />
      </div>

      <Button
        type="submit"
        className="w-full h-14 text-lg font-medium bg-gradient-to-r from-primary to-primary/90"
        disabled={loading || otp.length < 6}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <span className="flex items-center gap-2">
            {language === "hi" ? "सत्यापित करें" : "Verify OTP"}
            <ArrowRight className="w-4 h-4" />
          </span>
        )}
      </Button>

      <Button
        type="button"
        variant="link"
        className="w-full text-sm"
        onClick={() => {
          setOtp("");
          handlePhoneAuth({ preventDefault: () => {} } as React.FormEvent);
        }}
        disabled={loading}
      >
        {language === "hi" ? "OTP दोबारा भेजें" : "Resend OTP"}
      </Button>
    </form>
  );

  const renderEmailMode = () => (
    <form onSubmit={handleEmailAuth} className="space-y-6">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mb-2"
        onClick={() => setAuthMode("select")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {language === "hi" ? "वापस" : "Back"}
      </Button>

      <div className="space-y-2">
        <Label htmlFor="email">
          {language === "hi" ? "ईमेल पता" : "Email Address"}
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-12 bg-white/50 dark:bg-black/20 border-border/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          {language === "hi" ? "पासवर्ड" : "Password"}
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="h-12 bg-white/50 dark:bg-black/20 border-border/50"
        />
      </div>

      <Button
        type="submit"
        className="w-full h-12 text-lg font-medium bg-gradient-to-r from-primary to-primary/90"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <span className="flex items-center gap-2">
            {isLogin 
              ? (language === "hi" ? "लॉगिन करें" : "Sign In")
              : (language === "hi" ? "खाता बनाएं" : "Create Account")}
            <ArrowRight className="w-4 h-4" />
          </span>
        )}
      </Button>

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline"
        >
          {isLogin 
            ? (language === "hi" ? "नए हैं? खाता बनाएं" : "New to Beat? Create an account")
            : (language === "hi" ? "पहले से खाता है? लॉगिन करें" : "Already have an account? Sign in")}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.05),transparent_70%)]"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center space-y-2 mb-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
          <div className="inline-block p-4 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl mb-4">
            <Logo size="xl" showText={false} />
          </div>
          <h1 className="text-4xl font-serif font-bold tracking-tight">
            {authMode === "select" 
              ? (language === "hi" ? "बीट में आपका स्वागत है" : "Welcome to Beat")
              : authMode === "otp"
              ? (language === "hi" ? "OTP सत्यापित करें" : "Verify OTP")
              : (isLogin 
                ? (language === "hi" ? "वापस स्वागत है" : "Welcome Back")
                : (language === "hi" ? "बीट से जुड़ें" : "Join Beat"))}
          </h1>
          <p className="text-muted-foreground">
            {language === "hi" 
              ? "आपकी दिल की सेहत की यात्रा यहां शुरू होती है"
              : "Your heart health journey starts here"}
          </p>
        </div>

        <Card className="p-8 glass-panel border-white/20 shadow-2xl animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100">
          {authMode === "select" && renderSelectMode()}
          {authMode === "phone" && renderPhoneMode()}
          {authMode === "otp" && renderOtpMode()}
          {authMode === "email" && renderEmailMode()}
        </Card>
      </div>
    </div>
  );
};

export default Auth;
