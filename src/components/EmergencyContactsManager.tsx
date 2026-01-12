import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Plus, Trash2, Shield, AlertTriangle, User } from "lucide-react";
import { toast } from "sonner";

interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string | null;
  relationship: string;
  is_primary: boolean;
  notify_on_fall: boolean;
  notify_on_health_emergency: boolean;
  notify_on_missed_checkin: boolean;
  created_at: string;
}

export const EmergencyContactsManager = () => {
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    email: "",
    relationship: "family",
    is_primary: false,
    notify_on_fall: true,
    notify_on_health_emergency: true,
    notify_on_missed_checkin: false,
  });

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["emergency-contacts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("emergency_contacts")
        .select("*")
        .eq("user_id", user.id)
        .order("is_primary", { ascending: false });

      if (error) throw error;
      return data as EmergencyContact[];
    },
  });

  const addContact = useMutation({
    mutationFn: async (contact: typeof newContact) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("emergency_contacts")
        .insert({
          user_id: user.id,
          ...contact,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency-contacts"] });
      setShowAddDialog(false);
      setNewContact({
        name: "",
        phone: "",
        email: "",
        relationship: "family",
        is_primary: false,
        notify_on_fall: true,
        notify_on_health_emergency: true,
        notify_on_missed_checkin: false,
      });
      toast.success("Emergency contact added");
    },
    onError: (error) => {
      console.error("Error adding contact:", error);
      toast.error("Failed to add contact");
    },
  });

  const deleteContact = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from("emergency_contacts")
        .delete()
        .eq("id", contactId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency-contacts"] });
      toast.success("Contact removed");
    },
    onError: (error) => {
      console.error("Error deleting contact:", error);
      toast.error("Failed to remove contact");
    },
  });

  const togglePrimary = useMutation({
    mutationFn: async (contactId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // First, remove primary from all contacts
      await supabase
        .from("emergency_contacts")
        .update({ is_primary: false })
        .eq("user_id", user.id);

      // Then set the selected one as primary
      const { error } = await supabase
        .from("emergency_contacts")
        .update({ is_primary: true })
        .eq("id", contactId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency-contacts"] });
      toast.success("Primary contact updated");
    },
  });

  const getRelationshipIcon = (relationship: string) => {
    switch (relationship) {
      case "spouse":
        return "💑";
      case "child":
        return "👨‍👧";
      case "parent":
        return "👴";
      case "doctor":
        return "👨‍⚕️";
      case "caregiver":
        return "🤝";
      case "neighbor":
        return "🏠";
      default:
        return "👤";
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-destructive" />
          Emergency Contacts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {contacts && contacts.length > 0 ? (
          <div className="space-y-3">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className={`p-3 rounded-lg border ${
                  contact.is_primary
                    ? "border-destructive/50 bg-destructive/5"
                    : "border-border/50 bg-background/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getRelationshipIcon(contact.relationship)}</span>
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {contact.name}
                        {contact.is_primary && (
                          <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full">
                            Primary
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">{contact.phone}</p>
                      <p className="text-xs text-muted-foreground capitalize">{contact.relationship}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!contact.is_primary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePrimary.mutate(contact.id)}
                      >
                        Set Primary
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteContact.mutate(contact.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {contact.notify_on_fall && (
                    <span className="text-xs bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-full">
                      Fall alerts
                    </span>
                  )}
                  {contact.notify_on_health_emergency && (
                    <span className="text-xs bg-red-500/10 text-red-600 px-2 py-0.5 rounded-full">
                      Health emergencies
                    </span>
                  )}
                  {contact.notify_on_missed_checkin && (
                    <span className="text-xs bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded-full">
                      Missed check-ins
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-2">No emergency contacts added</p>
            <p className="text-sm text-muted-foreground">
              Add contacts who should be notified in emergencies
            </p>
          </div>
        )}

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add Emergency Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Emergency Contact</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="Contact name"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  placeholder="+91 XXXXX XXXXX"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Email (Optional)</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Relationship</Label>
                <Select
                  value={newContact.relationship}
                  onValueChange={(value) => setNewContact({ ...newContact, relationship: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="caregiver">Caregiver</SelectItem>
                    <SelectItem value="neighbor">Neighbor</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-2 border-t">
                <p className="text-sm font-medium">Notify for:</p>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-normal">Fall detection alerts</Label>
                  <Switch
                    checked={newContact.notify_on_fall}
                    onCheckedChange={(checked) =>
                      setNewContact({ ...newContact, notify_on_fall: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-normal">Health emergencies</Label>
                  <Switch
                    checked={newContact.notify_on_health_emergency}
                    onCheckedChange={(checked) =>
                      setNewContact({ ...newContact, notify_on_health_emergency: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-normal">Missed check-ins (48+ hours)</Label>
                  <Switch
                    checked={newContact.notify_on_missed_checkin}
                    onCheckedChange={(checked) =>
                      setNewContact({ ...newContact, notify_on_missed_checkin: checked })
                    }
                  />
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => addContact.mutate(newContact)}
                disabled={!newContact.name || !newContact.phone}
              >
                Add Contact
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
