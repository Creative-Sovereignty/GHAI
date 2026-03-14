import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, BookOpen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";

const WIKI_URL = "https://en.wikipedia.org/wiki/Filmmaking";

const Learn = () => {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("firecrawl-scrape", {
        body: { url: WIKI_URL, options: { formats: ["markdown"], onlyMainContent: true } },
      });

      if (fnError) throw new Error(fnError.message);

      const markdown = data?.data?.markdown || data?.markdown;
      if (!markdown) throw new Error("No content returned");

      setContent(markdown);
    } catch (err: any) {
      console.error("Scrape error:", err);
      setError(err.message || "Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-primary" />
            <div>
              <h1 className="font-display text-2xl font-bold">Learn: Filmmaking</h1>
              <p className="text-sm text-muted-foreground">
                Sourced from{" "}
                <a href={WIKI_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Wikipedia
                </a>
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchContent} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Scraping article…</span>
          </div>
        )}

        {error && (
          <div className="neo-card rounded-xl p-6 text-center space-y-3">
            <p className="text-destructive">{error}</p>
            <Button variant="glow" size="sm" onClick={fetchContent}>
              Try Again
            </Button>
          </div>
        )}

        {content && !loading && (
          <div className="neo-card rounded-xl p-6 lg:p-8">
            <div className="prose prose-invert prose-sm max-w-none
              prose-headings:font-display prose-headings:text-foreground
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground
              prose-code:text-accent prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-img:rounded-lg
              prose-table:text-sm
              prose-th:text-foreground prose-th:border-border
              prose-td:border-border
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          </div>
        )}

        <div className="flex justify-center pt-4 pb-8">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            ← Back
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Learn;
