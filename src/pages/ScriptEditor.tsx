import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Wand2, Download, Copy, RotateCcw, Send, Bot, User, Loader2, Sparkles, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import AppLayout from "@/components/AppLayout";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";

type Message = { role: "user" | "assistant"; content: string };

const SCRIPT_ASSIST_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/script-assist`;

const QUICK_PROMPTS = [
  { label: "Continue scene", prompt: "Continue the script from where it left off. Write the next 10-15 lines maintaining the tone and pacing." },
  { label: "Add dialogue", prompt: "Write additional dialogue for the current scene that deepens the character relationships and raises the stakes." },
  { label: "Rewrite last scene", prompt: "Rewrite the last scene with more tension and visual dynamism. Make the action lines more cinematic." },
  { label: "Add new character", prompt: "Introduce a new character who enters the current scene and creates an unexpected complication." },
];

const ScriptEditor = () => {
  const [script, setScript] = useState(
`INT. APARTMENT - NIGHT

A dimly lit apartment. Rain streaks down the window. ALEX (30s) sits at a desk, staring at a glowing monitor.

ALEX
(whispering)
It wasn't supposed to end like this.

The screen flickers. A message appears:

INSERT - MONITOR SCREEN: "TIME REMAINING: 00:03:42"

Alex stands abruptly, knocking the chair back.

ALEX (CONT'D)
Three minutes. That's all I need.

EXT. CITY STREET - CONTINUOUS

Alex bursts through the apartment door into the rain-soaked street. Neon signs reflect in puddles.`
  );

  const [title, setTitle] = useState("Neon Dreams - Draft 1");
  const [aiOpen, setAiOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "I'm your script writing assistant. I can help you **generate new scenes**, **polish dialogue**, **continue your story**, or **rewrite sections**. What would you like to work on?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const streamChat = async (userPrompt: string) => {
    if (!userPrompt.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: userPrompt.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(SCRIPT_ASSIST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
          currentScript: script,
        }),
      });

      if (resp.status === 401) {
        toast({ title: "Session expired", description: "Please sign out and log in again to continue.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      if (resp.status === 429 || resp.status === 402) {
        const data = await resp.json();
        toast({ title: "AI Unavailable", description: data.error, variant: "destructive" });
        setIsLoading(false);
        return;
      }

      if (!resp.ok || !resp.body) throw new Error("Failed to connect");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

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
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.role === "user") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch { /* partial chunk */ }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't connect to the AI service. Please try again." }]);
    }
    setIsLoading(false);
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 h-[calc(100vh-0px)] flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-display text-2xl font-bold bg-transparent border-none outline-none text-foreground"
            />
            <p className="text-sm text-muted-foreground mt-1">Last edited 2 hours ago</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="cinema"
              size="sm"
              onClick={() => setAiOpen(!aiOpen)}
              className={aiOpen ? "ring-2 ring-primary" : ""}
            >
              <Wand2 className="w-4 h-4" /> AI Assist
            </Button>
            <Button variant="ghost" size="sm"><RotateCcw className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm"><Copy className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button>
            <Button variant="glow" size="sm">
              <Save className="w-4 h-4" /> Save
            </Button>
          </div>
        </motion.div>

        {/* Editor + AI Panel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 flex gap-6 min-h-0"
        >
          {/* Main Editor */}
          <div className="flex-1 neo-card rounded-xl overflow-hidden flex flex-col">
            <div className="border-b border-[var(--neo-border)] px-4 py-2 flex items-center gap-4">
              <span className="text-xs text-muted-foreground">Screenplay Format</span>
              <Badge className="bg-[var(--neon-cyan-10)] text-[var(--neon-cyan)] border-[var(--neon-cyan-30)] text-[10px]">
                Words: {script.split(/\s+/).length}
              </Badge>
              <span className="text-xs text-muted-foreground">Lines: {script.split("\n").length}</span>
            </div>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="w-full flex-1 p-6 bg-transparent text-foreground font-mono text-sm leading-relaxed resize-none outline-none"
              spellCheck={false}
            />
          </div>

          {/* Side Panel — Scene Breakdown OR AI Assistant */}
          <AnimatePresence mode="wait">
            {aiOpen ? (
              <motion.div
                key="ai-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-80 lg:w-96 neo-card rounded-xl flex flex-col overflow-hidden border border-primary/20"
              >
                {/* AI Header */}
                <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-card">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-display font-semibold text-sm">Script Assistant</span>
                  </div>
                  <button onClick={() => setAiOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Prompts */}
                <div className="px-3 py-2 border-b border-border flex gap-1.5 flex-wrap">
                  {QUICK_PROMPTS.map((qp) => (
                    <button
                      key={qp.label}
                      onClick={() => streamChat(qp.prompt)}
                      disabled={isLoading}
                      className="text-[10px] px-2 py-1 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                    >
                      {qp.label}
                    </button>
                  ))}
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs ${
                        msg.role === "assistant" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"
                      }`}>
                        {msg.role === "assistant" ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      </div>
                      <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                        msg.role === "assistant" ? "bg-card border border-border" : "bg-primary/10 border border-primary/20"
                      }`}>
                        <div className="prose prose-sm prose-invert max-w-none [&_pre]:bg-background/50 [&_pre]:rounded-md [&_pre]:p-2 [&_pre]:text-[10px] [&_code]:text-[10px]">
                          <ReactMarkdown
                            components={{
                              pre({ children }) {
                                return <pre className="relative group">{children}</pre>;
                              },
                              code({ className, children, ...props }) {
                                const text = String(children).replace(/\n$/, "");
                                const isScreenplay = className?.includes("screenplay") || className?.includes("language-screenplay");
                                if (isScreenplay) {
                                  return (
                                    <div className="relative">
                                      <code className={className} {...props}>{children}</code>
                                      <button
                                        onClick={() => {
                                          setScript(prev => prev.trimEnd() + "\n\n" + text);
                                          toast({ title: "Inserted!", description: "Script content appended." });
                                        }}
                                        className="mt-2 flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                                      >
                                        <Plus className="w-3 h-3" /> Insert into script
                                      </button>
                                    </div>
                                  );
                                }
                                return <code className={className} {...props}>{children}</code>;
                              },
                            }}
                          >{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                        <Bot className="w-3 h-3" />
                      </div>
                      <div className="bg-card border border-border rounded-lg px-3 py-2">
                        <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <form
                  onSubmit={(e) => { e.preventDefault(); streamChat(input); }}
                  className="p-3 border-t border-border flex gap-2"
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask to write, continue, or refine..."
                    className="flex-1 text-xs h-8 bg-card border-border"
                    disabled={isLoading}
                  />
                  <Button type="submit" size="icon" className="h-8 w-8 bg-primary hover:bg-primary/90" disabled={isLoading || !input.trim()}>
                    <Send className="w-3 h-3" />
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="side-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-64 space-y-4 hidden lg:block"
              >
                <div className="neo-card rounded-xl p-4">
                  <h3 className="font-display font-semibold text-sm mb-3">Scene Breakdown</h3>
                  <div className="space-y-2">
                    {["INT. APARTMENT - NIGHT", "EXT. CITY STREET"].map((scene, i) => (
                      <div
                        key={i}
                        className="text-xs px-3 py-2 rounded-lg bg-[var(--neon-purple-05)] border border-[var(--neon-purple-30)] hover:bg-[var(--neon-purple-10)] cursor-pointer transition-colors text-[var(--neon-purple)]"
                      >
                        {scene}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="neo-card rounded-xl p-4">
                  <h3 className="font-display font-semibold text-sm mb-3">Characters</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-6 h-6 rounded-full bg-[var(--neon-cyan-10)] flex items-center justify-center text-accent font-bold">A</div>
                      Alex (30s)
                    </div>
                  </div>
                </div>
                <div className="neo-card rounded-xl p-4">
                  <h3 className="font-display font-semibold text-sm mb-3">AI Suggestions</h3>
                  <p className="text-xs text-muted-foreground">Click "AI Assist" to generate scene continuations, dialogue, or shot descriptions.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default ScriptEditor;
