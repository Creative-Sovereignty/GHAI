import { useState } from "react";
import { motion } from "framer-motion";
import { Video, Wand2, Download, Play, Pause, Clock, Sparkles, Settings2, ImagePlus, Type, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/AppLayout";

const styles = ["Cinematic", "Anime", "Photorealistic", "Surreal", "Documentary", "Noir", "Fantasy", "Abstract"];
const aspectRatios = ["16:9", "9:16", "1:1", "4:3"];
const durations = ["5s", "10s", "15s", "30s", "60s"];

const generatedVideos = [
  { id: 1, title: "Cyberpunk Cityscape", style: "Cinematic", aspect: "16:9", duration: "10s", status: "Complete" },
  { id: 2, title: "Forest Spirit Walk", style: "Fantasy", aspect: "9:16", duration: "15s", status: "Complete" },
  { id: 3, title: "Abstract Flow", style: "Abstract", aspect: "1:1", duration: "5s", status: "Generating" },
];

const Veo3 = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("Cinematic");
  const [selectedAspect, setSelectedAspect] = useState("16:9");
  const [selectedDuration, setSelectedDuration] = useState("10s");
  const [playingId, setPlayingId] = useState<number | null>(null);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">Veo 3</h1>
            <Badge className="bg-[var(--neon-cyan-10)] text-[var(--neon-cyan)] border-[var(--neon-cyan-30)] shadow-[0_0_8px_var(--neon-cyan-10)]">
              AI Video
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Generate cinematic video clips with AI</p>
        </motion.div>

        {/* Generator Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="neo-card rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="font-display font-semibold">Generate Video</h2>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the video you want to create... e.g., 'A sweeping aerial shot over a neon-lit cyberpunk city at night, rain reflections on wet streets, flying cars in the distance'"
            className="w-full h-28 p-4 rounded-xl bg-secondary/50 border border-[var(--neo-border)] text-foreground text-sm placeholder:text-muted-foreground outline-none focus:border-[var(--neon-cyan-30)] focus:shadow-[0_0_15px_var(--neon-cyan-10)] transition-all resize-none"
          />

          {/* Reference Image Upload */}
          <div className="mt-4">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--neo-border)] hover:border-[var(--neon-cyan-30)] text-muted-foreground hover:text-foreground transition-all text-sm">
              <ImagePlus className="w-4 h-4" />
              Upload reference image (optional)
            </button>
          </div>

          {/* Style selection */}
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Style</p>
            <div className="flex flex-wrap gap-2">
              {styles.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStyle(s)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    selectedStyle === s
                      ? "bg-[var(--neon-cyan-10)] text-[var(--neon-cyan)] border-[var(--neon-cyan-30)] shadow-[0_0_8px_var(--neon-cyan-10)]"
                      : "bg-secondary text-muted-foreground border-[var(--neo-border)] hover:border-[var(--neon-cyan-30)]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio & Duration */}
          <div className="mt-4 flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Aspect Ratio</p>
              <div className="flex gap-2">
                {aspectRatios.map((a) => (
                  <button
                    key={a}
                    onClick={() => setSelectedAspect(a)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      selectedAspect === a
                        ? "bg-[var(--neon-pink-10)] text-[var(--neon-pink)] border-[var(--neon-pink-30)] shadow-[0_0_8px_var(--neon-pink-10)]"
                        : "bg-secondary text-muted-foreground border-[var(--neo-border)] hover:border-[var(--neon-pink-30)]"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Duration</p>
              <div className="flex gap-2">
                {durations.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDuration(d)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      selectedDuration === d
                        ? "bg-[var(--neon-pink-10)] text-[var(--neon-pink)] border-[var(--neon-pink-30)] shadow-[0_0_8px_var(--neon-pink-10)]"
                        : "bg-secondary text-muted-foreground border-[var(--neo-border)] hover:border-[var(--neon-pink-30)]"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced Settings + Generate */}
          <div className="mt-6 flex items-center justify-between">
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Settings2 className="w-4 h-4" />
              Advanced Settings
            </button>
            <Button variant="glow" size="lg">
              <Wand2 className="w-4 h-4" /> Generate Video
            </Button>
          </div>
        </motion.div>

        {/* Generated Videos Library */}
        <div>
          <h2 className="font-display text-lg font-semibold mb-4">Generated Videos</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {generatedVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="neo-card rounded-xl overflow-hidden hover:border-[var(--neon-cyan-30)] hover:shadow-[0_0_20px_var(--neon-cyan-10)] transition-all group"
              >
                <div className="aspect-video bg-secondary/50 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--neo-black)]/80 to-transparent" />
                  {video.status === "Generating" ? (
                    <div className="flex flex-col items-center gap-2 z-10">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                        <RefreshCw className="w-6 h-6 text-accent" />
                      </motion.div>
                      <Badge className="bg-[var(--neon-cyan-10)] text-[var(--neon-cyan)] border-[var(--neon-cyan-30)] text-[10px] animate-pulse">Generating...</Badge>
                    </div>
                  ) : (
                    <button
                      onClick={() => setPlayingId(playingId === video.id ? null : video.id)}
                      className="w-12 h-12 rounded-full bg-[var(--neon-cyan-10)] backdrop-blur-sm flex items-center justify-center z-10 group-hover:bg-[var(--neon-cyan-30)] group-hover:shadow-[0_0_15px_var(--neon-cyan-30)] transition-all"
                    >
                      {playingId === video.id ? (
                        <Pause className="w-5 h-5 text-accent" />
                      ) : (
                        <Play className="w-5 h-5 text-accent ml-0.5" />
                      )}
                    </button>
                  )}
                  <Video className="absolute top-3 left-3 w-4 h-4 text-muted-foreground/40" />
                </div>

                <div className="p-4">
                  <h3 className="font-medium text-sm">{video.title}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge className="bg-[var(--neon-cyan-10)] text-[var(--neon-cyan)] border-[var(--neon-cyan-30)] text-[10px]">{video.style}</Badge>
                    <span className="text-xs text-muted-foreground">{video.aspect}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {video.duration}
                    </span>
                  </div>
                  {video.status === "Complete" && (
                    <div className="mt-3 flex gap-2">
                      <Button variant="ghost" size="sm" className="flex-1 text-xs">
                        <RefreshCw className="w-3 h-3" /> Regenerate
                      </Button>
                      <Button variant="cinema" size="sm" className="flex-1 text-xs">
                        <Download className="w-3 h-3" /> Download
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Veo3;
