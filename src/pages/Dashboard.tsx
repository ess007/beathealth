import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Sun, Moon, Activity, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import HeartScoreCard from "@/components/HeartScoreCard";
import RitualProgress from "@/components/RitualProgress";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth and get user
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Heart className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">Beat</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/app/insights")}>
              <TrendingUp className="w-5 h-5 mr-2" />
              Insights
            </Button>
            <Button variant="ghost" onClick={() => navigate("/app/family")}>
              <Users className="w-5 h-5 mr-2" />
              Family
            </Button>
            {user && (
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"}
            {user && ", " + (user.email?.split("@")[0] || "Friend")}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Let's keep your beat strong today.
          </p>
        </div>

        {/* HeartScore Card */}
        <div className="mb-8">
          <HeartScoreCard score={82} />
        </div>

        {/* Daily Rituals */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Today's Rituals</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <RitualProgress
              title="Morning Ritual"
              subtitle="With chai ☕"
              icon={<Sun className="w-6 h-6 text-accent" />}
              completed={false}
              tasks={[
                { label: "Blood Pressure", done: false },
                { label: "Fasting Sugar", done: false },
                { label: "Sleep Quality", done: false },
                { label: "Meds Taken", done: false },
              ]}
              onStart={() => navigate("/app/checkin/morning")}
            />
            <RitualProgress
              title="Evening Ritual"
              subtitle="After dinner 🍽️"
              icon={<Moon className="w-6 h-6 text-primary" />}
              completed={false}
              tasks={[
                { label: "Blood Pressure", done: false },
                { label: "Random Sugar", done: false },
                { label: "Steps Count", done: false },
                { label: "Stress Level", done: false },
              ]}
              onStart={() => toast.info("Evening ritual coming soon!")}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center border-2 hover:border-primary transition-smooth"
            onClick={() => navigate("/app/insights")}
          >
            <Activity className="w-6 h-6 mb-2 text-primary" />
            <span>View Trends</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center border-2 hover:border-secondary transition-smooth"
            onClick={() => navigate("/app/family")}
          >
            <Users className="w-6 h-6 mb-2 text-secondary" />
            <span>Family Dashboard</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center border-2 hover:border-accent transition-smooth"
            onClick={() => toast.info("AI Copilot coming soon!")}
          >
            <Heart className="w-6 h-6 mb-2 text-accent" />
            <span>AI Copilot</span>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
