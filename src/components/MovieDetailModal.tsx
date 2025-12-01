import React from 'react';
import { X, Play, Download, Star, Clock, Calendar, Film, Tv, Sparkles, Info } from 'lucide-react';

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop with Purple Glow */}
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
        onClick={onClose}
      />
      
      {/* Modal Content - Premium Design */}
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-purple-900/30 to-cyan-900/30 rounded-3xl border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20 animate-slide-up">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-pink-600/5 to-cyan-600/5 rounded-3xl animate-pulse" />
        
        {/* Close Button - Premium Style */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-12 h-12 bg-gradient-to-br from-purple-600/80 to-pink-600/80 backdrop-blur-md hover:from-purple-500 hover:to-pink-500 rounded-full flex items-center justify-center transition-all group shadow-lg shadow-purple-500/50 border border-purple-400/30"
        >
          <X className="w-7 h-7 text-white group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} />
        </button>

        {/* Hero Image with Gradient Overlay */}
        <div className="relative h-[45vh] md:h-[55vh] overflow-hidden rounded-t-3xl">
          {movie.thumbnailUrl ? (
            <>
              <img
                src={movie.thumbnailUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {/* Multi-layer Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-purple-900/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-transparent to-cyan-900/30" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900 via-pink-900 to-cyan-900 flex items-center justify-center relative overflow-hidden">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-white animate-pulse"
                    style={{
                      width: `${Math.random() * 100 + 50}px`,
                      height: `${Math.random() * 100 + 50}px`,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${Math.random() * 3 + 2}s`
                    }}
                  />
                ))}
              </div>
              <Film className="w-32 h-32 text-purple-400/50 relative z-10" strokeWidth={1.5} />
            </div>
          )}
          
          {/* Title Section with Premium Effects */}
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent">
            {/* Type Badge */}
            <div className="flex items-center gap-3 mb-4">
              <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full flex items-center gap-2 shadow-lg shadow-purple-500/50">
                {movie.type === 'series' ? (
                  <>
                    <Tv className="w-5 h-5 text-white" strokeWidth={2.5} />
                    <span className="text-white font-black text-sm uppercase">Series</span>
                  </>
                ) : (
                  <>
                    <Film className="w-5 h-5 text-white" strokeWidth={2.5} />
                    <span className="text-white font-black text-sm uppercase">Movie</span>
                  </>
                )}
              </div>
              
              {movie.ageRating && (
                <div className={`px-4 py-2 rounded-full font-black text-sm shadow-lg ${
                  movie.ageRating === '18+' 
                    ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white border border-red-400/30'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border border-green-400/30'
                }`}>
                  {movie.ageRating}
                </div>
              )}
            </div>
            
            {/* Title with Gradient */}
            <h1 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
              {movie.title}
            </h1>
            
            {/* Action Buttons - Modern 3D Style */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => onWatch(movie)}
                className="group relative"
              >
                {/* 3D Shadow Layers */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-cyan-700 rounded-2xl transform translate-y-2 group-hover:translate-y-3 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl transform translate-y-1 group-hover:translate-y-1.5 transition-transform" />
                
                {/* Main Button */}
                <div className="relative px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 rounded-2xl font-black text-white text-lg transform transition-all group-hover:translate-y-0.5 group-hover:shadow-2xl group-hover:shadow-cyan-500/60 flex items-center gap-3 border border-cyan-400/30">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Play className="w-5 h-5" fill="currentColor" />
                  </div>
                  <span>WATCH NOW</span>
                </div>
              </button>
              
              <button
                onClick={() => onDownload(movie)}
                className="px-8 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-2xl font-black text-white text-lg flex items-center gap-3 transition-all border border-purple-400/30 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/30"
              >
                <Download className="w-6 h-6" strokeWidth={2.5} />
                DOWNLOAD
              </button>
            </div>
          </div>
        </div>

        {/* Details Section - Premium Cards */}
        <div className="relative p-8 space-y-6">
          {/* Meta Information - Glassmorphism Cards */}
          <div className="flex flex-wrap gap-3">
            {movie.year && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-purple-400/20 rounded-xl hover:bg-white/10 transition-all">
                <Calendar className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-white">{movie.year}</span>
              </div>
            )}
            
            {movie.fileSize && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-purple-400/20 rounded-xl hover:bg-white/10 transition-all">
                <Clock className="w-5 h-5 text-purple-400" />
                <span className="font-bold text-white">{movie.fileSize}</span>
              </div>
            )}
            
            {movie.genre && (
              <div className="px-4 py-2 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-400/30 rounded-xl hover:from-purple-600/30 hover:to-cyan-600/30 transition-all">
                <span className="text-cyan-300 font-black">{movie.genre}</span>
              </div>
            )}
            
            {movie.category && (
              <div className="px-4 py-2 bg-gradient-to-r from-pink-600/20 to-purple-600/20 border border-pink-400/30 rounded-xl hover:from-pink-600/30 hover:to-purple-600/30 transition-all">
                <span className="text-pink-300 font-black capitalize">{movie.category}</span>
              </div>
            )}
          </div>

          {/* Series Information */}
          {movie.type === 'series' && (movie.seriesTitle || movie.seasonNumber || movie.episodeNumber) && (
            <div className="p-6 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-cyan-600/10 border-2 border-purple-500/30 rounded-2xl backdrop-blur-md">
              <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                <Tv className="w-6 h-6 text-cyan-400" />
                Series Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {movie.seriesTitle && (
                  <div className="p-3 bg-white/5 rounded-xl border border-purple-400/20">
                    <p className="text-gray-400 text-xs font-bold mb-1">Series</p>
                    <p className="text-white font-black">{movie.seriesTitle}</p>
                  </div>
                )}
                {movie.seasonNumber && (
                  <div className="p-3 bg-white/5 rounded-xl border border-purple-400/20">
                    <p className="text-gray-400 text-xs font-bold mb-1">Season</p>
                    <p className="text-white font-black">{movie.seasonNumber}</p>
                  </div>
                )}
                {movie.episodeNumber && (
                  <div className="p-3 bg-white/5 rounded-xl border border-purple-400/20">
                    <p className="text-gray-400 text-xs font-bold mb-1">Episode</p>
                    <p className="text-white font-black">{movie.episodeNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description - Premium Card */}
          {movie.description && (
            <div className="p-6 bg-gradient-to-br from-gray-800/50 to-purple-900/20 border-2 border-purple-500/20 rounded-2xl backdrop-blur-sm">
              <h3 className="text-2xl font-black mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Overview
                </span>
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                {movie.description}
              </p>
            </div>
          )}

          {/* Upload Date */}
          {movie.uploadedAt && (
            <div className="p-4 bg-white/5 backdrop-blur-md rounded-xl border border-purple-400/20">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-gray-400 text-sm font-bold">Added On</p>
                  <p className="text-white font-black">
                    {new Date(movie.uploadedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-6 border-t-2 border-purple-500/20">
            <button
              onClick={() => onWatch(movie)}
              className="group relative flex-1 min-w-[200px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-cyan-700 rounded-2xl transform translate-y-2 group-hover:translate-y-3 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl transform translate-y-1 group-hover:translate-y-1.5 transition-transform" />
              <div className="relative px-8 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 rounded-2xl font-black text-white text-lg transform transition-all group-hover:translate-y-0.5 group-hover:shadow-2xl group-hover:shadow-cyan-500/60 flex items-center justify-center gap-3 border border-cyan-400/30">
                <Play className="w-6 h-6" fill="currentColor" />
                WATCH NOW
              </div>
            </button>
            
            <button
              onClick={() => onDownload(movie)}
              className="flex-1 min-w-[200px] px-8 py-5 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-2xl font-black text-white text-lg flex items-center justify-center gap-3 transition-all border border-purple-400/30 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/30"
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