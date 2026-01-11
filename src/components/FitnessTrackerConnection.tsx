import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Activity, Apple, Smartphone, Watch, Link2, RefreshCw, CheckCircle2, Clock, Upload, FileUp } from "lucide-react";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";
import { FitnessDataImporter } from "./FitnessDataImporter";

interface Tracker {
  id: string;
  name: string;
  icon: any;
  color: string;
  connected: boolean;
  lastSync?: string;
  syncing?: boolean;
  dataTypes: string[];
}

const STORAGE_KEY = "beat_fitness_trackers";

const defaultTrackers: Tracker[] = [
  {
    id: "google_fit",
    name: "Google Fit",
    icon: Activity,
    color: "from-blue-500 to-cyan-500",
    connected: false,
    dataTypes: ["Steps", "Heart Rate", "Sleep", "Activity"],
  },
  {
    id: "apple_health",
    name: "Apple Health",
    icon: Apple,
    color: "from-red-500 to-pink-500",
    connected: false,
    dataTypes: ["Steps", "Heart Rate", "Blood Pressure", "Sleep"],
  },
  {
    id: "fitbit",
    name: "Fitbit",
    icon: Watch,
    color: "from-teal-500 to-green-500",
    connected: false,
    dataTypes: ["Steps", "Heart Rate", "Sleep", "SpO2"],
  },
  {
    id: "samsung_health",
    name: "Samsung Health",
    icon: Smartphone,
    color: "from-purple-500 to-indigo-500",
    connected: false,
    dataTypes: ["Steps", "Heart Rate", "Blood Pressure", "Stress"],
  },
];

export const FitnessTrackerConnection = () => {
  const [trackers, setTrackers] = useState<Tracker[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultTrackers;
      }
    }
    return defaultTrackers;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trackers));
  }, [trackers]);

  const handleConnect = async (trackerId: string) => {
    const tracker = trackers.find(t => t.id === trackerId);
    
    if (tracker?.connected) {
      // Disconnect
      haptic('light');
      setTrackers(prev =>
        prev.map(t =>
          t.id === trackerId ? { ...t, connected: false, lastSync: undefined } : t
        )
      );
      toast.success(`${tracker.name} disconnected`);
      return;
    }

    // Show info about using file import instead
    haptic('medium');
    toast.info(
      `Direct ${tracker?.name} connection requires API access. Use the Import tab to upload your exported data instead!`,
      { duration: 5000 }
    );
  };

  const handleSync = async (trackerId: string) => {
    const tracker = trackers.find(t => t.id === trackerId);
    if (!tracker?.connected) return;

    haptic('light');
    
    // Set syncing state
    setTrackers(prev =>
      prev.map(t =>
        t.id === trackerId ? { ...t, syncing: true } : t
      )
    );

    toast.info(`Syncing data from ${tracker.name}...`);
    
    // Simulate sync delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setTrackers(prev =>
      prev.map(t =>
        t.id === trackerId 
          ? { ...t, syncing: false, lastSync: new Date().toISOString() } 
          : t
      )
    );
    
    haptic('success');
    toast.success(`${tracker.name} data synced!`);
  };

  const formatLastSync = (isoString?: string) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const connectedCount = trackers.filter(t => t.connected).length;

  return (
    <Tabs defaultValue="import" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="import" className="gap-2">
          <FileUp className="w-4 h-4" />
          Import Data
        </TabsTrigger>
        <TabsTrigger value="connect" className="gap-2">
          <Link2 className="w-4 h-4" />
          Connect Apps
        </TabsTrigger>
      </TabsList>

      <TabsContent value="import">
        <FitnessDataImporter />
      </TabsContent>

      <TabsContent value="connect" className="space-y-4 py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Connect your fitness trackers to automatically sync health data.
          </p>
          {connectedCount > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {connectedCount} connected
            </Badge>
          )}
        </div>

        {/* Info banner about file import */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <Upload className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-primary">💡 Pro Tip: Use File Import</p>
              <p className="text-muted-foreground mt-1">
                Direct API connections require paid integrations. For free, instant access to your fitness data, 
                use the <strong>Import Data</strong> tab to upload exports from your fitness apps.
              </p>
            </div>
          </div>
        </Card>
        
        <div className="space-y-3">
          {trackers.map((tracker) => {
            const Icon = tracker.icon;
            return (
              <Card key={tracker.id} className={`p-4 transition-all duration-300 ${tracker.connected ? 'ring-1 ring-primary/20' : ''}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tracker.color} flex items-center justify-center text-white flex-shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold truncate">{tracker.name}</h4>
                        {tracker.connected && (
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      {tracker.connected ? (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>Synced {formatLastSync(tracker.lastSync)}</span>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {tracker.dataTypes.slice(0, 3).join(" • ")}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {tracker.connected && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSync(tracker.id)}
                        disabled={tracker.syncing}
                        className="h-9 w-9"
                      >
                        <RefreshCw className={`w-4 h-4 ${tracker.syncing ? 'animate-spin' : ''}`} />
                      </Button>
                    )}
                    <Button
                      variant={tracker.connected ? "outline" : "secondary"}
                      size="sm"
                      onClick={() => handleConnect(tracker.id)}
                      className="gap-1.5 min-w-[90px]"
                      disabled={tracker.syncing}
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      {tracker.connected ? "Disconnect" : "Info"}
                    </Button>
                  </div>
                </div>
                
                {/* Data types when connected */}
                {tracker.connected && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex flex-wrap gap-1.5">
                      {tracker.dataTypes.map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs font-normal">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-xl">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            What will be synced?
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              Blood pressure readings (from compatible devices)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              Heart rate data and variability
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              Daily step count and activity minutes
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              Sleep duration and quality metrics
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              Blood glucose levels (from compatible CGMs)
            </li>
          </ul>
        </div>
      </TabsContent>
    </Tabs>
  );
};