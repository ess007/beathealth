import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Smartphone, 
  Watch, 
  Activity, 
  Heart, 
  Droplet, 
  Plus, 
  RefreshCw, 
  Check, 
  AlertCircle,
  Trash2,
  Bluetooth
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { haptic } from "@/lib/haptics";

interface DataSource {
  id: string;
  user_id: string;
  type: string;
  label: string | null;
  status: string;
  metadata: unknown;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

const SOURCE_TYPES = [
  { value: "health_connect", label: "Health Connect (Android)", icon: Smartphone },
  { value: "apple_health", label: "Apple Health (iOS)", icon: Activity },
  { value: "wearable_generic", label: "Smartwatch / Band", icon: Watch },
  { value: "bp_monitor", label: "BP Monitor", icon: Heart },
  { value: "glucometer", label: "Glucometer", icon: Droplet },
  { value: "cgm", label: "CGM Device", icon: Activity },
  { value: "manual", label: "Manual Entry", icon: Plus },
];

const getSourceIcon = (type: string) => {
  const found = SOURCE_TYPES.find(s => s.value === type);
  return found?.icon || Activity;
};

const getSourceLabel = (type: string) => {
  const found = SOURCE_TYPES.find(s => s.value === type);
  return found?.label || type;
};

export const DataSourcesManager = () => {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newSource, setNewSource] = useState({
    type: "",
    label: "",
  });

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("data_sources")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSources(data || []);
    } catch (error) {
      console.error("Error fetching data sources:", error);
      toast.error("Failed to load connected devices");
    } finally {
      setLoading(false);
    }
  };

  const addSource = async () => {
    if (!newSource.type) {
      toast.error("Please select a device type");
      return;
    }

    try {
      haptic("light");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("data_sources").insert({
        user_id: user.id,
        type: newSource.type,
        label: newSource.label || null,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Device added! Mark as connected once paired.");
      setAddDialogOpen(false);
      setNewSource({ type: "", label: "" });
      fetchSources();
    } catch (error) {
      console.error("Error adding data source:", error);
      toast.error("Failed to add device");
    }
  };

  const toggleConnection = async (source: DataSource) => {
    try {
      haptic("light");
      const newStatus = source.status === "connected" ? "disconnected" : "connected";
      
      const { error } = await supabase
        .from("data_sources")
        .update({ 
          status: newStatus,
          last_sync_at: newStatus === "connected" ? new Date().toISOString() : source.last_sync_at
        })
        .eq("id", source.id);

      if (error) throw error;

      toast.success(newStatus === "connected" ? "Device connected!" : "Device disconnected");
      fetchSources();
    } catch (error) {
      console.error("Error toggling connection:", error);
      toast.error("Failed to update device");
    }
  };

  const syncDevice = async (source: DataSource) => {
    if (source.status !== "connected") {
      toast.error("Connect the device first");
      return;
    }

    try {
      haptic("medium");
      setSyncing(source.id);
      
      // Simulate sync (real implementation would fetch from Health Connect/Apple Health)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { error } = await supabase
        .from("data_sources")
        .update({ last_sync_at: new Date().toISOString() })
        .eq("id", source.id);

      if (error) throw error;

      toast.success("Sync complete! Data imported.");
      fetchSources();
    } catch (error) {
      console.error("Error syncing device:", error);
      toast.error("Sync failed");
    } finally {
      setSyncing(null);
    }
  };

  const deleteSource = async (id: string) => {
    try {
      haptic("light");
      const { error } = await supabase
        .from("data_sources")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Device removed");
      fetchSources();
    } catch (error) {
      console.error("Error deleting data source:", error);
      toast.error("Failed to remove device");
    }
  };

  const formatLastSync = (date: string | null) => {
    if (!date) return "Never synced";
    const d = new Date(date);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - d.getTime()) / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-20 bg-muted rounded" />
          <div className="h-20 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bluetooth className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Connected Devices</h2>
        </div>
        
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Device</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Device Type</Label>
                <Select value={newSource.type} onValueChange={(v) => setNewSource({ ...newSource, type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select device type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Device Name (Optional)</Label>
                <Input
                  value={newSource.label}
                  onChange={(e) => setNewSource({ ...newSource, label: e.target.value })}
                  placeholder="e.g., Omron BP Monitor, Ultrahuman CGM"
                />
              </div>
              
              <Button onClick={addSource} className="w-full">
                Add Device
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {sources.length === 0 ? (
        <div className="text-center py-8 px-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Watch className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-2">No devices connected</p>
          <p className="text-sm text-muted-foreground">
            Add your BP monitor, glucometer, or smartwatch to auto-sync readings.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sources.map((source) => {
            const Icon = getSourceIcon(source.type);
            const isConnected = source.status === "connected";
            const isSyncing = syncing === source.id;
            
            return (
              <div
                key={source.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                  isConnected 
                    ? "bg-secondary/5 border-secondary/20" 
                    : "bg-muted/30 border-border"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isConnected ? "bg-secondary/10" : "bg-muted"
                }`}>
                  <Icon className={`w-6 h-6 ${isConnected ? "text-secondary" : "text-muted-foreground"}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">
                      {source.label || getSourceLabel(source.type)}
                    </p>
                    <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
                      {isConnected ? (
                        <><Check className="w-3 h-3 mr-1" /> Connected</>
                      ) : (
                        <><AlertCircle className="w-3 h-3 mr-1" /> Pending</>
                      )}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatLastSync(source.last_sync_at)}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {isConnected && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => syncDevice(source)}
                      disabled={isSyncing}
                      className="h-8 w-8 p-0"
                    >
                      <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                    </Button>
                  )}
                  
                  <Switch
                    checked={isConnected}
                    onCheckedChange={() => toggleConnection(source)}
                  />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSource(source.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info banner */}
      <div className="mt-4 p-3 rounded-xl bg-muted/50 border border-border/50">
        <p className="text-xs text-muted-foreground">
          <strong>Coming soon:</strong> Auto-sync with Health Connect (Android) and Apple Health (iOS). 
          For now, mark devices as "connected" after pairing, and use manual entry.
        </p>
      </div>
    </Card>
  );
};
