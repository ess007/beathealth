import { useState, useRef } from "react";
import { Camera, X, Loader2, Check, RotateCcw, Zap, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

interface OCRReading {
  systolic?: number;
  diastolic?: number;
  heart_rate?: number;
  glucose?: number;
  measurement_type?: "fasting" | "random" | "post_meal";
}

interface ChatImageCaptureProps {
  onReadingDetected: (reading: OCRReading, summary: string) => void;
  onImageCaptured?: (base64: string) => void;
  disabled?: boolean;
}

export const ChatImageCapture = ({ 
  onReadingDetected, 
  onImageCaptured,
  disabled 
}: ChatImageCaptureProps) => {
  const { language } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<OCRReading | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    haptic("light");
    fileInputRef.current?.click();
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error(language === "hi" ? "फ़ाइल बहुत बड़ी है" : "File too large (max 10MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setPreview(base64);
      onImageCaptured?.(base64);
      await processWithOCR(base64);
    };
    reader.readAsDataURL(file);
  };

  const processWithOCR = async (base64: string) => {
    setIsProcessing(true);
    haptic("medium");

    try {
      const { data, error } = await supabase.functions.invoke("ocr-device-reading", {
        body: { imageBase64: base64 },
      });

      if (error) throw error;

      if (data.success && data.readings) {
        setResult(data.readings);
        
        // Build summary for chat
        const parts: string[] = [];
        if (data.readings.systolic && data.readings.diastolic) {
          parts.push(`BP ${data.readings.systolic}/${data.readings.diastolic}`);
        }
        if (data.readings.heart_rate) {
          parts.push(`HR ${data.readings.heart_rate}`);
        }
        if (data.readings.glucose) {
          parts.push(`Sugar ${data.readings.glucose}`);
        }
        
        const summary = parts.length > 0 
          ? `📷 ${language === "hi" ? "पढ़ी गई" : "Detected"}: ${parts.join(", ")}`
          : language === "hi" ? "📷 कोई रीडिंग नहीं मिली" : "📷 No readings detected";
        
        onReadingDetected(data.readings, summary);
        haptic("success");
        
        if (parts.length > 0 && data.confidence >= 0.7) {
          toast.success(language === "hi" ? "रीडिंग पहचानी गई!" : "Reading detected!");
        }
      } else {
        toast.error(data.error || (language === "hi" ? "पहचान नहीं हुई" : "Could not detect reading"));
      }
    } catch (err) {
      console.error("OCR error:", err);
      toast.error(language === "hi" ? "त्रुटि हुई" : "Recognition failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageSelect}
      />

      {!preview ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCapture}
          disabled={disabled || isProcessing}
          className="rounded-full h-10 w-10"
          title={language === "hi" ? "डिवाइस स्कैन करें" : "Scan device reading"}
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Camera className="w-5 h-5" />
          )}
        </Button>
      ) : (
        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary">
            <img src={preview} alt="Captured" className="w-full h-full object-cover" />
          </div>
          <button
            onClick={clearPreview}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-white flex items-center justify-center"
          >
            <X className="w-3 h-3" />
          </button>
          {result && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center">
              <Check className="w-3 h-3" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatImageCapture;