import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, Brain, Heart, Moon, Salad, PersonStanding, 
  Timer, Sparkles, CheckCircle2, Play 
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";

interface WellnessActivity {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string | null;
  duration_minutes: number | null;
  suitable_for: string[] | null;
}

const categoryIcons: Record<string, any> = {
  exercise: PersonStanding,
  meditation: Brain,
  breathing: Activity,
  sleep: Moon,
  nutrition: Salad,
  cardio: Heart,
};

const difficultyColors: Record<string, string> = {
  easy: "bg-green-500/10 text-green-600",
  medium: "bg-yellow-500/10 text-yellow-600",
  hard: "bg-red-500/10 text-red-600",
};

export const WellnessActivities = () => {
  const { language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("all");
  const [startedActivities, setStartedActivities] = useState<Set<string>>(new Set());

  const { data: activities, isLoading } = useQuery({
    queryKey: ["wellness-activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wellness_activities")
        .select("*")
        .eq("is_active", true)
        .order("category");
      if (error) throw error;
      return data as WellnessActivity[];
    },
  });

  const categories = ["all", ...new Set(activities?.map(a => a.category) || [])];

  const filteredActivities = activeCategory === "all"
    ? activities
    : activities?.filter(a => a.category === activeCategory);

  const startActivity = (activity: WellnessActivity) => {
    haptic("medium");
    setStartedActivities(prev => new Set([...prev, activity.id]));
    toast.success(
      language === "hi" 
        ? `${activity.title} शुरू करें!` 
        : `Starting ${activity.title}!`
    );
    
    // In a real app, you might start a timer or open a guided experience
    setTimeout(() => {
      setStartedActivities(prev => {
        const next = new Set(prev);
        next.delete(activity.id);
        return next;
      });
      toast.success(
        language === "hi" 
          ? "बहुत बढ़िया! गतिविधि पूरी हुई 🎉" 
          : "Great job! Activity completed 🎉"
      );
    }, 3000);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">
          {language === "hi" 
            ? "अभी कोई गतिविधियां उपलब्ध नहीं हैं" 
            : "No wellness activities available yet"}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-serif font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          {language === "hi" ? "कल्याण गतिविधियां" : "Wellness Activities"}
        </h2>
      </div>

      {/* Category Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full flex overflow-x-auto no-scrollbar h-auto p-1 bg-muted/50">
          {categories.map(cat => {
            const Icon = categoryIcons[cat] || Activity;
            return (
              <TabsTrigger
                key={cat}
                value={cat}
                onClick={() => setActiveCategory(cat)}
                className="flex-1 min-w-fit capitalize gap-1.5 data-[state=active]:bg-background"
              >
                <Icon className="w-4 h-4" />
                {cat === "all" ? (language === "hi" ? "सभी" : "All") : cat}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-4">
          <div className="grid gap-3">
            {filteredActivities?.map(activity => {
              const Icon = categoryIcons[activity.category] || Activity;
              const isStarted = startedActivities.has(activity.id);
              
              return (
                <Card 
                  key={activity.id}
                  className={`p-4 transition-all ${isStarted ? "ring-2 ring-primary" : ""}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      isStarted ? "bg-primary text-primary-foreground" : "bg-primary/10"
                    }`}>
                      {isStarted ? (
                        <CheckCircle2 className="w-6 h-6 animate-pulse" />
                      ) : (
                        <Icon className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold">{activity.title}</h3>
                        <div className="flex gap-1.5 shrink-0">
                          {activity.duration_minutes && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Timer className="w-3 h-3" />
                              {activity.duration_minutes}m
                            </Badge>
                          )}
                          {activity.difficulty && (
                            <Badge className={`text-xs ${difficultyColors[activity.difficulty] || ""}`}>
                              {activity.difficulty}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {activity.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {activity.description}
                        </p>
                      )}
                      
                      <Button
                        size="sm"
                        variant={isStarted ? "secondary" : "default"}
                        onClick={() => !isStarted && startActivity(activity)}
                        disabled={isStarted}
                        className="gap-1.5"
                      >
                        {isStarted ? (
                          <>
                            <Activity className="w-4 h-4 animate-spin" />
                            {language === "hi" ? "जारी है..." : "In progress..."}
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            {language === "hi" ? "शुरू करें" : "Start"}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
