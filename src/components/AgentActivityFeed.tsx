import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Sparkles, 
  Target, 
  Bell, 
  AlertTriangle,
  Clock,
  Undo2,
  ChevronDown,
  ChevronUp,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface AgentAction {
  id: string;
  action_type: string;
  action_payload: any;
  trigger_reason: string;
  trigger_type: string;
  status: string;
  created_at: string;
  reverted_at?: string;
  revert_reason?: string;
}

const actionIcons: Record<string, any> = {
  auto_nudge: Bell,
  auto_celebrate: Sparkles,
  auto_goal_adjust: Target,
  escalate_concern: AlertTriangle,
  schedule_followup: Clock,
};

const actionColors: Record<string, string> = {
  auto_nudge: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  auto_celebrate: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  auto_goal_adjust: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  escalate_concern: "bg-red-500/10 text-red-600 border-red-500/20",
  schedule_followup: "bg-secondary/10 text-secondary border-secondary/20",
};

export function AgentActivityFeed() {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(true);
  const [revertingId, setRevertingId] = useState<string | null>(null);

  const { data: actions, isLoading } = useQuery({
    queryKey: ["agent-actions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("agent_action_log")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as AgentAction[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Real-time subscription
  useEffect(() => {
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('agent-actions-feed')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_action_log',
          filter: `user_id=eq.${user.id}`
        }, () => {
          queryClient.invalidateQueries({ queryKey: ["agent-actions"] });
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtime();
  }, [queryClient]);

  const handleRevert = async (action: AgentAction) => {
    try {
      setRevertingId(action.id);
      
      // Update the action status
      await supabase
        .from("agent_action_log")
        .update({
          status: "reverted",
          reverted_at: new Date().toISOString(),
          revert_reason: "User requested revert"
        })
        .eq("id", action.id);

      // Reverse the action based on type
      if (action.action_type === "auto_goal_adjust" && action.action_payload?.previousTarget) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("health_goals")
            .update({ target_value: action.action_payload.previousTarget })
            .eq("user_id", user.id)
            .eq("goal_type", action.action_payload.goal_type)
            .eq("status", "active");
        }
      }

      queryClient.invalidateQueries({ queryKey: ["agent-actions"] });
      toast.success("Action reverted successfully");
    } catch (error) {
      console.error("Revert error:", error);
      toast.error("Failed to revert action");
    } finally {
      setRevertingId(null);
    }
  };

  const recentActions = actions?.filter(a => a.status === "completed").slice(0, 5) || [];
  const hasActions = recentActions.length > 0;

  if (!hasActions && !isLoading) {
    return null;
  }

  return (
    <Card className="overflow-hidden border-border/50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-sm">Agent Activity</h3>
            <p className="text-xs text-muted-foreground">
              {recentActions.length} recent action{recentActions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
            <Activity className="w-3 h-3 mr-1" />
            Active
          </Badge>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border/50">
          <ScrollArea className="max-h-64">
            <div className="p-3 space-y-2">
              {isLoading ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Loading agent activity...
                </div>
              ) : recentActions.length === 0 ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No recent agent actions
                </div>
              ) : (
                recentActions.map((action) => {
                  const Icon = actionIcons[action.action_type] || Bot;
                  const colorClass = actionColors[action.action_type] || "bg-muted text-muted-foreground";
                  const isReverted = action.status === "reverted";
                  const canRevert = action.action_type === "auto_goal_adjust" && !isReverted;

                  return (
                    <div 
                      key={action.id} 
                      className={`flex items-start gap-3 p-3 rounded-lg bg-muted/30 ${isReverted ? 'opacity-60' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass} border`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            {action.action_type.replace(/_/g, ' ').replace('auto ', '')}
                          </p>
                          {isReverted && (
                            <Badge variant="outline" className="text-xs">Reverted</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {action.action_payload?.message || 
                           action.action_payload?.reason ||
                           action.trigger_reason}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 mt-1">
                          {formatDistanceToNow(new Date(action.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {canRevert && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevert(action)}
                          disabled={revertingId === action.id}
                          className="shrink-0 h-7 text-xs"
                        >
                          <Undo2 className="w-3 h-3 mr-1" />
                          Undo
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </Card>
  );
}
