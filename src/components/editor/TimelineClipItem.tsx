import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";
import { TimelineClip, PIXELS_PER_FRAME, TRACK_HEIGHT } from "./types";

interface TimelineClipItemProps {
  clip: TimelineClip;
  onMove: (clipId: string, newStartFrame: number) => void;
  onResize: (clipId: string, newDuration: number) => void;
  onSelect: (clipId: string) => void;
  isSelected: boolean;
}

const TimelineClipItem = ({ clip, onMove, onResize, onSelect, isSelected }: TimelineClipItemProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef({ x: 0, startFrame: 0 });
  const resizeStartRef = useRef({ x: 0, duration: 0 });

  const width = clip.durationFrames * PIXELS_PER_FRAME;
  const left = clip.startFrame * PIXELS_PER_FRAME;

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(clip.id);
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, startFrame: clip.startFrame };

    const handleDragMove = (ev: MouseEvent) => {
      const dx = ev.clientX - dragStartRef.current.x;
      const dFrames = Math.round(dx / PIXELS_PER_FRAME);
      const newStart = Math.max(0, dragStartRef.current.startFrame + dFrames);
      onMove(clip.id, newStart);
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
    };

    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", handleDragEnd);
  }, [clip.id, clip.startFrame, onMove, onSelect]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = { x: e.clientX, duration: clip.durationFrames };

    const handleResizeMove = (ev: MouseEvent) => {
      const dx = ev.clientX - resizeStartRef.current.x;
      const dFrames = Math.round(dx / PIXELS_PER_FRAME);
      const newDuration = Math.max(15, resizeStartRef.current.duration + dFrames);
      onResize(clip.id, newDuration);
    };

    const handleResizeEnd = () => {
      setIsResizing(false);
      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("mouseup", handleResizeEnd);
    };

    window.addEventListener("mousemove", handleResizeMove);
    window.addEventListener("mouseup", handleResizeEnd);
  }, [clip.id, clip.durationFrames, onResize]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`absolute top-1 group cursor-grab active:cursor-grabbing rounded-lg overflow-hidden border transition-all ${
        isSelected
          ? "border-primary shadow-[0_0_12px_var(--neon-pink-30)] z-20"
          : "border-transparent hover:border-muted-foreground/30 z-10"
      } ${isDragging ? "opacity-80 z-30" : ""}`}
      style={{
        left,
        width: Math.max(width, 20),
        height: TRACK_HEIGHT - 10,
        backgroundColor: clip.color,
      }}
      onMouseDown={handleDragStart}
    >
      {/* Grip handle */}
      <div className="absolute left-0 top-0 bottom-0 w-5 flex items-center justify-center opacity-0 group-hover:opacity-60 transition-opacity">
        <GripVertical className="w-3 h-3 text-white/80" />
      </div>

      {/* Clip content */}
      <div className="px-2 py-1 h-full flex items-center overflow-hidden">
        <span className="text-[10px] font-medium text-white truncate drop-shadow-sm">
          {clip.name}
        </span>
      </div>

      {/* Right resize handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-white/20 transition-colors"
        onMouseDown={handleResizeStart}
      />

      {/* Waveform/thumbnail decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {clip.type === "audio" && (
          <div className="flex items-center h-full gap-px px-6">
            {Array.from({ length: Math.floor(width / 4) }).map((_, i) => (
              <div
                key={i}
                className="w-[2px] bg-white rounded-full"
                style={{ height: `${20 + Math.sin(i * 0.5) * 40 + Math.random() * 20}%` }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TimelineClipItem;
