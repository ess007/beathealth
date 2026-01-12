import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { ArrowRight, Loader2, Mail, ArrowLeft, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { z } from "zod";

// Validation schemas for authentication inputs
const emailSchema = z.string()
  .trim()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .max(255, "Email must be less than 255 characters");

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be less than 100 characters");

type AuthMode = "select" | "email" | "magic-link" | "reset-password";

const Auth = () => {
  const { language } = useLanguage();
  const [authMode, setAuthMode] = useState<AuthMode>("select");
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setEmailError(null);
    setPasswordError(null);
    
    // Validate inputs
    const emailValidation = emailSchema.safeParse(email);
    const passwordValidation = passwordSchema.safeParse(password);
    
    if (!emailValidation.success) {
      setEmailError(emailValidation.error.errors[0].message);
      return;
    }
    
    if (!passwordValidation.success) {
      setPasswordError(passwordValidation.error.errors[0].message);
      return;
    }
    
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: emailValidation.data, 
          password: passwordValidation.data 
        });
        if (error) throw error;
        toast.success(language === "hi" ? "स्वागत है!" : "Welcome back!");
        window.location.href = "/app/home";
      } else {
        const { error } = await supabase.auth.signUp({
          email: emailValidation.data,
          password: passwordValidation.data,
          options: { emailRedirectTo: `${window.location.origin}/app/home` },
        });
        if (error) throw error;
        toast.success(language === "hi" ? "खाता बन गया!" : "Account created! Logging you in...");
        window.location.href = "/app/home";
      }
    } catch (error: any) {
      toast.error(error.message || (language === "hi" ? "प्रमाणीकरण विफल" : "Authentication failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
      setEmailError(emailValidation.error.errors[0].message);
      return;
    }
    
    setLoading(true);
    setEmailError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: emailValidation.data,
        options: {
          emailRedirectTo: `${window.location.origin}/app/home`,
        },
      });
      if (error) throw error;
      setMagicLinkSent(true);
      toast.success(language === "hi" ? "मैजिक लिंक भेजा गया!" : "Magic link sent! Check your email.");
    } catch (error: any) {
      toast.error(error.message || (language === "hi" ? "लिंक भेजने में विफल" : "Failed to send magic link"));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
      setEmailError(emailValidation.error.errors[0].message);
      return;
    }
    
    setLoading(true);
    setEmailError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailValidation.data, {
        redirectTo: `${window.location.origin}/auth?mode=update-password`,
      });
      if (error) throw error;
      setResetSent(true);
      toast.success(language === "hi" ? "रीसेट लिंक भेजा गया!" : "Reset link sent! Check your email.");
    } catch (error: any) {
      toast.error(error.message || (language === "hi" ? "रीसेट लिंक भेजने में विफल" : "Failed to send reset link"));
    } finally {
      setLoading(false);
    }
  };

  const renderSelectMode = () => (
    <div className="space-y-4">
      <Button
        onClick={() => setAuthMode("magic-link")}
        variant="outline"
        className="w-full h-14 text-lg gap-3 border-2"
      >
        <Sparkles className="w-5 h-5" />
        {language === "hi" ? "मैजिक लिंक से लॉगिन" : "Sign in with Magic Link"}
      </Button>

      <Button
        onClick={() => setAuthMode("email")}
        variant="outline"
        className="w-full h-14 text-lg gap-3 border-2"
      >
        <Mail className="w-5 h-5" />
        {language === "hi" ? "ईमेल और पासवर्ड" : "Email & Password"}
      </Button>

      <p className="text-xs text-center text-muted-foreground pt-4">
        {language === "hi" 
          ? "जारी रखकर, आप हमारी शर्तों और गोपनीयता नीति से सहमत होते हैं"
          : "By continuing, you agree to our Terms & Privacy Policy"}
      </p>
    </div>
  );

  const renderMagicLinkMode = () => (
    <form onSubmit={handleMagicLink} className="space-y-6">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mb-2"
        onClick={() => {
          setAuthMode("select");
          setMagicLinkSent(false);
        }}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {language === "hi" ? "वापस" : "Back"}
      </Button>

      {magicLinkSent ? (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">
            {language === "hi" ? "अपना ईमेल जांचें" : "Check your email"}
          </h3>
          <p className="text-muted-foreground text-sm">
            {language === "hi" 
              ? `हमने ${email} पर एक मैजिक लिंक भेजा है। लॉगिन करने के लिए लिंक पर क्लिक करें।`
              : `We've sent a magic link to ${email}. Click the link to sign in.`}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setMagicLinkSent(false);
              handleMagicLink({ preventDefault: () => {} } as React.FormEvent);
            }}
            disabled={loading}
          >
            {language === "hi" ? "लिंक दोबारा भेजें" : "Resend link"}
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="email">
              {language === "hi" ? "ईमेल पता" : "Email Address"}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null);
              }}
              required
              className={`h-14 text-lg ${emailError ? 'border-destructive' : ''}`}
            />
            {emailError && (
              <p className="text-sm text-destructive">{emailError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {language === "hi" 
                ? "हम आपको एक मैजिक लिंक भेजेंगे - कोई पासवर्ड नहीं चाहिए!"
                : "We'll send you a magic link - no password needed!"}
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-lg font-medium bg-gradient-to-r from-primary to-primary/90"
            disabled={loading || !email}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                {language === "hi" ? "मैजिक लिंक भेजें" : "Send Magic Link"}
                <Sparkles className="w-4 h-4" />
              </span>
            )}
          </Button>
        </>
      )}
    </form>
  );

  const renderResetPasswordMode = () => (
    <form onSubmit={handlePasswordReset} className="space-y-6">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mb-2"
        onClick={() => {
          setAuthMode("email");
          setResetSent(false);
        }}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {language === "hi" ? "वापस" : "Back"}
      </Button>

      {resetSent ? (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">
            {language === "hi" ? "अपना ईमेल जांचें" : "Check your email"}
          </h3>
          <p className="text-muted-foreground text-sm">
            {language === "hi" 
              ? `हमने ${email} पर पासवर्ड रीसेट लिंक भेजा है।`
              : `We've sent a password reset link to ${email}.`}
          </p>
        </div>
      ) : (
        <>
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold">
              {language === "hi" ? "पासवर्ड रीसेट करें" : "Reset Password"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === "hi" 
                ? "अपना ईमेल दर्ज करें और हम आपको एक रीसेट लिंक भेजेंगे।"
                : "Enter your email and we'll send you a reset link."}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reset-email">
              {language === "hi" ? "ईमेल पता" : "Email Address"}
            </Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null);
              }}
              required
              className={`h-12 ${emailError ? 'border-destructive' : ''}`}
            />
            {emailError && (
              <p className="text-sm text-destructive">{emailError}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg font-medium bg-gradient-to-r from-primary to-primary/90"
            disabled={loading || !email}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                {language === "hi" ? "रीसेट लिंक भेजें" : "Send Reset Link"}
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </>
      )}
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
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError(null);
          }}
          required
          className={`h-12 bg-white/50 dark:bg-black/20 border-border/50 ${emailError ? 'border-destructive' : ''}`}
        />
        {emailError && (
          <p className="text-sm text-destructive">{emailError}</p>
        )}
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
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordError(null);
          }}
          required
          className={`h-12 bg-white/50 dark:bg-black/20 border-border/50 ${passwordError ? 'border-destructive' : ''}`}
        />
        {passwordError && (
          <p className="text-sm text-destructive">{passwordError}</p>
        )}
      </div>

      {isLogin && (
        <div className="text-right">
          <button
            type="button"
            onClick={() => setAuthMode("reset-password")}
            className="text-sm text-primary hover:underline"
          >
            {language === "hi" ? "पासवर्ड भूल गए?" : "Forgot password?"}
          </button>
        </div>
      )}

      <Button
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
          <div className="inline-block p-5 rounded-full bg-black shadow-2xl mb-4">
            <Logo size="xl" showText={false} />
          </div>
          <h1 className="text-4xl font-serif font-bold tracking-tight">
            {authMode === "select" 
              ? (language === "hi" ? "बीट में आपका स्वागत है" : "Welcome to Beat")
              : authMode === "magic-link"
              ? (language === "hi" ? "मैजिक लिंक से लॉगिन" : "Magic Link Sign In")
              : authMode === "reset-password"
              ? (language === "hi" ? "पासवर्ड रीसेट" : "Reset Password")
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
          {authMode === "magic-link" && renderMagicLinkMode()}
          {authMode === "reset-password" && renderResetPasswordMode()}
          {authMode === "email" && renderEmailMode()}
        </Card>
      </div>
    </div>
  );
};

export default Auth;