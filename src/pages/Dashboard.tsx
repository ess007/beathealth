import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sun, Moon, Activity, TrendingUp, Users, MessageCircle, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import HeartScoreCard from "@/components/HeartScoreCard";
import RitualProgress from "@/components/RitualProgress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStreaks } from "@/hooks/useStreaks";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { mainStreakCount, isLoading: streaksLoading } = useStreaks();

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  // Fetch today's ritual completion status
  const { data: ritualData, refetch: refetchRituals } = useQuery({
    queryKey: ["rituals", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const today = new Date().toISOString().split("T")[0];
      
      // Fetch behavior logs for today
      const { data: behaviorLogs } = await supabase
        .from("behavior_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("log_date", today);

      // Fetch BP logs for today
      const { data: bpLogs } = await supabase
        .from("bp_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("measured_at", `${today}T00:00:00`)
        .lt("measured_at", `${today}T23:59:59`);

      // Fetch sugar logs for today
      const { data: sugarLogs } = await supabase
        .from("sugar_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("measured_at", `${today}T00:00:00`)
        .lt("measured_at", `${today}T23:59:59`);

      const morningBehavior = behaviorLogs?.find((log) => log.ritual_type === "morning");
      const eveningBehavior = behaviorLogs?.find((log) => log.ritual_type === "evening");
      const morningBP = bpLogs?.find((log) => log.ritual_type === "morning");
      const eveningBP = bpLogs?.find((log) => log.ritual_type === "evening");
      const fastingSugar = sugarLogs?.find((log) => log.measurement_type === "fasting");
      const randomSugar = sugarLogs?.find((log) => log.measurement_type !== "fasting");

      return {
        morning: {
          completed: !!morningBehavior && !!morningBP,
          hasBP: !!morningBP,
          hasSugar: !!fastingSugar,
          hasSleep: !!morningBehavior?.sleep_quality,
          hasMeds: morningBehavior?.meds_taken !== null,
        },
        evening: {
          completed: !!eveningBehavior && !!eveningBP,
          hasBP: !!eveningBP,
          hasSugar: !!randomSugar,
          hasSteps: !!eveningBehavior?.steps_count,
          hasMeds: eveningBehavior?.meds_taken !== null,
        },
      };
    },
    enabled: !!user?.id,
    staleTime: 60 * 1000, // 1 minute
  });

  // Refetch rituals when page gains focus
  useEffect(() => {
    const handleFocus = () => {
      refetchRituals();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetchRituals]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigateTo("/auth");
        } else {
          setUser(session.user);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigateTo("/auth");
      } else {
        setUser(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("dashboard.goodMorning") : hour < 17 ? t("dashboard.goodAfternoon") : t("dashboard.goodEvening");

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6 animate-fade-in">
      <Header />

      <main className="container mx-auto px-4 py-4 md:py-8 max-w-5xl">
        <div className="mb-6 md:mb-8 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
              {greeting}{user && ", " + (user.email?.split("@")[0] || "Friend")}! 👋
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              {t("dashboard.tagline")}
            </p>
          </div>
          
          {!streaksLoading && (
            <Card className="p-3 md:p-4 flex items-center gap-2 md:gap-3 shadow-card shrink-0">
              <Flame className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              <div>
                <p className="text-xl md:text-2xl font-bold">{mainStreakCount}</p>
                <p className="text-xs text-muted-foreground whitespace-nowrap">{t("dashboard.daysStrong")}</p>
              </div>
            </Card>
          )}
        </div>

        {/* HeartScore Card */}
        <div className="mb-6 md:mb-8">
          <HeartScoreCard />
        </div>

        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">{t("dashboard.todaysRituals")}</h2>
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <RitualProgress
              title={t("ritual.morning")}
              subtitle={t("ritual.morningSubtitle")}
              icon={<Sun className="w-6 h-6 text-accent" />}
              completed={ritualData?.morning.completed || false}
              tasks={[
                { label: t("ritual.bloodPressure"), done: ritualData?.morning.hasBP || false },
                { label: t("ritual.fastingSugar"), done: ritualData?.morning.hasSugar || false },
                { label: t("ritual.sleepQuality"), done: ritualData?.morning.hasSleep || false },
                { label: t("ritual.medsTaken"), done: ritualData?.morning.hasMeds || false },
              ]}
              onStart={() => navigateTo("/app/checkin/morning")}
            />
            <RitualProgress
              title={t("ritual.evening")}
              subtitle={t("ritual.eveningSubtitle")}
              icon={<Moon className="w-6 h-6 text-primary" />}
              completed={ritualData?.evening.completed || false}
              tasks={[
                { label: t("ritual.bloodPressure"), done: ritualData?.evening.hasBP || false },
                { label: t("ritual.randomSugar"), done: ritualData?.evening.hasSugar || false },
                { label: t("ritual.stepsCount"), done: ritualData?.evening.hasSteps || false },
                { label: t("ritual.stressLevel"), done: false },
              ]}
              onStart={() => navigateTo("/app/checkin/evening")}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center border-2 hover:border-primary transition-smooth"
            onClick={() => navigateTo("/app/insights")}
          >
            <Activity className="w-6 h-6 mb-2 text-primary" />
            <span>{t("dashboard.viewTrends")}</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center border-2 hover:border-secondary transition-smooth"
            onClick={() => navigateTo("/app/family")}
          >
            <Users className="w-6 h-6 mb-2 text-secondary" />
            <span>{t("dashboard.familyDashboard")}</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center border-2 hover:border-accent transition-smooth"
            onClick={() => navigateTo("/app/coach")}
          >
            <MessageCircle className="w-6 h-6 mb-2 text-accent" />
            <span>{t("dashboard.aiCopilot")}</span>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
