import { useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, CheckCircle2, Circle, Camera, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/AppLayout";
import { useShotsByProject, useUpdateShot, EnrichedShot } from "@/hooks/useShots";
import { useProjects } from "@/hooks/useProjects";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

const ShotList = () => {
  const { data: projects } = useProjects();
  const activeProject = projects?.[0];
  const projectId = activeProject?.id ?? null;

  const { data: shots = [], isLoading } = useShotsByProject(projectId);
  const updateShot = useUpdateShot();
  const queryClient = useQueryClient();

  // Realtime subscription
  useEffect(() => {
    if (!projectId) return;
    const channel = supabase
      .channel("shots-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shots" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["shots-by-project", projectId] });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [projectId, queryClient]);

  const readyCount = shots.filter((s) => s.status === "ready").length;

  const toggleShot = (shot: EnrichedShot) => {
    const nextStatus = shot.status === "ready" ? "draft" : "ready";
    updateShot.mutate({ id: shot.id, status: nextStatus });
    trackEvent("shot_toggled", { shot_id: shot.id, status: nextStatus });
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="font-display text-2xl font-bold">Shot List</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-[var(--neon-pink-10)] text-[var(--neon-pink)] border-[var(--neon-pink-30)] text-[10px]">
                {readyCount}/{shots.length} ready
              </Badge>
            </div>
          </div>
          <Button variant="glow" size="sm">
            <Plus className="w-4 h-4" /> Add Shot
          </Button>
        </motion.div>

        {/* Progress */}
        <div className="mb-6 h-1.5 rounded-full bg-secondary overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: shots.length > 0 ? `${(readyCount / shots.length) * 100}%` : "0%" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full bg-primary shadow-[0_0_10px_var(--neon-pink-30)]"
          />
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="neo-card rounded-xl overflow-hidden"
        >
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading shots…</div>
          ) : shots.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No shots yet. Add one or let the Director AI create them.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--neo-border)] text-left text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="p-4 w-10"></th>
                  <th className="p-4">Shot</th>
                  <th className="p-4">Type</th>
                  <th className="p-4 hidden md:table-cell">Prompt</th>
                  <th className="p-4 hidden lg:table-cell">Angle</th>
                  <th className="p-4 hidden lg:table-cell">Motion</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {shots.map((shot) => (
                  <tr
                    key={shot.id}
                    onClick={() => toggleShot(shot)}
                    className={`border-b border-[var(--neo-border)]/50 cursor-pointer transition-colors hover:bg-[var(--neon-pink-05)] ${
                      shot.status === "ready" ? "opacity-50" : ""
                    }`}
                  >
                    <td className="p-4">
                      {shot.status === "ready" ? (
                        <CheckCircle2 className="w-4 h-4 text-[var(--neon-green-raw)]" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </td>
                    <td className="p-4 font-mono font-medium text-primary">
                      {shot.scene_number}.{shot.order_index + 1}
                    </td>
                    <td className="p-4">
                      <Badge className="bg-[var(--neon-purple-10)] text-[var(--neon-purple)] border-[var(--neon-purple-30)] text-[10px]">
                        <Camera className="w-3 h-3 mr-1" />
                        {shot.shot_type}
                      </Badge>
                    </td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground max-w-[200px] truncate">
                      {shot.prompt || "—"}
                    </td>
                    <td className="p-4 hidden lg:table-cell text-muted-foreground">{shot.camera_angle}</td>
                    <td className="p-4 hidden lg:table-cell text-muted-foreground">{shot.motion_intensity}%</td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-[10px]">{shot.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default ShotList;
