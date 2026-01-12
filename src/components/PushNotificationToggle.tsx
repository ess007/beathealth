import { Bell, BellOff, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export function PushNotificationToggle() {
  const { 
    isSupported, 
    isSubscribed, 
    permission, 
    isLoading, 
    subscribe, 
    unsubscribe 
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BellOff className="w-4 h-4 text-muted-foreground" />
            Push Notifications
          </CardTitle>
          <CardDescription className="text-sm">
            Not supported in this browser
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isSubscribed ? 'bg-primary/10' : 'bg-muted'}`}>
              {isSubscribed ? (
                <BellRing className="w-4 h-4 text-primary" />
              ) : (
                <Bell className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <div>
              <CardTitle className="text-base">Push Notifications</CardTitle>
              <CardDescription className="text-sm">
                {permission === 'denied' 
                  ? 'Blocked in browser settings'
                  : isSubscribed 
                    ? 'Get health reminders & alerts'
                    : 'Enable to receive updates'
                }
              </CardDescription>
            </div>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={handleToggle}
            disabled={isLoading || permission === 'denied'}
          />
        </div>
      </CardHeader>
      {permission === 'denied' && (
        <CardContent className="pt-0">
          <p className="text-xs text-destructive">
            Please enable notifications in your browser settings to receive health alerts.
          </p>
        </CardContent>
      )}
    </Card>
  );
}
