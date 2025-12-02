import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Logo } from "@/components/Logo";

interface DailyNudgeCardProps {
  userId?: string;
}

export const DailyNudgeCard = ({ userId }: DailyNudgeCardProps) => {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();

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

  const defaultNudges = [
    {
      en: "Start your day with a glass of warm water. Small habits lead to big changes! 💧",
      hi: "अपने दिन की शुरुआत एक गिलास गुनगुने पानी से करें। छोटी आदतें बड़े बदलाव लाती हैं! 💧",
    },
    {
      en: "Remember to check your BP today. Consistency is key to heart health! ❤️",
      hi: "आज अपना बीपी जांचना याद रखें। नियमितता दिल के स्वास्थ्य की कुंजी है! ❤️",
    },
    {
      en: "A 10-minute walk after meals can help manage blood sugar. Try it today! 🚶",
      hi: "भोजन के बाद 10 मिनट की सैर रक्त शर्करा को नियंत्रित करने में मदद कर सकती है। आज आज़माएं! 🚶",
    },
  ];

  const getRandomNudge = () => {
    const random = defaultNudges[Math.floor(Math.random() * defaultNudges.length)];
    return language === "hi" ? random.hi : random.en;
  };

  const displayNudge = nudge?.nudge_text || getRandomNudge();

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
