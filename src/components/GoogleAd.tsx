import React, { useEffect } from 'react';

interface GoogleAdProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  adStyle?: React.CSSProperties;
  className?: string;
}

/**
 * Google AdSense Component
 * 
 * SETUP INSTRUCTIONS:
 * 1. Get your AdSense Publisher ID from Google AdSense dashboard
 * 2. Add the AdSense script to your index.html or App.tsx:
 *    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX" crossOrigin="anonymous"></script>
 * 3. Replace "ca-pub-XXXXXXXXXX" with your actual publisher ID
 * 4. Replace the adSlot prop with your actual ad slot IDs
 * 
 * USAGE:
 * <GoogleAd adSlot="1234567890" adFormat="auto" />
 */
export function GoogleAd({ 
  adSlot, 
  adFormat = 'auto',
  adStyle = { display: 'block' },
  className = ''
}: GoogleAdProps) {
  useEffect(() => {
    try {
      // Push ad to AdSense
      if (window.adsbygoogle && process.env.NODE_ENV === 'production') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  // Don't show ads in development
  if (process.env.NODE_ENV !== 'production') {
    return (
      <div className={`bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-xl p-8 ${className}`}>
        <p className="text-center font-bold text-yellow-400">
          📢 Google Ad Placeholder (Dev Mode)
        </p>
        <p className="text-center text-xs text-gray-400 mt-2">
          Slot: {adSlot} | Format: {adFormat}
        </p>
        <p className="text-center text-xs text-gray-500 mt-1">
          Ads will display in production
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={adStyle}
        data-ad-client="ca-pub-XXXXXXXXXX" // REPLACE WITH YOUR PUBLISHER ID
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}

// Declare global adsbygoogle type
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}
