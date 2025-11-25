import { ArrowLeft, Play, Download, Star, Tv } from 'lucide-react';
import type { Movie } from '../types/movie';

interface ViewAllScreenProps {
  title: string;
  emoji?: string;
  movies: Movie[];
  onWatch: (movie: Movie) => void;
  onDownload: (movie: Movie, type?: 'audio' | 'video') => void;
  onSeriesClick?: (movie: Movie) => void;
  onBack: () => void;
}

export function ViewAllScreen({ 
  title, 
  emoji,
  movies, 
  onWatch, 
  onDownload,
  onSeriesClick,
  onBack 
}: ViewAllScreenProps) {
  
  // Movies are ALREADY grouped when passed in - don't group again!
  // const groupedMovies = groupSeriesEpisodes(movies); // ❌ REMOVED
  const groupedMovies = movies; // ✅ Use as-is
  
  const handleItemClick = (movie: Movie) => {
    if (movie.type === 'series' && onSeriesClick) {
      onSeriesClick(movie);
    } else {
      onWatch(movie);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-black/95 backdrop-blur-xl border-b border-[#FFD700]/20">
        <div className="px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            {emoji && <span className="text-2xl mr-2">{emoji}</span>}
            {title}
          </h1>
        </div>
      </div>

      {/* Scrollable Movie List */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-6 space-y-4 pb-24">
          {groupedMovies.map((movie, index) => (
            <div 
              key={movie.id}
              className="flex gap-3 bg-gradient-to-r from-white/5 to-transparent rounded-xl p-3 border border-white/10 hover:border-[#FFD700]/30 transition-all"
            >
              {/* Rank Badge + Poster */}
              <div className="relative flex-shrink-0">
                {/* Rank Badge - Based on Activity */}
                {index < 10 && (
                  <div className="absolute -top-2 -left-2 z-10 bg-gradient-to-br from-[#FFD700] to-[#FF4500] rounded-lg px-2 py-1 shadow-lg">
                    <div className="text-sm font-black text-black leading-none">#{index + 1}</div>
                  </div>
                )}
                
                {/* Movie Poster */}
                <img
                  src={movie.thumbnailUrl}
                  alt={movie.title}
                  className="w-24 h-36 object-cover rounded-lg shadow-lg"
                  loading="lazy"
                />
              </div>

              {/* Movie Info */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                {/* Title & Rating */}
                <div>
                  <h3 className="text-base font-black text-white mb-1 line-clamp-1">
                    {movie.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1 bg-[#FFD700]/20 px-2 py-0.5 rounded">
                      <Star className="w-3 h-3 text-[#FFD700] fill-[#FFD700]" />
                      <span className="text-sm font-black text-[#FFD700]">{((movie as any).views || 0) + ((movie as any).downloads || 0)}</span>
                    </div>
                    <span className="text-xs text-gray-400">{movie.year}</span>
                    {movie.ageRating && (
                      <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-300 font-bold">
                        {movie.ageRating}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                    {movie.genre}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleItemClick(movie)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-black text-sm py-2.5 rounded-lg hover:shadow-lg hover:shadow-[#FFD700]/50 transition-all"
                  >
                    {movie.type === 'series' ? <Tv className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {movie.type === 'series' ? 'Watch Series' : 'Watch'}
                  </button>
                  <button
                    onClick={() => onDownload(movie, 'video')}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black text-sm py-2.5 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}

          {groupedMovies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No movies found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}