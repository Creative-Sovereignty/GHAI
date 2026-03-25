import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Download, Trophy, Info, Loader2, Clapperboard, Share2, Youtube, Instagram, Twitter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ShotOption {
  id: string;
  shot_code: string;
  description: string;
  scene_number: string;
}

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shotId?: string | null;
}

const ExportModal = ({ open, onOpenChange, shotId }: ExportModalProps) => {
  const { user } = useAuth();
  const [submitToFest, setSubmitToFest] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedShotId, setSelectedShotId] = useState<string | null>(shotId ?? null);
  const [shots, setShots] = useState<ShotOption[]>([]);
  const [loadingShots, setLoadingShots] = useState(false);

  // Sync external shotId prop
  useEffect(() => {
    if (shotId) setSelectedShotId(shotId);
  }, [shotId]);

  // Fetch user's shots when modal opens
  useEffect(() => {
    if (!open || !user) return;
    const fetchShots = async () => {
      setLoadingShots(true);
      const { data: projects } = await supabase
        .from("projects")
        .select("id")
        .eq("user_id", user.id);
      if (!projects?.length) { setLoadingShots(false); return; }

      const { data, error } = await supabase
        .from("shots")
        .select("id, shot_code, description, scene_number")
        .in("project_id", projects.map((p) => p.id))
        .order("scene_number", { ascending: true });

      if (!error && data) setShots(data as ShotOption[]);
      setLoadingShots(false);
    };
    fetchShots();
  }, [open, user]);

  const handleExport = async () => {
    if (!user) {
      toast.error("You must be signed in to export.");
      return;
    }

    setExporting(true);

    try {
      // If festival submission is toggled and we have a shot
      if (submitToFest && selectedShotId) {
        const { error } = await supabase
          .from("contest_entries")
          .insert({ shot_id: selectedShotId, user_id: user.id });

        if (error) {
          if (error.code === "23505") {
            toast.info("This shot is already submitted to the festival.");
          } else {
            throw error;
          }
        } else {
          toast.success("Submitted to Golden Hour Indie Fest!");
        }
      }

      // Simulate export
      await new Promise((r) => setTimeout(r, 1200));
      toast.success("Export complete — MP4 ready for download.");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Export failed.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="neo-card border-[var(--neo-border)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Export Video
          </DialogTitle>
          <DialogDescription>
            Export your timeline as a high-quality MP4 file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Shot selector */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Clapperboard className="w-3.5 h-3.5" />
              Select Shot
            </Label>
            <Select
              value={selectedShotId ?? ""}
              onValueChange={(v) => setSelectedShotId(v)}
              disabled={loadingShots}
            >
              <SelectTrigger className="w-full bg-secondary/30 border-[var(--neo-border)]">
                <SelectValue placeholder={loadingShots ? "Loading shots…" : "Choose a shot to export"} />
              </SelectTrigger>
              <SelectContent>
                {shots.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <span className="font-mono text-xs text-primary mr-1.5">S{s.scene_number}-{s.shot_code}</span>
                    <span className="truncate">{s.description || "Untitled shot"}</span>
                  </SelectItem>
                ))}
                {!loadingShots && shots.length === 0 && (
                  <SelectItem value="__none" disabled>No shots found</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Format info */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Format</span>
            <span className="font-mono text-foreground">MP4 · H.264 · 4K</span>
          </div>

          {/* Festival toggle */}
          <div className="flex items-center justify-between rounded-xl border border-[var(--neo-border)] bg-secondary/30 p-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              <Label htmlFor="fest-toggle" className="text-sm font-medium cursor-pointer">
                Submit to Golden Hour Indie Fest
              </Label>
              <span className="text-[10px] font-mono uppercase tracking-wider text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded">
                Free Entry
              </span>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[220px] text-xs">
                    First-time users get a free export credit when submitting to the festival!
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch
              id="fest-toggle"
              checked={submitToFest}
              onCheckedChange={setSubmitToFest}
              disabled={!selectedShotId}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={exporting}>
            Cancel
          </Button>
          <Button variant="glow" onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting…
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
