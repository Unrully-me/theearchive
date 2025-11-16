
  import { createRoot } from "react-dom/client";
  import { pageview } from './utils/analytics';
  import App from "./App.tsx";
  import "./index.css";

  createRoot(document.getElementById("root")!).render(<App />);

  // Fire a pageview when the app loads. This is a lightweight SPA config.
  // Only track when running in production AND the user allowed analytics (cookie consent).
  if (import.meta.env.PROD) {
    try {
      const consent = localStorage.getItem('analyticsConsent');
      if (consent === 'true') {
        pageview(window.location.pathname + window.location.search);
        import('./utils/analytics').then(mod => mod.initGA()).catch(() => {});
        // Also hook the popstate event to track back/forward navigation in SPA
        window.addEventListener('popstate', () => {
          pageview(window.location.pathname + window.location.search);
        });
      }
    } catch (e) { }
  }
  