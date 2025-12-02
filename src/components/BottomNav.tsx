import { Home, Activity, TrendingUp, Users, MessageCircle, ShoppingBag, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { haptic } from "@/lib/haptics";

const navItems = [
  { icon: Home, label: "Home", path: "/app/home" },
  { icon: Activity, label: "Check-in", path: "/app/checkin" },
  { icon: MessageCircle, label: "Beat", path: "/app/coach", highlight: true },
  { icon: TrendingUp, label: "Insights", path: "/app/insights" },
  { icon: Users, label: "Family", path: "/app/family" },
];

export const BottomNav = () => {
  const location = useLocation();
  const pathname = location.pathname;
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
              onClick={() => {
                haptic('light');
                navigate(item.path);
              }}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 min-w-[52px]",
                "transition-all duration-200 active:scale-95 touch-manipulation",
                isActive
                  ? "text-primary scale-105"
                  : "text-muted-foreground hover:text-foreground",
                item.highlight && !isActive && "text-primary/70"
              )}
            >
              <div className={cn(
                "relative",
                item.highlight && "p-2 -mt-4 rounded-full bg-primary text-primary-foreground shadow-lg"
              )}>
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-200",
                  isActive && "stroke-[2.5] scale-110",
                  item.highlight && "h-6 w-6"
                )} />
              </div>
              <span className={cn(
                "text-xs transition-all duration-200",
                isActive && "font-semibold",
                item.highlight && "-mt-1"
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
