import React, { useState, useEffect } from 'react';
import { Baby, Star, Heart, Sparkles, PartyPopper, Smile, Shield, ArrowLeft, Zap } from 'lucide-react';
import { MovieCard } from './MovieCard';
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
  seriesTitle?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  episodes?: any[];
}

interface KidoModeScreenProps {
  movies: Movie[];
  onWatch: (movie: Movie) => void;
  onDownload: (movie: Movie) => void;
  onMusicClick: (movie: Movie) => void;
  onSeriesClick?: (movie: Movie) => void;
  onBack?: () => void;
}

export function KidoModeScreen({ movies, onWatch, onDownload, onMusicClick, onSeriesClick, onBack }: KidoModeScreenProps) {
  const [floatingStars, setFloatingStars] = useState<Array<{ id: number; x: number; y: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    // Generate floating stars on mount
    const stars = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 3
    }));
    setFloatingStars(stars);
  }, []);

  // Filter only kids content (age 3+)
  const kidsMovies = movies.filter(m => {
    // EXCLUDE adult content first (safety filter)
    if (m.ageRating === '18+' || m.ageRating === 'R') {
      return false;
    }
    
    // INCLUDE kids content
    return (
      m.ageRating === 'Kids' || 
      m.ageRating === 'G' || 
      m.section === 'kido' ||
      // Auto-detect kids content by title keywords
      m.title?.toLowerCase().includes('tom and jerry') ||
      m.title?.toLowerCase().includes('tom & jerry') ||
      m.title?.toLowerCase().includes('looney tunes') ||
      m.title?.toLowerCase().includes('mickey mouse') ||
      m.title?.toLowerCase().includes('peppa pig') ||
      m.title?.toLowerCase().includes('paw patrol') ||
      m.title?.toLowerCase().includes('spongebob') ||
      m.title?.toLowerCase().includes('dora') ||
      m.title?.toLowerCase().includes('kids') ||
      m.title?.toLowerCase().includes('children') ||
      m.genre?.toLowerCase().includes('kids') ||
      m.genre?.toLowerCase().includes('children') ||
      m.genre?.toLowerCase().includes('cartoon') ||
      m.genre?.toLowerCase().includes('animation')
    );
  });

  console.log('🧒 KidoModeScreen - Total movies:', movies.length, '| Kids movies:', kidsMovies.length);
  console.log('🧒 Kids movies sample:', kidsMovies.slice(0, 3).map(m => ({
    title: m.title,
    ageRating: m.ageRating,
    hasVideoUrl: !!m.videoUrl,
    videoUrl: m.videoUrl?.substring(0, 50) + '...'
  })));
  
  // GROUP SERIES EPISODES! This prevents duplicate cards
  const groupedKidsContent = groupSeriesEpisodes(kidsMovies);
  
  console.log('🧒 KidoModeScreen - Grouped kids content:', groupedKidsContent.length);
  console.log('🧒 onWatch function exists:', !!onWatch);
  console.log('🧒 onSeriesClick function exists:', !!onSeriesClick);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-black to-black pb-24 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Large Floating Orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Floating Stars */}
        {floatingStars.map(star => (
          <div
            key={star.id}
            className="absolute animate-float"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          >
            <Star className="text-cyan-400/30 w-4 h-4" fill="currentColor" />
          </div>
        ))}
      </div>

      {/* Hero Header */}
      <div className="relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Back Button - Desktop Only */}
          {onBack && (
            <button
              onClick={onBack}
              className="hidden md:flex items-center gap-2 mb-6 px-4 py-2 rounded-xl bg-white/5 backdrop-blur-2xl border border-white/10 hover:bg-white/10 hover:border-cyan-400/50 transition-all group"
            >
              <ArrowLeft className="w-5 h-5 text-white group-hover:text-cyan-400 transition-colors" />
              <span className="font-bold text-white group-hover:text-cyan-400 transition-colors">Back to Home</span>
            </button>
          )}

          {/* Hero Content */}
          <div className="text-center">
            {/* Icon with Glassmorphism */}
            <div className="mb-6 flex justify-center">
              <div className="relative group">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity animate-pulse" />
                
                {/* Main Icon Container */}
                <div className="relative bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-cyan-500/20 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 shadow-2xl">
                  <Baby className="w-20 h-20 text-white drop-shadow-2xl" />
                  
                  {/* Sparkle Decorations */}
                  <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-pulse" />
                  <PartyPopper className="absolute -bottom-2 -left-2 w-8 h-8 text-pink-400 animate-bounce" />
                </div>
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl animate-gradient">
              KIDo Corner
            </h1>
            
            {/* Subtitle */}
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 backdrop-blur-xl border border-white/20 mb-4">
              <Smile className="w-5 h-5 text-yellow-400" />
              <p className="font-black text-white">Fun & Safe for Kids!</p>
              <Smile className="w-5 h-5 text-yellow-400" />
            </div>
            
            <p className="text-gray-300 font-bold">Ages 3+ • Parent-Approved Content</p>
          </div>
        </div>
      </div>

      {/* Safe Browsing Badge */}
      <div className="relative z-10 px-6 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative group">
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Card */}
            <div className="relative bg-gradient-to-br from-green-600/10 via-emerald-600/5 to-cyan-600/10 backdrop-blur-2xl border border-green-500/30 rounded-2xl p-6 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/50">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                    Safe Kids Mode Active!
                    <Zap className="w-5 h-5 text-yellow-400" />
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-3">
                    All content is carefully filtered for children. No scary or inappropriate content will show up here! 
                    Parents, you can trust KIDo Corner! 🛡️
                  </p>
                  <div className="flex items-start gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-lg">💡</span>
                    <p className="text-gray-400 text-xs font-bold">
                      Tip: Click the tabs at the top to browse other content sections!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kids Content */}
      {groupedKidsContent.length === 0 ? (
        <div className="relative z-10 px-6 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-cyan-600/20 backdrop-blur-xl border border-purple-500/30 flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Baby className="w-16 h-16 text-purple-400" />
            </div>
            
            <h2 className="text-4xl font-black text-white mb-4">No Kids Content Yet!</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
              The admin needs to upload some fun movies and shows for kids. Check back soon! 🎈
            </p>
            
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-purple-500/30">
              <PartyPopper className="w-5 h-5 text-pink-400" />
              <span className="text-gray-300 font-bold">Coming Soon!</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 px-6 space-y-12">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Animated Movies Section */}
            {groupedKidsContent.filter(m => m.type === 'movie').length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/50">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white">Animated Adventures</h2>
                    <p className="text-sm text-gray-400 font-bold">{groupedKidsContent.filter(m => m.type === 'movie').length} movies</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {groupedKidsContent.filter(m => m.type === 'movie').map(movie => (
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
            )}

            {/* Kids Shows Section */}
            {groupedKidsContent.filter(m => m.type === 'series').length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                    <span className="text-2xl">📺</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white">Fun Shows</h2>
                    <p className="text-sm text-gray-400 font-bold">{groupedKidsContent.filter(m => m.type === 'series').length} series</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {groupedKidsContent.filter(m => m.type === 'series').map(movie => (
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
            )}

            {/* Kids Music Section */}
            {groupedKidsContent.filter(m => m.category === 'music').length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-600 to-pink-400 flex items-center justify-center shadow-lg shadow-pink-500/50">
                    <span className="text-2xl">🎵</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white">Kids Songs</h2>
                    <p className="text-sm text-gray-400 font-bold">{groupedKidsContent.filter(m => m.category === 'music').length} tracks</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {groupedKidsContent.filter(m => m.category === 'music').map(movie => (
                    <MovieCard
                      key={movie.id}
                      movie={movie as any}
                      onWatch={onWatch}
                      onDownload={onDownload}
                      onMusicClick={onMusicClick}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decorative Footer */}
      <div className="relative z-10 px-6 py-12 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-xl border border-purple-500/20">
          <Heart className="w-5 h-5 text-pink-400 fill-pink-400 animate-pulse" />
          <p className="text-gray-400 font-bold">
            Made with love for awesome kids everywhere!
          </p>
          <Sparkles className="w-5 h-5 text-yellow-400" />
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.6;
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}