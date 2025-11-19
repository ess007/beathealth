import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHeartScore } from "@/hooks/useHeartScore";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Heart, Activity, Droplet, TrendingUp } from "lucide-react";

const Insights = () => {
  const { history } = useHeartScore();

  // Fetch BP logs for last 30 days
  const { data: bpLogs } = useQuery({
    queryKey: ["bp", "history"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("bp_logs")
        .select("*")
        .eq("user_id", user?.id)
        .gte("measured_at", thirtyDaysAgo.toISOString())
        .order("measured_at", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Fetch sugar logs for last 30 days
  const { data: sugarLogs } = useQuery({
    queryKey: ["sugar", "history"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("sugar_logs")
        .select("*")
        .eq("user_id", user?.id)
        .gte("measured_at", thirtyDaysAgo.toISOString())
        .order("measured_at", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Transform HeartScore data for chart
  const heartScoreData = history?.map((score) => ({
    date: new Date(score.score_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    score: score.heart_score,
    bp: score.bp_score,
    sugar: score.sugar_score,
    consistency: score.consistency_score,
  })) || [];

  // Transform BP data for chart (group by day)
  const bpData = bpLogs?.reduce((acc: any[], log) => {
    const date = new Date(log.measured_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const existing = acc.find((item) => item.date === date);
    if (existing) {
      existing.systolic = (existing.systolic + log.systolic) / 2;
      existing.diastolic = (existing.diastolic + log.diastolic) / 2;
    } else {
      acc.push({
        date,
        systolic: log.systolic,
        diastolic: log.diastolic,
      });
    }
    return acc;
  }, []) || [];

  // Transform sugar data for chart (group by day)
  const sugarData = sugarLogs?.reduce((acc: any[], log) => {
    const date = new Date(log.measured_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const existing = acc.find((item) => item.date === date);
    if (existing) {
      existing.glucose = (existing.glucose + log.glucose_mg_dl) / 2;
    } else {
      acc.push({
        date,
        glucose: log.glucose_mg_dl,
        type: log.measurement_type,
      });
    }
    return acc;
  }, []) || [];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <Header />

      <main className="container mx-auto px-4 py-4 md:py-8 max-w-6xl">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">Health Insights</h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Track your health trends over time
          </p>
        </div>

        <Tabs defaultValue="heartscore" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="heartscore">
              <Heart className="w-4 h-4 mr-2" />
              HeartScore
            </TabsTrigger>
            <TabsTrigger value="bp">
              <Activity className="w-4 h-4 mr-2" />
              Blood Pressure
            </TabsTrigger>
            <TabsTrigger value="sugar">
              <Droplet className="w-4 h-4 mr-2" />
              Sugar Levels
            </TabsTrigger>
          </TabsList>

          <TabsContent value="heartscore" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">HeartScore Trend (30 Days)</h3>
              {heartScoreData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={heartScoreData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis domain={[0, 100]} className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Complete rituals to see your HeartScore trends</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Sub-scores */}
            {heartScoreData.length > 0 && (
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground mb-2">Avg BP Score</div>
                  <div className="text-3xl font-bold text-score-good">
                    {Math.round(
                      heartScoreData.reduce((sum, d) => sum + d.bp, 0) / heartScoreData.length
                    )}
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground mb-2">Avg Sugar Score</div>
                  <div className="text-3xl font-bold text-score-good">
                    {Math.round(
                      heartScoreData.reduce((sum, d) => sum + d.sugar, 0) / heartScoreData.length
                    )}
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground mb-2">Ritual Consistency</div>
                  <div className="text-3xl font-bold text-score-excellent">
                    {Math.round(
                      heartScoreData.reduce((sum, d) => sum + d.consistency, 0) /
                        heartScoreData.length
                    )}
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bp" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Blood Pressure Trend (30 Days)</h3>
              {bpData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={bpData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis domain={[60, 180]} className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="systolic"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Systolic"
                    />
                    <Line
                      type="monotone"
                      dataKey="diastolic"
                      stroke="hsl(var(--secondary))"
                      strokeWidth={2}
                      name="Diastolic"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Log BP readings to see trends</p>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="sugar" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Sugar Levels Trend (30 Days)</h3>
              {sugarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sugarData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis domain={[60, 250]} className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="glucose"
                      stroke="hsl(var(--accent))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--accent))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Droplet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Log sugar levels to see trends</p>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Insights;
