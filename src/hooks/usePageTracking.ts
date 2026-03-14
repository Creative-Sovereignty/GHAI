import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    window.dataLayer?.push({
      event: "page_view",
      page_path: location.pathname + location.search,
      page_title: document.title,
    });
  }, [location]);
}
