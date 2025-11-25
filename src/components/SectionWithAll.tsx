import { useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { MovieCard } from './MovieCard';
import type { Movie } from '../types/movie';


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
    <div className="mb-6">
      {/* Section Header with "All >" button */}
      <div className="px-4 mb-3 flex items-center justify-between">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          {emoji && <span className="text-2xl">{emoji}</span>}
          {title}
        </h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-sm font-bold text-gray-400 hover:text-[#FFD700] transition-colors"
          >
            All
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Horizontal Scrolling Container */}
      <div className="relative">
        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {movies.map((movie) => (
            <div key={movie.id} style={{ scrollSnapAlign: 'start' }}>
              <MovieCard
                movie={movie}
                onWatch={onWatch}
                onDownload={onDownload}
                onMusicClick={onMusicClick}
                onSeriesClick={onSeriesClick}
              />
            </div>
          ))}
        </div>

        {/* Desktop Navigation Arrows */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center bg-black/80 hover:bg-black rounded-full opacity-0 group-hover:opacity-100 transition-all z-10 border border-white/20"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center bg-black/80 hover:bg-black rounded-full opacity-0 group-hover:opacity-100 transition-all z-10 border border-white/20"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
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