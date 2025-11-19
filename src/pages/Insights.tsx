import { useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHeartScore } from "@/hooks/useHeartScore";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Heart, Activity, Droplet, TrendingUp, Brain, Sparkles } from "lucide-react";
import { toast } from "sonner";

const Insights = () => {
  const { history } = useHeartScore();
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Fetch AI-generated insights
  const { data: aiInsights, refetch: refetchInsights } = useQuery({
    queryKey: ["ai-insights"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-insights');
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

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
            Track your health trends and get personalized recommendations
          </p>
        </div>

        {/* Summary Metrics */}
        {aiInsights?.summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground uppercase">Avg BP</span>
              </div>
              <p className="text-2xl font-bold">{aiInsights.summary.avgSystolic}/{aiInsights.summary.avgDiastolic}</p>
              <p className="text-xs text-muted-foreground">{aiInsights.summary.dataPoints.bp} readings</p>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-secondary/10 to-secondary/5">
              <div className="flex items-center gap-2 mb-2">
                <Droplet className="w-4 h-4 text-secondary" />
                <span className="text-xs font-medium text-muted-foreground uppercase">Avg Sugar</span>
              </div>
              <p className="text-2xl font-bold">{aiInsights.summary.avgSugar}</p>
              <p className="text-xs text-muted-foreground">{aiInsights.summary.dataPoints.sugar} readings</p>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-accent" />
                <span className="text-xs font-medium text-muted-foreground uppercase">HeartScore</span>
              </div>
              <p className="text-2xl font-bold">{aiInsights.summary.avgHeartScore}/100</p>
              <p className="text-xs text-muted-foreground">30-day average</p>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground uppercase">Activity</span>
              </div>
              <p className="text-2xl font-bold">{aiInsights.summary.avgSteps}</p>
              <p className="text-xs text-muted-foreground">steps/day</p>
            </Card>
          </div>
        )}

        {/* AI Insights Card */}
        {aiInsights && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <div className="flex items-start gap-3 mb-4">
              <Brain className="w-6 h-6 text-primary shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                  AI Health Analysis
                  <Sparkles className="w-4 h-4 text-accent" />
                </h2>
                <p className="text-sm text-muted-foreground">Personalized insights from your health data</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      toast.loading("Generating PDF report...");
                      const { data, error } = await supabase.functions.invoke('generate-pdf-report');
                      
                      if (error) throw error;
                      
                      // Create blob from base64 PDF data
                      const byteCharacters = atob(data.pdf);
                      const byteNumbers = new Array(byteCharacters.length);
                      for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                      }
                      const byteArray = new Uint8Array(byteNumbers);
                      const blob = new Blob([byteArray], { type: 'application/pdf' });
                      
                      // Download PDF
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `health-report-${new Date().toISOString().split('T')[0]}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                      
                      toast.success("Report downloaded!");
                    } catch (error) {
                      console.error('PDF generation error:', error);
                      toast.error("Failed to generate report");
                    }
                  }}
                >
                  Download Report
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    setLoadingInsights(true);
                    await refetchInsights();
                    setLoadingInsights(false);
                    toast.success("Insights refreshed!");
                  }}
                  disabled={loadingInsights}
                >
                  {loadingInsights ? "Analyzing..." : "Refresh"}
                </Button>
              </div>
            </div>
            
            {/* Parse and render insights in structured format */}
            <div className="space-y-4">
              {aiInsights.insights.split('\n\n').map((section: string, idx: number) => {
                if (!section.trim()) return null;
                
                // Check if it's a heading (contains ** or starts with #)
                const isHeading = section.includes('**') || section.startsWith('#');
                
                if (isHeading) {
                  const cleanHeading = section.replace(/[*#]/g, '').trim();
                  return (
                    <div key={idx} className="pt-4 first:pt-0">
                      <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                        {cleanHeading.includes('Correlation') && <TrendingUp className="w-4 h-4 text-primary" />}
                        {cleanHeading.includes('Trend') && <Activity className="w-4 h-4 text-accent" />}
                        {cleanHeading.includes('Recommendation') && <Sparkles className="w-4 h-4 text-secondary" />}
                        {cleanHeading}
                      </h3>
                    </div>
                  );
                }
                
                // Render as bullet points or paragraphs
                const lines = section.split('\n').filter(l => l.trim());
                return (
                  <div key={idx} className="space-y-2">
                    {lines.map((line, lineIdx) => {
                      const isBullet = line.trim().startsWith('-') || line.trim().startsWith('•');
                      const cleanLine = line.replace(/^[-•]\s*/, '').trim();
                      
                      if (isBullet) {
                        return (
                          <div key={lineIdx} className="flex items-start gap-2 pl-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                            <p className="text-sm text-foreground leading-relaxed">{cleanLine}</p>
                          </div>
                        );
                      }
                      
                      return (
                        <p key={lineIdx} className="text-sm text-foreground leading-relaxed">
                          {cleanLine}
                        </p>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Correlations */}
            {aiInsights.correlations && (
              <div className="mt-6 pt-6 border-t border-border/50">
                <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Health Correlations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(aiInsights.correlations).map(([key, value]: [string, any]) => {
                    const correlation = value as number;
                    const strength = Math.abs(correlation);
                    const label = key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/And/g, '&')
                      .trim();
                    
                    return (
                      <div key={key} className="flex items-center gap-3 p-4 rounded-lg bg-background border border-border/50">
                        <div className="relative w-12 h-12 shrink-0">
                          <svg className="transform -rotate-90 w-12 h-12">
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              stroke="hsl(var(--muted))"
                              strokeWidth="4"
                              fill="none"
                            />
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              stroke={strength > 0.5 ? 'hsl(var(--primary))' : strength > 0.3 ? 'hsl(var(--accent))' : 'hsl(var(--muted))'}
                              strokeWidth="4"
                              fill="none"
                              strokeDasharray={`${strength * 125.6} 125.6`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold">{(strength * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{label}</p>
                          <p className="text-xs text-muted-foreground">
                            {correlation > 0 ? 'Positive' : 'Negative'} correlation
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        )}

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
