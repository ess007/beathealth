import { Home, Activity, TrendingUp, Users, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", path: "/app/home" },
  { icon: Activity, label: "Check-in", path: "/app/checkin/morning" },
  { icon: MessageCircle, label: "Pulse", path: "/app/coach" },
  { icon: TrendingUp, label: "Insights", path: "/app/insights" },
  { icon: Users, label: "Family", path: "/app/family" },
];

export const BottomNav = () => {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const navigate = useNavigate();

  return (
    <nav id="bottom-nav" className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border md:hidden transition-all duration-300">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1",
                "transition-all duration-200 active:scale-95",
                isActive
                  ? "text-primary scale-105"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-all duration-200",
                isActive && "stroke-[2.5] scale-110"
              )} />
              <span className={cn(
                "text-xs transition-all duration-200",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
