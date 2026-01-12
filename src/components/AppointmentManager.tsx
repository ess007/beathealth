import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, MapPin, Clock, Check, X, Stethoscope, TestTube, Pill, User } from "lucide-react";
import { format, isFuture, isPast, isToday, parseISO } from "date-fns";
import { toast } from "sonner";

interface Appointment {
  id: string;
  user_id: string;
  appointment_type: string;
  provider_name: string | null;
  location: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  pre_visit_tasks: { task: string; completed: boolean }[];
  post_visit_notes: string | null;
  created_at: string;
}

const APPOINTMENT_TYPES = [
  { value: "doctor_visit", label: "Doctor Visit", icon: Stethoscope, color: "text-blue-500" },
  { value: "lab_test", label: "Lab Test", icon: TestTube, color: "text-purple-500" },
  { value: "pharmacy", label: "Pharmacy", icon: Pill, color: "text-green-500" },
  { value: "specialist", label: "Specialist", icon: User, color: "text-orange-500" },
  { value: "follow_up", label: "Follow-up", icon: Calendar, color: "text-cyan-500" },
];

export const AppointmentManager = () => {
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    appointment_type: "doctor_visit",
    provider_name: "",
    location: "",
    scheduled_at: "",
    duration_minutes: 30,
    notes: "",
    pre_visit_tasks: [] as { task: string; completed: boolean }[],
  });
  const [newTask, setNewTask] = useState("");

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", user.id)
        .order("scheduled_at", { ascending: true });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        pre_visit_tasks: Array.isArray(item.pre_visit_tasks) ? item.pre_visit_tasks : []
      })) as Appointment[];
    },
  });

  const addAppointment = useMutation({
    mutationFn: async (appointment: typeof newAppointment) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("appointments")
        .insert({
          user_id: user.id,
          ...appointment,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setShowAddDialog(false);
      setNewAppointment({
        appointment_type: "doctor_visit",
        provider_name: "",
        location: "",
        scheduled_at: "",
        duration_minutes: 30,
        notes: "",
        pre_visit_tasks: [],
      });
      toast.success("Appointment scheduled");
    },
    onError: (error) => {
      console.error("Error adding appointment:", error);
      toast.error("Failed to schedule appointment");
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment updated");
    },
  });

  const toggleTask = useMutation({
    mutationFn: async ({ id, tasks }: { id: string; tasks: { task: string; completed: boolean }[] }) => {
      const { error } = await supabase
        .from("appointments")
        .update({ pre_visit_tasks: tasks })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const addPreVisitTask = () => {
    if (newTask.trim()) {
      setNewAppointment({
        ...newAppointment,
        pre_visit_tasks: [...newAppointment.pre_visit_tasks, { task: newTask.trim(), completed: false }],
      });
      setNewTask("");
    }
  };

  const getTypeInfo = (type: string) => {
    return APPOINTMENT_TYPES.find((t) => t.value === type) || APPOINTMENT_TYPES[0];
  };

  const upcomingAppointments = appointments?.filter((a) => isFuture(parseISO(a.scheduled_at)) && a.status === "scheduled") || [];
  const todayAppointments = appointments?.filter((a) => isToday(parseISO(a.scheduled_at)) && a.status === "scheduled") || [];
  const pastAppointments = appointments?.filter((a) => isPast(parseISO(a.scheduled_at)) || a.status !== "scheduled").slice(0, 5) || [];

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
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Appointments
          </span>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Schedule Appointment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newAppointment.appointment_type}
                    onValueChange={(value) =>
                      setNewAppointment({ ...newAppointment, appointment_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {APPOINTMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <span className="flex items-center gap-2">
                            <type.icon className={`h-4 w-4 ${type.color}`} />
                            {type.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Provider/Doctor Name</Label>
                  <Input
                    placeholder="Dr. Sharma"
                    value={newAppointment.provider_name}
                    onChange={(e) =>
                      setNewAppointment({ ...newAppointment, provider_name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={newAppointment.scheduled_at}
                    onChange={(e) =>
                      setNewAppointment({ ...newAppointment, scheduled_at: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="Hospital/Clinic address"
                    value={newAppointment.location}
                    onChange={(e) =>
                      setNewAppointment({ ...newAppointment, location: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Any special notes..."
                    value={newAppointment.notes}
                    onChange={(e) =>
                      setNewAppointment({ ...newAppointment, notes: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Pre-visit Tasks</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Fasting 12 hours"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addPreVisitTask()}
                    />
                    <Button type="button" size="icon" onClick={addPreVisitTask}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {newAppointment.pre_visit_tasks.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {newAppointment.pre_visit_tasks.map((task, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded">
                          <Check className="h-3 w-3 text-muted-foreground" />
                          {task.task}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 ml-auto"
                            onClick={() =>
                              setNewAppointment({
                                ...newAppointment,
                                pre_visit_tasks: newAppointment.pre_visit_tasks.filter((_, i) => i !== idx),
                              })
                            }
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  className="w-full"
                  onClick={() => addAppointment.mutate(newAppointment)}
                  disabled={!newAppointment.scheduled_at}
                >
                  Schedule Appointment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today's Appointments */}
        {todayAppointments.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-destructive mb-2">Today</h4>
            <div className="space-y-2">
              {todayAppointments.map((apt) => {
                const typeInfo = getTypeInfo(apt.appointment_type);
                const TypeIcon = typeInfo.icon;
                return (
                  <div
                    key={apt.id}
                    className="p-3 rounded-lg border border-destructive/30 bg-destructive/5"
                  >
                    <div className="flex items-center gap-3">
                      <TypeIcon className={`h-5 w-5 ${typeInfo.color}`} />
                      <div className="flex-1">
                        <p className="font-medium">{apt.provider_name || typeInfo.label}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(parseISO(apt.scheduled_at), "h:mm a")}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-green-500"
                          onClick={() => updateStatus.mutate({ id: apt.id, status: "completed" })}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() => updateStatus.mutate({ id: apt.id, status: "cancelled" })}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {apt.pre_visit_tasks && apt.pre_visit_tasks.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {apt.pre_visit_tasks.map((task, idx) => (
                          <button
                            key={idx}
                            className={`flex items-center gap-2 text-xs w-full p-1 rounded ${
                              task.completed ? "text-muted-foreground line-through" : "text-foreground"
                            }`}
                            onClick={() => {
                              const updatedTasks = [...apt.pre_visit_tasks];
                              updatedTasks[idx] = { ...task, completed: !task.completed };
                              toggleTask.mutate({ id: apt.id, tasks: updatedTasks });
                            }}
                          >
                            <div className={`h-3 w-3 rounded-sm border ${task.completed ? "bg-green-500 border-green-500" : "border-muted-foreground"}`}>
                              {task.completed && <Check className="h-3 w-3 text-white" />}
                            </div>
                            {task.task}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Upcoming</h4>
            <div className="space-y-2">
              {upcomingAppointments.slice(0, 3).map((apt) => {
                const typeInfo = getTypeInfo(apt.appointment_type);
                const TypeIcon = typeInfo.icon;
                return (
                  <div
                    key={apt.id}
                    className="p-3 rounded-lg border border-border/50 bg-background/50"
                  >
                    <div className="flex items-center gap-3">
                      <TypeIcon className={`h-5 w-5 ${typeInfo.color}`} />
                      <div className="flex-1">
                        <p className="font-medium">{apt.provider_name || typeInfo.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(apt.scheduled_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                        {apt.location && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {apt.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {upcomingAppointments.length === 0 && todayAppointments.length === 0 && (
          <div className="text-center py-6">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No upcoming appointments</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
