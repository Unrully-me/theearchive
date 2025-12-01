import React from 'react';
import { Play, Download, Music, Film, Tv } from 'lucide-react';

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
  
  const handlePrimaryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('🎯 MovieCard handlePrimaryClick:', movie.title, '| isMusic:', isMusic, '| isSeries:', isSeries);
    
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

  return (
    <div className="group relative w-[140px] sm:w-[160px] flex-shrink-0">
      {/* Netflix-style Card */}
      <div 
        onClick={handlePrimaryClick}
        className="netflix-card relative aspect-[2/3] mb-2 cursor-pointer"
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
          <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
            {isMusic ? (
              <Music className="w-12 h-12 text-gray-600" />
            ) : isSeries ? (
              <Tv className="w-12 h-12 text-gray-600" />
            ) : (
              <Film className="w-12 h-12 text-gray-600" />
            )}
          </div>
        )}
        
        {/* Dark gradient overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        
        {/* Age Rating Badge */}
        {movie.ageRating && (
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ 
              movie.ageRating === '18+' 
                ? 'bg-red-600 text-white' 
                : movie.ageRating === 'Kids'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-white'
            }`}>
              {movie.ageRating}
            </span>
          </div>
        )}
        
        {/* Series Episode Count */}
        {isSeries && movie.episodes && movie.episodes.length > 0 && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#7c3aed] text-white flex items-center gap-1">
              <Tv className="w-3 h-3" />
              {movie.episodes.length}
            </span>
          </div>
        )}

        {/* Download Button */}
        {(!isSeries || !movie.episodes || movie.episodes.length === 0) && (
          <button
            onClick={handleDownloadClick}
            className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
          >
            <Download className="w-4 h-4 text-black" strokeWidth={2.5} />
          </button>
        )}

        {/* Play Button (center on hover) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handlePrimaryClick}
            className="w-12 h-12 rounded-full bg-white hover:bg-white/90 flex items-center justify-center transition-transform hover:scale-110"
          >
            {isMusic || !isSeries ? (
              <Play className="w-5 h-5 text-black fill-black ml-0.5" />
            ) : (
              <Tv className="w-5 h-5 text-black" />
            )}
          </button>
        </div>
      </div>

      {/* Title - Clean and simple */}
      <div className="px-0.5">
        <h3 className="text-white text-sm line-clamp-2 leading-tight mb-1">
          {movie.title}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span>{movie.year}</span>
          <span>•</span>
          <span className="truncate">{movie.genre}</span>
        </div>
      </div>
    </div>
  );
}
