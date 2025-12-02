import { Activity, Droplets, Moon, Footprints } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { haptic } from "@/lib/haptics";
import { useNavigate } from "react-router-dom";

export const QuickLogActions = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const handleAction = (path: string) => {
    haptic("medium");
    navigate(path);
  };

  const actions = [
    {
      label: language === "hi" ? "बीपी" : "BP",
      icon: Activity,
      path: "/app/checkin/morning",
      gradient: "from-primary to-accent",
      iconBg: "bg-primary/10",
    },
    {
      label: language === "hi" ? "शुगर" : "Sugar",
      icon: Droplets,
      path: "/app/checkin/morning",
      gradient: "from-blue-500 to-cyan-500",
      iconBg: "bg-blue-500/10",
    },
    {
      label: language === "hi" ? "नींद" : "Sleep",
      icon: Moon,
      path: "/app/checkin/morning",
      gradient: "from-indigo-500 to-violet-500",
      iconBg: "bg-indigo-500/10",
    },
    {
      label: language === "hi" ? "कदम" : "Steps",
      icon: Footprints,
      path: "/app/checkin/evening",
      gradient: "from-secondary to-emerald-500",
      iconBg: "bg-secondary/10",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={() => handleAction(action.path)}
          className="group flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl bg-card border border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
        >
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
            <action.icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
          </div>
          <span className="text-xs sm:text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
};
