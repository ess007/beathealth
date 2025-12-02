import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, User, Trash2, MessageSquare } from "lucide-react";
import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VoiceInput } from "@/components/VoiceInput";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
      toast.error("Failed to load conversation");
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
          title: "New Conversation",
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

  // Save message to database
  const saveMessage = async (role: "user" | "assistant", content: string) => {
    if (!conversationId) return;
    await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      role,
      content,
    });
  };

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

    // Create conversation if not exists
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

    // Save user message
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
          toast.error("Rate limit exceeded. Please try again later.");
        } else if (error.message?.includes("402")) {
          toast.error("Payment required. Please add credits to continue.");
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
                // Ignore parsing errors for incomplete chunks
              }
            }
          }
        }

        // Save assistant message
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
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-4 md:py-6 max-w-4xl flex flex-col">
        <div className="mb-4 md:mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" showText={false} />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Beat AI Coach</h1>
              <p className="text-muted-foreground text-sm md:text-base">
                {language === "hi" ? "आपका व्यक्तिगत स्वास्थ्य सलाहकार" : "Your personal health advisor"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => createConversation.mutate()}
            disabled={createConversation.isPending}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {language === "hi" ? "नई चैट" : "New Chat"}
          </Button>
        </div>

        {/* Conversation History */}
        {conversations && conversations.length > 0 && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {conversations.map((conv) => (
              <Button
                key={conv.id}
                variant={conversationId === conv.id ? "default" : "outline"}
                size="sm"
                className="shrink-0 gap-2"
                onClick={() => loadConversation(conv.id)}
              >
                {conv.title?.substring(0, 20) || "Conversation"}
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
        <Card className="flex-1 p-4 mb-4 overflow-y-auto shadow-elevated min-h-[400px]">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center text-muted-foreground">
              <div>
                <Logo size="lg" showText={false} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">
                  {language === "hi" ? "नमस्ते! मैं बीट हूं 👋" : "Hello! I'm Beat 👋"}
                </p>
                <p className="text-sm max-w-md">
                  {language === "hi"
                    ? "अपने स्वास्थ्य के बारे में कोई भी सवाल पूछें। मैं यहां आपकी मदद के लिए हूं।"
                    : "Ask me anything about your health. I'm here to help you on your wellness journey."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Logo size="sm" showText={false} />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Logo size="sm" showText={false} />
                  </div>
                  <div className="bg-muted rounded-2xl p-4">
                    <p className="text-muted-foreground">{t("coach.thinking")}</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </Card>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder={language === "hi" ? "अपना सवाल पूछें..." : "Ask your question..."}
            disabled={isLoading}
            className="h-12 text-base flex-1"
          />
          <VoiceInput
            onTranscript={(text) => {
              setInput(text);
              setTimeout(() => handleSend(), 100);
            }}
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="icon" className="h-12 w-12">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AICoach;
