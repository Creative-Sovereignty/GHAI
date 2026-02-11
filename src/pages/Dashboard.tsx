import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Play, Clock, Film, Music, FileText, TrendingUp, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AppLayout from "@/components/AppLayout";
import heroBanner from "@/assets/hero-banner.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Project = Tables<"projects">;

const stats = [
  { label: "Active Projects", icon: Film, key: "projects" as const },
  { label: "Scripts Written", icon: FileText, key: "scripts" as const },
  { label: "Music Tracks", icon: Music, key: "music" as const },
  { label: "Hours Edited", icon: Clock, key: "hours" as const },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Project[];
    },
  });

  const createProject = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("projects").insert({
        title: newTitle,
        description: newDescription || null,
        user_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setNewTitle("");
      setNewDescription("");
      setDialogOpen(false);
      toast.success("Project created!");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  const statValues = {
    projects: projects.length.toString(),
    scripts: "0",
    music: "0",
    hours: "0",
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden h-48 lg:h-56"
        >
          <img src={heroBanner} alt="CineForge banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple/80 via-pink/40 to-transparent" />
          <div className="absolute inset-0 flex items-center px-8">
            <div>
              <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2">
                Welcome to <span className="text-gradient">CineForge</span>
              </h1>
              <p className="text-muted-foreground text-sm lg:text-base max-w-md">
                Your AI-powered filmmaking studio. Create stunning shorts from script to screen.
              </p>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="glow" className="mt-4" size="lg">
                    <Plus className="w-4 h-4" /> New Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-display">Create New Project</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newTitle.trim()) createProject.mutate();
                    }}
                    className="space-y-4 mt-2"
                  >
                    <Input
                      placeholder="Project title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                    />
                    <Button type="submit" variant="glow" className="w-full" disabled={createProject.isPending}>
                      {createProject.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Project"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={item}
              className="card-gradient rounded-xl border border-border p-4 hover:border-primary/20 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="w-5 h-5 text-primary" />
                <TrendingUp className="w-3 h-3 text-muted-foreground" />
              </div>
              <p className="font-display text-2xl font-bold">{statValues[stat.key]}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Recent Projects</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  variants={item}
                  whileHover={{ y: -4 }}
                  className="card-gradient rounded-xl border border-border p-5 hover:border-primary/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-semibold text-lg truncate">{project.title}</h3>
                      {project.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1">{project.description}</span>
                      )}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border shrink-0 ml-2 ${
                      project.status === "in_progress"
                        ? "text-primary border-primary/30 bg-primary/10"
                        : project.status === "completed"
                        ? "text-green-400 border-green-400/30 bg-green-400/10"
                        : "text-muted-foreground border-border bg-secondary"
                    }`}>
                      {project.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(project.updated_at).toLocaleDateString()}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1 text-xs">
                      <Play className="w-3 h-3" /> Open
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject.mutate(project.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}

              {/* New Project Card */}
              <motion.div
                variants={item}
                whileHover={{ y: -4 }}
                onClick={() => setDialogOpen(true)}
                className="rounded-xl border border-dashed border-border p-5 flex flex-col items-center justify-center min-h-[180px] cursor-pointer hover:border-primary/40 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Create New Short
                </p>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
