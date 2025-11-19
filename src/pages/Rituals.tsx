import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Check, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";

const Rituals = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Fetch today's ritual completion status
  const { data: ritualStatus, isLoading } = useQuery({
    queryKey: ["ritual-status"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const today = new Date().toISOString().split("T")[0];

      // Check morning ritual
      const { data: morningLogs } = await supabase
        .from("behavior_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("log_date", today)
        .eq("ritual_type", "morning")
        .single();

      // Check evening ritual
      const { data: eveningLogs } = await supabase
        .from("behavior_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("log_date", today)
        .eq("ritual_type", "evening")
        .single();

      return {
        morningCompleted: !!morningLogs,
        eveningCompleted: !!eveningLogs,
      };
    },
  });

  const handleStartRitual = (type: "morning" | "evening") => {
    navigate(`/app/checkin/${type}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Daily Check-ins
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Complete your morning and evening rituals to keep your beat strong
          </p>
        </div>

        <div className="space-y-4">
          {/* Morning Ritual Card */}
          <Card className="p-6 transition-all hover:shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-accent/10">
                  <Sun className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                    {t("ritual.morning")}
                    {ritualStatus?.morningCompleted && (
                      <Check className="w-6 h-6 text-green-500" />
                    )}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("ritual.morningSubtitle")}
                  </p>
                </div>
              </div>
            </div>

            {ritualStatus?.morningCompleted ? (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <Check className="w-5 h-5 text-green-500" />
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Morning ritual completed! Great job!
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Blood Pressure</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Fasting Sugar (optional)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Sleep Quality</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Medications</span>
                  </div>
                </div>
                <Button
                  onClick={() => handleStartRitual("morning")}
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  Start Morning Check-in
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </>
            )}
          </Card>

          {/* Evening Ritual Card */}
          <Card className="p-6 transition-all hover:shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Moon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                    {t("ritual.evening")}
                    {ritualStatus?.eveningCompleted && (
                      <Check className="w-6 h-6 text-green-500" />
                    )}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("ritual.eveningSubtitle")}
                  </p>
                </div>
              </div>
            </div>

            {ritualStatus?.eveningCompleted ? (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <Check className="w-5 h-5 text-green-500" />
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Evening ritual completed! Well done!
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Blood Pressure</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Random Sugar (optional)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Steps Count</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Stress Level</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Medications</span>
                  </div>
                </div>
                <Button
                  onClick={() => handleStartRitual("evening")}
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  Start Evening Check-in
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Rituals;
