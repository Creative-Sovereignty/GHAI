import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Smartphone, Monitor, Share, MoreVertical, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full space-y-8"
      >
        <div className="text-center space-y-3">
          <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden shadow-lg">
            <img src="/pwa-192x192.png" alt="Golden Hour AI" className="w-full h-full" />
          </div>
          <h1 className="text-3xl font-bold font-display tracking-tight">
            Install <span className="text-primary">Golden Hour</span> AI
          </h1>
          <p className="text-muted-foreground">
            Add to your home screen for a native app experience — works offline.
          </p>
        </div>

        {isInstalled ? (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-6 text-center">
              <p className="text-primary font-semibold text-lg">✓ Already installed!</p>
              <p className="text-muted-foreground text-sm mt-1">
                Open Golden Hour AI from your home screen or app launcher.
              </p>
            </CardContent>
          </Card>
        ) : deferredPrompt ? (
          <Button
            onClick={handleInstall}
            size="lg"
            className="w-full text-lg gap-3 py-6"
          >
            <Download className="w-5 h-5" />
            Install App
          </Button>
        ) : null}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-center">Manual Install</h2>

          <Card className="bg-card border-border/50">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-primary shrink-0" />
                <span className="font-medium">iPhone / iPad</span>
              </div>
              <ol className="text-sm text-muted-foreground space-y-2 ml-8 list-decimal">
                <li className="flex items-center gap-2">
                  Tap <Share className="w-4 h-4 inline text-foreground" /> <strong className="text-foreground">Share</strong>
                </li>
                <li className="flex items-center gap-2">
                  Tap <PlusSquare className="w-4 h-4 inline text-foreground" /> <strong className="text-foreground">Add to Home Screen</strong>
                </li>
                <li>Tap <strong className="text-foreground">Add</strong></li>
              </ol>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-primary shrink-0" />
                <span className="font-medium">Android</span>
              </div>
              <ol className="text-sm text-muted-foreground space-y-2 ml-8 list-decimal">
                <li className="flex items-center gap-2">
                  Tap <MoreVertical className="w-4 h-4 inline text-foreground" /> <strong className="text-foreground">Menu</strong> in Chrome
                </li>
                <li>
                  Tap <strong className="text-foreground">Add to Home Screen</strong> or <strong className="text-foreground">Install App</strong>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-primary shrink-0" />
                <span className="font-medium">Desktop (Chrome / Edge)</span>
              </div>
              <ol className="text-sm text-muted-foreground space-y-2 ml-8 list-decimal">
                <li>Click the install icon in the address bar</li>
                <li>Click <strong className="text-foreground">Install</strong></li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default Install;
