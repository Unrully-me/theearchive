import React from 'react';
import { Play, Download, Music, Film, Tv, Info } from 'lucide-react';

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

interface MovieCardProps {
  movie: Movie;
  onWatch: (movie: Movie) => void;
  onDownload: (movie: Movie, type?: 'audio' | 'video') => void;
  onMusicClick: (movie: Movie) => void;
  onSeriesClick?: (movie: Movie) => void;
}

export function MovieCard({ movie, onWatch, onDownload, onMusicClick, onSeriesClick }: MovieCardProps) {
  const isMusic = movie.category === 'music';
  const isSeries = movie.type === 'series';
  const [imageError, setImageError] = React.useState(false);
  const [showOverlay, setShowOverlay] = React.useState(false);
  
  const handlePrimaryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMusic) {
      onMusicClick(movie);
    } else if (isSeries && onSeriesClick) {
      onSeriesClick(movie);
    } else {
      onWatch(movie);
    }
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload(movie);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (showOverlay || (e.target as HTMLElement).closest('button')) {
      return;
    }
    setShowOverlay(true);
  };

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showOverlay && !target.closest('.movie-card-container')) {
        setShowOverlay(false);
      }
    };

    const handleScroll = () => {
      if (showOverlay) {
        setShowOverlay(false);
      }
    };

    if (showOverlay) {
      document.addEventListener('click', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      return () => {
        document.removeEventListener('click', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [showOverlay]);

  return (
    <div className="group relative w-[140px] sm:w-[160px] flex-shrink-0">
      {/* Main Card Container */}
      <div 
        onClick={handleCardClick}
        className="movie-card-container relative aspect-[2/3] rounded-lg overflow-hidden mb-3 cursor-pointer transform transition-all duration-300 ease-out group-hover:scale-105 group-hover:z-10"
      >
        {/* Movie Poster */}
        {movie.thumbnailUrl && !imageError ? (
          <img
            src={movie.thumbnailUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center">
            {isMusic ? (
              <Music className="w-12 h-12 text-gray-600" />
            ) : isSeries ? (
              <Tv className="w-12 h-12 text-gray-600" />
            ) : (
              <Film className="w-12 h-12 text-gray-600" />
            )}
          </div>
        )}
        
        {/* Bottom Gradient (Always Visible) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
        
        {/* Age Rating Badge */}
        {movie.ageRating && (
          <div className="absolute top-2 left-2 z-30">
            <span className={`px-2 py-0.5 rounded text-[9px] font-black backdrop-blur-md ${
              movie.ageRating === '18+' 
                ? 'bg-red-600/95 text-white' 
                : movie.ageRating === 'Kids'
                ? 'bg-green-600/95 text-white'
                : 'bg-yellow-500/95 text-black'
            }`}>
              {movie.ageRating}
            </span>
          </div>
        )}
        
        {/* Series Episode Count */}
        {isSeries && movie.episodes && movie.episodes.length > 0 && (
          <div className="absolute top-2 right-2 z-30">
            <span className="px-2 py-0.5 rounded text-[9px] font-black backdrop-blur-md bg-purple-600/95 text-white flex items-center gap-1">
              <Tv className="w-2.5 h-2.5" />
              {movie.episodes.length}
            </span>
          </div>
        )}

        {/* Hover/Tap Overlay */}
        <div className={`absolute inset-0 bg-black/95 backdrop-blur-sm transition-all duration-300 ease-out z-20 ${showOverlay ? 'overlay-visible' : 'overlay-hidden'}`}>
          <div className="h-full flex flex-col items-center justify-center p-3 gap-2">
            
            {/* Primary Action Button */}
            <button
              onClick={handlePrimaryClick}
              className="w-full group/btn relative overflow-hidden rounded-full bg-white hover:bg-[#FFD700] text-black font-bold text-sm py-3 px-4 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-[#FFD700]/50"
            >
              <div className="flex items-center justify-center gap-2">
                {isMusic ? (
                  <>
                    <div className="w-5 h-5 rounded-full bg-black/90 flex items-center justify-center">
                      <Play className="w-3 h-3 text-white fill-white" />
                    </div>
                    <span>Play</span>
                  </>
                ) : isSeries ? (
                  <>
                    <Tv className="w-4 h-4" />
                    <span>Episodes</span>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-full bg-black/90 flex items-center justify-center">
                      <Play className="w-3 h-3 text-white fill-white" />
                    </div>
                    <span>Play</span>
                  </>
                )}
              </div>
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownloadClick}
              className="w-full rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-xs py-2.5 px-4 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-center gap-2">
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </div>
            </button>

            {/* Movie Info */}
            <div className="w-full mt-1 space-y-1">
              <div className="flex items-center justify-center gap-2 text-[10px]">
                <span className="text-[#FFD700] font-bold">{movie.year}</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400 font-medium truncate max-w-[80px]">{movie.genre}</span>
              </div>
              
              {movie.fileSize && (
                <div className="text-center">
                  <span className="text-[9px] text-gray-500 font-medium">{movie.fileSize}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Action Hint (Desktop Only - Shows on Hover) */}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 hidden sm:block">
          <div className="flex items-center justify-center gap-1 text-white/80">
            <Info className="w-3 h-3" />
            <span className="text-[9px] font-medium">Click for options</span>
          </div>
        </div>
      </div>

      {/* Title Section */}
      <div className="px-1">
        <h3 className="text-white text-xs font-bold line-clamp-2 mb-1 leading-tight group-hover:text-[#FFD700] transition-colors duration-300">
          {movie.title}
        </h3>
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="text-[#FFD700]/80 font-semibold">{movie.year}</span>
          <span className="text-gray-600">•</span>
          <span className="text-gray-500 truncate font-medium">{movie.genre}</span>
        </div>
      </div>
      
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .overlay-hidden {
          opacity: 0;
          pointer-events: none;
        }
        
        .overlay-visible {
          opacity: 1 !important;
          pointer-events: auto;
          animation: slideIn 0.2s ease-out;
        }
        
        .group:hover .overlay-hidden {
          opacity: 1;
          pointer-events: auto;
        }

        /* Smooth transform on card */
        .movie-card-container {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }

        .group:hover .movie-card-container {
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 215, 0, 0.3);
        }

        /* Button animations */
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
          }
          50% {
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
          }
        }
      `}</style>
    </div>
  );
}
