import React, { useEffect } from 'react';

interface PropellerAdProps {
  zoneId: string;
  adType?: 'banner' | 'native' | 'push' | 'popunder' | 'interstitial';
  className?: string;
}

/**
 * PropellerAds Component - Adult-Friendly Ad Network
 * 
 * SETUP INSTRUCTIONS:
 * 1. Sign up at https://propellerads.com
 * 2. Create ad zones in your dashboard
 * 3. Get your Zone IDs for different ad placements
 * 4. Add the PropellerAds script to your site (see below)
 * 5. Replace zone IDs in your components
 * 
 * EARNINGS:
 * - CPM: $1-$3 (varies by country)
 * - Allows adult content ✅
 * - Payment threshold: $5
 * - Payment methods: PayPal, Payoneer, Wire, WebMoney
 * 
 * USAGE:
 * <PropellerAd zoneId="1234567" adType="banner" />
 */
export function PropellerAd({ zoneId, adType = 'banner', className = '' }: PropellerAdProps) {
  useEffect(() => {
    // Load PropellerAds script dynamically
    if (!document.querySelector('#propellerads-script')) {
      const script = document.createElement('script');
      script.id = 'propellerads-script';
      script.src = `//client.propellerads.com/client.js`;
      script.async = true;
      document.body.appendChild(script);
    }

    // Initialize the ad after script loads
    const timer = setTimeout(() => {
      if (window.propellerads) {
        window.propellerads.push({
          zone_id: zoneId,
          container_id: `propeller-ad-${zoneId}`
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [zoneId]);

  // Don't show ads in development
  if (process.env.NODE_ENV !== 'production') {
    return (
      <div className={`bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 rounded-xl p-8 ${className}`}>
        <p className="text-center font-bold text-purple-400">
          📢 PropellerAds Placeholder (Dev Mode)
        </p>
        <p className="text-center text-xs text-gray-400 mt-2">
          Zone: {zoneId} | Type: {adType}
        </p>
        <p className="text-center text-xs text-gray-500 mt-1">
          PropellerAds will display in production
        </p>
        <p className="text-center text-xs text-green-400 mt-2">
          ✅ Adult content allowed!
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div id={`propeller-ad-${zoneId}`} />
    </div>
  );
}

// Declare global propellerads type
declare global {
  interface Window {
    propellerads: any[];
  }
}

/**
 * HOW TO GET ZONE IDS:
 * 
 * 1. Log in to PropellerAds dashboard
 * 2. Go to "Websites & Apps" → "Add Website"
 * 3. Add your domain
 * 4. Go to "Ad Zones" → "Create Ad Zone"
 * 5. Choose ad format:
 *    - Push Notifications (best CPM)
 *    - Banner Ads
 *    - Native Ads
 *    - Interstitial
 *    - Popunder
 * 6. Copy the Zone ID (looks like "1234567")
 * 7. Use it: <PropellerAd zoneId="1234567" />
 * 
 * RECOMMENDED PLACEMENTS:
 * - Push Notifications: All pages (highest revenue)
 * - Banner: After hero, between content sections
 * - Native: In content lists
 * - Interstitial: On page changes
 * - Popunder: Entry/exit (annoying but high CPM)
 */
