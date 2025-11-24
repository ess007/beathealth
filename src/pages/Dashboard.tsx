import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sun, Moon, Activity, TrendingUp, Users, MessageCircle, Flame, Pill, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import HeartScoreCard from "@/components/HeartScoreCard";
import RitualProgress from "@/components/RitualProgress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useStreaks } from "@/hooks/useStreaks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { StreakCelebration } from "@/components/StreakCelebration";
import { useAchievements } from "@/hooks/useAchievements";
import { AchievementBadge } from "@/components/AchievementBadge";
import { InteractiveTutorial } from "@/components/InteractiveTutorial";
import { haptic } from "@/lib/haptics";

const Dashboard = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const { mainStreakCount, isLoading: streaksLoading } = useStreaks();
  const { achievements, checkAndAwardBadges } = useAchievements();
  const [showCelebration, setShowCelebration] = useState(false);
  const tiltRef = useRef<HTMLDivElement>(null);

  // Spotlight Effect Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll(".spotlight-card");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty("--mouse-x", `${x}px`);
        (card as HTMLElement).style.setProperty("--mouse-y", `${y}px`);
      });
    };

    const container = document.getElementById("dashboard-grid");
    if (container) container.addEventListener("mousemove", handleMouseMove);
    return () => container?.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // ... [Preserving existing auth/data fetching logic from your original file] ...
  // (I'm re-injecting the critical data fetching hooks here to ensure functionality persists)

  const navigateTo = (path: string) => {
    haptic("light");
    window.location.href = path;
  };

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: ritualData, refetch: refetchRituals } = useQuery({
    queryKey: ["rituals", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const today = new Date().toISOString().split("T")[0];

      // Efficiently fetch only what's needed
      const [behaviorLogs, bpLogs, sugarLogs] = await Promise.all([
        supabase.from("behavior_logs").select("*").eq("user_id", user.id).eq("log_date", today),
        supabase
          .from("bp_logs")
          .select("*")
          .eq("user_id", user.id)
          .gte("measured_at", `${today}T00:00:00`)
          .lt("measured_at", `${today}T23:59:59`),
        supabase
          .from("sugar_logs")
          .select("*")
          .eq("user_id", user.id)
          .gte("measured_at", `${today}T00:00:00`)
          .lt("measured_at", `${today}T23:59:59`),
      ]);

      const morningBehavior = behaviorLogs.data?.find((log) => log.ritual_type === "morning");
      const eveningBehavior = behaviorLogs.data?.find((log) => log.ritual_type === "evening");
      const morningBP = bpLogs.data?.find((log) => log.ritual_type === "morning");
      const eveningBP = bpLogs.data?.find((log) => log.ritual_type === "evening");
      const fastingSugar = sugarLogs.data?.find((log) => log.measurement_type === "fasting");
      const randomSugar = sugarLogs.data?.find((log) => log.measurement_type !== "fasting");

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
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser(session.user);
      else navigateTo("/auth");
    });
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t("dashboard.goodMorning") : hour < 17 ? t("dashboard.goodAfternoon") : t("dashboard.goodEvening");

  return (
    <div className="min-h-screen pb-24 md:pb-6">
      <Header />
      <InteractiveTutorial />
      <StreakCelebration
        show={showCelebration}
        streakCount={mainStreakCount}
        onClose={() => setShowCelebration(false)}
      />

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header Section */}
        <div className="mb-8 flex items-start justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-2 text-gradient-primary">
              {greeting}
              {profile?.full_name && ", " + profile.full_name.split(" ")[0]}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg font-light">{t("dashboard.tagline")}</p>
          </div>

          {!streaksLoading && (
            <div className="glass-panel p-3 rounded-2xl flex items-center gap-3 shrink-0 border border-orange-200/20 bg-orange-500/5">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 animate-pulse">
                <Flame className="w-6 h-6" />
              </div>
              <div className="text-right">
                <p className="text-xl font-bold tabular-nums leading-none">{mainStreakCount}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Streak</p>
              </div>
            </div>
          )}
        </div>

        {/* Main HeartScore Card with 3D Tilt (If wrapped) */}
        <div className="mb-8 transform transition-all duration-500 hover:scale-[1.01]">
          <HeartScoreCard />
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-serif font-semibold mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full"></span>
            {t("dashboard.todaysRituals")}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Morning Ritual - Glass Style */}
            <div className="glass-card rounded-3xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <RitualProgress
                title={t("ritual.morning")}
                subtitle={t("ritual.morningSubtitle")}
                icon={<Sun className="w-6 h-6 text-orange-500" />}
                completed={ritualData?.morning.completed || false}
                tasks={[
                  { label: t("ritual.bloodPressure"), done: ritualData?.morning.hasBP || false },
                  { label: t("ritual.fastingSugar"), done: ritualData?.morning.hasSugar || false },
                  { label: t("ritual.sleepQuality"), done: ritualData?.morning.hasSleep || false },
                  { label: t("ritual.medsTaken"), done: ritualData?.morning.hasMeds || false },
                ]}
                onStart={() => navigateTo("/app/checkin/morning")}
              />
            </div>

            {/* Evening Ritual - Glass Style */}
            <div className="glass-card rounded-3xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <RitualProgress
                title={t("ritual.evening")}
                subtitle={t("ritual.eveningSubtitle")}
                icon={<Moon className="w-6 h-6 text-indigo-500" />}
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
        </div>

        {/* Quick Actions Grid with Spotlight */}
        <h2 className="text-xl font-serif font-semibold mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-secondary rounded-full"></span>
          Quick Access
        </h2>
        <div id="dashboard-grid" className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              title: t("dashboard.viewTrends"),
              icon: TrendingUp,
              color: "text-blue-500",
              bg: "bg-blue-500/10",
              action: () => navigateTo("/app/insights"),
            },
            {
              title: t("dashboard.familyDashboard"),
              icon: Users,
              color: "text-purple-500",
              bg: "bg-purple-500/10",
              action: () => navigateTo("/app/family"),
            },
            {
              title: t("dashboard.aiCopilot"),
              icon: MessageCircle,
              color: "text-rose-500",
              bg: "bg-rose-500/10",
              action: () => navigateTo("/app/coach"),
            },
            {
              title: "Medications",
              icon: Pill,
              color: "text-emerald-500",
              bg: "bg-emerald-500/10",
              action: () => navigateTo("/app/medications"),
            },
          ].map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className="spotlight-card relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 text-left transition-all hover:bg-accent/5 group"
            >
              <div
                className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <span className="font-medium text-sm md:text-base">{item.title}</span>
            </button>
          ))}
        </div>

        {/* Achievements Ticker */}
        {achievements && achievements.length > 0 && (
          <div className="mt-8 p-1 overflow-hidden">
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="snap-center shrink-0 w-64">
                  <AchievementBadge type={achievement.badge_type} earnedAt={achievement.earned_at} size="small" />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
