import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ImageIcon, Wand2, GripVertical, Loader2, Sparkles, X, Trash2, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/AppLayout";

type Frame = {
  id: number;
  scene: string;
  description: string;
  notes: string;
  imageUrl?: string;
};

const STORYBOARD_IMAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/storyboard-image`;

const initialFrames: Frame[] = [
  { id: 1, scene: "INT. APARTMENT - NIGHT", description: "Wide shot: Alex at desk, monitor glow", notes: "Blue/cold tones" },
  { id: 2, scene: "INT. APARTMENT - NIGHT", description: "CU: Monitor screen with countdown", notes: "Insert shot" },
  { id: 3, scene: "INT. APARTMENT - NIGHT", description: "MCU: Alex stands, chair falls", notes: "Quick camera movement" },
  { id: 4, scene: "EXT. CITY STREET", description: "Wide: Alex exits building into rain", notes: "Neon reflections in puddles" },
  { id: 5, scene: "EXT. CITY STREET", description: "Tracking shot: Alex running", notes: "Handheld, urgent feel" },
  { id: 6, scene: "EXT. CITY STREET", description: "Low angle: Neon signs above", notes: "Atmosphere establishing" },
];

const STORYBOARD_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/storyboard-assist`;

const SUGGESTIONS = [
  "A tense chase through a rainy cyberpunk city at night",
  "A quiet emotional conversation in a sunlit café",
  "An action sequence in an abandoned warehouse",
  "A mysterious figure entering a neon-lit alley",
];

const Storyboard = () => {
  const [frames, setFrames] = useState<Frame[]>(initialFrames);
  const [showAI, setShowAI] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFrames, setGeneratedFrames] = useState<Frame[]>([]);
  const [generatingImageIds, setGeneratingImageIds] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const generateThumbnail = async (frame: Frame) => {
    setGeneratingImageIds(prev => new Set(prev).add(frame.id));
    try {
      const resp = await fetch(STORYBOARD_IMAGE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          scene: frame.scene,
          description: frame.description,
          notes: frame.notes,
          frameId: frame.id,
        }),
      });

      if (resp.status === 429 || resp.status === 402) {
        const data = await resp.json();
        toast({ title: "AI Unavailable", description: data.error, variant: "destructive" });
        return;
      }
      if (!resp.ok) throw new Error("Failed");

      const data = await resp.json();
      if (data.imageUrl) {
        setFrames(prev => prev.map(f => f.id === frame.id ? { ...f, imageUrl: data.imageUrl } : f));
        toast({ title: "Thumbnail generated!", description: `Frame "${frame.description}" now has a visual.` });
      }
    } catch {
      toast({ title: "Error", description: "Failed to generate thumbnail.", variant: "destructive" });
    } finally {
      setGeneratingImageIds(prev => {
        const next = new Set(prev);
        next.delete(frame.id);
        return next;
      });
    }
  };

  const generateAllThumbnails = async () => {
    const framesWithoutImages = frames.filter(f => !f.imageUrl);
    if (framesWithoutImages.length === 0) {
      toast({ title: "All done", description: "Every frame already has a thumbnail." });
      return;
    }
    toast({ title: "Generating thumbnails...", description: `${framesWithoutImages.length} frames queued.` });
    for (const frame of framesWithoutImages) {
      await generateThumbnail(frame);
    }
  };

  const generateFrames = async (inputPrompt: string) => {
    if (!inputPrompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setGeneratedFrames([]);

    try {
      const resp = await fetch(STORYBOARD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          prompt: inputPrompt,
          existingFrames: frames,
        }),
      });

      if (resp.status === 429 || resp.status === 402) {
        const data = await resp.json();
        toast({ title: "AI Unavailable", description: data.error, variant: "destructive" });
        setIsGenerating(false);
        return;
      }

      if (!resp.ok) throw new Error("Failed");

      const data = await resp.json();
      const newFrames = (data.frames || []).map((f: any, i: number) => ({
        id: Date.now() + i,
        scene: f.scene,
        description: f.description,
        notes: f.notes,
      }));
      setGeneratedFrames(newFrames);
    } catch {
      toast({ title: "Error", description: "Failed to generate frames. Please try again.", variant: "destructive" });
    }
    setIsGenerating(false);
  };

  const addGeneratedFrames = () => {
    setFrames(prev => [...prev, ...generatedFrames]);
    setGeneratedFrames([]);
    setShowAI(false);
    setPrompt("");
    toast({ title: "Frames added!", description: `${generatedFrames.length} frames appended to your storyboard.` });
  };

  const removeFrame = (id: number) => {
    setFrames(prev => prev.filter(f => f.id !== id));
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="font-display text-2xl font-bold">Storyboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Neon Dreams - {frames.length} frames</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="cinema"
              size="sm"
              onClick={() => setShowAI(!showAI)}
              className={showAI ? "ring-2 ring-primary" : ""}
            >
              <Wand2 className="w-4 h-4" /> AI Generate
            </Button>
            <Button
              variant="glow"
              size="sm"
              onClick={() => {
                const newId = Date.now();
                setFrames(prev => [...prev, { id: newId, scene: "INT. NEW SCENE", description: "Shot description", notes: "Notes" }]);
              }}
            >
              <Plus className="w-4 h-4" /> Add Frame
            </Button>
          </div>
        </motion.div>

        {/* AI Generation Panel */}
        <AnimatePresence>
          {showAI && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="neo-card rounded-xl p-5 border border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="font-display font-semibold text-sm">AI Scene Generator</h3>
                  </div>
                  <button onClick={() => { setShowAI(false); setGeneratedFrames([]); }} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Suggestion chips */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setPrompt(s); generateFrames(s); }}
                      disabled={isGenerating}
                      className="text-[10px] px-2.5 py-1 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <form
                  onSubmit={(e) => { e.preventDefault(); generateFrames(prompt); }}
                  className="flex gap-2 mb-4"
                >
                  <Input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe a scene or sequence to generate frames for..."
                    className="flex-1 text-sm bg-card border-border"
                    disabled={isGenerating}
                  />
                  <Button type="submit" variant="cinema" size="sm" disabled={isGenerating || !prompt.trim()}>
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    {isGenerating ? "Generating..." : "Generate"}
                  </Button>
                </form>

                {/* Generated Frames Preview */}
                {generatedFrames.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-muted-foreground">
                        {generatedFrames.length} frames generated — preview below
                      </p>
                      <Button variant="glow" size="sm" onClick={addGeneratedFrames}>
                        <Plus className="w-3 h-3" /> Add all to storyboard
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {generatedFrames.map((frame, i) => (
                        <motion.div
                          key={frame.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.08 }}
                          className="rounded-lg border border-primary/20 bg-primary/5 overflow-hidden"
                        >
                          <div className="aspect-video bg-secondary/30 flex items-center justify-center relative">
                            <ImageIcon className="w-8 h-8 text-primary/30" />
                            <Badge className="absolute top-2 left-2 bg-primary/20 text-primary border-primary/30 font-mono text-[10px]">
                              New #{i + 1}
                            </Badge>
                          </div>
                          <div className="p-3">
                            <p className="text-xs text-accent font-mono mb-1">{frame.scene}</p>
                            <p className="text-xs font-medium mb-1">{frame.description}</p>
                            <p className="text-[10px] text-muted-foreground">{frame.notes}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Storyboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {frames.map((frame, index) => (
            <motion.div
              key={frame.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
              className="neo-card rounded-xl overflow-hidden group cursor-pointer hover:border-[var(--neon-cyan-30)] hover:shadow-[0_0_20px_var(--neon-cyan-10)] transition-all"
            >
              <div className="aspect-video bg-secondary/50 flex items-center justify-center relative">
                <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                <Badge className="absolute top-2 left-2 bg-[var(--neon-cyan-10)] text-[var(--neon-cyan)] border-[var(--neon-cyan-30)] font-mono text-[10px]">
                  #{index + 1}
                </Badge>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => removeFrame(frame.id)}
                    className="w-6 h-6 rounded bg-destructive/80 flex items-center justify-center hover:bg-destructive transition-colors"
                  >
                    <Trash2 className="w-3 h-3 text-destructive-foreground" />
                  </button>
                  <GripVertical className="w-4 h-4 text-muted-foreground mt-1" />
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs text-accent font-mono mb-1">{frame.scene}</p>
                <p className="text-sm font-medium mb-2">{frame.description}</p>
                <p className="text-xs text-muted-foreground">{frame.notes}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Storyboard;
