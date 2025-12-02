import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Logo } from "@/components/Logo";
import { useHeartScore } from "@/hooks/useHeartScore";
import { useMemo } from "react";

interface DailyNudgeCardProps {
  userId?: string;
}

export const DailyNudgeCard = ({ userId }: DailyNudgeCardProps) => {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const { todayScore } = useHeartScore();

  const { data: nudge, isLoading } = useQuery({
    queryKey: ["daily-nudge", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("ai_nudges")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const generateNudge = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("generate-daily-nudge", {
        body: { nudgeType: "morning" },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-nudge", userId] });
    },
  });

  // Generate personalized tip based on HeartScore data
  const personalizedTip = useMemo(() => {
    if (!todayScore) {
      return {
        en: "Complete your morning ritual to get personalized health insights! ☀️",
        hi: "व्यक्तिगत स्वास्थ्य जानकारी पाने के लिए अपनी सुबह की दिनचर्या पूरी करें! ☀️",
      };
    }

    const { heart_score, bp_score, sugar_score, consistency_score } = todayScore;

    // Find the lowest scoring area to provide targeted advice
    const scores = [
      { type: "bp", score: bp_score || 0 },
      { type: "sugar", score: sugar_score || 0 },
      { type: "consistency", score: consistency_score || 0 },
    ];
    
    const lowestScore = scores.reduce((min, curr) => 
      curr.score < min.score ? curr : min
    );

    // Excellent overall score
    if (heart_score >= 80) {
      return {
        en: `Your HeartScore is ${heart_score}! 🌟 You're doing amazing. Keep up the great work with your daily rituals!`,
        hi: `आपका हार्टस्कोर ${heart_score} है! 🌟 आप बहुत अच्छा कर रहे हैं। अपनी दैनिक दिनचर्या जारी रखें!`,
      };
    }

    // Good score with room for improvement
    if (heart_score >= 70) {
      if (lowestScore.type === "bp") {
        return {
          en: `HeartScore: ${heart_score}. Your BP needs attention. Try deep breathing exercises and reduce salt intake today. 💪`,
          hi: `हार्टस्कोर: ${heart_score}। आपके BP पर ध्यान देने की जरूरत है। आज गहरी सांस के व्यायाम करें और नमक कम लें। 💪`,
        };
      }
      if (lowestScore.type === "sugar") {
        return {
          en: `HeartScore: ${heart_score}. Focus on blood sugar today. A 15-min walk after meals can help! 🚶`,
          hi: `हार्टस्कोर: ${heart_score}। आज रक्त शर्करा पर ध्यान दें। भोजन के बाद 15 मिनट की सैर मदद कर सकती है! 🚶`,
        };
      }
      return {
        en: `HeartScore: ${heart_score}. Stay consistent with your rituals - you're close to excellent! ✨`,
        hi: `हार्टस्कोर: ${heart_score}। अपनी दिनचर्या में नियमित रहें - आप उत्कृष्टता के करीब हैं! ✨`,
      };
    }

    // Fair score - more targeted advice
    if (heart_score >= 50) {
      if (lowestScore.type === "bp" && lowestScore.score < 60) {
        return {
          en: `Your BP score is ${lowestScore.score}. Consider: reduce stress, limit caffeine, and take your medications on time. ❤️`,
          hi: `आपका BP स्कोर ${lowestScore.score} है। तनाव कम करें, कैफीन सीमित करें, और समय पर दवाई लें। ❤️`,
        };
      }
      if (lowestScore.type === "sugar" && lowestScore.score < 60) {
        return {
          en: `Sugar score: ${lowestScore.score}. Avoid sugary drinks today and choose whole grains over refined carbs. 🍎`,
          hi: `शुगर स्कोर: ${lowestScore.score}। आज मीठे पेय से बचें और रिफाइंड कार्ब्स की जगह साबुत अनाज चुनें। 🍎`,
        };
      }
      return {
        en: `HeartScore: ${heart_score}. Complete both morning and evening rituals to boost your consistency score! 📊`,
        hi: `हार्टस्कोर: ${heart_score}। अपना कंसिस्टेंसी स्कोर बढ़ाने के लिए सुबह और शाम दोनों दिनचर्या पूरी करें! 📊`,
      };
    }

    // Low score - urgent advice
    return {
      en: `HeartScore: ${heart_score}. Your health needs attention today. Start with logging your BP and taking your medications. 🏥`,
      hi: `हार्टस्कोर: ${heart_score}। आज आपके स्वास्थ्य पर ध्यान देने की जरूरत है। BP लॉग करें और दवाई लें। 🏥`,
    };
  }, [todayScore]);

  // Use saved nudge if available and recent (within 12 hours), otherwise use personalized tip
  const displayNudge = useMemo(() => {
    if (nudge?.nudge_text) {
      const nudgeDate = new Date(nudge.created_at);
      const now = new Date();
      const hoursAgo = (now.getTime() - nudgeDate.getTime()) / (1000 * 60 * 60);
      
      // Use saved nudge only if it's recent
      if (hoursAgo < 12) {
        return nudge.nudge_text;
      }
    }
    return language === "hi" ? personalizedTip.hi : personalizedTip.en;
  }, [nudge, personalizedTip, language]);

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-sm">
                {language === "hi" ? "बीट का टिप" : "Beat's Daily Tip"}
              </h3>
              <Logo size="sm" showText={false} className="opacity-50 scale-75" />
            </div>
            
            {isLoading ? (
              <div className="h-12 bg-muted/50 rounded animate-pulse" />
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {displayNudge}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs gap-1.5"
            onClick={() => generateNudge.mutate()}
            disabled={generateNudge.isPending}
          >
            {generateNudge.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
            {language === "hi" ? "नया टिप" : "New Tip"}
          </Button>
        </div>
      </div>
    </Card>
  );
};
