import React, { useRef } from 'react';
import { TrendingUp, Film, Tv, Music, Baby, Lock } from 'lucide-react';

interface TopCategoryTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  has18Plus?: boolean;
}

export function TopCategoryTabs({ activeTab, onTabChange, has18Plus = true }: TopCategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'trending', label: 'Trending', icon: TrendingUp, special: false },
    { id: 'movies', label: 'Movie', icon: Film, special: false },
    { id: 'series', label: 'Series', icon: Tv, special: false },
    { id: 'music', label: 'Music', icon: Music, special: false },
    { id: 'kids', label: 'Kids', icon: Baby, special: false },
    ...(has18Plus ? [{ id: '18+', label: '18+', icon: Lock, special: true }] : []),
  ];

  return (
    <div className="sticky top-[128px] md:top-[132px] z-[85] bg-black/95 backdrop-blur-xl border-b border-cyan-500/20">
      <div 
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-3"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                isActive
                  ? tab.special
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/50'
                    : tab.id === 'trending'
                    ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-purple-600 text-white shadow-lg shadow-orange-500/50'
                    : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/50'
                  : tab.special
                  ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                  : tab.id === 'trending'
                  ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}