import React, { useEffect } from 'react';

interface AdSterraAdProps {
  adKey: string;
  adType?: 'banner' | 'native' | 'popunder' | 'social-bar' | 'direct-link';
  className?: string;
}

/**
 * AdSterra Component - Adult-Friendly Ad Network
 * 
 * SETUP INSTRUCTIONS:
 * 1. Sign up at https://adsterra.com
 * 2. Add your website
 * 3. Create ad codes in dashboard
 * 4. Get your Ad Keys for different placements
 * 5. Replace ad keys in your components
 * 
 * EARNINGS:
 * - CPM: $2-$4 (varies by country)
 * - Allows adult content ✅
 * - Payment threshold: $5 (WebMoney), $100 (Others)
 * - Payment methods: PayPal, Paxum, WebMoney, Wire, Bitcoin
 * 
 * USAGE:
 * <AdSterraAd adKey="abc123xyz" adType="banner" />
 */
export function AdSterraAd({ adKey, adType = 'banner', className = '' }: AdSterraAdProps) {
  useEffect(() => {
    // Load AdSterra script based on ad type
    const scriptId = `adsterra-${adKey}`;
    
    if (!document.querySelector(`#${scriptId}`)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.async = true;
      
      // Different script URLs for different ad types
      if (adType === 'popunder') {
        script.src = `//pl${adKey}.profitablecpmrate.com/${adKey}/invoke.js`;
      } else if (adType === 'social-bar') {
        script.src = `//pl${adKey}.profitablecpmrate.com/${adKey}/invoke.js`;
      } else {
        // Banner and Native
        script.innerHTML = `
          atOptions = {
            'key' : '${adKey}',
            'format' : 'iframe',
            'height' : ${adType === 'banner' ? '90' : '250'},
            'width' : ${adType === 'banner' ? '728' : '300'},
            'params' : {}
          };
        `;
        const invokeScript = document.createElement('script');
        invokeScript.type = 'text/javascript';
        invokeScript.src = `//www.topcreativeformat.com/${adKey}/invoke.js`;
        document.body.appendChild(script);
        document.body.appendChild(invokeScript);
        return;
      }
      
      document.body.appendChild(script);
    }
  }, [adKey, adType]);

  // Don't show ads in development
  if (process.env.NODE_ENV !== 'production') {
    return (
      <div className={`bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/50 rounded-xl p-8 ${className}`}>
        <p className="text-center font-bold text-cyan-400">
          📢 AdSterra Placeholder (Dev Mode)
        </p>
        <p className="text-center text-xs text-gray-400 mt-2">
          Key: {adKey} | Type: {adType}
        </p>
        <p className="text-center text-xs text-gray-500 mt-1">
          AdSterra ads will display in production
        </p>
        <p className="text-center text-xs text-green-400 mt-2">
          ✅ Adult content allowed!
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {adType !== 'popunder' && adType !== 'social-bar' && (
        <div id={`adsterra-container-${adKey}`} />
      )}
    </div>
  );
}

/**
 * HOW TO GET AD KEYS:
 * 
 * 1. Log in to AdSterra dashboard
 * 2. Go to "Websites" → "Add Website"
 * 3. Submit your website for approval
 * 4. Once approved, go to "Codes"
 * 5. Create new ad code:
 *    - Banner Ads (728x90, 300x250)
 *    - Native Banners
 *    - Popunder (highest CPM!)
 *    - Social Bar
 *    - Direct Link
 * 6. Copy the ad code/key
 * 7. Use it: <AdSterraAd adKey="your-key-here" />
 * 
 * RECOMMENDED PLACEMENTS:
 * - Popunder: All pages (best revenue, but annoying)
 * - Banner: After hero, between sections
 * - Native: In content feed
 * - Social Bar: Bottom of page
 * 
 * BEST PERFORMING:
 * 1. Popunder (highest CPM but intrusive)
 * 2. Social Bar (good balance)
 * 3. Native Banners (best user experience)
 * 4. Regular Banners
 */
