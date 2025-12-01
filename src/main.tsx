
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  // Global client-side error overlay for easier debugging in production
  window.addEventListener("error", (ev) => {
    try {
      // Show visible overlay with error message so users/developers can see it
      const overlayId = "__client_error_overlay__";
      if (!document.getElementById(overlayId)) {
        const overlay = document.createElement("div");
        overlay.id = overlayId;
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.right = "0";
        overlay.style.padding = "12px";
        overlay.style.background = "rgba(255,0,0,0.95)";
        overlay.style.color = "white";
        overlay.style.zIndex = "99999";
        overlay.style.fontFamily = "monospace";
        overlay.style.fontSize = "13px";
        overlay.style.whiteSpace = "pre-wrap";
        overlay.innerText = `Client error: ${ev?.message || ev?.error?.message || String(ev)}`;
        document.body.appendChild(overlay);
      }
    } catch (err) {
      // Keep best-effort only — don't throw from the handler
      // eslint-disable-next-line no-console
      console.error("Error while showing overlay:", err);
    }
  });

  window.addEventListener("unhandledrejection", (ev) => {
    try {
      const msg = ev?.reason ? String(ev.reason) : "Unhandled rejection";
      const overlayId = "__client_error_overlay__";
      let overlay = document.getElementById(overlayId);
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = overlayId;
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.right = "0";
        overlay.style.padding = "12px";
        overlay.style.background = "rgba(255,0,0,0.95)";
        overlay.style.color = "white";
        overlay.style.zIndex = "99999";
        overlay.style.fontFamily = "monospace";
        overlay.style.fontSize = "13px";
        overlay.style.whiteSpace = "pre-wrap";
        document.body.appendChild(overlay);
      }
      overlay!.textContent = `Unhandled rejection: ${msg}`;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error while showing rejection overlay:", err);
    }
  });

  createRoot(document.getElementById("root")!).render(<App />);
  