import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, onSearch, placeholder = "Search movies, series, music..." }: SearchBarProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  return (
    <div className="sticky top-[60px] md:top-[64px] z-[90] px-4 py-4 bg-black/95 backdrop-blur-xl border-b border-cyan-500/20">
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full bg-white/10 border border-cyan-500/30 rounded-xl pl-11 pr-4 py-3 text-white placeholder-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-orange-400/60 focus:border-orange-400/60 transition-all backdrop-blur-md shadow-lg shadow-cyan-500/10 focus:shadow-orange-500/30"
          />
        </div>

        {/* Search Button (visible when typing) */}
        {value && onSearch && (
          <button
            onClick={onSearch}
            className="px-4 py-3 bg-gradient-to-r from-orange-500 via-purple-600 to-cyan-500 text-white font-black text-sm rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all hover:scale-105"
          >
            Search
          </button>
        )}
      </div>
    </div>
  );
}