import { Home, Activity, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { haptic } from "@/lib/haptics";
import beatLogo from "@/assets/beat-logo.png";

const navItems = [
  { icon: Home, label: "Home", path: "/app/home" },
  { icon: Activity, label: "Check-in", path: "/app/checkin" },
  { icon: null, label: "Beat", path: "/app/coach", highlight: true, useLogo: true },
  { icon: TrendingUp, label: "Insights", path: "/app/insights" },
  { icon: Users, label: "Family", path: "/app/family" },
];

export const BottomNav = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();

  return (
    <nav id="bottom-nav" className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border md:hidden transition-all duration-300 safe-area-bottom">
      <div className="flex justify-around items-center h-18 px-1">
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
                "flex flex-col items-center justify-center flex-1 h-full gap-0.5 min-w-[56px] py-2",
                "transition-all duration-200 active:scale-95 touch-manipulation",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
                item.highlight && !isActive && "text-primary/70"
              )}
            >
              {item.useLogo ? (
                <div className={cn(
                  "relative -mt-5 p-2.5 rounded-full shadow-lg transition-all duration-300",
                  "bg-primary ring-4 ring-background",
                  isActive && "scale-110 shadow-primary/30"
                )}>
                  <img 
                    src={beatLogo} 
                    alt="Beat" 
                    className="h-7 w-7 brightness-0 invert"
                  />
                </div>
              ) : (
                <div className={cn(
                  "relative p-1.5 rounded-xl transition-all duration-200",
                  isActive && "bg-primary/10"
                )}>
                  {Icon && <Icon className={cn(
                    "h-5 w-5 transition-all duration-200",
                    isActive && "stroke-[2.5]"
                  )} />}
                </div>
              )}
              <span className={cn(
                "text-[10px] transition-all duration-200",
                isActive && "font-semibold text-primary",
                item.highlight && "mt-0.5"
              )}>
                {item.label}
              </span>
              {isActive && !item.highlight && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
