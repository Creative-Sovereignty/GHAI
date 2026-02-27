import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Wand2, Download, Copy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/AppLayout";

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
            <Button variant="cinema" size="sm">
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

        {/* Editor */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 flex gap-6"
        >
          {/* Main Editor */}
          <div className="flex-1 neo-card rounded-xl overflow-hidden">
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
              className="w-full h-full p-6 bg-transparent text-foreground font-mono text-sm leading-relaxed resize-none outline-none"
              spellCheck={false}
            />
          </div>

          {/* Side Panel */}
          <div className="w-64 space-y-4 hidden lg:block">
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
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default ScriptEditor;
