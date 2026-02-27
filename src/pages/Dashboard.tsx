import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Play, Clock, Film, Music, FileText, TrendingUp, Trash2, LogOut, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import AppLayout from "@/components/AppLayout";
import heroBanner from "@/assets/hero-banner.jpg";
import { useProjects, useCreateProject, useDeleteProject } from "@/hooks/useProjects";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const stats = [
  { label: "Active Projects", value: "–", icon: Film, change: "" },
  { label: "Scripts Written", value: "–", icon: FileText, change: "" },
  { label: "Music Tracks", value: "–", icon: Music, change: "" },
  { label: "Hours Edited", value: "–", icon: Clock, change: "" },
];

const statusColors: Record<string, string> = {
  draft: "text-muted-foreground border-border bg-secondary",
  "in-progress": "text-primary border-primary/30 bg-primary/10",
  completed: "text-green-400 border-green-400/30 bg-green-400/10",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Dashboard = () => {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(() =>
    localStorage.getItem("pwa-banner-dismissed") === "true"
  );
  const isStandalone = typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches;

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setBannerDismissed(true);
      localStorage.setItem("pwa-banner-dismissed", "true");
    }
    setInstallPrompt(null);
  };

  const dismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem("pwa-banner-dismissed", "true");
  };

  const showBanner = !isStandalone && !bannerDismissed;

  const dynamicStats = [
    { ...stats[0], value: String(projects?.length ?? 0), change: "" },
    ...stats.slice(1),
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject.mutateAsync({ title, description: description || undefined });
      setTitle("");
      setDescription("");
      setDialogOpen(false);
      toast({ title: "Project created!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject.mutateAsync(id);
      toast({ title: "Project deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Install Banner */}
        <AnimatePresence>
          {showBanner && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">Install Golden Hour AI</p>
                  <p className="text-xs text-muted-foreground truncate">Add to your home screen for the best experience</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {installPrompt ? (
                  <Button variant="glow" size="sm" onClick={handleInstallClick}>
                    Install
                  </Button>
                ) : (
                  <Button variant="cinema" size="sm" asChild>
                    <a href="/install">How to Install</a>
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={dismissBanner}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden h-48 lg:h-56"
        >
          <img src={heroBanner} alt="Golden Hour AI banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-purple/40" />
          <div className="absolute inset-0 flex items-center justify-between px-8">
            <div>
              <h1 className="font-heading text-3xl lg:text-4xl font-bold mb-2 neon-glow-pink">
                Welcome to <span className="rainbow-text">Golden Hour AI</span>
              </h1>
              <p className="text-muted-foreground text-sm lg:text-base max-w-md neon-glow-cyan" style={{ textShadow: '0 0 8px hsl(var(--accent) / 0.3)' }}>
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
                    <DialogTitle>Create New Project</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-title">Title</Label>
                      <Input
                        id="project-title"
                        placeholder="My Short Film"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project-desc">Description (optional)</Label>
                      <Textarea
                        id="project-desc"
                        placeholder="A brief description..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        maxLength={500}
                      />
                    </div>
                    <Button type="submit" variant="glow" className="w-full" disabled={createProject.isPending}>
                      {createProject.isPending ? "Creating..." : "Create Project"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut} className="self-start">
              <LogOut className="w-4 h-4 mr-1" /> Sign Out
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {dynamicStats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={item}
              className="card-gradient rounded-xl border border-border p-4 hover:border-primary/20 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="w-5 h-5 text-primary" />
                <TrendingUp className="w-3 h-3 text-muted-foreground" />
              </div>
              <p className="font-display text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Your Projects</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects?.map((project) => (
                <motion.div
                  key={project.id}
                  variants={item}
                  whileHover={{ y: -4 }}
                  className="card-gradient rounded-xl border border-border p-5 hover:border-primary/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-display font-semibold text-lg">{project.title}</h3>
                      {project.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${statusColors[project.status] ?? statusColors.draft}`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(project.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="cinema" size="sm" className="flex-1 text-xs">
                      <Play className="w-3 h-3" /> Open
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-destructive hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
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
