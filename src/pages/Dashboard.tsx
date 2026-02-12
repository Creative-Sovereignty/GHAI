import { motion } from "framer-motion";
import { Plus, Play, Clock, Film, Music, FileText, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import heroBanner from "@/assets/hero-banner.jpg";

const projects = [
  { id: 1, title: "Neon Dreams", status: "In Progress", scenes: 12, duration: "2:30", genre: "Sci-Fi" },
  { id: 2, title: "Midnight Echo", status: "Pre-Production", scenes: 8, duration: "1:45", genre: "Thriller" },
  { id: 3, title: "Golden Hour", status: "Post-Production", scenes: 15, duration: "3:00", genre: "Drama" },
];

const stats = [
  { label: "Active Projects", value: "3", icon: Film, change: "+1 this week" },
  { label: "Scripts Written", value: "7", icon: FileText, change: "2 drafts" },
  { label: "Music Tracks", value: "12", icon: Music, change: "4 generated" },
  { label: "Hours Edited", value: "24", icon: Clock, change: "+6 today" },
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
          <img
            src={heroBanner}
            alt="CineForge banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple/80 via-pink/40 to-transparent" />
          <div className="absolute inset-0 flex items-center px-8">
            <div>
              <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2">
                Welcome to <span className="text-gradient">AShort AI</span>
              </h1>
              <p className="text-muted-foreground text-sm lg:text-base max-w-md">
                Your AI-powered filmmaking studio. Create stunning shorts from script to screen.
              </p>
              <Button variant="glow" className="mt-4" size="lg">
                <Plus className="w-4 h-4" /> New Project
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
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
              <p className="font-display text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              <p className="text-xs text-primary/70 mt-0.5">{stat.change}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Recent Projects</h2>
            <Button variant="cinema" size="sm">View All</Button>
          </div>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {projects.map((project) => (
              <motion.div
                key={project.id}
                variants={item}
                whileHover={{ y: -4 }}
                className="card-gradient rounded-xl border border-border p-5 hover:border-primary/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display font-semibold text-lg">{project.title}</h3>
                    <span className="text-xs text-muted-foreground">{project.genre}</span>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border ${
                    project.status === "In Progress"
                      ? "text-primary border-primary/30 bg-primary/10"
                      : project.status === "Post-Production"
                      ? "text-green-400 border-green-400/30 bg-green-400/10"
                      : "text-muted-foreground border-border bg-secondary"
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Film className="w-3.5 h-3.5" /> {project.scenes} scenes
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {project.duration}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="ghost" size="sm" className="flex-1 text-xs">
                    <Play className="w-3 h-3" /> Preview
                  </Button>
                  <Button variant="cinema" size="sm" className="flex-1 text-xs">
                    Continue
                  </Button>
                </div>
              </motion.div>
            ))}

            {/* New Project Card */}
            <motion.div
              variants={item}
              whileHover={{ y: -4 }}
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
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
