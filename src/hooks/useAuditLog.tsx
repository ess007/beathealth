import { supabase } from "@/integrations/supabase/client";

interface AuditLogEntry {
  actor_id: string;
  target_user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata?: Record<string, any>;
}

export const useAuditLog = () => {
  const logAccess = async (entry: AuditLogEntry) => {
    try {
      const { error } = await supabase.from("audit_logs").insert({
        actor_id: entry.actor_id,
        target_user_id: entry.target_user_id,
        action: entry.action,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
        metadata: entry.metadata || {},
      });

      if (error) {
        console.error("Failed to log audit entry:", error);
      }
    } catch (err) {
      console.error("Audit logging error:", err);
    }
  };

  const getAuditLogs = async (targetUserId: string, limit = 50) => {
    const { data, error } = await supabase
      .from("audit_logs")
      .select(`
        *,
        actor:profiles!audit_logs_actor_id_fkey(full_name, email)
      `)
      .eq("target_user_id", targetUserId)
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Failed to fetch audit logs:", error);
      return [];
    }

    return data || [];
  };

  return { logAccess, getAuditLogs };
};
