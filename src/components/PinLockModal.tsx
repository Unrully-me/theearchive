import React, { useState } from 'react';
import { Lock, X, Eye, EyeOff } from 'lucide-react';

interface PinLockModalProps {
  onUnlock: () => void;
  onClose: () => void;
  userPersonalPin?: string; // User's personal PIN
}

export function PinLockModal({ onUnlock, onClose, userPersonalPin }: PinLockModalProps) {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = () => {
    // Use user's personal PIN (no fallback needed)
    const correctPin = userPersonalPin;
    
    if (!correctPin) {
      alert('❌ No PIN found. Please set up your PIN first.');
      onClose();
      return;
    }
    
    if (pin === correctPin) {
      onUnlock();
    } else {
      setError(true);
      setAttempts(prev => prev + 1);
      setPin('');
      
      if (attempts >= 2) {
        alert('❌ Too many failed attempts. Please try again later.');
        onClose();
      }
      
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && pin.length === 4) {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
      <div className="relative w-full max-w-md bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl border border-red-500/30 shadow-2xl shadow-red-500/20 p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-red-500/20 hover:bg-red-500/30 rounded-full transition-all"
        >
          <X className="w-5 h-5 text-red-500" />
        </button>

        <div className="text-center">
          <div className="mb-6">
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all ${
              error 
                ? 'bg-red-500 shake' 
                : 'bg-gradient-to-br from-red-600 to-red-500 shadow-red-500/50'
            }`}>
              <Lock className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-white mb-3">18+ Content Locked</h2>
          <p className="text-gray-400 mb-6">
            Enter your PIN to access adult content
          </p>
          
          <div className="mb-6">
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                onKeyPress={handleKeyPress}
                placeholder="••••"
                maxLength={4}
                autoFocus
                className={`w-full bg-gray-800 border rounded-xl px-4 py-4 text-white text-center text-3xl tracking-widest focus:outline-none focus:ring-2 transition-all ${
                  error 
                    ? 'border-red-500 ring-2 ring-red-500' 
                    : 'border-red-500/30 focus:ring-red-500'
                }`}
              />
              <button
                onClick={() => setShowPin(!showPin)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {error && (
              <p className="text-red-500 text-sm font-bold mt-2 animate-pulse">
                Incorrect PIN! {3 - attempts} attempts remaining
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={pin.length !== 4}
            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-black py-4 rounded-xl transition-all shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Unlock
          </button>

          <div className="mt-4 space-y-2">
            <p className="text-gray-400 text-xs">
              🔒 Enter your personal 18+ PIN
            </p>
            <p className="text-gray-500 text-xs">
              Forgot PIN? Go to Profile → Set/Change 18+ PIN
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}