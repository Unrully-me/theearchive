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
    <div className="sticky top-[68px] z-40 bg-black/95 backdrop-blur-xl border-b border-[#FFD700]/10">
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
                    : 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black shadow-lg shadow-[#FFD700]/50'
                  : tab.special
                  ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
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