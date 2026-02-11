import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, ImageIcon, Wand2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";

const initialFrames = [
  { id: 1, scene: "INT. APARTMENT - NIGHT", description: "Wide shot: Alex at desk, monitor glow", notes: "Blue/cold tones" },
  { id: 2, scene: "INT. APARTMENT - NIGHT", description: "CU: Monitor screen with countdown", notes: "Insert shot" },
  { id: 3, scene: "INT. APARTMENT - NIGHT", description: "MCU: Alex stands, chair falls", notes: "Quick camera movement" },
  { id: 4, scene: "EXT. CITY STREET", description: "Wide: Alex exits building into rain", notes: "Neon reflections in puddles" },
  { id: 5, scene: "EXT. CITY STREET", description: "Tracking shot: Alex running", notes: "Handheld, urgent feel" },
  { id: 6, scene: "EXT. CITY STREET", description: "Low angle: Neon signs above", notes: "Atmosphere establishing" },
];

const Storyboard = () => {
  const [frames] = useState(initialFrames);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="font-display text-2xl font-bold">Storyboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Neon Dreams - {frames.length} frames</p>
          </div>
          <div className="flex gap-2">
            <Button className="border border-teal/30 text-teal hover:bg-teal/10 hover:border-teal/60 bg-transparent" size="sm">
              <Wand2 className="w-4 h-4" /> AI Generate
            </Button>
            <Button className="bg-teal text-teal-foreground hover:bg-teal/90 shadow-[0_0_20px_hsl(174_72%_46%/0.3)] hover:shadow-[0_0_30px_hsl(174_72%_46%/0.5)] transition-shadow" size="sm">
              <Plus className="w-4 h-4" /> Add Frame
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {frames.map((frame, index) => (
            <motion.div
              key={frame.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
              className="card-gradient rounded-xl border border-border overflow-hidden group cursor-pointer hover:border-teal/30 transition-all"
            >
              {/* Frame placeholder */}
              <div className="aspect-video bg-secondary/50 flex items-center justify-center relative">
                <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                <div className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded bg-background/80 text-muted-foreground font-mono">
                  #{index + 1}
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs text-teal/80 font-mono mb-1">{frame.scene}</p>
                <p className="text-sm font-medium mb-2">{frame.description}</p>
                <p className="text-xs text-muted-foreground">{frame.notes}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Storyboard;
