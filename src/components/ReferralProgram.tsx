import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Gift, Copy, Share2, Users, CheckCircle2, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const ReferralProgram = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [isCopied, setIsCopied] = useState(false);

  // Fetch or create referral code
  const { data: referral, isLoading } = useQuery({
    queryKey: ["referral", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Check if user has a referral code
      const { data: existing, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .is("referred_id", null)
        .maybeSingle();
      
      if (existing) return existing;
      
      // Create new referral code
      const code = `BEAT${user.id.substring(0, 6).toUpperCase()}`;
      const { data: newReferral, error: createError } = await supabase
        .from("referrals")
        .insert({
          referrer_id: user.id,
          referral_code: code,
          status: "pending",
        })
        .select()
        .single();
      
      if (createError) throw createError;
      return newReferral;
    },
    enabled: !!user?.id,
  });

  // Fetch completed referrals count
  const { data: completedReferrals } = useQuery({
    queryKey: ["completed-referrals", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count } = await supabase
        .from("referrals")
        .select("*", { count: "exact", head: true })
        .eq("referrer_id", user.id)
        .eq("status", "completed");
      return count || 0;
    },
    enabled: !!user?.id,
  });

  const copyCode = async () => {
    if (!referral?.referral_code) return;
    await navigator.clipboard.writeText(referral.referral_code);
    setIsCopied(true);
    toast.success(language === "hi" ? "कोड कॉपी हो गया!" : "Code copied!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const shareReferral = async () => {
    if (!referral?.referral_code) return;
    
    const text = language === "hi"
      ? `Beat ऐप से अपने स्वास्थ्य को ट्रैक करें! मेरे रेफरल कोड ${referral.referral_code} का उपयोग करके साइन अप करें और 50 पॉइंट्स पाएं! 💪`
      : `Track your health with Beat app! Sign up using my referral code ${referral.referral_code} and get 50 points! 💪`;
    
    const url = `https://beathealth.lovable.app/?ref=${referral.referral_code}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Beat - Health Intelligence",
          text,
          url,
        });
      } catch (e) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      toast.success(language === "hi" ? "लिंक कॉपी हो गया!" : "Link copied!");
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-20 bg-muted rounded" />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Gift className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">
              {language === "hi" ? "दोस्तों को आमंत्रित करें" : "Invite Friends"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === "hi" ? "दोनों को 50 पॉइंट्स मिलेंगे!" : "Both of you get 50 points!"}
            </p>
          </div>
        </div>

        {/* Referral Code */}
        <div className="bg-card rounded-xl p-4 mb-4 border border-border/50">
          <p className="text-xs text-muted-foreground mb-2">
            {language === "hi" ? "आपका रेफरल कोड" : "Your referral code"}
          </p>
          <div className="flex items-center gap-2">
            <Input
              value={referral?.referral_code || ""}
              readOnly
              className="font-mono font-bold text-lg tracking-wider text-center"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyCode}
              className="shrink-0"
            >
              {isCopied ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-primary" />
            <span>
              <strong>{completedReferrals}</strong>{" "}
              {language === "hi" ? "सफल रेफरल" : "successful referrals"}
            </span>
          </div>
          {completedReferrals && completedReferrals > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="w-3 h-3" />
              {completedReferrals * 50} {language === "hi" ? "पॉइंट्स" : "points"}
            </Badge>
          )}
        </div>

        {/* Share Button */}
        <Button onClick={shareReferral} className="w-full gap-2">
          <Share2 className="w-4 h-4" />
          {language === "hi" ? "दोस्तों को शेयर करें" : "Share with Friends"}
        </Button>
      </div>

      {/* How it works */}
      <div className="p-4 bg-muted/30">
        <p className="text-xs font-medium mb-2">
          {language === "hi" ? "यह कैसे काम करता है:" : "How it works:"}
        </p>
        <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
          <li>{language === "hi" ? "अपना कोड दोस्तों को शेयर करें" : "Share your code with friends"}</li>
          <li>{language === "hi" ? "वे आपके कोड से साइन अप करें" : "They sign up using your code"}</li>
          <li>{language === "hi" ? "दोनों को 50 पॉइंट्स मिलें!" : "Both of you get 50 points!"}</li>
        </ol>
      </div>
    </Card>
  );
};
