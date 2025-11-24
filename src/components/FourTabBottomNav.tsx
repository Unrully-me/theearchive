import React from 'react';
import { Home, AlertCircle, Baby, Music2, Globe } from 'lucide-react';
import { MuZIkiLogo } from './MuZIkiLogo';

interface FourTabBottomNavProps {
  activeTab: 'home' | '18plus' | 'browse' | 'kido' | 'music';
  onTabChange: (tab: 'home' | '18plus' | 'browse' | 'kido' | 'music') => void;
  isMusicPlaying?: boolean;
}

export function FourTabBottomNav({ activeTab, onTabChange, isMusicPlaying = false }: FourTabBottomNavProps) {
  const sideTabs = [
    { id: 'home' as const, icon: Home, label: 'Home' },
    { id: '18plus' as const, icon: AlertCircle, label: '18+', special: true },
    // Browse is in the middle as a big button
    { id: 'kido' as const, icon: Baby, label: 'KIDo' },
    { id: 'music' as const, icon: Music2, label: 'muZIki' },
  ];

  return (
    <>
      {/* Bottom Navigation - Fixed (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-2xl border-t border-[#FFD700]/20 pb-safe">
        <div className="relative px-2 py-2">
          <div className="grid grid-cols-5 gap-2">
            {/* Home */}
            {(() => {
              const tab = sideTabs[0];
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl transition-all duration-300 ${
                    isActive ? 'bg-gradient-to-t from-[#FFD700]/20 to-transparent' : ''
                  }`}
                >
                  <div className="relative">
                    <Icon 
                      className={`w-6 h-6 transition-all ${
                        isActive ? 'text-[#FFD700] scale-110' : 'text-gray-400'
                      }`} 
                    />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isActive ? 'text-[#FFD700]' : 'text-gray-400'
                  }`}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <div className="w-1 h-1 rounded-full bg-[#FFD700]" />
                  )}
                </button>
              );
            })()}

            {/* 18+ */}
            {(() => {
              const tab = sideTabs[1];
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl transition-all duration-300 ${
                    isActive ? 'bg-gradient-to-t from-red-600/30 to-transparent' : ''
                  }`}
                >
                  <div className="relative">
                    {tab.special && (
                      <div className="absolute inset-0 bg-red-500/20 rounded-full blur-md animate-pulse" />
                    )}
                    <Icon 
                      className={`w-6 h-6 transition-all ${
                        isActive ? 'text-red-500 scale-110' : 'text-red-400'
                      }`} 
                    />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isActive ? 'text-red-500' : 'text-red-400'
                  }`}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <div className="w-1 h-1 rounded-full bg-red-500" />
                  )}
                </button>
              );
            })()}

            {/* BROWSE - BIG CENTER BUTTON */}
            <button
              onClick={() => onTabChange('browse')}
              className="relative -mt-8 flex items-center justify-center"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#FFD700]/30 via-[#FFD700]/10 to-transparent rounded-full blur-2xl scale-150" />
              
              {/* Main button */}
              <div className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                activeTab === 'browse'
                  ? 'bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF8C00] shadow-2xl shadow-[#FFD700]/50 scale-110'
                  : 'bg-gradient-to-br from-[#FFD700]/90 via-[#FFA500]/90 to-[#FF8C00]/90 shadow-xl shadow-[#FFD700]/30'
              }`}>
                {/* Inner circle for depth */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
                
                {/* Rotating border */}
                {activeTab === 'browse' && (
                  <div className="absolute -inset-1 rounded-full border-2 border-[#FFD700]/50 animate-spin" style={{ animationDuration: '3s' }} />
                )}
                
                {/* Globe icon */}
                <Globe 
                  className={`w-8 h-8 transition-all relative z-10 ${
                    activeTab === 'browse' ? 'text-black scale-110' : 'text-black/90'
                  }`}
                  strokeWidth={2.5}
                />
              </div>
              
              {/* Label below */}
              <span className={`absolute -bottom-5 text-[10px] font-black uppercase tracking-wider transition-all ${
                activeTab === 'browse' ? 'text-[#FFD700] scale-110' : 'text-gray-400'
              }`}>
                Browse
              </span>
            </button>

            {/* KIDo */}
            {(() => {
              const tab = sideTabs[2];
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl transition-all duration-300 ${
                    isActive ? 'bg-gradient-to-t from-[#FFD700]/20 to-transparent' : ''
                  }`}
                >
                  <div className="relative">
                    <Icon 
                      className={`w-6 h-6 transition-all ${
                        isActive ? 'text-[#FFD700] scale-110' : 'text-gray-400'
                      }`} 
                    />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isActive ? 'text-[#FFD700]' : 'text-gray-400'
                  }`}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <div className="w-1 h-1 rounded-full bg-[#FFD700]" />
                  )}
                </button>
              );
            })()}

            {/* Music */}
            {(() => {
              const tab = sideTabs[3];
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl transition-all duration-300 ${
                    isActive ? 'bg-gradient-to-t from-green-500/20 to-transparent' : ''
                  }`}
                >
                  {/* Music playing indicator badge */}
                  {isMusicPlaying && !isActive && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse z-10">
                      <div className="absolute inset-0 bg-green-500 rounded-full animate-ping" />
                    </div>
                  )}
                  
                  <div className="relative">
                    {/* Custom muZIki Logo */}
                    <MuZIkiLogo 
                      className={`w-6 h-6 transition-all ${
                        isActive ? 'scale-110' : ''
                      }`}
                      isActive={isActive}
                    />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isActive ? 'text-green-400' : isMusicPlaying ? 'text-green-500' : 'text-gray-400'
                  }`}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                  )}
                  {isMusicPlaying && !isActive && (
                    <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                  )}
                </button>
              );
            })()}
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