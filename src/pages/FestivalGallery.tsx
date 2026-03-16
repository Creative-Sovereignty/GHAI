import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trophy, Film, Sparkles, Play, Share2, Filter, Search, Clock, Crown, Medal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/AppLayout";

interface ContestEntry {
  id: string;
  shot_id: string;
  votes: number;
  created_at: string;
  director_name: string | null;
  director_avatar: string | null;
  shot: {
    description: string;
    shot_type: string;
    scene_number: string;
    shot_code: string;
    thumbnail_url: string | null;
    video_url: string | null;
  } | null;
  hasVoted: boolean;
}

type SortMode = "trending" | "recent" | "top";

const FestivalGallery = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<ContestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const prevDiffRef = useRef<number | null>(null);

  const getNextSunday = useCallback(() => {
    const now = new Date();
    const daysUntilSunday = (7 - now.getUTCDay()) % 7 || 7;
    const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilSunday));
    return next.getTime();
  }, []);

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, getNextSunday() - Date.now());
      // Detect when countdown hits zero (previous was >0, now is 0)
      if (prevDiffRef.current !== null && prevDiffRef.current > 0 && diff === 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      prevDiffRef.current = diff;
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [getNextSunday]);

  const DAILY_VOTE_LIMIT = 5;
  const votesUsedToday = useMemo(() => {
    return entries.filter((e) => e.hasVoted).length;
  }, [entries]);
  const votesRemaining = Math.max(0, DAILY_VOTE_LIMIT - votesUsedToday);

  const fetchEntries = async () => {
    setLoading(true);
    const { data: contestData, error } = await supabase
      .from("contest_entries_public" as any)
      .select("*, shots(description, shot_type, scene_number, shot_code, thumbnail_url, video_url)")
      .order("votes", { ascending: false });

    if (error) {
      console.error("Error fetching contest entries:", error);
      setLoading(false);
      return;
    }

    let userVotes: Set<string> = new Set();
    if (user) {
      const { data: votes } = await supabase
        .from("contest_votes")
        .select("entry_id")
        .eq("user_id", user.id);
      if (votes) userVotes = new Set(votes.map((v: { entry_id: string }) => v.entry_id));
    }

    const mapped: ContestEntry[] = (contestData || []).map((e: any) => ({
      id: e.id,
      shot_id: e.shot_id,
      votes: e.votes,
      created_at: e.created_at,
      director_name: e.director_name,
      director_avatar: e.director_avatar,
      shot: e.shots,
      hasVoted: userVotes.has(e.id),
    }));

    setEntries(mapped);
    setLoading(false);
  };

  useEffect(() => {
    fetchEntries();
  }, [user]);

  const handleVote = async (entryId: string) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to vote.", variant: "destructive" });
      return;
    }
    const entry = entries.find((e) => e.id === entryId);
    if (entry && !entry.hasVoted && votesRemaining <= 0) {
      toast({ title: "No votes left", description: "You've used all your votes for today.", variant: "destructive" });
      return;
    }
    setVotingId(entryId);
    const { data, error } = await supabase.rpc("toggle_contest_vote", { _entry_id: entryId });
    if (error) {
      toast({ title: "Vote failed", description: error.message, variant: "destructive" });
    } else {
      const voted = data as boolean;
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId
            ? { ...e, hasVoted: voted, votes: e.votes + (voted ? 1 : -1) }
            : e
        )
      );
      toast({ title: voted ? "Voted! 🎬" : "Vote removed" });
    }
    setVotingId(null);
  };

  const sortedEntries = useMemo(() => {
    let filtered = entries;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = entries.filter(
        (e) =>
          e.shot?.description?.toLowerCase().includes(q) ||
          e.shot?.shot_code?.toLowerCase().includes(q) ||
          e.director_name?.toLowerCase().includes(q)
      );
    }
    const sorted = [...filtered];
    switch (sortMode) {
      case "recent":
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "top":
        sorted.sort((a, b) => b.votes - a.votes);
        break;
      case "trending":
      default:
        // Trending = weighted by recency + votes
        sorted.sort((a, b) => {
          const ageA = (Date.now() - new Date(a.created_at).getTime()) / 3600000;
          const ageB = (Date.now() - new Date(b.created_at).getTime()) / 3600000;
          return (b.votes / (ageB + 2)) - (a.votes / (ageA + 2));
        });
        break;
    }
    return sorted;
  }, [entries, sortMode, searchQuery]);

  const leaderboard = useMemo(() => {
    const dirMap = new Map<string, { name: string; avatar: string | null; totalVotes: number; entries: number }>();
    entries.forEach((e) => {
      const key = e.user_id;
      const existing = dirMap.get(key);
      if (existing) {
        existing.totalVotes += e.votes;
        existing.entries += 1;
      } else {
        dirMap.set(key, {
          name: e.profile?.display_name || "Anonymous",
          avatar: e.profile?.avatar_url || null,
          totalVotes: e.votes,
          entries: 1,
        });
      }
    });
    return Array.from(dirMap.values())
      .sort((a, b) => b.totalVotes - a.totalVotes)
      .slice(0, 10);
  }, [entries]);

  return (
    <AppLayout>
      <div className="flex-1 overflow-auto relative">

        {/* ── Confetti Overlay ── */}
        <AnimatePresence>
          {showConfetti && (
            <motion.div
              className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              {Array.from({ length: 60 }).map((_, i) => {
                const colors = [
                  "hsl(var(--primary))",
                  "hsl(var(--primary) / 0.7)",
                  "hsl(45, 100%, 60%)",
                  "hsl(200, 80%, 60%)",
                  "hsl(340, 80%, 60%)",
                  "hsl(120, 60%, 50%)",
                ];
                const color = colors[i % colors.length];
                const left = Math.random() * 100;
                const delay = Math.random() * 2;
                const duration = 2.5 + Math.random() * 2;
                const size = 6 + Math.random() * 8;
                const rotation = Math.random() * 720 - 360;
                const isCircle = i % 3 === 0;
                return (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${left}%`,
                      top: -20,
                      width: size,
                      height: isCircle ? size : size * 0.6,
                      borderRadius: isCircle ? "50%" : "2px",
                      backgroundColor: color,
                    }}
                    initial={{ y: -20, opacity: 1, rotate: 0 }}
                    animate={{
                      y: "100vh",
                      opacity: [1, 1, 0],
                      rotate: rotation,
                      x: [0, (Math.random() - 0.5) * 120, (Math.random() - 0.5) * 80],
                    }}
                    transition={{
                      duration,
                      delay,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  />
                );
              })}
              <motion.div
                className="absolute top-1/4 left-1/2 -translate-x-1/2 text-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
              >
                <div className="px-8 py-5 rounded-2xl bg-card/90 backdrop-blur-xl border border-primary/30 shadow-[0_0_40px_hsl(var(--primary)/0.3)]">
                  <Trophy className="w-10 h-10 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-display font-bold text-gold-blue-shimmer">Round Complete!</p>
                  <p className="text-sm text-muted-foreground mt-1">A new round has begun</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Festival Header ── */}
        <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-card via-card to-primary/5">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary))_0%,transparent_60%)]" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 md:p-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/25 mb-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-xs font-mono uppercase tracking-wider text-primary">Live Competition</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold">
                <span className="text-gold-blue-shimmer">Golden Hour</span>
                <br />
                <span className="text-foreground">Indie Fest '26</span>
              </h1>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-muted-foreground mr-1" />
              {[
                { label: "D", value: countdown.days },
                { label: "H", value: countdown.hours },
                { label: "M", value: countdown.minutes },
                { label: "S", value: countdown.seconds },
              ].map((unit) => (
                <div key={unit.label} className="text-center px-2.5 py-2 rounded-lg border border-border bg-card/80 backdrop-blur-sm min-w-[44px]">
                  <p className="text-lg font-mono font-bold text-foreground leading-none">{String(unit.value).padStart(2, "0")}</p>
                  <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">{unit.label}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center px-5 py-3 rounded-xl border border-border bg-card/80 backdrop-blur-sm">
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Your Power</p>
                <p className="text-2xl font-display font-bold text-primary">{votesRemaining}</p>
                <p className="text-[10px] text-muted-foreground">Votes Left Today</p>
              </div>
              <Button
                variant="glow"
                className="gap-2"
                onClick={() => {
                  toast({ title: "Head to the Video Editor", description: "Export a shot and toggle Festival Submission." });
                }}
              >
                <Trophy className="w-4 h-4" />
                Submit Entry
              </Button>
            </div>
          </div>
        </div>

        {/* ── Gallery Filters ── */}
        <div className="flex items-center justify-between gap-4 px-6 md:px-8 py-4 border-b border-border bg-card/50">
          <div className="flex items-center gap-1">
            {(["trending", "recent", "top"] as SortMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setSortMode(mode)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  sortMode === mode
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                {mode === "trending" ? "Trending" : mode === "recent" ? "Recent" : "Top Rated"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {showSearch && (
                <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 200, opacity: 1 }} exit={{ width: 0, opacity: 0 }}>
                  <Input
                    placeholder="Search entries…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 text-sm bg-secondary/30 border-border"
                    autoFocus
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => { setShowSearch((s) => !s); if (showSearch) setSearchQuery(""); }}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Main Content + Leaderboard ── */}
        <div className="flex gap-0">
          {/* ── Submission Grid ── */}
          <div className="flex-1 p-6 md:p-8 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[16/12] rounded-xl bg-card animate-pulse border border-border" />
              ))}
            </div>
          ) : sortedEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Film className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {searchQuery ? "No matching entries" : "No entries yet"}
              </h2>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try a different search term."
                  : "Submit your best shots from the Video Editor to enter the festival."}
              </p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
            >
              {sortedEntries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  className="group relative rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all hover:shadow-[0_0_24px_hsl(var(--primary)/0.08)]"
                >
                  {/* Video Preview */}
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {entry.shot?.video_url ? (
                      <video
                        src={entry.shot.video_url}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                        onMouseLeave={(e) => {
                          const v = e.target as HTMLVideoElement;
                          v.pause();
                          v.currentTime = 0;
                        }}
                      />
                    ) : entry.shot?.thumbnail_url ? (
                      <img src={entry.shot.thumbnail_url} alt={entry.shot.description} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-card to-secondary/30">
                        <Film className="w-10 h-10 text-muted-foreground/30" />
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Rank badge */}
                    {i < 3 && (
                      <div className="absolute top-2.5 left-2.5">
                        <Badge className="bg-primary text-primary-foreground border-0 font-bold text-xs shadow-[0_0_12px_hsl(var(--primary)/0.4)]">
                          Rank #{i + 1}
                        </Badge>
                      </div>
                    )}

                    {/* Play button */}
                    {entry.shot?.video_url && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                          <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Entry Metadata */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {entry.shot?.description || "Untitled Shot"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Dir. @{entry.profile?.display_name || "Anonymous"}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {entry.votes.toLocaleString()}
                          </span>
                          <span className="font-mono">
                            {entry.shot?.shot_code || "—"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleVote(entry.id)}
                          disabled={votingId === entry.id}
                          className={`p-2.5 rounded-xl border transition-all active:scale-90 ${
                            entry.hasVoted
                              ? "bg-primary text-primary-foreground border-primary shadow-[0_0_10px_hsl(var(--primary)/0.3)]"
                              : "bg-secondary/30 hover:bg-primary hover:text-primary-foreground border-border hover:border-primary"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${entry.hasVoted ? "fill-current" : ""}`} />
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/festival?entry=${entry.id}`);
                            toast({ title: "Link copied!" });
                          }}
                          className="p-2.5 bg-secondary/30 hover:bg-secondary/60 rounded-xl border border-border transition-colors"
                        >
                          <Share2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
          </div>

          {/* ── Leaderboard Sidebar ── */}
          <div className="hidden lg:block w-72 shrink-0 border-l border-border bg-card/50 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Top Directors</h3>
            </div>
            {leaderboard.length === 0 ? (
              <p className="text-xs text-muted-foreground">No entries yet.</p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((dir, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                      i === 0 ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary/30"
                    }`}
                  >
                    <span className={`text-xs font-mono font-bold w-5 text-center shrink-0 ${
                      i === 0 ? "text-primary" : i < 3 ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {i + 1}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-secondary/50 border border-border overflow-hidden shrink-0 flex items-center justify-center">
                      {dir.avatar ? (
                        <img src={dir.avatar} alt={dir.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-muted-foreground">{dir.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground truncate">@{dir.name}</p>
                      <p className="text-[10px] text-muted-foreground">{dir.entries} {dir.entries === 1 ? "entry" : "entries"}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Heart className="w-3 h-3 text-primary" />
                      <span className="text-xs font-mono font-bold text-primary">{dir.totalVotes.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default FestivalGallery;
