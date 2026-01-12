import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  AlertTriangle, 
  Heart, 
  Droplet, 
  Activity, 
  Check, 
  X,
  Clock,
  Pill,
  TrendingUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface HealthAlert {
  id: string;
  user_id: string;
  alert_type: string;
  message: string;
  severity: string;
  related_date: string | null;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

const ALERT_CONFIG: Record<string, { icon: typeof Heart; color: string; bgColor: string; label: string }> = {
  high_bp: { 
    icon: Heart, 
    color: "text-red-600", 
    bgColor: "bg-red-100 dark:bg-red-500/20",
    label: "High Blood Pressure"
  },
  low_bp: { 
    icon: Heart, 
    color: "text-orange-600", 
    bgColor: "bg-orange-100 dark:bg-orange-500/20",
    label: "Low Blood Pressure"
  },
  high_sugar: { 
    icon: Droplet, 
    color: "text-red-600", 
    bgColor: "bg-red-100 dark:bg-red-500/20",
    label: "High Blood Sugar"
  },
  low_sugar: { 
    icon: Droplet, 
    color: "text-amber-600", 
    bgColor: "bg-amber-100 dark:bg-amber-500/20",
    label: "Low Blood Sugar"
  },
  rapid_change: { 
    icon: TrendingUp, 
    color: "text-purple-600", 
    bgColor: "bg-purple-100 dark:bg-purple-500/20",
    label: "Rapid Change"
  },
  missed_ritual: { 
    icon: Clock, 
    color: "text-blue-600", 
    bgColor: "bg-blue-100 dark:bg-blue-500/20",
    label: "Missed Check-in"
  },
  medication_due: { 
    icon: Pill, 
    color: "text-teal-600", 
    bgColor: "bg-teal-100 dark:bg-teal-500/20",
    label: "Medication Due"
  },
};

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case "high":
      return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
    case "medium":
      return <Badge variant="default" className="text-xs bg-amber-500">Important</Badge>;
    default:
      return <Badge variant="secondary" className="text-xs">Info</Badge>;
  }
};

export const AlertsDrawer = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["health-alerts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("health_alerts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as HealthAlert[];
    },
    staleTime: 30000, // 30 seconds
  });

  // Real-time subscription for new alerts
  useEffect(() => {
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('health-alerts-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'health_alerts',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ["health-alerts"] });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupSubscription();
  }, [queryClient]);

  const unresolvedCount = alerts.filter(a => !a.resolved).length;

  const resolveAlert = async (alertId: string) => {
    try {
      haptic("light");
      
      const { error } = await supabase
        .from("health_alerts")
        .update({ 
          resolved: true,
          resolved_at: new Date().toISOString()
        })
        .eq("id", alertId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["health-alerts"] });
      toast.success("Alert acknowledged");
    } catch (error) {
      console.error("Error resolving alert:", error);
      toast.error("Failed to acknowledge alert");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / 3600000);
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return "Yesterday";
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0">
          <Bell className="w-5 h-5" />
          {unresolvedCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {unresolvedCount > 9 ? "9+" : unresolvedCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Health Alerts
            {unresolvedCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unresolvedCount} new
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-secondary" />
              </div>
              <p className="text-lg font-medium">All Clear!</p>
              <p className="text-sm text-muted-foreground text-center mt-1">
                No health alerts at the moment. Keep up the good work!
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {/* Unresolved alerts first */}
              {alerts.filter(a => !a.resolved).length > 0 && (
                <>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    New Alerts
                  </p>
                  {alerts.filter(a => !a.resolved).map(alert => {
                    const config = ALERT_CONFIG[alert.alert_type] || {
                      icon: AlertTriangle,
                      color: "text-muted-foreground",
                      bgColor: "bg-muted",
                      label: alert.alert_type
                    };
                    const Icon = config.icon;
                    
                    return (
                      <div
                        key={alert.id}
                        className={`relative p-4 rounded-xl border-2 ${
                          alert.severity === "high" 
                            ? "border-destructive/50 bg-destructive/5" 
                            : "border-border bg-card"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center shrink-0`}>
                            <Icon className={`w-5 h-5 ${config.color}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm">{config.label}</p>
                              {getSeverityBadge(alert.severity)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {alert.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(alert.created_at)}
                              {alert.related_date && ` • ${new Date(alert.related_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                            </p>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resolveAlert(alert.id)}
                            className="shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
              
              {/* Resolved alerts */}
              {alerts.filter(a => a.resolved).length > 0 && (
                <>
                  <Separator className="my-4" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Acknowledged
                  </p>
                  {alerts.filter(a => a.resolved).slice(0, 10).map(alert => {
                    const config = ALERT_CONFIG[alert.alert_type] || {
                      icon: AlertTriangle,
                      color: "text-muted-foreground",
                      bgColor: "bg-muted",
                      label: alert.alert_type
                    };
                    const Icon = config.icon;
                    
                    return (
                      <div
                        key={alert.id}
                        className="p-3 rounded-xl bg-muted/30 border border-border/50 opacity-60"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs">{config.label}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {alert.message}
                            </p>
                          </div>
                          
                          <Check className="w-4 h-4 text-secondary shrink-0" />
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
