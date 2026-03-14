import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play, Pause, SkipBack, SkipForward, Scissors, Volume2,
  Type, Layers, Wand2, ZoomIn, ZoomOut, Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import AppLayout from "@/components/AppLayout";

const tracks = [
  { id: 1, name: "Scene 1 - Apartment", type: "video", color: "bg-primary/60", width: "35%" },
  { id: 2, name: "Scene 2 - Street", type: "video", color: "bg-primary/40", width: "45%" },
  { id: 3, name: "Scene 3 - Alley", type: "video", color: "bg-primary/50", width: "20%" },
];

const audioTracks = [
  { id: 1, name: "Dialogue", color: "bg-neon-green/40", segments: [{ start: "5%", width: "25%" }, { start: "40%", width: "35%" }] },
  { id: 2, name: "Music", color: "bg-[var(--neon-purple)]/30", segments: [{ start: "0%", width: "80%" }] },
  { id: 3, name: "SFX", color: "bg-accent/30", segments: [{ start: "10%", width: "10%" }, { start: "35%", width: "8%" }, { start: "60%", width: "15%" }] },
];

const VideoEditor = () => {
  const [playing, setPlaying] = useState(false);
  const [currentTime] = useState("00:01:24");
  const [zoom] = useState(100);

  return (
    <AppLayout>
      <div className="h-screen flex flex-col">
        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-b border-[var(--neo-border)] px-4 py-2 flex items-center justify-between"
        >
          <h1 className="font-display font-semibold">Video Editor</h1>
          <div className="flex items-center gap-2">
            <Button variant="cinema" size="sm" onClick={() => trackEvent("video_ai_edit")}><Wand2 className="w-4 h-4" /> AI Edit</Button>
            <Button variant="glow" size="sm" onClick={() => trackEvent("video_export")}>Export</Button>
          </div>
        </motion.div>

        {/* Preview + panels */}
        <div className="flex-1 flex overflow-hidden">
          {/* Tools panel */}
          <div className="w-12 border-r border-[var(--neo-border)] flex flex-col items-center py-4 gap-3">
            {[Scissors, Type, Layers, Volume2].map((Icon, i) => (
              <button key={i} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-[var(--neon-pink-10)] transition-colors">
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Main area */}
          <div className="flex-1 flex flex-col">
            {/* Preview Monitor */}
            <div className="flex-1 flex items-center justify-center bg-background p-4">
              <div className="relative w-full max-w-2xl aspect-video rounded-lg neo-card overflow-hidden flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Preview Window</p>
                </div>
                <div className="absolute bottom-2 right-2">
                  <Maximize2 className="w-4 h-4 text-muted-foreground/50" />
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="border-t border-[var(--neo-border)]">
              {/* Transport controls */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--neo-border)]">
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded hover:bg-[var(--neon-pink-10)] text-muted-foreground hover:text-foreground transition-colors">
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPlaying(!playing)}
                    className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_var(--neon-pink-30)] transition-all"
                  >
                    {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button className="p-1.5 rounded hover:bg-[var(--neon-pink-10)] text-muted-foreground hover:text-foreground transition-colors">
                    <SkipForward className="w-4 h-4" />
                  </button>
                  <span className="ml-3 font-mono text-xs text-muted-foreground">{currentTime} / 02:30</span>
                </div>
                <div className="flex items-center gap-2">
                  <ZoomOut className="w-3.5 h-3.5 text-muted-foreground" />
                  <div className="w-20 h-1 bg-secondary rounded-full">
                    <div className="w-1/2 h-full bg-primary rounded-full shadow-[0_0_6px_var(--neon-pink-30)]" />
                  </div>
                  <ZoomIn className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground ml-1">{zoom}%</span>
                </div>
              </div>

              {/* Tracks */}
              <div className="h-48 overflow-auto">
                <div className="flex items-center h-10 border-b border-[var(--neo-border)]/50">
                  <div className="w-24 shrink-0 px-3 text-xs text-muted-foreground truncate">Video</div>
                  <div className="flex-1 relative h-full flex items-center px-1 gap-0.5">
                    {tracks.map((t) => (
                      <div
                        key={t.id}
                        style={{ width: t.width }}
                        className={`h-7 ${t.color} rounded-md flex items-center px-2 text-[10px] font-mono truncate cursor-pointer hover:brightness-125 transition-all border border-[var(--neon-pink-30)]`}
                      >
                        {t.name}
                      </div>
                    ))}
                  </div>
                </div>
                {audioTracks.map((track) => (
                  <div key={track.id} className="flex items-center h-10 border-b border-[var(--neo-border)]/50">
                    <div className="w-24 shrink-0 px-3 text-xs text-muted-foreground truncate">{track.name}</div>
                    <div className="flex-1 relative h-full flex items-center">
                      {track.segments.map((seg, i) => (
                        <div
                          key={i}
                          style={{ left: seg.start, width: seg.width }}
                          className={`absolute h-6 ${track.color} rounded-sm cursor-pointer hover:brightness-125 transition-all`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default VideoEditor;
