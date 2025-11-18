
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  import { APP_VERSION } from './version';

  createRoot(document.getElementById("root")!).render(<App />);

  // Expose app version for debugging and QA
  try {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('data-app-version', APP_VERSION);
      console.info('THEE ARCHIVE version:', APP_VERSION);
    }
  } catch (e) { /* no-op */ }
  