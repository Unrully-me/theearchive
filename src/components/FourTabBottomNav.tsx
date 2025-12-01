import React from 'react';
import { Home, Baby, Music2, Zap, Film, User } from 'lucide-react';
import { MuZIkiLogo } from './MuZIkiLogo';

interface FourTabBottomNavProps {
  activeTab: 'home' | 'browse' | 'kido' | 'music';
  onTabChange: (tab: 'home' | 'browse' | 'kido' | 'music') => void;
  isMusicPlaying?: boolean;
  onShortsClick?: () => void;
}

export function FourTabBottomNav({ activeTab, onTabChange, isMusicPlaying = false, onShortsClick }: FourTabBottomNavProps) {
  return (
    <>
      {/* Bottom Navigation - Fixed (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-2xl border-t border-purple-500/20 pb-safe">
        <div className="relative px-2 py-2">
          <div className="flex items-end justify-around">
            {/* Home */}
            <button
              onClick={() => onTabChange('home')}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 ${
                activeTab === 'home' ? 'bg-gradient-to-t from-purple-600/20 to-transparent' : ''
              }`}
            >
              <div className="relative">
                <Home 
                  className={`w-6 h-6 transition-all ${
                    activeTab === 'home' ? 'text-purple-400 scale-110' : 'text-gray-400'
                  }`} 
                />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                activeTab === 'home' ? 'text-purple-400' : 'text-gray-400'
              }`}>
                Home
              </span>
              {activeTab === 'home' && (
                <div className="w-1 h-1 rounded-full bg-purple-400" />
              )}
            </button>

            {/* Browse */}
            <button
              onClick={() => onTabChange('browse')}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 ${
                activeTab === 'browse' ? 'bg-gradient-to-t from-cyan-600/20 to-transparent' : ''
              }`}
            >
              <div className="relative">
                <Zap 
                  className={`w-6 h-6 transition-all ${
                    activeTab === 'browse' ? 'text-cyan-400 scale-110' : 'text-gray-400'
                  }`} 
                />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                activeTab === 'browse' ? 'text-cyan-400' : 'text-gray-400'
              }`}>
                Browse
              </span>
              {activeTab === 'browse' && (
                <div className="w-1 h-1 rounded-full bg-cyan-400" />
              )}
            </button>

            {/* SHORTS - BIG CENTER BUTTON */}
            <button
              onClick={onShortsClick}
              className="relative -mt-8 flex items-center justify-center mx-2"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-orange-500/40 via-purple-600/20 to-transparent rounded-full blur-2xl scale-150" />
              
              {/* Main button */}
              <div className="relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 bg-gradient-to-br from-purple-600 via-orange-500 to-pink-500 shadow-xl shadow-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/70 hover:scale-110">
                {/* Inner circle for depth */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
                
                {/* Rotating border */}
                <div className="absolute -inset-1 rounded-full border-2 border-orange-400/60 animate-spin" style={{ animationDuration: '3s' }} />
                
                {/* Film Icon */}
                <Film className="relative z-10 w-8 h-8 text-white" />
              </div>
              
              {/* Label below */}
              <span className="absolute -bottom-5 text-[10px] font-black uppercase tracking-wider text-orange-400">
                SHORTS
              </span>
            </button>

            {/* KIDo */}
            <button
              onClick={() => onTabChange('kido')}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 ${
                activeTab === 'kido' ? 'bg-gradient-to-t from-purple-600/20 to-transparent' : ''
              }`}
            >
              <div className="relative">
                <Baby 
                  className={`w-6 h-6 transition-all ${
                    activeTab === 'kido' ? 'text-purple-400 scale-110' : 'text-gray-400'
                  }`} 
                />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                activeTab === 'kido' ? 'text-purple-400' : 'text-gray-400'
              }`}>
                KIDo
              </span>
              {activeTab === 'kido' && (
                <div className="w-1 h-1 rounded-full bg-purple-400" />
              )}
            </button>

            {/* Music */}
            <button
              onClick={() => onTabChange('music')}
              className={`relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 ${
                activeTab === 'music' ? 'bg-gradient-to-t from-green-500/20 to-transparent' : ''
              }`}
            >
              {/* Music playing indicator badge */}
              {isMusicPlaying && activeTab !== 'music' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse z-10">
                  <div className="absolute inset-0 bg-green-500 rounded-full animate-ping" />
                </div>
              )}
              
              <div className="relative">
                {/* Custom muZIki Logo */}
                <MuZIkiLogo 
                  className={`w-6 h-6 transition-all ${
                    activeTab === 'music' ? 'scale-110' : ''
                  }`}
                  isActive={activeTab === 'music'}
                />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                activeTab === 'music' ? 'text-green-400' : isMusicPlaying ? 'text-green-500' : 'text-gray-400'
              }`}>
                muZIki
              </span>
              {activeTab === 'music' && (
                <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
              )}
              {isMusicPlaying && activeTab !== 'music' && (
                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Spacer for bottom nav */}
      <div className="md:hidden h-20" />

      <style>{`
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .pb-safe {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>
    </>
  );
}