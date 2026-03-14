import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, CheckCircle2, Circle, Camera, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/AppLayout";

const initialShots = [
  { id: 1, scene: "1", shot: "1A", type: "Wide", description: "Establishing - apartment interior", lens: "24mm", movement: "Static", duration: "4s", done: true },
  { id: 2, scene: "1", shot: "1B", type: "Close-Up", description: "Monitor countdown screen", lens: "85mm", movement: "Slow push", duration: "3s", done: true },
  { id: 3, scene: "1", shot: "1C", type: "Medium CU", description: "Alex reaction - stands up", lens: "50mm", movement: "Tilt up", duration: "2s", done: false },
  { id: 4, scene: "2", shot: "2A", type: "Wide", description: "Alex exits into rain", lens: "35mm", movement: "Static", duration: "3s", done: false },
  { id: 5, scene: "2", shot: "2B", type: "Tracking", description: "Alex running through street", lens: "24mm", movement: "Steadicam", duration: "6s", done: false },
  { id: 6, scene: "2", shot: "2C", type: "Low Angle", description: "Neon signs overhead", lens: "16mm", movement: "Slow pan", duration: "4s", done: false },
];

const ShotList = () => {
  const [shots, setShots] = useState(initialShots);
  const completed = shots.filter((s) => s.done).length;

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
                {completed}/{shots.length} completed
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
            animate={{ width: `${(completed / shots.length) * 100}%` }}
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
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--neo-border)] text-left text-xs text-muted-foreground uppercase tracking-wider">
                <th className="p-4 w-10"></th>
                <th className="p-4">Shot</th>
                <th className="p-4">Type</th>
                <th className="p-4 hidden md:table-cell">Description</th>
                <th className="p-4 hidden lg:table-cell">Lens</th>
                <th className="p-4 hidden lg:table-cell">Movement</th>
                <th className="p-4">Duration</th>
              </tr>
            </thead>
            <tbody>
              {shots.map((shot) => (
                <tr
                  key={shot.id}
                  onClick={() =>
                    setShots(shots.map((s) => (s.id === shot.id ? { ...s, done: !s.done } : s)))
                  }
                  className={`border-b border-[var(--neo-border)]/50 cursor-pointer transition-colors hover:bg-[var(--neon-pink-05)] ${
                    shot.done ? "opacity-50" : ""
                  }`}
                >
                  <td className="p-4">
                    {shot.done ? (
                      <CheckCircle2 className="w-4 h-4 text-[var(--neon-green-raw)]" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground" />
                    )}
                  </td>
                  <td className="p-4 font-mono font-medium text-primary">{shot.shot}</td>
                  <td className="p-4">
                    <Badge className="bg-[var(--neon-purple-10)] text-[var(--neon-purple)] border-[var(--neon-purple-30)] text-[10px]">
                      <Camera className="w-3 h-3 mr-1" />
                      {shot.type}
                    </Badge>
                  </td>
                  <td className="p-4 hidden md:table-cell text-muted-foreground">{shot.description}</td>
                  <td className="p-4 hidden lg:table-cell text-muted-foreground">{shot.lens}</td>
                  <td className="p-4 hidden lg:table-cell text-muted-foreground">{shot.movement}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" /> {shot.duration}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default ShotList;
