// Read measurement ID from Vite env var (set in Vercel as VITE_GA_ID) with fallback
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_ID || 'G-C42E9WGM8K';

// Safe wrapper around gtag
export function gtag(...args: any[]) {
  if (typeof window === 'undefined') return;
  const w: any = window as any;
  if (!w.gtag) return;
  w.gtag(...args);
}

export function pageview(path: string) {
  try {
    gtag('config', GA_MEASUREMENT_ID, {
      page_path: path,
      anonymize_ip: true,
    });
  } catch (e) {
    // ignore
  }
}

export function event(name: string, params = {}) {
  try {
    gtag('event', name, params);
  } catch (e) {
    // ignore
  }
}

export function trackDownload(movieId: string) {
  event('download', { movie_id: movieId });
}

export function trackShortLink(code: string) {
  event('short_link', { code });
}

// Dynamically loads the gtag script, only call this after user consent
export function initGA() {
  if (typeof window === 'undefined') return;
  const w: any = window as any;
  if (w.gtag) return; // already loaded

  const key = GA_MEASUREMENT_ID;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${key}`;
  document.head.appendChild(script);

  w.dataLayer = w.dataLayer || [];
  w.gtag = function() { w.dataLayer.push(arguments); };
  w.gtag('js', new Date());
  w.gtag('config', key, { anonymize_ip: true });
}
