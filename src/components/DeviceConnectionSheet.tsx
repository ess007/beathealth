import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Watch, 
  Smartphone, 
  Activity, 
  Heart, 
  Droplet, 
  Plus, 
  RefreshCw, 
  Check, 
  Bluetooth,
  Trash2,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { haptic } from "@/lib/haptics";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeviceConnectionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DataSource {
  id: string;
  type: string;
  label: string | null;
  status: string;
  last_sync_at: string | null;
}

const DEVICE_TYPES = [
  { value: "bp_monitor", label: "BP Monitor", labelHi: "BP मॉनिटर", icon: Heart, desc: "Omron, Dr. Morepen" },
  { value: "glucometer", label: "Glucometer", labelHi: "ग्लूकोमीटर", icon: Droplet, desc: "Accu-Chek, OneTouch" },
  { value: "wearable_generic", label: "Smartwatch", labelHi: "स्मार्टवॉच", icon: Watch, desc: "Apple, Samsung, Fitbit" },
  { value: "health_connect", label: "Health Connect", labelHi: "Health Connect", icon: Smartphone, desc: "Android" },
  { value: "cgm", label: "CGM Device", labelHi: "CGM डिवाइस", icon: Activity, desc: "FreeStyle, Dexcom" },
];

export const DeviceConnectionSheet = ({ isOpen, onClose }: DeviceConnectionSheetProps) => {
  const { language } = useLanguage();
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchSources();
    }
  }, [isOpen]);

  const fetchSources = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("data_sources")
        .select("id, type, label, status, last_sync_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSources(data || []);
    } catch (error) {
      console.error("Error fetching data sources:", error);
    } finally {
      setLoading(false);
    }
  };

  const addDevice = async () => {
    if (!selectedDevice) return;

    try {
      haptic('light');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("data_sources").insert({
        user_id: user.id,
        type: selectedDevice,
        label: deviceName || null,
        status: "pending",
      });

      toast.success(language === 'hi' ? 'डिवाइस जोड़ी गई!' : 'Device added!');
      setAddDialogOpen(false);
      setSelectedDevice(null);
      setDeviceName("");
      fetchSources();
    } catch (error) {
      toast.error(language === 'hi' ? 'डिवाइस जोड़ने में त्रुटि' : 'Failed to add device');
    }
  };

  const toggleConnection = async (source: DataSource) => {
    try {
      haptic('light');
      const newStatus = source.status === "connected" ? "disconnected" : "connected";
      
      await supabase
        .from("data_sources")
        .update({ 
          status: newStatus,
          last_sync_at: newStatus === "connected" ? new Date().toISOString() : source.last_sync_at
        })
        .eq("id", source.id);

      toast.success(newStatus === "connected" 
        ? (language === 'hi' ? 'डिवाइस कनेक्ट हो गई' : 'Device connected')
        : (language === 'hi' ? 'डिवाइस डिस्कनेक्ट हो गई' : 'Device disconnected')
      );
      fetchSources();
    } catch (error) {
      toast.error(language === 'hi' ? 'अपडेट करने में त्रुटि' : 'Failed to update device');
    }
  };

  const syncDevice = async (source: DataSource) => {
    if (source.status !== "connected") {
      toast.error(language === 'hi' ? 'पहले डिवाइस कनेक्ट करें' : 'Connect the device first');
      return;
    }

    try {
      haptic('medium');
      setSyncing(source.id);
      
      // Simulate sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await supabase
        .from("data_sources")
        .update({ last_sync_at: new Date().toISOString() })
        .eq("id", source.id);

      toast.success(language === 'hi' ? 'सिंक पूरा!' : 'Sync complete!');
      fetchSources();
    } catch (error) {
      toast.error(language === 'hi' ? 'सिंक विफल' : 'Sync failed');
    } finally {
      setSyncing(null);
    }
  };

  const deleteDevice = async (id: string) => {
    try {
      haptic('light');
      await supabase.from("data_sources").delete().eq("id", id);
      toast.success(language === 'hi' ? 'डिवाइस हटाई गई' : 'Device removed');
      fetchSources();
    } catch (error) {
      toast.error(language === 'hi' ? 'हटाने में त्रुटि' : 'Failed to remove');
    }
  };

  const getDeviceInfo = (type: string) => {
    return DEVICE_TYPES.find(d => d.value === type) || DEVICE_TYPES[0];
  };

  const formatLastSync = (date: string | null) => {
    if (!date) return language === 'hi' ? 'कभी नहीं' : 'Never';
    const d = new Date(date);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - d.getTime()) / 60000);
    
    if (diffMins < 1) return language === 'hi' ? 'अभी' : 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return d.toLocaleDateString();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bluetooth className="h-5 w-5 text-blue-500" />
              {language === 'hi' ? 'डिवाइस' : 'Devices'}
            </SheetTitle>
            <Button 
              size="sm" 
              className="gap-2 rounded-xl"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              {language === 'hi' ? 'जोड़ें' : 'Add'}
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-4 overflow-y-auto max-h-[calc(85vh-100px)] pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : sources.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <Watch className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-lg font-semibold mb-2">
                {language === 'hi' ? 'कोई डिवाइस नहीं' : 'No devices connected'}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {language === 'hi' 
                  ? 'अपना BP मॉनिटर, ग्लूकोमीटर या स्मार्टवॉच जोड़ें'
                  : 'Add your BP monitor, glucometer, or smartwatch'}
              </p>
              <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                {language === 'hi' ? 'डिवाइस जोड़ें' : 'Add Device'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sources.map((source) => {
                const deviceInfo = getDeviceInfo(source.type);
                const Icon = deviceInfo.icon;
                const isConnected = source.status === "connected";
                const isSyncing = syncing === source.id;

                return (
                  <Card key={source.id} className={`p-4 ${isConnected ? 'border-secondary/30' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isConnected ? 'bg-secondary/10' : 'bg-muted'
                      }`}>
                        <Icon className={`w-6 h-6 ${isConnected ? 'text-secondary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">
                            {source.label || (language === 'hi' ? deviceInfo.labelHi : deviceInfo.label)}
                          </p>
                          {isConnected && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              <Check className="w-2.5 h-2.5 mr-0.5" />
                              {language === 'hi' ? 'जुड़ा' : 'Connected'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {language === 'hi' ? 'अंतिम सिंक:' : 'Last sync:'} {formatLastSync(source.last_sync_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isConnected && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => syncDevice(source)}
                            disabled={isSyncing}
                            className="h-9 w-9 p-0"
                          >
                            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                          </Button>
                        )}
                        <Switch
                          checked={isConnected}
                          onCheckedChange={() => toggleConnection(source)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteDevice(source.id)}
                          className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Info */}
          <Card className="p-4 bg-muted/50 border-border/50">
            <p className="text-xs text-muted-foreground">
              <strong>{language === 'hi' ? 'जल्द आ रहा है:' : 'Coming soon:'}</strong>{' '}
              {language === 'hi' 
                ? 'Health Connect (Android) और Apple Health के साथ ऑटो-सिंक।'
                : 'Auto-sync with Health Connect (Android) and Apple Health.'}
            </p>
          </Card>
        </div>

        {/* Add Device Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {language === 'hi' ? 'डिवाइस जोड़ें' : 'Add Device'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                {DEVICE_TYPES.map((device) => (
                  <button
                    key={device.value}
                    onClick={() => setSelectedDevice(device.value)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      selectedDevice === device.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedDevice === device.value ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <device.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{language === 'hi' ? device.labelHi : device.label}</p>
                      <p className="text-xs text-muted-foreground">{device.desc}</p>
                    </div>
                    {selectedDevice === device.value && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>

              {selectedDevice && (
                <div className="space-y-2">
                  <Label>{language === 'hi' ? 'डिवाइस का नाम (वैकल्पिक)' : 'Device Name (Optional)'}</Label>
                  <Input
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    placeholder={language === 'hi' ? 'जैसे: मेरा Omron' : 'e.g., My Omron'}
                    className="h-12"
                  />
                </div>
              )}

              <Button 
                onClick={addDevice} 
                className="w-full h-12"
                disabled={!selectedDevice}
              >
                {language === 'hi' ? 'डिवाइस जोड़ें' : 'Add Device'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
};
