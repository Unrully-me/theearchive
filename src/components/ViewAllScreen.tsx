import React from 'react';
import { ArrowLeft, Play, Download, Star, Tv } from 'lucide-react';
import { groupSeriesEpisodes } from '../utils/seriesGrouping';

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
  category?: 'movie' | 'series' | 'music';
  ageRating?: 'G' | 'PG' | 'PG-13' | 'R' | '18+' | 'Kids';
  section?: string;
  uploadedAt?: string;
  episodes?: any[];
}

interface ViewAllScreenProps {
  title: string;
  emoji?: string;
  movies: Movie[];
  onWatch: (movie: Movie) => void;
  onDownload: (movie: Movie) => void;
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
      <div className="flex-shrink-0 bg-gradient-to-b from-black via-purple-950/20 to-black backdrop-blur-xl border-b border-purple-500/20 shadow-lg shadow-purple-500/10">
        <div className="px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 border border-white/20 hover:border-purple-400/50 transition-all shadow-lg hover:shadow-purple-500/50"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-black bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent flex items-center gap-2 drop-shadow-lg">
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
              className="flex gap-3 bg-gradient-to-r from-white/5 via-purple-500/5 to-transparent rounded-2xl p-3 border border-white/10 hover:border-purple-400/30 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
            >
              {/* Rank Badge + Poster */}
              <div className="relative flex-shrink-0">
                {/* Rank Badge - Based on Activity */}
                {index < 10 && (
                  <div className="absolute -top-2 -left-2 z-10 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-lg px-2 py-1 shadow-lg shadow-purple-500/50 border border-purple-400/50">
                    <div className="text-sm font-black text-white leading-none">#{index + 1}</div>
                  </div>
                )}
                
                {/* Movie Poster */}
                <img
                  src={movie.thumbnailUrl}
                  alt={movie.title}
                  className="w-24 h-36 object-cover rounded-xl shadow-lg border border-white/10"
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
                    <div className="flex items-center gap-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 px-2 py-0.5 rounded-lg">
                      <Star className="w-3 h-3 text-purple-400 fill-purple-400" />
                      <span className="text-sm font-black text-purple-300">{((movie as any).views || 0) + ((movie as any).downloads || 0)}</span>
                    </div>
                    <span className="text-xs text-gray-400">{movie.year}</span>
                    {movie.ageRating && (
                      <span className="text-xs bg-white/10 px-2 py-0.5 rounded-lg text-gray-300 font-bold border border-white/20">
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
                    className={`${movie.type === 'series' && movie.episodes && movie.episodes.length > 0 ? 'flex-1' : 'flex-1'} flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white font-black text-sm py-2.5 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all border border-white/20`}
                  >
                    {movie.type === 'series' ? <Tv className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {movie.type === 'series' ? 'View Episodes' : 'Watch'}
                  </button>
                  {/* Only show download for non-series or series without episodes */}
                  {(!movie.type || movie.type !== 'series' || !movie.episodes || movie.episodes.length === 0) && (
                    <button
                      onClick={() => onDownload(movie)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-sm py-2.5 rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all border border-white/20"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  )}
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