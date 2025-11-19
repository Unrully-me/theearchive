
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  createRoot(document.getElementById("root")!).render(<App />);
  
  // Ensure root-level meta/icon references point to an absolute URL so
  // social previews (og:image) and external scrapers can find them.
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    if (origin) {
      const setAbsolute = (selector: string, attr = 'href') => {
        const el = document.querySelector(selector) as HTMLLinkElement | HTMLMetaElement | null;
        if (!el) return;
        const val = el.getAttribute(attr);
        if (!val || val.startsWith('http')) return;
        el.setAttribute(attr, origin + val);
      };

      setAbsolute('link[rel="icon"][href]');
      setAbsolute('link[rel="apple-touch-icon"][href]');
      setAbsolute('link[rel="icon"][type="image/svg+xml"][href]');
      setAbsolute('meta[property="og:image"]', 'content');
    }
  } catch (e) {}
  