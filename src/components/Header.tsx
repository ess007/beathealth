import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UnifiedControls } from "@/components/UnifiedControls";

export const Header = () => {
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success(t("header.signOut"));
    window.location.href = "/";
  };

  return (
    <header className="border-b bg-card/95 backdrop-blur-md shadow-sm sticky top-0 z-10 transition-all">
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          <span className="text-xl md:text-2xl font-bold">Beat</span>
        </div>
        <div className="flex items-center gap-2">
          <UnifiedControls />
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="hidden md:flex"
          >
            {t("header.signOut")}
          </Button>
        </div>
      </div>
    </header>
  );
};
