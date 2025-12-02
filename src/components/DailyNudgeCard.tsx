import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHeartScore } from "@/hooks/useHeartScore";
import { useMemo } from "react";
import { haptic } from "@/lib/haptics";

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

    const scores = [
      { type: "bp", score: bp_score || 0 },
      { type: "sugar", score: sugar_score || 0 },
      { type: "consistency", score: consistency_score || 0 },
    ];
    
    const lowestScore = scores.reduce((min, curr) => 
      curr.score < min.score ? curr : min
    );

    if (heart_score >= 80) {
      return {
        en: `HeartScore ${heart_score}! 🌟 You're doing amazing. Keep up the great work!`,
        hi: `हार्टस्कोर ${heart_score}! 🌟 आप बहुत अच्छा कर रहे हैं। जारी रखें!`,
      };
    }

    if (heart_score >= 70) {
      if (lowestScore.type === "bp") {
        return {
          en: `Score: ${heart_score}. Try deep breathing and reduce salt today. 💪`,
          hi: `स्कोर: ${heart_score}। आज गहरी सांस लें और नमक कम करें। 💪`,
        };
      }
      if (lowestScore.type === "sugar") {
        return {
          en: `Score: ${heart_score}. A 15-min walk after meals helps blood sugar! 🚶`,
          hi: `स्कोर: ${heart_score}। भोजन के बाद 15 मिनट सैर करें! 🚶`,
        };
      }
      return {
        en: `Score: ${heart_score}. Stay consistent - you're close to excellent! ✨`,
        hi: `स्कोर: ${heart_score}। नियमित रहें - आप उत्कृष्ट के करीब हैं! ✨`,
      };
    }

    if (heart_score >= 50) {
      if (lowestScore.type === "bp" && lowestScore.score < 60) {
        return {
          en: `BP needs attention. Reduce stress and take meds on time. ❤️`,
          hi: `BP पर ध्यान दें। तनाव कम करें, समय पर दवाई लें। ❤️`,
        };
      }
      if (lowestScore.type === "sugar" && lowestScore.score < 60) {
        return {
          en: `Avoid sugary drinks today. Choose whole grains! 🍎`,
          hi: `आज मीठे पेय से बचें। साबुत अनाज चुनें! 🍎`,
        };
      }
      return {
        en: `Complete both rituals to boost your consistency score! 📊`,
        hi: `कंसिस्टेंसी बढ़ाने के लिए दोनों दिनचर्या पूरी करें! 📊`,
      };
    }

    return {
      en: `Your health needs attention today. Start with logging your BP. 🏥`,
      hi: `आज स्वास्थ्य पर ध्यान दें। BP लॉग करें और दवाई लें। 🏥`,
    };
  }, [todayScore]);

  const displayNudge = useMemo(() => {
    if (nudge?.nudge_text) {
      const nudgeDate = new Date(nudge.created_at);
      const now = new Date();
      const hoursAgo = (now.getTime() - nudgeDate.getTime()) / (1000 * 60 * 60);
      if (hoursAgo < 12) return nudge.nudge_text;
    }
    return language === "hi" ? personalizedTip.hi : personalizedTip.en;
  }, [nudge, personalizedTip, language]);

  return (
    <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-primary/5 via-card to-secondary/5">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-semibold text-sm">
                {language === "hi" ? "बीट का टिप" : "Beat's Tip"}
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 rounded-full"
                onClick={() => {
                  haptic('light');
                  generateNudge.mutate();
                }}
                disabled={generateNudge.isPending}
              >
                {generateNudge.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
            
            {isLoading ? (
              <div className="h-10 bg-muted/50 rounded-lg skeleton-shimmer" />
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {displayNudge}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
