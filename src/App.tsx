import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import ScriptEditor from "./pages/ScriptEditor";
import Storyboard from "./pages/Storyboard";
import ShotList from "./pages/ShotList";
import VideoEditor from "./pages/VideoEditor";
import AIMusic from "./pages/AIMusic";
import Veo3 from "./pages/Veo3";
import Auth from "./pages/Auth";
import Install from "./pages/Install";
import FAQ from "./pages/FAQ";
import Help from "./pages/Help";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ChatWidget from "./components/ChatWidget";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/install" element={<Install />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/help" element={<Help />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/script" element={<ProtectedRoute><ScriptEditor /></ProtectedRoute>} />
            <Route path="/storyboard" element={<ProtectedRoute><Storyboard /></ProtectedRoute>} />
            <Route path="/shots" element={<ProtectedRoute><ShotList /></ProtectedRoute>} />
            <Route path="/editor" element={<ProtectedRoute><VideoEditor /></ProtectedRoute>} />
            <Route path="/veo3" element={<ProtectedRoute><Veo3 /></ProtectedRoute>} />
            <Route path="/music" element={<ProtectedRoute><AIMusic /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatWidget />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
