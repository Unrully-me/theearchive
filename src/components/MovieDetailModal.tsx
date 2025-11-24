import React from 'react';
import { X, Play, Download, Star, Clock, Calendar, Film, Tv } from 'lucide-react';

interface Movie {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  genre?: string;
  year?: string;
  type?: 'movie' | 'series' | 'documentary';
  fileSize?: string;
  ageRating?: string;
  category?: string;
  seriesTitle?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  uploadedAt?: string;
}

interface MovieDetailModalProps {
  movie: Movie;
  onClose: () => void;
  onWatch: (movie: Movie) => void;
  onDownload: (movie: Movie) => void;
}

export function MovieDetailModal({ movie, onClose, onWatch, onDownload }: MovieDetailModalProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-card rounded-3xl border-2 border-[#FFD700]/30 animate-slide-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-all group"
        >
          <X className="w-6 h-6 text-white group-hover:text-[#FFD700]" strokeWidth={2.5} />
        </button>

        {/* Hero Image */}
        <div className="relative h-[40vh] md:h-[50vh] overflow-hidden rounded-t-3xl">
          {movie.thumbnailUrl ? (
            <img
              src={movie.thumbnailUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
              <Film className="w-24 h-24 text-gray-600" />
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          
          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-center gap-3 mb-4">
              {movie.type === 'series' ? (
                <Tv className="w-8 h-8 text-[#FFD700]" strokeWidth={2.5} />
              ) : (
                <Film className="w-8 h-8 text-[#FFD700]" strokeWidth={2.5} />
              )}
              <h1 className="text-4xl md:text-5xl font-black text-white gradient-gold">
                {movie.title}
              </h1>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onWatch(movie)}
                className="px-8 py-4 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-black text-lg rounded-2xl hover:shadow-xl hover:shadow-[#FFD700]/50 transition-all flex items-center gap-3"
              >
                <Play className="w-6 h-6" fill="currentColor" />
                WATCH NOW
              </button>
              
              <button
                onClick={() => onDownload(movie)}
                className="px-8 py-4 glass-card glass-card-hover rounded-2xl font-black text-white text-lg flex items-center gap-3"
              >
                <Download className="w-6 h-6" strokeWidth={2.5} />
                DOWNLOAD
              </button>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-8 space-y-6">
          {/* Meta Information */}
          <div className="flex flex-wrap gap-4">
            {movie.year && (
              <div className="flex items-center gap-2 text-gray-300">
                <Calendar className="w-5 h-5 text-[#FFD700]" />
                <span className="font-bold">{movie.year}</span>
              </div>
            )}
            
            {movie.fileSize && (
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="w-5 h-5 text-[#FFD700]" />
                <span className="font-bold">{movie.fileSize}</span>
              </div>
            )}
            
            {movie.genre && (
              <div className="px-4 py-2 bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 border-2 border-[#FFD700]/30 rounded-lg">
                <span className="text-[#FFD700] font-black">{movie.genre}</span>
              </div>
            )}
            
            {movie.ageRating && (
              <div className={`px-4 py-2 rounded-lg font-black ${
                movie.ageRating === '18+' 
                  ? 'bg-red-500/20 border-2 border-red-500 text-red-500'
                  : 'bg-green-500/20 border-2 border-green-500 text-green-500'
              }`}>
                {movie.ageRating}
              </div>
            )}
            
            {movie.type && (
              <div className="px-4 py-2 bg-purple-500/20 border-2 border-purple-500/50 rounded-lg">
                <span className="text-purple-400 font-black uppercase">{movie.type}</span>
              </div>
            )}
          </div>

          {/* Series Information */}
          {movie.type === 'series' && (movie.seriesTitle || movie.seasonNumber || movie.episodeNumber) && (
            <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30 rounded-2xl">
              <h3 className="text-xl font-black text-white mb-3 flex items-center gap-2">
                <Tv className="w-6 h-6 text-blue-400" />
                Series Information
              </h3>
              <div className="space-y-2 text-gray-300">
                {movie.seriesTitle && (
                  <p className="font-bold">Series: <span className="text-white">{movie.seriesTitle}</span></p>
                )}
                {movie.seasonNumber && (
                  <p className="font-bold">Season: <span className="text-white">{movie.seasonNumber}</span></p>
                )}
                {movie.episodeNumber && (
                  <p className="font-bold">Episode: <span className="text-white">{movie.episodeNumber}</span></p>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {movie.description && (
            <div>
              <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-[#FFD700]" fill="currentColor" />
                Overview
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                {movie.description}
              </p>
            </div>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {movie.category && (
              <div className="p-4 bg-white/5 rounded-xl border-2 border-white/10">
                <p className="text-gray-400 text-sm font-bold mb-1">Category</p>
                <p className="text-white font-black capitalize">{movie.category}</p>
              </div>
            )}
            
            {movie.uploadedAt && (
              <div className="p-4 bg-white/5 rounded-xl border-2 border-white/10">
                <p className="text-gray-400 text-sm font-bold mb-1">Added On</p>
                <p className="text-white font-black">
                  {new Date(movie.uploadedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Action Buttons - Repeated for convenience */}
          <div className="flex flex-wrap gap-3 pt-4 border-t-2 border-white/10">
            <button
              onClick={() => onWatch(movie)}
              className="flex-1 min-w-[200px] px-8 py-5 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-black text-lg rounded-2xl hover:shadow-xl hover:shadow-[#FFD700]/50 transition-all flex items-center justify-center gap-3"
            >
              <Play className="w-6 h-6" fill="currentColor" />
              WATCH NOW
            </button>
            
            <button
              onClick={() => onDownload(movie)}
              className="flex-1 min-w-[200px] px-8 py-5 glass-card glass-card-hover rounded-2xl font-black text-white text-lg flex items-center justify-center gap-3"
            >
              <Download className="w-6 h-6" strokeWidth={2.5} />
              DOWNLOAD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
