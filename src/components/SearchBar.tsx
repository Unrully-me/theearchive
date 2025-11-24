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
    <div className="sticky top-0 z-50 px-4 py-4 bg-black/95 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700]/50 transition-all backdrop-blur-md"
          />
        </div>

        {/* Search Button (visible when typing) */}
        {value && onSearch && (
          <button
            onClick={onSearch}
            className="px-4 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-black text-sm rounded-xl hover:shadow-lg hover:shadow-[#FFD700]/50 transition-all"
          >
            Search
          </button>
        )}
      </div>
    </div>
  );
}