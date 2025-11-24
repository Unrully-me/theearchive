import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

interface CookieConsentProps {
  onNavigateToPrivacy: () => void;
}

export function CookieConsent({ onNavigateToPrivacy }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasConsented = localStorage.getItem('cookie_consent');
    if (!hasConsented) {
      // Show banner after 2 seconds
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-slide-up">
      <div className="max-w-6xl mx-auto bg-gradient-to-r from-gray-900/98 to-black/98 backdrop-blur-xl rounded-2xl p-6 border-2 border-[#FFD700]/30 shadow-2xl">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-[#FFD700]/20 flex items-center justify-center">
              <Cookie className="w-6 h-6 text-[#FFD700]" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-lg font-black text-white mb-2">
              🍪 We Use Cookies
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              We use cookies and similar technologies to improve your browsing experience, personalize content and ads, 
              provide social media features, and analyze our traffic. We also use Google AdSense which may use cookies 
              to show personalized ads based on your interests.{' '}
              <button
                onClick={onNavigateToPrivacy}
                className="text-[#FFD700] hover:text-[#FFA500] underline font-bold"
              >
                Learn more in our Privacy Policy
              </button>
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAccept}
                className="px-6 py-2.5 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-black rounded-xl hover:shadow-lg hover:shadow-[#FFD700]/50 transition-all"
              >
                Accept All Cookies
              </button>
              <button
                onClick={handleDecline}
                className="px-6 py-2.5 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/20"
              >
                Decline Optional Cookies
              </button>
              <button
                onClick={onNavigateToPrivacy}
                className="px-6 py-2.5 bg-transparent text-gray-400 font-bold rounded-xl hover:text-white transition-all"
              >
                Customize Settings
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleDecline}
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
