import { useState, useRef, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import type { TimelineClip } from "@/components/editor/types";

export type ExportStage = "idle" | "loading" | "downloading" | "encoding" | "complete" | "error";

interface ExportState {
  stage: ExportStage;
  progress: number; // 0-100
  message: string;
  downloadUrl: string | null;
  error: string | null;
}

const CORE_VERSION = "0.12.6";
const BASE_URL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/esm`;

export function useTimelineExport() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [state, setState] = useState<ExportState>({
    stage: "idle",
    progress: 0,
    message: "",
    downloadUrl: null,
    error: null,
  });

  const reset = useCallback(() => {
    if (state.downloadUrl) URL.revokeObjectURL(state.downloadUrl);
    setState({ stage: "idle", progress: 0, message: "", downloadUrl: null, error: null });
  }, [state.downloadUrl]);

  const exportTimeline = useCallback(async (clips: TimelineClip[]) => {
    // Filter to video clips with actual URLs, sorted by startFrame
    const videoClips = clips
      .filter((c) => c.type === "video" && c.videoUrl)
      .sort((a, b) => a.startFrame - b.startFrame);

    if (videoClips.length === 0) {
      setState((s) => ({ ...s, stage: "error", error: "No video clips with sources found on the timeline." }));
      return;
    }

    try {
      // Stage 1: Load FFmpeg
      setState({ stage: "loading", progress: 0, message: "Loading video encoder…", downloadUrl: null, error: null });

      if (!ffmpegRef.current) {
        const ffmpeg = new FFmpeg();
        ffmpeg.on("progress", ({ progress }) => {
          setState((s) => {
            if (s.stage === "encoding") {
              return { ...s, progress: Math.min(Math.round(progress * 100), 99), message: `Encoding… ${Math.round(progress * 100)}%` };
            }
            return s;
          });
        });

        const coreURL = await toBlobURL(`${BASE_URL}/ffmpeg-core.js`, "text/javascript");
        const wasmURL = await toBlobURL(`${BASE_URL}/ffmpeg-core.wasm`, "application/wasm");
        await ffmpeg.load({ coreURL, wasmURL });
        ffmpegRef.current = ffmpeg;
      }

      const ffmpeg = ffmpegRef.current;

      // Stage 2: Download clips
      setState((s) => ({ ...s, stage: "downloading", progress: 0, message: "Downloading clips…" }));

      const fileNames: string[] = [];
      for (let i = 0; i < videoClips.length; i++) {
        const clip = videoClips[i];
        const pct = Math.round(((i + 1) / videoClips.length) * 100);
        setState((s) => ({ ...s, progress: pct, message: `Downloading clip ${i + 1}/${videoClips.length}…` }));

        const fileName = `input_${i}.mp4`;
        const data = await fetchFile(clip.videoUrl!);
        await ffmpeg.writeFile(fileName, data);
        fileNames.push(fileName);
      }

      // Stage 3: Encode (concatenate)
      setState((s) => ({ ...s, stage: "encoding", progress: 0, message: "Encoding video…" }));

      if (fileNames.length === 1) {
        // Single clip — just re-mux
        await ffmpeg.exec(["-i", fileNames[0], "-c", "copy", "-movflags", "+faststart", "output.mp4"]);
      } else {
        // Multiple clips — concat via filter_complex
        const inputs = fileNames.flatMap((f) => ["-i", f]);
        const filterParts = fileNames.map((_, i) => `[${i}:v:0]`).join("");
        const filter = `${filterParts}concat=n=${fileNames.length}:v=1:a=0[outv]`;
        await ffmpeg.exec([
          ...inputs,
          "-filter_complex", filter,
          "-map", "[outv]",
          "-c:v", "libx264",
          "-preset", "fast",
          "-crf", "23",
          "-movflags", "+faststart",
          "output.mp4",
        ]);
      }

      // Stage 4: Read output
      const outputData = await ffmpeg.readFile("output.mp4");
      const blob = new Blob([outputData], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);

      // Cleanup input files
      for (const f of fileNames) {
        try { await ffmpeg.deleteFile(f); } catch {}
      }
      try { await ffmpeg.deleteFile("output.mp4"); } catch {}

      setState({
        stage: "complete",
        progress: 100,
        message: `Export complete — ${(blob.size / (1024 * 1024)).toFixed(1)} MB`,
        downloadUrl: url,
        error: null,
      });
    } catch (err: any) {
      console.error("Export failed:", err);
      setState((s) => ({
        ...s,
        stage: "error",
        progress: 0,
        message: "",
        error: err.message || "Export failed. Please try again.",
      }));
    }
  }, []);

  return { ...state, exportTimeline, reset };
}
