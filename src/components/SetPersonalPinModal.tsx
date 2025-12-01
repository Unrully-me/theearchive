import React, { useState } from 'react';
import { Lock, X, Save } from 'lucide-react';

interface SetPersonalPinModalProps {
  onClose: () => void;
  onSave: (pin: string) => void;
  currentPin?: string;
}

export function SetPersonalPinModal({ onClose, onSave, currentPin }: SetPersonalPinModalProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    setError('');

    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits!');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match!');
      return;
    }

    onSave(pin);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90">
      <div className="w-full max-w-md bg-gradient-to-br from-gray-900 to-black rounded-2xl border-2 border-red-500/30 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">
                  {currentPin ? 'Change Your' : 'Set Your'} 18+ PIN
                </h2>
                <p className="text-sm text-white/80">Personal access code</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <p className="text-sm text-yellow-400">
              <strong>🔒 Important:</strong> This PIN is unique to your account. You'll need it to access 18+ content. 
              Don't share it with anyone!
            </p>
          </div>

          {currentPin && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-sm text-gray-400">
                Current PIN: <span className="text-white font-bold">****</span>
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">
              Enter New PIN (4 digits)
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setPin(value);
                setError('');
              }}
              placeholder="••••"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-center text-3xl tracking-[0.5em] font-bold"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">
              Confirm PIN
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setConfirmPin(value);
                setError('');
              }}
              placeholder="••••"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-center text-3xl tracking-[0.5em] font-bold"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
              <p className="text-sm text-red-400 font-bold">❌ {error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={pin.length !== 4 || confirmPin.length !== 4}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-black rounded-xl hover:shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5 inline mr-2" />
              Save PIN
            </button>
            <button
              onClick={onClose}
              className="px-6 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
            >
              Cancel
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-2">💡 PIN Tips:</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Use 4 digits you can remember easily</li>
              <li>• Don't use obvious PINs like 0000, 1234, or your birth year</li>
              <li>• You can change your PIN anytime from your profile</li>
              <li>• If you forget your PIN, you'll need to reset it from settings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
