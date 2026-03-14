import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, FileText, Image, ListChecks, Film, Video, Music, Settings,
  ChevronLeft, ChevronRight, BarChart3,
} from "lucide-react";
import logoImg from "@/assets/logo.png";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", neon: "pink" },
  { icon: FileText, label: "Script", path: "/script", neon: "cyan" },
  { icon: ListChecks, label: "Shot List", path: "/shots", neon: "pink" },
  { icon: Image, label: "Storyboard", path: "/storyboard", neon: "cyan" },
  { icon: Video, label: "Veo 3", path: "/veo3", neon: "cyan" },
  { icon: Film, label: "Editor", path: "/editor", neon: "pink" },
  { icon: Music, label: "AI Music", path: "/music", neon: "purple" },
  { icon: Settings, label: "Settings", path: "/settings", neon: "pink" },
];

const neonStyles: Record<string, { bg: string; text: string; bar: string; glow: string }> = {
  pink: { bg: "bg-[var(--neon-pink-10)]", text: "text-[var(--neon-pink)]", bar: "bg-[var(--neon-pink)]", glow: "shadow-[0_0_10px_var(--neon-pink-30)]" },
  cyan: { bg: "bg-[var(--neon-cyan-10)]", text: "text-[var(--neon-cyan)]", bar: "bg-[var(--neon-cyan)]", glow: "shadow-[0_0_10px_var(--neon-cyan-30)]" },
  purple: { bg: "bg-[var(--neon-purple-10)]", text: "text-[var(--neon-purple)]", bar: "bg-[var(--neon-purple)]", glow: "shadow-[0_0_10px_var(--neon-purple-30)]" },
};

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen sticky top-0 flex flex-col border-r border-[var(--neo-border)] bg-[var(--neo-surface)]"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--neo-border)]">
        <img src={logoImg} alt="Golden Hour AI" className={`shrink-0 object-contain ${collapsed ? 'h-9' : 'h-10'}`} />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-display font-bold text-lg text-foreground truncate"
          >
            Golden Hour AI
          </motion.span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const colors = neonStyles[item.neon];
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? `${colors.bg} ${colors.text} ${colors.glow}`
                  : "text-muted-foreground hover:text-foreground hover:bg-[var(--neon-pink-05)]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 ${colors.bar} rounded-r-full shadow-[0_0_6px_currentColor]`}
                />
              )}
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? colors.text : ""}`} />
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="truncate">
                  {item.label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-2 mb-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[var(--neon-pink-05)] transition-colors flex items-center justify-center"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </motion.aside>
  );
};

export default AppSidebar;
