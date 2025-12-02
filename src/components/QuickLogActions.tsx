import { Button } from "@/components/ui/button";
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
      label: language === "hi" ? "बीपी लॉग करें" : "Log BP",
      icon: Activity,
      path: "/app/checkin/morning",
      color: "from-rose-500 to-pink-600",
      bgColor: "bg-rose-500/10",
    },
    {
      label: language === "hi" ? "शुगर लॉग करें" : "Log Sugar",
      icon: Droplets,
      path: "/app/checkin/morning",
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-500/10",
    },
    {
      label: language === "hi" ? "नींद लॉग करें" : "Log Sleep",
      icon: Moon,
      path: "/app/checkin/morning",
      color: "from-indigo-500 to-purple-600",
      bgColor: "bg-indigo-500/10",
    },
    {
      label: language === "hi" ? "कदम लॉग करें" : "Log Steps",
      icon: Footprints,
      path: "/app/checkin/evening",
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={() => handleAction(action.path)}
          className={`group relative overflow-hidden rounded-2xl ${action.bgColor} p-4 md:p-5 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border border-transparent hover:border-primary/20`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
          
          <div className="flex flex-col items-center text-center gap-3">
            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
              <action.icon className="w-7 h-7 md:w-8 md:h-8" />
            </div>
            <span className="font-medium text-sm md:text-base">{action.label}</span>
          </div>
        </button>
      ))}
    </div>
  );
};
