import React, { useRef } from 'react';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { MovieCard } from './MovieCard';

interface Movie {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  genre: string;
  year: string;
  type: string;
  fileSize?: string;
  category: 'movie' | 'series' | 'music';
  ageRating: 'G' | 'PG' | 'PG-13' | 'R' | '18+' | 'Kids';
  section: 'home' | 'movies' | 'series' | '18+' | 'kido' | 'music';
  season?: string;
  episode?: string;
  seriesId?: string;
  uploadedAt?: string;
}

interface SectionWithAllProps {
  title: string;
  emoji?: string;
  movies: Movie[];
  onWatch: (movie: Movie) => void;
  onDownload: (movie: Movie, type?: 'audio' | 'video') => void;
  onMusicClick: (movie: Movie) => void;
  onSeriesClick?: (movie: Movie) => void;
  onViewAll?: () => void;
}

export function SectionWithAll({ 
  title, 
  emoji,
  movies, 
  onWatch, 
  onDownload, 
  onMusicClick,
  onSeriesClick,
  onViewAll 
}: SectionWithAllProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (movies.length === 0) return null;

  return (
    <div className="mb-10 relative group/section">
      {/* Section Header with Premium Design */}
      <div className="px-4 mb-4 flex items-center justify-between relative">
        {/* Animated underline glow */}
        <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent opacity-0 group-hover/section:opacity-100 transition-opacity duration-500" />
        
        <div className="flex items-center gap-3 relative z-10">
          {/* Emoji with glow effect */}
          {emoji && (
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-[#FFD700]/30 scale-150" />
              <span className="relative text-2xl">{emoji}</span>
            </div>
          )}
          
          {/* Title with gradient and glow */}
          <h2 className="relative">
            <span className="absolute inset-0 blur-lg bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF4500] opacity-20" />
            <span className="relative text-xl sm:text-2xl font-black bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">
              {title}
            </span>
          </h2>
          
          {/* Sparkle icon */}
          <Sparkles className="w-4 h-4 text-[#FFD700] animate-pulse" />
        </div>
        
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="group/btn flex items-center gap-1 px-4 py-2 rounded-full bg-gradient-to-r from-white/5 to-white/10 hover:from-[#FFD700]/20 hover:to-[#FFA500]/20 border border-white/10 hover:border-[#FFD700]/50 transition-all duration-300 relative overflow-hidden"
          >
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/0 via-[#FFD700]/20 to-[#FFD700]/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
            
            <span className="relative text-sm font-bold text-gray-400 group-hover/btn:text-[#FFD700] transition-colors">
              View All
            </span>
            <ChevronRight className="relative w-4 h-4 text-gray-400 group-hover/btn:text-[#FFD700] group-hover/btn:translate-x-1 transition-all" />
          </button>
        )}
      </div>

      {/* Horizontal Scrolling Container with Enhanced Design */}
      <div className="relative group/scroll">
        {/* Left gradient fade */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none opacity-0 group-hover/scroll:opacity-100 transition-opacity" />
        
        {/* Right gradient fade */}
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none opacity-0 group-hover/scroll:opacity-100 transition-opacity" />
        
        {/* Left scroll button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/80 backdrop-blur-xl border border-white/20 flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 hover:bg-[#FFD700] hover:border-[#FFD700] hover:scale-110 transition-all duration-300 shadow-2xl"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        
        {/* Right scroll button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/80 backdrop-blur-xl border border-white/20 flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 hover:bg-[#FFD700] hover:border-[#FFD700] hover:scale-110 transition-all duration-300 shadow-2xl"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 py-2 scroll-smooth"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie as any}
              onWatch={onWatch}
              onDownload={onDownload}
              onMusicClick={onMusicClick}
              onSeriesClick={onSeriesClick}
            />
          ))}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
