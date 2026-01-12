import { useState, useCallback, useRef, useEffect } from "react";
import { haptic } from "@/lib/haptics";
import { toast } from "sonner";

export type VoiceState = "idle" | "listening" | "processing" | "speaking";

interface UseVoiceConversationOptions {
  language?: "en" | "hi";
  onTranscript?: (text: string) => void;
  autoRestartListening?: boolean;
}

export const useVoiceConversation = ({
  language = "en",
  onTranscript,
  autoRestartListening = true,
}: UseVoiceConversationOptions = {}) => {
  const [voiceMode, setVoiceMode] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const shouldRestartRef = useRef(false);

  // Check for support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const hasSpeechRecognition = !!SpeechRecognition;
      const hasSpeechSynthesis = "speechSynthesis" in window;
      
      setIsSupported(hasSpeechRecognition && hasSpeechSynthesis);

      if (hasSpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language === "hi" ? "hi-IN" : "en-US";

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          haptic("light");
          setVoiceState("processing");
          onTranscript?.(transcript);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          
          if (event.error === "no-speech") {
            // Restart listening if still in voice mode
            if (shouldRestartRef.current && autoRestartListening) {
              setTimeout(() => startListening(), 500);
              return;
            }
          } else if (event.error === "not-allowed") {
            toast.error(
              language === "hi"
                ? "माइक्रोफ़ोन की अनुमति दें"
                : "Please allow microphone access"
            );
            setVoiceMode(false);
          }
          
          setVoiceState("idle");
        };

        recognition.onend = () => {
          // Auto-restart if in voice mode and should restart
          if (shouldRestartRef.current && voiceState === "listening" && autoRestartListening) {
            setTimeout(() => {
              if (shouldRestartRef.current) {
                startListening();
              }
            }, 300);
          }
        };

        recognitionRef.current = recognition;
      }

      // Preload voices
      if (hasSpeechSynthesis) {
        window.speechSynthesis.getVoices();
      }
    }
  }, [language, onTranscript, autoRestartListening]);

  // Update recognition language when it changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === "hi" ? "hi-IN" : "en-US";
    }
  }, [language]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || voiceState === "speaking") return;

    try {
      recognitionRef.current.start();
      setVoiceState("listening");
      haptic("light");
    } catch (error) {
      console.error("Error starting recognition:", error);
    }
  }, [voiceState]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setVoiceState("idle");
  }, []);

  const speak = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve) => {
        if (!("speechSynthesis" in window) || !text.trim()) {
          resolve();
          return;
        }

        // Stop any ongoing speech
        window.speechSynthesis.cancel();
        shouldRestartRef.current = false;

        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;

        utterance.lang = language === "hi" ? "hi-IN" : "en-US";
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Find suitable voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find((v) =>
          language === "hi" ? v.lang.startsWith("hi") : v.lang.startsWith("en")
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
          setVoiceState("speaking");
          haptic("light");
        };

        utterance.onend = () => {
          setVoiceState("idle");
          
          // Auto-restart listening after speaking if in voice mode
          if (voiceMode && autoRestartListening) {
            shouldRestartRef.current = true;
            setTimeout(() => {
              if (shouldRestartRef.current && voiceMode) {
                startListening();
              }
            }, 500);
          }
          
          resolve();
        };

        utterance.onerror = (event) => {
          console.error("Speech synthesis error:", event.error);
          setVoiceState("idle");
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      });
    },
    [language, voiceMode, autoRestartListening, startListening]
  );

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setVoiceState("idle");
    shouldRestartRef.current = false;
  }, []);

  const toggleVoiceMode = useCallback(() => {
    const newMode = !voiceMode;
    setVoiceMode(newMode);
    haptic("medium");

    if (newMode) {
      shouldRestartRef.current = true;
      toast.info(
        language === "hi" ? "आवाज़ मोड चालू। बोलें..." : "Voice mode on. Speak now...",
        { duration: 2000 }
      );
      startListening();
    } else {
      shouldRestartRef.current = false;
      stopListening();
      stopSpeaking();
      toast.info(
        language === "hi" ? "आवाज़ मोड बंद" : "Voice mode off",
        { duration: 1500 }
      );
    }
  }, [voiceMode, language, startListening, stopListening, stopSpeaking]);

  const interrupt = useCallback(() => {
    stopSpeaking();
    if (voiceMode) {
      shouldRestartRef.current = true;
      setTimeout(() => startListening(), 300);
    }
  }, [voiceMode, stopSpeaking, startListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Set processing state to idle if stuck
  useEffect(() => {
    if (voiceState === "processing") {
      const timeout = setTimeout(() => {
        // If still processing after 30s, reset
        if (voiceState === "processing") {
          setVoiceState("idle");
          if (voiceMode) {
            shouldRestartRef.current = true;
            startListening();
          }
        }
      }, 30000);
      return () => clearTimeout(timeout);
    }
  }, [voiceState, voiceMode, startListening]);

  return {
    voiceMode,
    voiceState,
    isSupported,
    toggleVoiceMode,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    interrupt,
    setVoiceState,
  };
};
