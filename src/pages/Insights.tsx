import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ArrowLeft, TrendingUp, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Insights = () => {
  const navigate = useNavigate();

  // Mock data for charts
  const heartScoreData = [
    { date: "Mon", score: 78 },
    { date: "Tue", score: 80 },
    { date: "Wed", score: 79 },
    { date: "Thu", score: 82 },
    { date: "Fri", score: 81 },
    { date: "Sat", score: 85 },
    { date: "Sun", score: 82 },
  ];

  const bpData = [
    { date: "Mon", systolic: 125, diastolic: 82 },
    { date: "Tue", systolic: 122, diastolic: 80 },
    { date: "Wed", systolic: 128, diastolic: 84 },
    { date: "Thu", systolic: 120, diastolic: 78 },
    { date: "Fri", systolic: 118, diastolic: 76 },
    { date: "Sat", systolic: 122, diastolic: 80 },
    { date: "Sun", systolic: 120, diastolic: 78 },
  ];

  const sugarData = [
    { date: "Mon", fasting: 105, random: 140 },
    { date: "Tue", fasting: 102, random: 135 },
    { date: "Wed", fasting: 108, random: 145 },
    { date: "Thu", fasting: 100, random: 130 },
    { date: "Fri", fasting: 98, random: 128 },
    { date: "Sat", fasting: 103, random: 138 },
    { date: "Sun", fasting: 100, random: 132 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app/home")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <span className="font-semibold">Insights & Trends</span>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Tabs defaultValue="heart" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-14">
            <TabsTrigger value="heart" className="text-base">
              <Heart className="w-4 h-4 mr-2" />
              HeartScore
            </TabsTrigger>
            <TabsTrigger value="bp" className="text-base">
              <Activity className="w-4 h-4 mr-2" />
              Blood Pressure
            </TabsTrigger>
            <TabsTrigger value="sugar" className="text-base">
              <TrendingUp className="w-4 h-4 mr-2" />
              Blood Sugar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="heart" className="space-y-6">
            <Card className="p-6 shadow-card">
              <h3 className="text-xl font-semibold mb-4">7-Day HeartScore Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={heartScoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
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
                    dot={{ fill: "hsl(var(--primary))", r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 shadow-card">
              <h3 className="text-lg font-semibold mb-2">Weekly Summary</h3>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Average Score</p>
                  <p className="text-2xl font-bold text-primary">81</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Best Day</p>
                  <p className="text-2xl font-bold text-secondary">85</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="bp" className="space-y-6">
            <Card className="p-6 shadow-card">
              <h3 className="text-xl font-semibold mb-4">7-Day Blood Pressure Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bpData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
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
                    strokeWidth={3}
                    name="Systolic"
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={3}
                    name="Diastolic"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="sugar" className="space-y-6">
            <Card className="p-6 shadow-card">
              <h3 className="text-xl font-semibold mb-4">7-Day Blood Sugar Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sugarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="fasting"
                    stroke="hsl(var(--accent))"
                    strokeWidth={3}
                    name="Fasting"
                  />
                  <Line
                    type="monotone"
                    dataKey="random"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    name="Random"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Insights;
