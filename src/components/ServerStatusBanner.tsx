import React from 'react';
import { AlertCircle, Server, ExternalLink } from 'lucide-react';

interface ServerStatusBannerProps {
  onDismiss?: () => void;
}

export function ServerStatusBanner({ onDismiss }: ServerStatusBannerProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <AlertCircle className="w-6 h-6 flex-shrink-0 animate-pulse" />
            <div className="flex-1">
              <p className="font-semibold">Server Not Deployed</p>
              <p className="text-sm opacity-90">
                The Supabase Edge Function is not accessible. Please deploy it to use the app.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <a
              href="/test-server.html"
              target="_blank"
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <Server className="w-4 h-4" />
              Test Server
              <ExternalLink className="w-3 h-3" />
            </a>
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-white/80 hover:text-white px-3 py-2 text-2xl leading-none"
                aria-label="Dismiss"
              >
                ×
              </button>
            )}
          </div>
        </div>
        
        <div className="mt-2 pt-2 border-t border-white/20 text-xs opacity-75">
          <strong>Quick Deploy:</strong> Run{' '}
          <code className="bg-black/20 px-2 py-1 rounded">
            supabase functions deploy make-server-4d451974
          </code>
        </div>
      </div>
    </div>
  );
}
