import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Camera, Plus, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shot, useShots, useCreateShot, useUpdateShot, useDeleteShot } from "@/hooks/useShots";
import { useToast } from "@/hooks/use-toast";

const shotTypes = ["Wide", "Medium", "Close-Up", "Medium CU", "Tracking", "Low Angle", "High Angle", "POV", "Over Shoulder"];
const movements = ["Static", "Pan", "Tilt", "Steadicam", "Dolly", "Crane", "Handheld", "Slow push", "Tilt up"];

interface ShotListTrackerProps {
  projectId: string;
  onSelectShot: (shot: Shot) => void;
  currentShotId?: string;
}

const ShotListTracker = ({ projectId, onSelectShot, currentShotId }: ShotListTrackerProps) => {
  const { data: shots = [], isLoading } = useShots(projectId);
  const createShot = useCreateShot();
  const updateShot = useUpdateShot();
  const deleteShot = useDeleteShot();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [sceneNumber, setSceneNumber] = useState("1");
  const [shotCode, setShotCode] = useState("");
  const [shotType, setShotType] = useState("Wide");
  const [description, setDescription] = useState("");
  const [lens, setLens] = useState("50mm");
  const [movement, setMovement] = useState("Static");
  const [angle, setAngle] = useState("Eye Level");
  const [duration, setDuration] = useState("5s");

  const completed = shots.filter((s) => s.is_completed).length;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createShot.mutateAsync({
        project_id: projectId,
        scene_number: sceneNumber,
        shot_code: shotCode || `${sceneNumber}${String.fromCharCode(65 + shots.length)}`,
        shot_type: shotType,
        description,
        lens,
        movement,
        angle,
        duration,
        sort_order: shots.length,
      });
      setDialogOpen(false);
      setDescription("");
      setShotCode("");
      toast({ title: "Shot added" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleComplete = async (shot: Shot) => {
    await updateShot.mutateAsync({ id: shot.id, is_completed: !shot.is_completed });
  };

  const handleDeleteShot = async (e: React.MouseEvent, shot: Shot) => {
    e.stopPropagation();
    await deleteShot.mutateAsync({ id: shot.id, projectId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      {shots.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest px-1">
            <span>Progress</span>
            <span>{completed}/{shots.length}</span>
          </div>
          <div className="h-1 rounded-full bg-secondary overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${shots.length > 0 ? (completed / shots.length) * 100 : 0}%` }}
              className="h-full rounded-full bg-primary shadow-[0_0_10px_var(--neon-pink-30)]"
            />
          </div>
        </div>
      )}

      {/* Shot cards */}
      <AnimatePresence mode="popLayout">
        {shots.map((shot) => (
          <motion.div
            key={shot.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={() => onSelectShot(shot)}
            className={`neo-card rounded-xl p-4 cursor-pointer transition-all group ${
              currentShotId === shot.id
                ? "border-[var(--neon-cyan-30)] shadow-[0_0_20px_var(--neon-cyan-10)]"
                : "hover:border-[var(--neon-pink-30)]"
            } ${shot.is_completed ? "opacity-60" : ""}`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); toggleComplete(shot); }}
                className="mt-0.5 shrink-0"
              >
                {shot.is_completed ? (
                  <CheckCircle2 className="w-4 h-4 text-[var(--neon-green-raw)]" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-primary">{shot.shot_code}</span>
                  <Badge className="bg-[var(--neon-purple-10)] text-[var(--neon-purple)] border-[var(--neon-purple-30)] text-[9px]">
                    <Camera className="w-2.5 h-2.5 mr-0.5" />
                    {shot.shot_type}
                  </Badge>
                  {shot.lens && <span className="text-[10px] text-muted-foreground">{shot.lens}</span>}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{shot.description}</p>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                  {shot.movement && <span>{shot.movement}</span>}
                  {shot.duration && <span>• {shot.duration}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => handleDeleteShot(e, shot)} className="p-1 hover:text-destructive transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
                <ChevronRight className={`w-4 h-4 transition-colors ${currentShotId === shot.id ? "text-accent" : "text-muted-foreground"}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Empty state */}
      {shots.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          <Camera className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>No shots yet. Add your first shot to begin.</p>
        </div>
      )}

      {/* Add shot button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="w-full border border-dashed border-[var(--neo-border)] hover:border-[var(--neon-cyan-30)] text-muted-foreground text-xs">
            <Plus className="w-3 h-3" /> Add Shot
          </Button>
        </DialogTrigger>
        <DialogContent className="neo-card border-[var(--neon-pink-30)]">
          <DialogHeader>
            <DialogTitle className="font-display">Add Shot</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Scene</Label>
                <Input value={sceneNumber} onChange={(e) => setSceneNumber(e.target.value)} placeholder="1" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Shot Code</Label>
                <Input value={shotCode} onChange={(e) => setShotCode(e.target.value)} placeholder="Auto" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Establishing shot of the warehouse" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Shot Type</Label>
                <Select value={shotType} onValueChange={setShotType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {shotTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Movement</Label>
                <Select value={movement} onValueChange={setMovement}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {movements.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Lens</Label>
                <Input value={lens} onChange={(e) => setLens(e.target.value)} placeholder="50mm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Angle</Label>
                <Input value={angle} onChange={(e) => setAngle(e.target.value)} placeholder="Eye Level" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Duration</Label>
                <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="5s" />
              </div>
            </div>
            <Button type="submit" variant="glow" className="w-full" disabled={createShot.isPending}>
              {createShot.isPending ? "Adding..." : "Add Shot"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShotListTracker;
