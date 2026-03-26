import { motion } from "framer-motion";
import { Film, Sparkles } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const VideoEditor = () => {
  return (
    <AppLayout>
      <div className="h-screen flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="relative inline-block mb-6">
            <Film className="w-16 h-16 text-muted-foreground/30" />
            <Sparkles className="w-6 h-6 text-accent absolute -top-1 -right-1" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">Timeline Editor</h1>
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 mb-4">
            Coming Soon
          </span>
          <p className="text-muted-foreground text-sm leading-relaxed">
            A professional non-linear video editor is in development. You'll be able to
            assemble clips, trim, add transitions, and export your final cut — all inside
            Golden Hour AI.
          </p>
          <p className="text-muted-foreground/50 text-xs mt-4">
            In the meantime, use the AI Scene Generator and Storyboard to plan your visuals.
          </p>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default VideoEditor;
