import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, User, Clapperboard, FileText, Video, Music,
  Loader2, Sparkles, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

type Role = "user" | "assistant";

interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  toolCalls?: ToolCall[];
  timestamp: Date;
}

const DIRECTOR_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/director-assist`;

const toolIcons: Record<string, typeof FileText> = {
  update_script: FileText,
  generate_video_clip: Video,
  set_music_mood: Music,
};

const toolColors: Record<string, string> = {
  update_script: "var(--neon-cyan)",
  generate_video_clip: "var(--neon-pink)",
  set_music_mood: "var(--neon-purple)",
};

const toolLabels: Record<string, string> = {
  update_script: "Script Update",
  generate_video_clip: "Video Generation",
  set_music_mood: "Music Mood",
};

const DirectorAI = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    const apiMessages = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const resp = await fetch(DIRECTOR_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Unknown error" }));
        if (resp.status === 429) {
          toast({ title: "Rate Limited", description: "Too many requests. Please wait a moment.", variant: "destructive" });
        } else if (resp.status === 402) {
          toast({ title: "Credits Depleted", description: "Please add credits to continue using Director AI.", variant: "destructive" });
        } else {
          toast({ title: "Error", description: err.error || "AI service error", variant: "destructive" });
        }
        setIsStreaming(false);
        return;
      }

      // Stream SSE response
      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";
      let toolCalls: ToolCall[] = [];
      // Track tool call accumulation from streaming deltas
      const toolCallAccum: Record<number, { name: string; argsStr: string }> = {};

      const assistantId = crypto.randomUUID();

      const updateAssistant = () => {
        setMessages((prev) => {
          const existing = prev.find((m) => m.id === assistantId);
          const msg: ChatMessage = {
            id: assistantId,
            role: "assistant",
            content: assistantContent,
            toolCalls: toolCalls.length > 0 ? [...toolCalls] : undefined,
            timestamp: new Date(),
          };
          if (existing) {
            return prev.map((m) => (m.id === assistantId ? msg : m));
          }
          return [...prev, msg];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta;
            if (!delta) continue;

            // Text content
            if (delta.content) {
              assistantContent += delta.content;
              updateAssistant();
            }

            // Tool calls (streaming accumulation)
            if (delta.tool_calls) {
              for (const tc of delta.tool_calls) {
                const idx = tc.index ?? 0;
                if (!toolCallAccum[idx]) {
                  toolCallAccum[idx] = { name: "", argsStr: "" };
                }
                if (tc.function?.name) {
                  toolCallAccum[idx].name = tc.function.name;
                }
                if (tc.function?.arguments) {
                  toolCallAccum[idx].argsStr += tc.function.arguments;
                }

                // Try to parse completed tool call
                try {
                  const args = JSON.parse(toolCallAccum[idx].argsStr);
                  const existingIdx = toolCalls.findIndex(
                    (t) => t.name === toolCallAccum[idx].name
                  );
                  const newTc: ToolCall = { name: toolCallAccum[idx].name, arguments: args };
                  if (existingIdx >= 0) {
                    toolCalls[existingIdx] = newTc;
                  } else {
                    toolCalls.push(newTc);
                  }
                  updateAssistant();
                } catch {
                  // Arguments still streaming, wait for more chunks
                }
              }
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      updateAssistant();
    } catch (e) {
      console.error("Director AI error:", e);
      toast({ title: "Connection Error", description: "Failed to reach Director AI.", variant: "destructive" });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)]">
        {/* Header */}
        <div className="shrink-0 p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[var(--neon-pink)] flex items-center justify-center">
              <Clapperboard className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold flex items-center gap-2">
                Director AI
                <Badge className="bg-[var(--neon-green-10)] text-[var(--neon-green-raw)] border-[var(--neon-green-30)] text-[9px] font-mono">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5" /> LIVE
                </Badge>
              </h1>
              <p className="text-xs text-muted-foreground">
                Orchestrate script, video & music in one command
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
              <Clapperboard className="w-12 h-12 text-muted-foreground" />
              <div>
                <p className="font-display text-lg font-semibold">What's your vision?</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Describe a mood, scene change, or creative direction. I'll orchestrate
                  script, visuals, and music simultaneously.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {[
                  "Make the desert scene feel like a horror movie",
                  "Add a romantic subplot in Scene 2",
                  "Create a high-energy chase sequence",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-[var(--neon-pink)] flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] space-y-2 ${
                    msg.role === "user"
                      ? "neo-card rounded-2xl rounded-br-md px-4 py-3"
                      : ""
                  }`}
                >
                  {msg.content && (
                    <div className="prose prose-sm prose-invert max-w-none text-sm">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}

                  {/* Tool Calls */}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="space-y-2 mt-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Production Actions
                      </p>
                      {msg.toolCalls.map((tc, i) => {
                        const Icon = toolIcons[tc.name] || Clapperboard;
                        const color = toolColors[tc.name] || "var(--neon-cyan)";
                        const label = toolLabels[tc.name] || tc.name;
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="neo-card rounded-xl p-3 border-l-2"
                            style={{ borderLeftColor: color }}
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <Icon className="w-3.5 h-3.5" style={{ color }} />
                              <span className="text-xs font-bold" style={{ color }}>
                                {label}
                              </span>
                            </div>
                            <pre className="text-[11px] text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                              {JSON.stringify(tc.arguments, null, 2)}
                            </pre>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-1">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isStreaming && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-[var(--neon-pink)] flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Director is thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0 p-4 border-t border-border">
          <div className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your creative vision..."
              className="min-h-[44px] max-h-32 resize-none text-sm"
              rows={1}
            />
            <Button
              variant="glow"
              size="icon"
              className="shrink-0 h-11 w-11"
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
            >
              {isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DirectorAI;
