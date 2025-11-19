import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface RitualProgressProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  completed: boolean;
  tasks: Array<{ label: string; done: boolean }>;
  onStart: () => void;
}

const RitualProgress = ({
  title,
  subtitle,
  icon,
  completed,
  tasks,
  onStart,
}: RitualProgressProps) => {
  const completedTasks = tasks.filter((t) => t.done).length;
  const progress = (completedTasks / tasks.length) * 100;

  return (
    <Card className="p-6 shadow-card hover:shadow-elevated transition-smooth border-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">
            {completedTasks} of {tasks.length} tasks
          </span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-glow transition-smooth"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2 mb-4">
        {tasks.map((task, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-sm"
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-smooth ${
                task.done
                  ? "bg-primary border-primary"
                  : "border-muted-foreground/30"
              }`}
            >
              {task.done && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className={task.done ? "text-muted-foreground line-through" : ""}>
              {task.label}
            </span>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <Button
        className="w-full h-12 gradient-primary text-white shadow-card"
        onClick={onStart}
        disabled={completed}
      >
        {completed ? "✓ Completed" : "Start Ritual"}
      </Button>
    </Card>
  );
};

export default RitualProgress;
