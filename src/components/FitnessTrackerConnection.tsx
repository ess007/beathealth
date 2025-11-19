import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Activity, Apple, Smartphone, Watch, Link2 } from "lucide-react";
import { toast } from "sonner";

interface Tracker {
  id: string;
  name: string;
  icon: any;
  color: string;
  connected: boolean;
}

export const FitnessTrackerConnection = () => {
  const [trackers, setTrackers] = useState<Tracker[]>([
    {
      id: "google_fit",
      name: "Google Fit",
      icon: Activity,
      color: "from-blue-500 to-cyan-500",
      connected: false,
    },
    {
      id: "apple_health",
      name: "Apple Health",
      icon: Apple,
      color: "from-red-500 to-pink-500",
      connected: false,
    },
    {
      id: "fitbit",
      name: "Fitbit",
      icon: Watch,
      color: "from-teal-500 to-green-500",
      connected: false,
    },
    {
      id: "samsung_health",
      name: "Samsung Health",
      icon: Smartphone,
      color: "from-purple-500 to-indigo-500",
      connected: false,
    },
  ]);

  const handleConnect = (trackerId: string) => {
    // TODO: Implement actual OAuth connection flow
    // This is a placeholder that will be replaced with real integration
    toast.info("Device integration coming soon! This feature will sync your health data automatically.");
    
    setTrackers(prev =>
      prev.map(t =>
        t.id === trackerId ? { ...t, connected: !t.connected } : t
      )
    );
  };

  return (
    <div className="space-y-4 py-4">
      <p className="text-sm text-muted-foreground">
        Connect your fitness trackers and smartwatches to automatically sync BP, heart rate, steps, and other health metrics to Beat.
      </p>
      
      <div className="space-y-3">
        {trackers.map((tracker) => {
          const Icon = tracker.icon;
          return (
            <Card key={tracker.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tracker.color} flex items-center justify-center text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{tracker.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {tracker.connected ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {tracker.connected && (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                      Active
                    </Badge>
                  )}
                  <Button
                    variant={tracker.connected ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleConnect(tracker.id)}
                    className="gap-2"
                  >
                    <Link2 className="w-4 h-4" />
                    {tracker.connected ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          What will be synced?
        </h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Blood pressure readings (from compatible devices)</li>
          <li>• Heart rate data</li>
          <li>• Daily step count and activity minutes</li>
          <li>• Sleep duration and quality metrics</li>
          <li>• Blood glucose levels (from compatible CGMs)</li>
        </ul>
      </div>
    </div>
  );
};
