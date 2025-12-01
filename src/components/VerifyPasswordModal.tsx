import React, { useState } from 'react';
import { Lock, X, ShieldCheck } from 'lucide-react';

interface VerifyPasswordModalProps {
  onClose: () => void;
  onVerified: () => void;
  userEmail: string;
}

export function VerifyPasswordModal({ onClose, onVerified, userEmail }: VerifyPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    setError('');
    setIsVerifying(true);

    if (!password.trim()) {
      setError('Please enter your password!');
      setIsVerifying(false);
      return;
    }

    try {
      // Verify password with Supabase Auth
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4d451974/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          email: userEmail,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok && data.verified) {
        // Password verified successfully
        onVerified();
      } else {
        setError(data.error || 'Incorrect password. Please try again.');
      }
    } catch (err) {
      console.error('Password verification error:', err);
      setError('Failed to verify password. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
      <div className="w-full max-w-md bg-gradient-to-br from-gray-900 to-black rounded-2xl border-2 border-[#FFD700]/30 overflow-hidden animate-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-black">
                  Verify Your Identity
                </h2>
                <p className="text-sm text-black/70">Security verification required</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-black/20 hover:bg-black/30 flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5 text-black" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-xl p-4">
            <p className="text-sm text-[#FFD700]">
              <strong>🔐 Security Check:</strong> To change your 18+ PIN, please enter your THEE ARCHIVE account password for verification.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs text-gray-400">
              <strong>Account:</strong> <span className="text-white">{userEmail}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">
              Enter Your Account Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && password.trim()) {
                  handleVerify();
                }
              }}
              placeholder="Enter password..."
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 text-lg font-medium"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 animate-shake">
              <p className="text-sm text-red-400 font-bold">❌ {error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleVerify}
              disabled={!password.trim() || isVerifying}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-black rounded-xl hover:shadow-lg hover:shadow-[#FFD700]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <div className="w-5 h-5 inline-block border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 inline mr-2" />
                  Verify Password
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isVerifying}
              className="px-6 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-2">🔒 Why do we need this?</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Prevents unauthorized PIN changes if someone gets your device</li>
              <li>• Protects your 18+ content from being accessed by others</li>
              <li>• Ensures only you can modify your security settings</li>
              <li>• Required by THEE ARCHIVE security policy</li>
            </ul>
          </div>
        </div>

        <style>{`
          @keyframes animate-in {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }
          .animate-in {
            animation: animate-in 0.3s ease-out;
          }
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
        `}</style>
      </div>
    </div>
  );
}

// Import these at the top of the component file (for the API calls)
import { projectId, publicAnonKey } from '../utils/supabase/info';
