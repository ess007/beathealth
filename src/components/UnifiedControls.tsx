import { Type, Sun, Moon, Monitor, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { Separator } from "@/components/ui/separator";

export const UnifiedControls = () => {
  const { textSize, setTextSize } = useAccessibility();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 h-10 px-3 rounded-full border border-border/40 hover:border-border hover:bg-accent/50 transition-all"
        >
          {getThemeIcon()}
          <span className="text-xs font-medium">{language === "en" ? "EN" : "हि"}</span>
          <Type className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="end">
        <div className="space-y-4">
          {/* Font Size Section */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Type className="h-4 w-4" />
              {t("accessibility.textSize") || "Text Size"}
            </h4>
            <div className="flex gap-2">
              <Button
                variant={textSize === "normal" ? "default" : "outline"}
                size="sm"
                onClick={() => setTextSize("normal")}
                className="flex-1 transition-all"
              >
                A
              </Button>
              <Button
                variant={textSize === "large" ? "default" : "outline"}
                size="sm"
                onClick={() => setTextSize("large")}
                className="flex-1 text-lg transition-all"
              >
                A
              </Button>
            </div>
          </div>

          <Separator />

          {/* Theme Section */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              {getThemeIcon()}
              {t("header.theme") || "Theme"}
            </h4>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className="flex-1 transition-all"
              >
                <Sun className="h-4 w-4 mr-1" />
                {t("header.light")}
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="flex-1 transition-all"
              >
                <Moon className="h-4 w-4 mr-1" />
                {t("header.dark")}
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("system")}
                className="flex-1 transition-all"
              >
                <Monitor className="h-4 w-4 mr-1" />
                {t("header.system")}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Language Section */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Languages className="h-4 w-4" />
              {t("header.language") || "Language"}
            </h4>
            <div className="flex gap-2">
              <Button
                variant={language === "en" ? "default" : "outline"}
                size="sm"
                onClick={() => setLanguage("en")}
                className="flex-1 transition-all"
              >
                English
              </Button>
              <Button
                variant={language === "hi" ? "default" : "outline"}
                size="sm"
                onClick={() => setLanguage("hi")}
                className="flex-1 transition-all"
              >
                हिंदी
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
