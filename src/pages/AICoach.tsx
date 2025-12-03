import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, User, Trash2, MessageSquare, Sparkles, AlertTriangle } from "lucide-react";
import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VoiceInput } from "@/components/VoiceInput";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FeatureGate } from "@/components/FeatureGate";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AICoach = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch existing conversations
  const { data: conversations } = useQuery({
    queryKey: ["chat-conversations", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Load messages for a conversation
  const loadConversation = async (convId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (error) {
      toast.error(language === 'hi' ? 'बातचीत लोड करने में त्रुटि' : 'Failed to load conversation');
      return;
    }

    setConversationId(convId);
    setMessages(data.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })));
  };

  // Create new conversation
  const createConversation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("chat_conversations")
        .insert({
          user_id: user.id,
          language,
          title: language === 'hi' ? 'नई बातचीत' : 'New Conversation',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setConversationId(data.id);
      setMessages([]);
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
    },
  });

  // Delete conversation
  const deleteConversation = useMutation({
    mutationFn: async (convId: string) => {
      await supabase.from("chat_messages").delete().eq("conversation_id", convId);
      await supabase.from("chat_conversations").delete().eq("id", convId);
    },
    onSuccess: () => {
      if (conversationId) {
        setConversationId(null);
        setMessages([]);
      }
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      toast.success(language === "hi" ? "बातचीत हटा दी गई" : "Conversation deleted");
    },
  });

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    let currentConvId = conversationId;
    if (!currentConvId && user?.id) {
      const { data: newConv } = await supabase
        .from("chat_conversations")
        .insert({
          user_id: user.id,
          language,
          title: input.substring(0, 50),
        })
        .select()
        .single();
      if (newConv) {
        currentConvId = newConv.id;
        setConversationId(newConv.id);
        queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      }
    }

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    if (currentConvId) {
      await supabase.from("chat_messages").insert({
        conversation_id: currentConvId,
        role: "user",
        content: input,
      });
    }

    try {
      const { data, error } = await supabase.functions.invoke("chat-copilot", {
        body: {
          messages: [...messages, userMessage],
          language,
        },
      });

      if (error) {
        if (error.message?.includes("429")) {
          toast.error(language === 'hi' ? 'सीमा पार। कृपया बाद में प्रयास करें।' : "Rate limit exceeded. Please try again later.");
        } else if (error.message?.includes("402")) {
          toast.error(language === 'hi' ? 'भुगतान आवश्यक। कृपया क्रेडिट जोड़ें।' : "Payment required. Please add credits to continue.");
        } else {
          throw error;
        }
        return;
      }

      const reader = data.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  assistantContent += content;
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage?.role === "assistant") {
                      lastMessage.content = assistantContent;
                    } else {
                      newMessages.push({ role: "assistant", content: assistantContent });
                    }
                    return newMessages;
                  });
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }

        if (currentConvId && assistantContent) {
          await supabase.from("chat_messages").insert({
            conversation_id: currentConvId,
            role: "assistant",
            content: assistantContent,
          });
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(language === 'hi' ? 'संदेश भेजने में त्रुटि' : "Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = language === 'hi' 
    ? [
        "मेरा BP 140/90 है, क्या यह खतरनाक है?",
        "शुगर कम करने के लिए क्या खाएं?",
        "रात को अच्छी नींद के लिए टिप्स",
        "क्या चाय पीना BP बढ़ाता है?"
      ]
    : [
        "Is 140/90 BP dangerous for me?",
        "What foods help lower blood sugar?",
        "Tips for better sleep at night",
        "Does drinking tea raise BP?"
      ];

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24 md:pb-0">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-5 max-w-4xl flex flex-col">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Logo size="sm" showText={false} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                Beat AI Coach
                <Sparkles className="w-5 h-5 text-primary" />
              </h1>
              <p className="text-xs text-muted-foreground">
                {language === "hi" ? "आपका व्यक्तिगत स्वास्थ्य सलाहकार" : "Your personal health advisor"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => createConversation.mutate()}
            disabled={createConversation.isPending}
            className="gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">{language === "hi" ? "नई चैट" : "New Chat"}</span>
          </Button>
        </div>

        {/* Medical Disclaimer */}
        <div className="flex items-start gap-2 p-3 mb-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-muted-foreground">
            {language === 'hi' 
              ? 'यह AI सलाह है, चिकित्सा निदान नहीं। गंभीर लक्षणों के लिए डॉक्टर से मिलें।'
              : 'This is AI guidance, not medical diagnosis. Consult a doctor for serious symptoms.'}
          </p>
        </div>

        {/* Conversation History */}
        {conversations && conversations.length > 0 && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {conversations.map((conv) => (
              <Button
                key={conv.id}
                variant={conversationId === conv.id ? "default" : "outline"}
                size="sm"
                className="shrink-0 gap-2 rounded-full"
                onClick={() => loadConversation(conv.id)}
              >
                {conv.title?.substring(0, 20) || "Chat"}
                {conversationId === conv.id && (
                  <Trash2
                    className="w-3 h-3 opacity-50 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation.mutate(conv.id);
                    }}
                  />
                )}
              </Button>
            ))}
          </div>
        )}

        {/* Messages */}
        <FeatureGate feature="ai_coach">
          <Card className="flex-1 p-4 mb-4 overflow-y-auto border-border/50 min-h-[400px] max-h-[60vh]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                  <Logo size="lg" showText={false} className="opacity-50" />
                </div>
                <p className="text-lg font-semibold mb-2">
                  {language === "hi" ? "नमस्ते! मैं Beat हूं 👋" : "Hello! I'm Beat 👋"}
                </p>
                <p className="text-sm text-muted-foreground max-w-sm mb-6">
                  {language === "hi"
                    ? "अपने स्वास्थ्य के बारे में कोई भी सवाल पूछें।"
                    : "Ask me anything about your health. I'm here to help."}
                </p>
                
                {/* Suggested Questions */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-full transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                        <Logo size="sm" showText={false} />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === "user" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-secondary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                      <Logo size="sm" showText={false} />
                    </div>
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </Card>
        </FeatureGate>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder={language === "hi" ? "अपना सवाल पूछें..." : "Ask your question..."}
            disabled={isLoading}
            className="h-12 text-base flex-1 rounded-xl"
          />
          <VoiceInput
            onTranscript={(text) => {
              setInput(text);
              setTimeout(() => handleSend(), 100);
            }}
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="icon" className="h-12 w-12 rounded-xl">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AICoach;