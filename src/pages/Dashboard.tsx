import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Activity, TrendingUp, Users, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import HeartScoreCard from "@/components/HeartScoreCard";
import RitualProgress from "@/components/RitualProgress";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">{t("common.loading")}</div>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("dashboard.goodMorning") : hour < 17 ? t("dashboard.goodAfternoon") : t("dashboard.goodEvening");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {greeting}{user && ", " + (user.email?.split("@")[0] || "Friend")}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("dashboard.tagline")}
          </p>
        </div>

        {/* HeartScore Card */}
        <div className="mb-8">
          <HeartScoreCard />
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t("dashboard.todaysRituals")}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <RitualProgress
              title={t("ritual.morning")}
              subtitle={t("ritual.morningSubtitle")}
              icon={<Sun className="w-6 h-6 text-accent" />}
              completed={false}
              tasks={[
                { label: t("ritual.bloodPressure"), done: false },
                { label: t("ritual.fastingSugar"), done: false },
                { label: t("ritual.sleepQuality"), done: false },
                { label: t("ritual.medsTaken"), done: false },
              ]}
              onStart={() => navigate("/app/checkin/morning")}
            />
            <RitualProgress
              title={t("ritual.evening")}
              subtitle={t("ritual.eveningSubtitle")}
              icon={<Moon className="w-6 h-6 text-primary" />}
              completed={false}
              tasks={[
                { label: t("ritual.bloodPressure"), done: false },
                { label: t("ritual.randomSugar"), done: false },
                { label: t("ritual.stepsCount"), done: false },
                { label: t("ritual.stressLevel"), done: false },
              ]}
              onStart={() => navigate("/app/checkin/evening")}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center border-2 hover:border-primary transition-smooth"
            onClick={() => navigate("/app/insights")}
          >
            <Activity className="w-6 h-6 mb-2 text-primary" />
            <span>{t("dashboard.viewTrends")}</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center border-2 hover:border-secondary transition-smooth"
            onClick={() => navigate("/app/family")}
          >
            <Users className="w-6 h-6 mb-2 text-secondary" />
            <span>{t("dashboard.familyDashboard")}</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center border-2 hover:border-accent transition-smooth"
            onClick={() => navigate("/app/coach")}
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
