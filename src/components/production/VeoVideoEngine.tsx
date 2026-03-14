import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wand2, Sparkles, Zap, Copy, Settings2, ImagePlus, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shot } from "@/hooks/useShots";
import { trackEvent } from "@/lib/analytics";
import { useToast } from "@/hooks/use-toast";

const styles = ["Cinematic", "Anime", "Photorealistic", "Surreal", "Documentary", "Noir", "Fantasy"];
const aspectRatios = ["16:9", "9:16", "1:1", "4:3"];
const durations = ["5s", "10s", "15s", "30s"];

interface VeoVideoEngineProps {
  initialPrompt: string;
  isSyncing: boolean;
  shotData: Shot | null;
}

const VeoVideoEngine = ({ initialPrompt, isSyncing, shotData }: VeoVideoEngineProps) => {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("Cinematic");
  const [selectedAspect, setSelectedAspect] = useState("16:9");
  const [selectedDuration, setSelectedDuration] = useState("10s");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Sync prompt from shot selection
  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  // Auto-set duration from shot data
  useEffect(() => {
    if (shotData?.duration) {
      const dur = shotData.duration.replace("s", "");
      const closest = durations.reduce((prev, curr) =>
        Math.abs(parseInt(curr) - parseInt(dur)) < Math.abs(parseInt(prev) - parseInt(dur)) ? curr : prev
      );
      setSelectedDuration(closest);
    }
  }, [shotData]);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({ title: "Enter a prompt", description: "Describe the video you want to generate.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    trackEvent("veo_engine_generate", {
      style: selectedStyle,
      aspect: selectedAspect,
      duration: selectedDuration,
      from_shot: !!shotData,
      prompt_length: prompt.length,
    });
    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false);
      toast({ title: "Generation complete", description: "Your video clip is ready for preview." });
    }, 3000);
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    toast({ title: "Prompt copied" });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Veo Engine</h2>
          <Badge className="bg-[var(--neon-green-10)] text-[var(--neon-green-raw)] border-[var(--neon-green-30)] text-[9px]">
            <Zap className="w-2.5 h-2.5 mr-0.5" fill="currentColor" /> Online
          </Badge>
        </div>
        {isSyncing && (
          <Badge className="bg-[var(--neon-cyan-10)] text-accent border-[var(--neon-cyan-30)] text-[9px] animate-pulse">
            <Sparkles className="w-2.5 h-2.5 mr-0.5" /> Synced from Shot
          </Badge>
        )}
      </div>

      {/* Main Panel */}
      <div className="neo-card rounded-2xl p-6 space-y-5">
        {/* Shot context banner */}
        {shotData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-3 p-3 rounded-xl bg-[var(--neon-cyan-10)]/30 border border-[var(--neon-cyan-30)]/30"
          >
            <Video className="w-4 h-4 text-accent shrink-0" />
            <div className="text-xs">
              <span className="text-accent font-mono font-bold">{shotData.shot_code}</span>
              <span className="text-muted-foreground ml-2">{shotData.shot_type} • {shotData.movement} • {shotData.lens}</span>
            </div>
          </motion.div>
        )}

        {/* Prompt textarea */}
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the video you want to generate... Select a shot from the list to auto-fill."
            className="w-full h-32 p-4 pr-10 rounded-xl bg-secondary/50 border border-[var(--neo-border)] text-foreground text-sm placeholder:text-muted-foreground outline-none focus:border-[var(--neon-cyan-30)] focus:shadow-[0_0_15px_var(--neon-cyan-10)] transition-all resize-none"
          />
          {prompt && (
            <button onClick={copyPrompt} className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Reference image */}
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--neo-border)] hover:border-[var(--neon-cyan-30)] text-muted-foreground hover:text-foreground transition-all text-xs">
          <ImagePlus className="w-3.5 h-3.5" />
          Upload reference image (optional)
        </button>

        {/* Controls */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Style</p>
            <Select value={selectedStyle} onValueChange={setSelectedStyle}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {styles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Aspect</p>
            <Select value={selectedAspect} onValueChange={setSelectedAspect}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {aspectRatios.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Duration</p>
            <Select value={selectedDuration} onValueChange={setSelectedDuration}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {durations.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Generate */}
        <div className="flex items-center justify-between pt-2">
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Settings2 className="w-3.5 h-3.5" /> Advanced
          </button>
          <Button
            variant="glow"
            size="lg"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Sparkles className="w-4 h-4" />
              </motion.div>
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            {isGenerating ? "Generating..." : "Generate Video"}
          </Button>
        </div>

        {/* Generation preview placeholder */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl bg-secondary/30 border border-[var(--neon-cyan-30)]/30 aspect-video flex items-center justify-center"
          >
            <div className="text-center space-y-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 mx-auto rounded-full bg-[var(--neon-cyan-10)] flex items-center justify-center"
              >
                <Sparkles className="w-6 h-6 text-accent" />
              </motion.div>
              <p className="text-xs text-muted-foreground">Rendering your scene...</p>
              <div className="w-48 mx-auto h-1 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                  className="h-full rounded-full bg-accent"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VeoVideoEngine;
