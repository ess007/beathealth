import { useState, useEffect, useCallback, useRef } from "react";
import { Volume2, VolumeX, Square } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface VoiceOutputProps {
  onSpeakingStart?: () => void;
  onSpeakingEnd?: () => void;
  language?: "en" | "hi";
}

export const VoiceOutput = ({ onSpeakingStart, onSpeakingEnd, language = "en" }: VoiceOutputProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);
    }
  }, []);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      onSpeakingEnd?.();
    }
  }, [isSupported, onSpeakingEnd]);

  const speak = useCallback((text: string, lang?: "en" | "hi") => {
    if (!isSupported || !text.trim()) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    
    // Set language
    const targetLang = lang || language;
    utterance.lang = targetLang === "hi" ? "hi-IN" : "en-US";
    
    // Slightly slower for seniors
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to find a suitable voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      targetLang === "hi" 
        ? v.lang.startsWith("hi") 
        : (v.lang.startsWith("en") && v.name.includes("Female"))
    ) || voices.find(v => 
      targetLang === "hi" 
        ? v.lang.startsWith("hi")
        : v.lang.startsWith("en")
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      onSpeakingStart?.();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      onSpeakingEnd?.();
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      setIsSpeaking(false);
      onSpeakingEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }, [isSupported, language, onSpeakingStart, onSpeakingEnd]);

  return { speak, stop, isSpeaking, isSupported };
};

// Standalone button component for manual playback
interface SpeakButtonProps {
  text: string;
  language?: "en" | "hi";
  size?: "sm" | "default" | "icon";
  className?: string;
}

export const SpeakButton = ({ text, language = "en", size = "icon", className }: SpeakButtonProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);
    }
  }, []);

  const handleClick = () => {
    if (!isSupported) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "hi" ? "hi-IN" : "en-US";
    utterance.rate = 0.9;

    // Try to find a suitable voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      language === "hi" ? v.lang.startsWith("hi") : v.lang.startsWith("en")
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported) return null;

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleClick}
      className={cn(
        "transition-all",
        isSpeaking && "text-primary animate-pulse",
        className
      )}
      title={isSpeaking ? "Stop speaking" : "Read aloud"}
    >
      {isSpeaking ? (
        <Square className="h-3.5 w-3.5" />
      ) : (
        <Volume2 className="h-3.5 w-3.5" />
      )}
    </Button>
  );
};

// Hook version for programmatic control
export const useVoiceOutput = (language: "en" | "hi" = "en") => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);
      // Load voices
      window.speechSynthesis.getVoices();
    }
  }, []);

  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!isSupported || !text.trim()) {
        resolve();
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      
      utterance.lang = language === "hi" ? "hi-IN" : "en-US";
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Find suitable voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        language === "hi" ? v.lang.startsWith("hi") : v.lang.startsWith("en")
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = (event) => {
        console.error("Speech error:", event.error);
        setIsSpeaking(false);
        reject(event.error);
      };

      window.speechSynthesis.speak(utterance);
    });
  }, [isSupported, language]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking, isSupported };
};
