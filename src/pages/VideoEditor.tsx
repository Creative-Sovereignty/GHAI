import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Film } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import PaywallGate from "@/components/PaywallGate";
import TransportControls from "@/components/editor/TransportControls";
import TrackHeader from "@/components/editor/TrackHeader";
import TimelineRuler from "@/components/editor/TimelineRuler";
import TimelineClipItem from "@/components/editor/TimelineClipItem";
import Playhead from "@/components/editor/Playhead";
import { TimelineTrack, TimelineClip, FRAME_RATE, PIXELS_PER_FRAME, TRACK_HEIGHT, RULER_HEIGHT } from "@/components/editor/types";

const CLIP_COLORS: Record<string, string> = {
  video: "hsla(190, 80%, 40%, 0.8)",
  audio: "hsla(270, 70%, 45%, 0.8)",
  title: "hsla(340, 70%, 45%, 0.8)",
  dialog: "hsla(45, 85%, 50%, 0.8)",
  score: "hsla(270, 70%, 45%, 0.8)",
  sfx: "hsla(160, 70%, 40%, 0.8)",
};

const defaultTracks: TimelineTrack[] = [
  { id: "v1", name: "V1 — Video", type: "video", muted: false, locked: false, visible: true },
  { id: "v2", name: "V2 — B-Roll", type: "video", muted: false, locked: false, visible: true },
  { id: "dialog", name: "Dialog", type: "audio", muted: false, locked: false, visible: true },
  { id: "score", name: "Score", type: "audio", muted: false, locked: false, visible: true },
  { id: "sfx", name: "Sound Design", type: "audio", muted: false, locked: false, visible: true },
];

const defaultClips: TimelineClip[] = [
  { id: "c1", name: "Scene 1 — Wide", trackId: "v1", startFrame: 0, durationFrames: 90, color: CLIP_COLORS.video, type: "video" },
  { id: "c2", name: "Scene 1 — CU", trackId: "v1", startFrame: 95, durationFrames: 60, color: CLIP_COLORS.video, type: "video" },
  { id: "c3", name: "B-Roll", trackId: "v2", startFrame: 30, durationFrames: 120, color: "hsla(190, 60%, 50%, 0.7)", type: "video" },
  { id: "c4", name: "Character Dialog", trackId: "dialog", startFrame: 0, durationFrames: 150, color: CLIP_COLORS.dialog, type: "audio" },
  { id: "c5", name: "Main Score", trackId: "score", startFrame: 10, durationFrames: 140, color: CLIP_COLORS.score, type: "audio" },
  { id: "c6", name: "Ambient Room Tone", trackId: "sfx", startFrame: 0, durationFrames: 160, color: CLIP_COLORS.sfx, type: "audio" },
  { id: "c7", name: "Door Slam SFX", trackId: "sfx", startFrame: 85, durationFrames: 15, color: "hsla(160, 50%, 50%, 0.7)", type: "audio" },
];

const VideoEditor = () => {
  const [tracks, setTracks] = useState<TimelineTrack[]>(defaultTracks);
  const [clips, setClips] = useState<TimelineClip[]>(defaultClips);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const totalFrames = FRAME_RATE * 30; // 30 seconds timeline

  // Playback loop
  useEffect(() => {
    if (!isPlaying) return;
    lastTimeRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - lastTimeRef.current;
      if (elapsed >= 1000 / FRAME_RATE) {
        lastTimeRef.current = now;
        setCurrentFrame((f) => {
          if (f >= totalFrames) {
            setIsPlaying(false);
            return totalFrames;
          }
          return f + 1;
        });
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [isPlaying, totalFrames]);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) setScrollLeft(scrollRef.current.scrollLeft);
  }, []);

  const moveClip = useCallback((clipId: string, newStart: number) => {
    setClips((prev) => prev.map((c) => c.id === clipId ? { ...c, startFrame: newStart } : c));
  }, []);

  const resizeClip = useCallback((clipId: string, newDuration: number) => {
    setClips((prev) => prev.map((c) => c.id === clipId ? { ...c, durationFrames: newDuration } : c));
  }, []);

  const addTrack = (type: "video" | "audio" | "title") => {
    const count = tracks.filter((t) => t.type === type).length + 1;
    const prefix = type === "video" ? "V" : type === "audio" ? "A" : "T";
    setTracks([...tracks, {
      id: `${prefix.toLowerCase()}${Date.now()}`,
      name: `${prefix}${count}`,
      type,
      muted: false,
      locked: false,
      visible: true,
    }]);
  };

  const deleteTrack = (trackId: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
    setClips((prev) => prev.filter((c) => c.trackId !== trackId));
  };

  const toggleTrackProp = (trackId: string, prop: "muted" | "locked" | "visible") => {
    setTracks((prev) => prev.map((t) => t.id === trackId ? { ...t, [prop]: !t[prop] } : t));
  };

  const timelineHeight = tracks.length * TRACK_HEIGHT;

  return (
    <AppLayout>
      <PaywallGate>
        <div className="flex flex-col h-[calc(100vh-64px)]">
          {/* Preview Monitor */}
          <div className="flex-1 min-h-0 bg-black flex items-center justify-center relative">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="aspect-video w-full max-w-2xl mx-auto bg-secondary/10 rounded-lg border border-[var(--neo-border)] flex items-center justify-center">
                <div className="text-center p-8">
                  <Film className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-xs text-muted-foreground/50">Preview Monitor</p>
                  <p className="text-[10px] text-muted-foreground/30 mt-1">Drag clips on the timeline below</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Timeline Panel */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="border-t border-[var(--neo-border)] bg-background"
          >
            {/* Transport */}
            <TransportControls
              isPlaying={isPlaying}
              currentFrame={currentFrame}
              totalFrames={totalFrames}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onStop={() => { setIsPlaying(false); setCurrentFrame(0); }}
              onSkipBack={() => setCurrentFrame((f) => Math.max(0, f - FRAME_RATE * 5))}
              onSkipForward={() => setCurrentFrame((f) => Math.min(totalFrames, f + FRAME_RATE * 5))}
              onAddTrack={addTrack}
            />

            {/* Timeline body */}
            <div className="flex overflow-hidden" style={{ height: timelineHeight + RULER_HEIGHT + 4 }}>
              {/* Track headers */}
              <div className="w-36 shrink-0 border-r border-[var(--neo-border)]">
                <div style={{ height: RULER_HEIGHT }} className="border-b border-[var(--neo-border)] bg-secondary/10" />
                {tracks.map((track) => (
                  <TrackHeader
                    key={track.id}
                    track={track}
                    onToggleMute={() => toggleTrackProp(track.id, "muted")}
                    onToggleLock={() => toggleTrackProp(track.id, "locked")}
                    onToggleVisible={() => toggleTrackProp(track.id, "visible")}
                    onDelete={() => deleteTrack(track.id)}
                  />
                ))}
              </div>

              {/* Scrollable timeline area */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-x-auto overflow-y-hidden relative"
                onScroll={handleScroll}
              >
                {/* Ruler */}
                <div className="sticky top-0 z-30" style={{ width: totalFrames * PIXELS_PER_FRAME }}>
                  <TimelineRuler
                    totalFrames={totalFrames}
                    scrollLeft={0}
                    onSeek={(f) => setCurrentFrame(f)}
                  />
                </div>

                {/* Tracks area */}
                <div className="relative" style={{ width: totalFrames * PIXELS_PER_FRAME, height: timelineHeight }}>
                  {/* Track lane backgrounds */}
                  {tracks.map((track, i) => (
                    <div
                      key={track.id}
                      className={`absolute w-full border-b border-[var(--neo-border)] ${
                        i % 2 === 0 ? "bg-secondary/5" : "bg-transparent"
                      }`}
                      style={{ top: i * TRACK_HEIGHT, height: TRACK_HEIGHT }}
                    />
                  ))}

                  {/* Clips */}
                  {clips.map((clip) => {
                    const trackIndex = tracks.findIndex((t) => t.id === clip.trackId);
                    if (trackIndex === -1) return null;
                    return (
                      <div
                        key={clip.id}
                        className="absolute"
                        style={{ top: trackIndex * TRACK_HEIGHT }}
                      >
                        <TimelineClipItem
                          clip={clip}
                          onMove={moveClip}
                          onResize={resizeClip}
                          onSelect={setSelectedClip}
                          isSelected={selectedClip === clip.id}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Playhead */}
                <Playhead
                  currentFrame={currentFrame}
                  scrollLeft={0}
                  timelineHeight={timelineHeight}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </PaywallGate>
    </AppLayout>
  );
};

export default VideoEditor;
