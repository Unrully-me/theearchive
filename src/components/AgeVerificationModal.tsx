import React, { useState } from 'react';
import { Lock, X, Eye, EyeOff } from 'lucide-react';

interface AgeVerificationModalProps {
  onVerified: (pin: string) => void;
  onClose: () => void;
  userId: string; // User ID to save user-specific PIN
}

export function AgeVerificationModal({ onVerified, onClose, userId }: AgeVerificationModalProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  const handleSetPin = () => {
    if (pin.length !== 4) {
      alert('PIN must be 4 digits!');
      return;
    }
    
    if (pin !== confirmPin) {
      alert('PINs do not match!');
      return;
    }
    
    // Save PIN to user-specific localStorage key
    localStorage.setItem(`user_pin_${userId}`, pin);
    onVerified(pin);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
      <div className="relative w-full max-w-md bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl border border-red-500/30 shadow-2xl shadow-red-500/20">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-red-500/20 hover:bg-red-500/30 rounded-full transition-all z-10"
        >
          <X className="w-5 h-5 text-red-500" />
        </button>

        {/* PIN SETUP */}
        <div className="p-8">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center shadow-2xl shadow-red-500/50">
              <Lock className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-white mb-3 text-center">18+ Content</h2>
          <p className="text-gray-400 mb-6 text-center">
            This section contains adult content. Create a 4-digit PIN to protect access.
          </p>
          
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <h3 className="text-red-500 font-black mb-2 flex items-center gap-2 justify-center">
              <Lock className="w-5 h-5" />
              PIN Protection
            </h3>
            <p className="text-sm text-gray-300 text-center">
              Your PIN will be required each time you access 18+ content
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Enter PIN</label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="4-digit PIN"
                  maxLength={4}
                  className="w-full bg-gray-800 border border-red-500/30 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Confirm PIN</label>
              <input
                type={showPin ? 'text' : 'password'}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="Re-enter PIN"
                maxLength={4}
                className="w-full bg-gray-800 border border-red-500/30 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <button
            onClick={handleSetPin}
            disabled={pin.length !== 4 || confirmPin.length !== 4}
            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-black py-4 rounded-xl transition-all shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Set PIN & Access 18+ Content
          </button>
        </div>
      </div>
    </div>
  );
}