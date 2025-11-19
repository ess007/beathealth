import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useTheme } from "@/components/ThemeProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  LogOut, 
  Activity, 
  Type, 
  Sun, 
  Moon, 
  Monitor, 
  Languages,
  Settings
} from "lucide-react";
import { FitnessTrackerConnection } from "@/components/FitnessTrackerConnection";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Header = () => {
  const { t, language, setLanguage } = useLanguage();
  const { textSize, setTextSize } = useAccessibility();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [isDeviceDialogOpen, setIsDeviceDialogOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success(t("header.signOut"));
    window.location.href = "/";
  };

  const getThemeIcon = () => {
    if (theme === "light") return <Sun className="w-4 h-4" />;
    if (theme === "dark") return <Moon className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const initials = profile?.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <header className="border-b bg-card/95 backdrop-blur-md shadow-sm sticky top-0 z-10 transition-all">
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        <Logo size="md" />
        
        <Dialog open={isDeviceDialogOpen} onOpenChange={setIsDeviceDialogOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="w-8 h-8 border-2 border-primary">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline">{profile?.full_name || "User"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{profile?.full_name || "User"}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              <DialogTrigger asChild>
                <DropdownMenuItem>
                  <Activity className="w-4 h-4 mr-2" />
                  {t("profile.connectDevices") || "Connect Devices"}
                </DropdownMenuItem>
              </DialogTrigger>
              
              <DropdownMenuItem onClick={() => window.location.href = "/app/profile"}>
                <Settings className="w-4 h-4 mr-2" />
                {t("profile.settings") || "Settings"}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {t("accessibility.textSize") || "Text Size"}
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setTextSize("normal")}>
                <Type className="w-4 h-4 mr-2" />
                {t("accessibility.normal") || "Normal"}
                {textSize === "normal" && " ✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTextSize("large")}>
                <Type className="w-5 h-5 mr-2" />
                {t("accessibility.large") || "Large"}
                {textSize === "large" && " ✓"}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {t("theme.title") || "Theme"}
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="w-4 h-4 mr-2" />
                {t("theme.light") || "Light"}
                {theme === "light" && " ✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="w-4 h-4 mr-2" />
                {t("theme.dark") || "Dark"}
                {theme === "dark" && " ✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="w-4 h-4 mr-2" />
                {t("theme.system") || "System"}
                {theme === "system" && " ✓"}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {t("language.title") || "Language"}
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setLanguage("en")}>
                <Languages className="w-4 h-4 mr-2" />
                English
                {language === "en" && " ✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("hi")}>
                <Languages className="w-4 h-4 mr-2" />
                हिन्दी
                {language === "hi" && " ✓"}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                {t("header.signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect Fitness Trackers</DialogTitle>
            </DialogHeader>
            <FitnessTrackerConnection />
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
};
