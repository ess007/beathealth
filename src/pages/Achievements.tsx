import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Award } from "lucide-react";
import { useAchievements } from "@/hooks/useAchievements";
import { AchievementBadge } from "@/components/AchievementBadge";

const Achievements = () => {
  const { achievements, isLoading, checkAndAwardBadges, shareBadge } = useAchievements();

  useEffect(() => {
    // Check for new achievements on page load
    checkAndAwardBadges();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6 animate-fade-in">
      <Header />

      <main className="container mx-auto px-4 py-4 md:py-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Your Achievements</h1>
          <p className="text-muted-foreground">
            Celebrate your health milestones and keep up the great work!
          </p>
        </div>

        {achievements.length === 0 ? (
          <Card className="p-8 text-center">
            <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No achievements yet</h2>
            <p className="text-muted-foreground mb-4">
              Complete your daily rituals and maintain healthy habits to earn badges!
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="p-4 border border-dashed border-border rounded-lg">
                <p className="text-sm font-medium mb-1">🔥 7-Day Warrior</p>
                <p className="text-xs text-muted-foreground">7 days streak</p>
              </div>
              <div className="p-4 border border-dashed border-border rounded-lg">
                <p className="text-sm font-medium mb-1">🏆 30-Day Champion</p>
                <p className="text-xs text-muted-foreground">30 days streak</p>
              </div>
              <div className="p-4 border border-dashed border-border rounded-lg">
                <p className="text-sm font-medium mb-1">❤️ BP Master</p>
                <p className="text-xs text-muted-foreground">Healthy BP for 30 days</p>
              </div>
              <div className="p-4 border border-dashed border-border rounded-lg">
                <p className="text-sm font-medium mb-1">⭐ Sugar Champion</p>
                <p className="text-xs text-muted-foreground">Healthy sugar for 30 days</p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                type={achievement.badge_type}
                earnedAt={achievement.earned_at}
                shared={achievement.shared}
                onShare={() => shareBadge(achievement.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Achievements;
