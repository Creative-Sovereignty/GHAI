import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Image,
  ListChecks,
  Film,
  Video,
  Music,
  Settings,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/", color: "primary" },
  { icon: FileText, label: "Script", path: "/script", color: "blue" },
  { icon: Image, label: "Storyboard", path: "/storyboard", color: "teal" },
  { icon: ListChecks, label: "Shot List", path: "/shots", color: "pink" },
  { icon: Film, label: "Editor", path: "/editor", color: "blue" },
  { icon: Video, label: "Veo 3", path: "/veo3", color: "teal" },
  { icon: Music, label: "AI Music", path: "/music", color: "purple" },
  { icon: Settings, label: "Settings", path: "/settings", color: "primary" },
];

const colorClasses: Record<string, { bg: string; text: string; bar: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary", bar: "bg-primary" },
  teal: { bg: "bg-teal/10", text: "text-teal", bar: "bg-teal" },
  blue: { bg: "bg-blue/10", text: "text-blue", bar: "bg-blue" },
  purple: { bg: "bg-purple/10", text: "text-purple", bar: "bg-purple" },
  pink: { bg: "bg-pink/10", text: "text-pink", bar: "bg-pink" },
};

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen sticky top-0 flex flex-col border-r border-border bg-sidebar"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Clapperboard className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-display font-bold text-lg text-foreground truncate"
          >
            CineForge
          </motion.span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const colors = colorClasses[item.color];
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? `${colors.bg} ${colors.text}`
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 ${colors.bar} rounded-r-full`}
                />
              )}
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? colors.text : ""}`} />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-2 mb-4 space-y-1">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="truncate">Sign Out</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center justify-center"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </motion.aside>
  );
};

export default AppSidebar;
