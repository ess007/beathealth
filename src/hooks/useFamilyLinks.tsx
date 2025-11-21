import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuditLog } from "./useAuditLog";

export const useFamilyLinks = () => {
  const queryClient = useQueryClient();
  const { logAccess } = useAuditLog();

  // Fetch family members I'm caring for (as caregiver)
  const { data: familyMembers, isLoading: loadingMembers } = useQuery({
    queryKey: ["familyMembers"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("family_links")
        .select(`
          *,
          member:profiles!family_links_member_id_fkey(*)
        `)
        .eq("caregiver_id", user.id);

      if (error) throw error;
      
      // Note: Removed excessive audit logging from read queries
      // Audit logging only happens on state-changing actions (create, update, delete, nudge)
      
      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Fetch my caregivers (people caring for me)
  const { data: myCaregivers, isLoading: loadingCaregivers } = useQuery({
    queryKey: ["myCaregivers"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("family_links")
        .select(`
          *,
          caregiver:profiles!family_links_caregiver_id_fkey(*)
        `)
        .eq("member_id", user.id);

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Create family link invitation
  const createLink = useMutation({
    mutationFn: async ({ memberEmail, relationship }: { memberEmail: string; relationship: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Find member by email using secure lookup function
      const { data: memberId, error: lookupError } = await supabase
        .rpc("lookup_user_by_email", { _email: memberEmail });

      if (lookupError) throw lookupError;
      if (!memberId) {
        throw new Error("Unable to add family member. Please verify the email address and try again.");
      }

      // Create family link
      const { data, error } = await supabase
        .from("family_links")
        .insert({
          caregiver_id: user.id,
          member_id: memberId,
          relationship,
          can_view: true,
          can_nudge: true,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("This family link already exists");
        }
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["familyMembers"] });
      toast.success("Family member added successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add family member");
    },
  });

  // Remove family link
  const removeLink = useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase
        .from("family_links")
        .delete()
        .eq("id", linkId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["familyMembers"] });
      queryClient.invalidateQueries({ queryKey: ["myCaregivers"] });
      toast.success("Family member removed");
    },
    onError: () => {
      toast.error("Failed to remove family member");
    },
  });

  // Update family link permissions
  const updateLink = useMutation({
    mutationFn: async ({ 
      linkId, 
      updates 
    }: { 
      linkId: string; 
      updates: { 
        can_view?: boolean; 
        can_nudge?: boolean; 
        relationship?: string;
      };
    }) => {
      const { data, error } = await supabase
        .from("family_links")
        .update(updates)
        .eq("id", linkId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["familyMembers"] });
      queryClient.invalidateQueries({ queryKey: ["myCaregivers"] });
      toast.success("Permissions updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update permissions");
    },
  });

  return {
    familyMembers,
    myCaregivers,
    isLoading: loadingMembers || loadingCaregivers,
    createLink: createLink.mutate,
    isCreating: createLink.isPending,
    removeLink: removeLink.mutate,
    isRemoving: removeLink.isPending,
    updateLink: updateLink.mutate,
    isUpdating: updateLink.isPending,
  };
};
