import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ScriptEditor from "./pages/ScriptEditor";
import Storyboard from "./pages/Storyboard";
import ShotList from "./pages/ShotList";
import VideoEditor from "./pages/VideoEditor";
import AIMusic from "./pages/AIMusic";
import Veo3 from "./pages/Veo3";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/script" element={<ScriptEditor />} />
          <Route path="/storyboard" element={<Storyboard />} />
          <Route path="/shots" element={<ShotList />} />
          <Route path="/editor" element={<VideoEditor />} />
          <Route path="/veo3" element={<Veo3 />} />
          <Route path="/music" element={<AIMusic />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
