import { useState } from "react";
import { motion } from "framer-motion";
import { Music, Play, Pause, Download, Wand2, Clock, RefreshCw, Volume2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/AppLayout";

const genres = ["Cinematic", "Ambient", "Electronic", "Orchestral", "Lo-Fi", "Suspense", "Action", "Romantic"];
const moods = ["Tense", "Uplifting", "Melancholic", "Mysterious", "Energetic", "Peaceful", "Dark", "Triumphant"];

const generatedTracks = [
  { id: 1, name: "Neon Pulse", genre: "Electronic", mood: "Tense", duration: "1:32", bpm: 128 },
  { id: 2, name: "Midnight Rain", genre: "Ambient", mood: "Melancholic", duration: "2:15", bpm: 80 },
  { id: 3, name: "City Chase", genre: "Action", mood: "Energetic", duration: "1:48", bpm: 145 },
  { id: 4, name: "Quiet Resolve", genre: "Cinematic", mood: "Mysterious", duration: "2:30", bpm: 92 },
];

const AIMusic = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Cinematic");
  const [selectedMood, setSelectedMood] = useState("Tense");
  const [playingId, setPlayingId] = useState<number | null>(null);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold">AI Music Generator</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate custom soundtracks for your shorts</p>
        </motion.div>

        {/* Generator Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="neo-card rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[var(--neon-purple)]" />
            <h2 className="font-display font-semibold">Create a Track</h2>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the music you need... e.g., 'Dark, pulsing electronic beat for a cyberpunk chase scene, building tension with synth layers'"
            className="w-full h-24 p-4 rounded-xl bg-secondary/50 border border-[var(--neo-border)] text-foreground text-sm placeholder:text-muted-foreground outline-none focus:border-[var(--neon-purple-30)] focus:shadow-[0_0_15px_var(--neon-purple-10)] transition-all resize-none"
          />

          {/* Genre selection */}
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Genre</p>
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    selectedGenre === g
                      ? "bg-[var(--neon-purple-10)] text-[var(--neon-purple)] border-[var(--neon-purple-30)] shadow-[0_0_8px_var(--neon-purple-10)]"
                      : "bg-secondary text-muted-foreground border-[var(--neo-border)] hover:border-[var(--neon-purple-30)]"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Mood selection */}
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Mood</p>
            <div className="flex flex-wrap gap-2">
              {moods.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMood(m)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    selectedMood === m
                      ? "bg-[var(--neon-cyan-10)] text-[var(--neon-cyan)] border-[var(--neon-cyan-30)] shadow-[0_0_8px_var(--neon-cyan-10)]"
                      : "bg-secondary text-muted-foreground border-[var(--neo-border)] hover:border-[var(--neon-cyan-30)]"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Duration + Generate */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Duration</p>
                <select className="bg-secondary text-foreground border border-[var(--neo-border)] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[var(--neon-purple-30)]">
                  <option>30 seconds</option>
                  <option>1 minute</option>
                  <option>2 minutes</option>
                  <option>3 minutes</option>
                </select>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">BPM</p>
                <input
                  type="number"
                  defaultValue={120}
                  className="w-20 bg-secondary text-foreground border border-[var(--neo-border)] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[var(--neon-purple-30)]"
                />
              </div>
            </div>
            <Button variant="glow" size="lg" onClick={() => trackEvent("music_generate", { genre: selectedGenre, mood: selectedMood, prompt_length: prompt.length })}>
              <Wand2 className="w-4 h-4" /> Generate Track
            </Button>
          </div>
        </motion.div>

        {/* Generated Tracks Library */}
        <div>
          <h2 className="font-display text-lg font-semibold mb-4">Generated Tracks</h2>
          <div className="space-y-3">
            {generatedTracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="neo-card rounded-xl p-4 flex items-center gap-4 hover:border-[var(--neon-purple-30)] hover:shadow-[0_0_20px_var(--neon-purple-10)] transition-all group"
              >
                <button
                  onClick={() => setPlayingId(playingId === track.id ? null : track.id)}
                  className="w-10 h-10 rounded-full bg-[var(--neon-purple-10)] flex items-center justify-center shrink-0 group-hover:bg-[var(--neon-purple-30)] group-hover:shadow-[0_0_12px_var(--neon-purple-30)] transition-all"
                >
                  {playingId === track.id ? (
                    <Pause className="w-4 h-4 text-[var(--neon-purple)]" />
                  ) : (
                    <Play className="w-4 h-4 text-[var(--neon-purple)] ml-0.5" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm">{track.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-[var(--neon-purple-10)] text-[var(--neon-purple)] border-[var(--neon-purple-30)] text-[10px]">{track.genre}</Badge>
                    <Badge className="bg-[var(--neon-cyan-10)] text-[var(--neon-cyan)] border-[var(--neon-cyan-30)] text-[10px]">{track.mood}</Badge>
                  </div>
                </div>

                {/* Waveform placeholder */}
                <div className="hidden md:flex items-center gap-[2px] h-8 flex-1 max-w-xs">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all ${
                        playingId === track.id ? "bg-[var(--neon-purple)]" : "bg-muted-foreground/20"
                      }`}
                      style={{ height: `${Math.random() * 80 + 20}%`, animationDelay: `${i * 50}ms` }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {track.duration}
                  </span>
                  <span className="text-xs text-muted-foreground">{track.bpm} BPM</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button className="p-2 rounded-lg hover:bg-[var(--neon-purple-10)] text-muted-foreground hover:text-foreground transition-colors">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-[var(--neon-purple-10)] text-muted-foreground hover:text-foreground transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AIMusic;
