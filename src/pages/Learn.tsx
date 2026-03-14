import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, BookOpen, RefreshCw, Search, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackEvent } from "@/lib/analytics";
import AppLayout from "@/components/AppLayout";

const DEFAULT_URL = "https://en.wikipedia.org/wiki/Filmmaking";

const Learn = () => {
  const [url, setUrl] = useState(DEFAULT_URL);
  const [activeUrl, setActiveUrl] = useState(DEFAULT_URL);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async (targetUrl?: string) => {
    const scrapeUrl = targetUrl || url;

    try {
      new URL(scrapeUrl);
    } catch {
      setError("Please enter a valid URL (e.g. https://example.com)");
      return;
    }

    setLoading(true);
    setError(null);
    setContent(null);
    setActiveUrl(scrapeUrl);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("firecrawl-scrape", {
        body: { url: scrapeUrl, options: { formats: ["markdown"], onlyMainContent: true } },
      });

      if (fnError) throw new Error(fnError.message);

      const markdown = data?.data?.markdown || data?.markdown;
      if (!markdown) throw new Error("No content returned");

      setContent(markdown);
      trackEvent("learn_scrape", { url: scrapeUrl });
    } catch (err: any) {
      console.error("Scrape error:", err);
      setError(err.message || "Failed to load content");
    } finally {
      setLoading(false);
    }
  }, [url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContent();
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold">Learn</h1>
            <p className="text-sm text-muted-foreground">Scrape any article or webpage into readable content</p>
          </div>
        </div>

        {/* URL input */}
        <form onSubmit={handleSubmit} className="neo-card rounded-xl p-4 flex gap-3">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://en.wikipedia.org/wiki/Filmmaking"
            className="flex-1 bg-secondary/50 border-[var(--neo-border)] focus-visible:border-primary focus-visible:ring-primary/20"
            required
          />
          <Button type="submit" variant="glow" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span className="ml-1.5 hidden sm:inline">Scrape</span>
          </Button>
        </form>

        {/* Active URL indicator */}
        {activeUrl && content && !loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Showing:</span>
            <a
              href={activeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1 truncate max-w-md"
            >
              {activeUrl} <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
            <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs" onClick={() => fetchContent(activeUrl)} disabled={loading}>
              <RefreshCw className={`w-3 h-3 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Scraping article…</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="neo-card rounded-xl p-6 text-center space-y-3">
            <p className="text-destructive">{error}</p>
            <Button variant="glow" size="sm" onClick={() => fetchContent()}>
              Try Again
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!content && !loading && !error && (
          <div className="neo-card rounded-xl p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground">Enter a URL above and click Scrape to load an article</p>
          </div>
        )}

        {/* Content */}
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
      </div>
    </AppLayout>
  );
};

export default Learn;
