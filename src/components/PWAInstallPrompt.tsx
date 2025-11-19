import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePWA } from "@/hooks/usePWA";
import { useState } from "react";

export const PWAInstallPrompt = () => {
  const { isInstallable, installPWA } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || dismissed) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 p-4 shadow-elevated z-50 border-2 border-primary">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex gap-4 items-start">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Download className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Install Beat</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Install Beat on your phone for quick access to your health rituals
          </p>
          <Button onClick={installPWA} size="sm" className="w-full">
            Install App
          </Button>
        </div>
      </div>
    </Card>
  );
};
