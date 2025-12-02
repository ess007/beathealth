import { Button } from "@/components/ui/button";
import { Check, ChevronRight } from "lucide-react";
import { haptic } from "@/lib/haptics";

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
    <div className="p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-base">{title}</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {completed && (
          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
            <Check className="w-4 h-4 text-secondary" strokeWidth={3} />
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">
            {completedTasks}/{tasks.length} completed
          </span>
          <span className="font-semibold text-foreground">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Task List - Compact */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {tasks.map((task, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
              task.done 
                ? "bg-secondary/10 text-secondary" 
                : "bg-muted/50 text-muted-foreground"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                task.done
                  ? "bg-secondary border-secondary"
                  : "border-muted-foreground/30"
              }`}
            >
              {task.done && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
            </div>
            <span className={`truncate ${task.done ? "font-medium" : ""}`}>
              {task.label}
            </span>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <Button
        className={`w-full h-12 rounded-xl font-semibold text-sm transition-all duration-300 ${
          completed 
            ? "bg-secondary/10 text-secondary hover:bg-secondary/20" 
            : "gradient-primary text-white shadow-md hover:shadow-lg hover:opacity-90"
        }`}
        onClick={() => {
          if (!completed) {
            haptic('medium');
            onStart();
          }
        }}
        disabled={completed}
      >
        {completed ? (
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            Completed
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Start Ritual
            <ChevronRight className="w-4 h-4" />
          </span>
        )}
      </Button>
    </div>
  );
};

export default RitualProgress;
