import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: string | null;
  frequency: string;
  custom_times: string[] | null;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicationLog {
  id: string;
  user_id: string;
  medication_id: string;
  scheduled_at: string;
  taken_at: string | null;
  skipped: boolean;
  notes: string | null;
  created_at: string;
}

export const useMedications = (userId?: string) => {
  const queryClient = useQueryClient();

  const { data: medications, isLoading: medicationsLoading } = useQuery({
    queryKey: ["medications", userId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;

      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .eq("user_id", targetUserId)
        .eq("active", true)
        .order("name");

      if (error) throw error;
      return data as Medication[];
    },
    enabled: !!userId || true,
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ["medication-logs", userId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;

      if (!targetUserId) return [];

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data, error } = await supabase
        .from("medication_logs")
        .select("*")
        .eq("user_id", targetUserId)
        .gte("scheduled_at", weekAgo.toISOString())
        .order("scheduled_at", { ascending: false });

      if (error) throw error;
      return data as MedicationLog[];
    },
    enabled: !!userId || true,
  });

  const addMedication = useMutation({
    mutationFn: async (medication: Omit<Medication, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("medications")
        .insert({
          user_id: user.id,
          ...medication,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      toast.success("Medication added successfully");
    },
    onError: (error) => {
      console.error("Error adding medication:", error);
      toast.error("Failed to add medication");
    },
  });

  const logMedication = useMutation({
    mutationFn: async ({ medicationId, taken }: { medicationId: string; taken: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const now = new Date();

      const { data, error } = await supabase
        .from("medication_logs")
        .insert({
          user_id: user.id,
          medication_id: medicationId,
          scheduled_at: now.toISOString(),
          taken_at: taken ? now.toISOString() : null,
          skipped: !taken,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medication-logs"] });
      toast.success("Medication logged");
    },
    onError: (error) => {
      console.error("Error logging medication:", error);
      toast.error("Failed to log medication");
    },
  });

  const deleteMedication = useMutation({
    mutationFn: async (medicationId: string) => {
      const { error } = await supabase
        .from("medications")
        .update({ active: false })
        .eq("id", medicationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      toast.success("Medication removed");
    },
    onError: (error) => {
      console.error("Error deleting medication:", error);
      toast.error("Failed to remove medication");
    },
  });

  // Calculate adherence percentage
  const adherenceRate = logs && logs.length > 0
    ? Math.round((logs.filter(log => log.taken_at).length / logs.length) * 100)
    : 0;

  return {
    medications: medications || [],
    logs: logs || [],
    adherenceRate,
    isLoading: medicationsLoading || logsLoading,
    addMedication: addMedication.mutate,
    logMedication: logMedication.mutate,
    deleteMedication: deleteMedication.mutate,
  };
};
