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
    console.log('🎯 MovieCard handlePrimaryClick:', movie.title, '| isMusic:', isMusic, '| isSeries:', isSeries, '| ageRating:', movie.ageRating);
    console.log('📹 Movie has videoUrl:', !!movie.videoUrl, '| URL:', movie.videoUrl?.substring(0, 50));
    
    if (isMusic) {
      console.log('🎵 Calling onMusicClick for:', movie.title);
      onMusicClick(movie);
    } else if (isSeries && onSeriesClick) {
      console.log('📺 Calling onSeriesClick for:', movie.title);
      onSeriesClick(movie);
    } else {
      console.log('🎬 Calling onWatch for:', movie.title, '| AgeRating:', movie.ageRating);
      onWatch(movie);
    }
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('🎯 MovieCard Download Button Clicked!');
    console.log('🎯 Movie:', movie.title);
    console.log('🎯 Movie ID:', movie.id);
    console.log('🎯 Movie Type:', movie.type);
    console.log('🎯 Has Episodes:', movie.episodes?.length || 0);
    console.log('🎯 Video URL:', movie.videoUrl);
    console.log('🎯 Video URL exists:', !!movie.videoUrl);
    console.log('🎯 Calling onDownload...');
    onDownload(movie);
    console.log('🎯 onDownload called successfully');
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Ignore if clicking on a button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    // Show overlay for more options (both mobile and desktop)
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
    <div className="group relative w-[160px] sm:w-[180px] flex-shrink-0">
      {/* Main Card Container - Modern Style */}
      <div 
        onClick={handleCardClick}
        className="movie-card-container relative aspect-[2/3] rounded-2xl overflow-hidden mb-3 cursor-pointer transform transition-all duration-500 ease-out group-hover:scale-[1.08] group-hover:z-10"
      >
        {/* Movie Poster */}
        {movie.thumbnailUrl && !imageError ? (
          <img
            src={movie.thumbnailUrl}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900 via-gray-900 to-black flex items-center justify-center">
            {isMusic ? (
              <Music className="w-14 h-14 text-purple-500/50" />
            ) : isSeries ? (
              <Tv className="w-14 h-14 text-purple-500/50" />
            ) : (
              <Film className="w-14 h-14 text-purple-500/50" />
            )}
          </div>
        )}
        
        {/* Modern Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none" />
        
        {/* Glassmorphism Border Glow */}
        <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-orange-500/50 group-hover:shadow-lg group-hover:shadow-orange-500/30 transition-all duration-300 pointer-events-none" />
        
        {/* Age Rating Badge - Modern Pill */}
        {movie.ageRating && (
          <div className="absolute top-3 left-3 z-30">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black backdrop-blur-xl border shadow-lg ${
              movie.ageRating === '18+' 
                ? 'bg-red-500/90 border-red-400/50 text-white shadow-red-500/50' 
                : movie.ageRating === 'Kids'
                ? 'bg-green-500/90 border-green-400/50 text-white shadow-green-500/50'
                : 'bg-purple-500/90 border-purple-400/50 text-white shadow-purple-500/50'
            }`}>
              {movie.ageRating}
            </span>
          </div>
        )}
        
        {/* Series Episode Count - Modern Badge */}
        {isSeries && movie.episodes && movie.episodes.length > 0 && (
          <div className="absolute top-3 right-3 z-30">
            <span className="px-3 py-1 rounded-full text-[10px] font-black backdrop-blur-xl bg-gradient-to-r from-purple-600/90 to-pink-600/90 border border-purple-400/50 text-white flex items-center gap-1.5 shadow-lg shadow-purple-500/50">
              <Tv className="w-3 h-3" />
              {movie.episodes.length}
            </span>
          </div>
        )}

        {/* QUICK DOWNLOAD BUTTON - ALWAYS VISIBLE (non-series only) */}
        {(!isSeries || !movie.episodes || movie.episodes.length === 0) && (
          <button
            onClick={handleDownloadClick}
            className="absolute bottom-3 right-3 z-30 w-10 h-10 rounded-full bg-cyan-500/90 hover:bg-cyan-400 backdrop-blur-xl border border-cyan-400/50 shadow-lg shadow-cyan-500/50 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <Download className="w-5 h-5 text-white" strokeWidth={2.5} />
          </button>
        )}

        {/* Hover/Tap Overlay - CLEAN & REAL */}
        <div className={`absolute inset-0 backdrop-blur-md bg-gradient-to-b from-black/80 via-black/90 to-black/95 transition-all duration-300 ease-out z-20 ${showOverlay ? 'overlay-visible' : 'overlay-hidden'}`}>
          <div className="h-full flex flex-col items-center justify-center p-5 gap-4">
            
            {/* WATCH BUTTON - Clean & Real */}
            <button
              onClick={handlePrimaryClick}
              className="group/btn relative rounded-full bg-white hover:bg-white/90 text-black font-bold text-sm py-3 px-6 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center gap-2"
            >
              {isMusic ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                    <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                  </div>
                  <span>Play</span>
                </>
              ) : isSeries ? (
                <>
                  <Tv className="w-4 h-4" />
                  <span>View Episodes</span>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                    <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                  </div>
                  <span>Play</span>
                </>
              )}
            </button>

            {/* Movie Info */}
            <div className="text-center space-y-2 px-4">
              <h3 className="text-white font-bold text-sm line-clamp-2">{movie.title}</h3>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <span>{movie.year}</span>
                <span>•</span>
                <span>{movie.genre}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Play Hint (Desktop Only) */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 hidden sm:block">
          <div className="flex items-center justify-center gap-1.5 text-white/90">
            <Info className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] font-bold">Click for options</span>
          </div>
        </div>
      </div>

      {/* Title Section - Modern Typography */}
      <div className="px-1 space-y-1">
        <h3 className="text-white text-sm font-black line-clamp-2 leading-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-300">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-purple-400 font-bold">{movie.year}</span>
          <span className="text-gray-700">•</span>
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
          animation: slideIn 0.25s ease-out;
        }
        
        .group:hover .overlay-hidden {
          opacity: 1;
          pointer-events: auto;
        }

        /* Modern card shadow */
        .movie-card-container {
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
        }

        .group:hover .movie-card-container {
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.7),
            0 0 0 1px rgba(168, 85, 247, 0.4),
            0 0 60px rgba(168, 85, 247, 0.3);
        }
      `}</style>
    </div>
  );
}