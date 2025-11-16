import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'analyticsConsent';

export default function CookieConsent() {
  const [consent, setConsent] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) setConsent(stored === 'true');
  }, []);

  if (consent !== null) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[70] md:left-auto md:right-8 md:w-[420px] bg-black/90 p-4 rounded-xl border-2 border-[#FFD700]/30 text-white flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="font-black mb-1">We use analytics</div>
          <div className="text-gray-400 text-sm">This site uses Google Analytics to understand traffic. You can opt in or out below. No personal data is shared.</div>
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <button onClick={() => { localStorage.setItem(STORAGE_KEY, 'false'); setConsent(false); }} className="px-4 py-2 bg-gray-800 rounded">Decline</button>
        <button onClick={() => { localStorage.setItem(STORAGE_KEY, 'true'); setConsent(true); window.location.reload(); }} className="px-4 py-2 bg-[#FFD700] text-black font-black rounded">Allow Analytics</button>
      </div>
    </div>
  );
}
