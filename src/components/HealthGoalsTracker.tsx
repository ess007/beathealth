import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useHealthGoals } from "@/hooks/useHealthGoals";
import { Target, TrendingUp, Calendar, Plus, Trash2, CheckCircle } from "lucide-react";
import { Progress } from "./ui/progress";

const GOAL_TYPES = {
  bp_control: { label: "BP Control", unit: "mmHg", icon: "🫀" },
  weight_loss: { label: "Weight Loss", unit: "kg", icon: "⚖️" },
  step_count: { label: "Daily Steps", unit: "steps", icon: "👟" },
  sugar_control: { label: "Sugar Control", unit: "mg/dL", icon: "🩸" },
  consistency: { label: "Check-in Streak", unit: "days", icon: "🔥" },
};

export const HealthGoalsTracker = () => {
  const { goals, createGoal, updateGoal, deleteGoal } = useHealthGoals();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    goal_type: "",
    target_value: "",
    target_date: "",
    notes: "",
  });

  const handleCreateGoal = () => {
    if (!newGoal.goal_type || !newGoal.target_value) {
      return;
    }

    createGoal({
      goal_type: newGoal.goal_type,
      target_value: parseFloat(newGoal.target_value),
      target_date: newGoal.target_date || undefined,
      notes: newGoal.notes || undefined,
    });

    setNewGoal({ goal_type: "", target_value: "", target_date: "", notes: "" });
    setIsDialogOpen(false);
  };

  const activeGoals = goals.filter((g) => g.status === "active");

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Health Goals</h2>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set a New Health Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Goal Type</Label>
                <Select
                  value={newGoal.goal_type}
                  onValueChange={(value) => setNewGoal({ ...newGoal, goal_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select goal type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(GOAL_TYPES).map(([key, { label, icon }]) => (
                      <SelectItem key={key} value={key}>
                        {icon} {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target Value</Label>
                <Input
                  type="number"
                  placeholder={
                    newGoal.goal_type
                      ? `Target ${GOAL_TYPES[newGoal.goal_type as keyof typeof GOAL_TYPES]?.unit}`
                      : "Enter target"
                  }
                  value={newGoal.target_value}
                  onChange={(e) => setNewGoal({ ...newGoal, target_value: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Target Date (Optional)</Label>
                <Input
                  type="date"
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Input
                  placeholder="Add any notes..."
                  value={newGoal.notes}
                  onChange={(e) => setNewGoal({ ...newGoal, notes: e.target.value })}
                />
              </div>

              <Button onClick={handleCreateGoal} className="w-full">
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {activeGoals.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No active goals yet</p>
          <p className="text-sm">Set a goal to start tracking your progress</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeGoals.map((goal) => {
            const goalInfo = GOAL_TYPES[goal.goal_type as keyof typeof GOAL_TYPES];
            const progress = goal.current_value
              ? Math.min(100, (goal.current_value / goal.target_value) * 100)
              : 0;

            return (
              <div
                key={goal.id}
                className="p-4 border border-border rounded-lg bg-gradient-to-r from-background to-muted/20"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{goalInfo?.icon}</span>
                    <div>
                      <h3 className="font-semibold">{goalInfo?.label}</h3>
                      {goal.notes && (
                        <p className="text-xs text-muted-foreground">{goal.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {progress >= 100 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          updateGoal({
                            goalId: goal.id,
                            updates: { status: "completed" },
                          })
                        }
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGoal(goal.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="font-medium">
                        {goal.current_value || 0} / {goal.target_value} {goalInfo?.unit}
                      </span>
                    </div>
                    {goal.target_date && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span className="text-xs">
                          {new Date(goal.target_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">
                    {progress.toFixed(0)}% complete
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
