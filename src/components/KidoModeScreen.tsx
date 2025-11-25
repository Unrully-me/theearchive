// React default import not required with new JSX transform
import { Baby, Star, Heart } from 'lucide-react';
import { MovieCard } from './MovieCard';
import { groupSeriesEpisodes } from '../utils/seriesGrouping';
import type { Movie } from '../types/movie';

interface KidoModeScreenProps {
  movies: Movie[];
  onWatch: (movie: Movie) => void;
  onDownload: (movie: Movie, type?: 'audio' | 'video') => void;
  onMusicClick: (movie: Movie) => void;
  onSeriesClick?: (movie: Movie) => void;
}

export function KidoModeScreen({ movies, onWatch, onDownload, onMusicClick, onSeriesClick }: KidoModeScreenProps) {
  // Filter only kids content (age 3+)
  const kidsMovies = movies.filter(m => 
    m.ageRating === 'Kids' || 
    m.ageRating === 'G' || 
    m.section === 'kido'
  );

  // GROUP SERIES EPISODES! This prevents duplicate cards
  const groupedKidsContent = groupSeriesEpisodes(kidsMovies);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-900 to-blue-900 pb-24">
      {/* KIDo Header */}
      <div className="relative overflow-hidden">
        {/* Background Stars */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <Star
              key={i}
              className="absolute text-yellow-300 animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 20 + 10}px`,
                height: `${Math.random() * 20 + 10}px`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: Math.random() * 0.7 + 0.3
              }}
            />
          ))}
        </div>

        <div className="relative px-4 py-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 p-6 rounded-3xl shadow-2xl">
                <Baby className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 bg-clip-text text-transparent drop-shadow-2xl">
            KIDo Corner
          </h1>
          <p className="text-xl font-bold text-white/90 mb-1">Fun & Safe for Kids!</p>
          <p className="text-sm text-white/70">Ages 3+ • Parent-Approved Content 🌟</p>
        </div>
      </div>

      {/* Safe Browsing Notice */}
      <div className="px-4 mb-6">
        <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border-2 border-green-400/30 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <Heart className="w-6 h-6 text-pink-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-white font-black mb-1">Safe Kids Mode Active!</h3>
              <p className="text-white/80 text-sm">
                All content is filtered for children. No scary or inappropriate content will show up here! 
                Parents, you can trust KIDo Corner! 🛡️
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Kids Content */}
      {groupedKidsContent.length === 0 ? (
        <div className="px-4 py-20 text-center">
          <Baby className="w-24 h-24 text-pink-300 mx-auto mb-6 opacity-50" />
          <h2 className="text-2xl font-black text-white mb-3">No Kids Content Yet!</h2>
          <p className="text-white/70 max-w-sm mx-auto">
            The admin needs to upload some fun movies and shows for kids. Check back soon! 🎈
          </p>
        </div>
      ) : (
        <div className="px-4 space-y-6">
          {/* Animated Movies Section */}
          <div>
            <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
              🎨 Animated Adventures
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {groupedKidsContent.filter((m: Movie) => m.type === 'movie').map((movie: Movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onWatch={onWatch}
                  onDownload={onDownload}
                  onMusicClick={onMusicClick}
                  onSeriesClick={onSeriesClick}
                />
              ))}
            </div>
          </div>

          {/* Kids Shows Section */}
          {groupedKidsContent.filter(m => m.type === 'series').length > 0 && (
            <div>
              <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
                📺 Fun Shows
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
              <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
                🎵 Kids Songs
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
      )}

      {/* Decorative Footer */}
      <div className="px-4 py-8 text-center">
        <p className="text-white/50 text-sm">
          Made with 💖 for awesome kids everywhere!
        </p>
      </div>
    </div>
  );
}