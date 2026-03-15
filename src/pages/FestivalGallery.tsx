import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trophy, Film, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/AppLayout";

interface ContestEntry {
  id: string;
  shot_id: string;
  user_id: string;
  votes: number;
  created_at: string;
  shot: {
    description: string;
    shot_type: string;
    scene_number: string;
    shot_code: string;
    thumbnail_url: string | null;
    video_url: string | null;
  } | null;
  profile: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  hasVoted: boolean;
}

const FestivalGallery = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<ContestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState<string | null>(null);

  const fetchEntries = async () => {
    setLoading(true);
    const { data: contestData, error } = await supabase
      .from("contest_entries")
      .select("*, shots(description, shot_type, scene_number, shot_code, thumbnail_url, video_url), profiles(display_name, avatar_url)")
      .order("votes", { ascending: false });

    if (error) {
      console.error("Error fetching contest entries:", error);
      setLoading(false);
      return;
    }

    // Fetch user's votes
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
      user_id: e.user_id,
      votes: e.votes,
      created_at: e.created_at,
      shot: e.shots,
      profile: e.profiles,
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

  return (
    <AppLayout>
      <div className="flex-1 overflow-auto p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-7 h-7 text-[var(--neon-pink)]" />
            <h1 className="text-3xl font-display font-bold text-foreground">Festival Gallery</h1>
          </div>
          <p className="text-muted-foreground max-w-xl">
            Browse and vote on community submissions. The best shots rise to the top.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-video rounded-xl bg-card animate-pulse border border-border" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Film className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No entries yet</h2>
            <p className="text-muted-foreground">Submit your best shots from the Shot List to enter the festival.</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
          >
            {entries.map((entry, i) => (
              <motion.div
                key={entry.id}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="group relative rounded-xl border border-border bg-card overflow-hidden hover:border-[var(--neon-pink-30)] transition-colors"
              >
                {/* Thumbnail / Video */}
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {entry.shot?.video_url ? (
                    <video
                      src={entry.shot.video_url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                      onMouseLeave={(e) => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                    />
                  ) : entry.shot?.thumbnail_url ? (
                    <img src={entry.shot.thumbnail_url} alt={entry.shot.description} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                  )}

                  {/* Rank badge for top 3 */}
                  {i < 3 && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-[var(--neon-pink)] text-foreground border-0 font-bold text-xs shadow-[0_0_12px_var(--neon-pink-30)]">
                        #{i + 1}
                      </Badge>
                    </div>
                  )}

                  {/* Festival participant badge */}
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="bg-card/80 backdrop-blur-sm border-[var(--neon-cyan-30)] text-[var(--neon-cyan)] gap-1 text-xs">
                      <Sparkles className="w-3 h-3" />
                      Festival Participant
                    </Badge>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {entry.shot?.shot_code || "Shot"} — {entry.shot?.shot_type || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{entry.shot?.description || "No description"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">
                      by {entry.profile?.display_name || "Anonymous"}
                    </span>
                    <Button
                      size="sm"
                      variant={entry.hasVoted ? "default" : "outline"}
                      className={`gap-1.5 text-xs ${
                        entry.hasVoted
                          ? "bg-[var(--neon-pink)] hover:bg-[var(--neon-pink)]/80 text-foreground shadow-[0_0_10px_var(--neon-pink-30)]"
                          : "border-border hover:border-[var(--neon-pink-30)] hover:text-[var(--neon-pink)]"
                      }`}
                      disabled={votingId === entry.id}
                      onClick={() => handleVote(entry.id)}
                    >
                      <Heart className={`w-3.5 h-3.5 ${entry.hasVoted ? "fill-current" : ""}`} />
                      {entry.votes}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default FestivalGallery;
