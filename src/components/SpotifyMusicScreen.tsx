import React, { useState } from 'react';
import { 
  Play, 
  Pause,
  Music2,
  TrendingUp,
  Clock,
  Heart,
  Download,
  MoreHorizontal,
  Search,
  ListMusic,
  Radio,
  Library,
  Star,
  Flame,
  Disc3,
  Headphones
} from 'lucide-react';
import { MuZIkiLogo } from './MuZIkiLogo';

interface Movie {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  genre: string;
  year: string;
  type: string;
  category?: string;
  artist?: string;
  fileSize?: string;
  duration?: string;
}

interface SpotifyMusicScreenProps {
  movies: Movie[];
  onMusicClick: (movie: Movie) => void;
  onDownload: (movie: Movie) => void;
  currentTrack: Movie | null;
  isPlaying: boolean;
  onBack?: () => void;
}

export function SpotifyMusicScreen({ 
  movies,
  onMusicClick,
  onDownload,
  currentTrack,
  isPlaying
}: SpotifyMusicScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'trending' | 'recent'>('all');

  // Filter music from movies
  const musicTracks = movies.filter(m => m.category === 'music');

  // Search and filter
  const filteredTracks = musicTracks
    .filter(track => 
      searchQuery === '' || 
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (track.artist && track.artist.toLowerCase().includes(searchQuery.toLowerCase())) ||
      track.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Get trending (random selection for demo)
  const trendingTracks = [...musicTracks].sort(() => Math.random() - 0.5).slice(0, 6);
  
  // Get recent (last 4)
  const recentTracks = musicTracks.slice(0, 4);

  // Quick picks
  const quickPicks = musicTracks.slice(0, 8);

  return (
    <div className="min-h-screen bg-black pb-24 relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-1/4 left-1/3 w-[700px] h-[700px] bg-orange-600/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10">
        {/* Header with Search */}
        <div className="sticky top-0 z-40 backdrop-blur-2xl bg-black/80 border-b border-white/10">
          <div className="px-4 md:px-6 py-4">
            {/* Logo and Title */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <MuZIkiLogo className="w-10 h-10" isActive={true} />
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full opacity-30 blur-lg" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-400 via-orange-400 to-cyan-400 bg-clip-text text-transparent">
                  muZIki
                </h1>
                <p className="text-[10px] text-gray-500">Your Ultimate Music Library</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search songs, artists, genres..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 md:px-6 py-6 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 text-center">
              <Music2 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-black text-white">{musicTracks.length}</p>
              <p className="text-xs text-gray-400">Tracks</p>
            </div>
            <div className="bg-gradient-to-br from-orange-600/20 to-orange-900/20 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-4 text-center">
              <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <p className="text-2xl font-black text-white">{trendingTracks.length}</p>
              <p className="text-xs text-gray-400">Trending</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-600/20 to-cyan-900/20 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-4 text-center">
              <Headphones className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <p className="text-2xl font-black text-white">∞</p>
              <p className="text-xs text-gray-400">Hours</p>
            </div>
          </div>

          {/* Now Playing (if track is playing) */}
          {currentTrack && (
            <div className="bg-gradient-to-r from-purple-900/40 via-orange-900/40 to-pink-900/40 backdrop-blur-xl border border-purple-500/40 rounded-3xl p-4 shadow-2xl shadow-purple-500/20">
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <img
                    src={currentTrack.thumbnailUrl}
                    alt={currentTrack.title}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover"
                  />
                  {isPlaying && (
                    <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                      <div className="flex gap-1">
                        <div className="w-1 h-6 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                        <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                        <div className="w-1 h-6 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black truncate">{currentTrack.title}</p>
                  <p className="text-gray-400 text-sm truncate">{currentTrack.artist || currentTrack.genre}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 w-1/3 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onMusicClick(currentTrack)}
                  className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-purple-500/50"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white fill-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Featured Music Videos */}
          {!searchQuery && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Radio className="w-5 h-5 text-pink-400" />
                <h2 className="text-xl font-black text-white">Featured Music Videos</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-pink-500/50 to-transparent" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Video 1 */}
                <div className="group relative bg-gradient-to-br from-purple-900/30 to-black/30 backdrop-blur-xl border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 via-pink-600/10 to-orange-600/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  
                  <div className="relative aspect-video">
                    <iframe
                      src="https://www.youtube.com/embed/ynR1vaCfIcc?rel=0&modestbranding=1"
                      title="Featured Music Video 1"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                  
                  <div className="p-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-black text-white">Featured Video</h3>
                        <p className="text-xs text-gray-400">Premium Music Content</p>
                      </div>
                      <div className="px-3 py-1 bg-pink-500/20 border border-pink-500/40 rounded-full">
                        <span className="text-pink-400 text-xs font-black">FEATURED</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 rounded-3xl ring-1 ring-purple-500/20 group-hover:ring-purple-500/50 transition-all pointer-events-none" />
                </div>

                {/* Video 2 */}
                <div className="group relative bg-gradient-to-br from-cyan-900/30 to-black/30 backdrop-blur-xl border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/0 via-orange-600/10 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  
                  <div className="relative aspect-video">
                    <iframe
                      src="https://www.youtube.com/embed/BJgdrb92lCg?rel=0&modestbranding=1"
                      title="Featured Music Video 2"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                  
                  <div className="p-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-600 via-orange-500 to-pink-500 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-black text-white">Featured Video</h3>
                        <p className="text-xs text-gray-400">Premium Music Content</p>
                      </div>
                      <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 rounded-full">
                        <span className="text-cyan-400 text-xs font-black">FEATURED</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 rounded-3xl ring-1 ring-cyan-500/20 group-hover:ring-cyan-500/50 transition-all pointer-events-none" />
                </div>
              </div>
            </section>
          )}

          {/* All Music / Search Results */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Library className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-black text-white">
                {searchQuery ? `Search Results (${filteredTracks.length})` : 'All Music'}
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
            </div>
            
            {filteredTracks.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredTracks.map((track) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    onPlay={onMusicClick}
                    onDownload={onDownload}
                    isPlaying={currentTrack?.id === track.id && isPlaying}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Music2 className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No music tracks found</p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 px-6 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-full hover:bg-purple-600/30 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

// Track Card Component (Grid View)
function TrackCard({ track, onPlay, onDownload, isPlaying, badge }: any) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Album Art */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/40 to-black shadow-lg shadow-black/40 mb-3">
        <img
          src={track.thumbnailUrl}
          alt={track.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        
        {/* Badge (Trending number) */}
        {badge && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
            <span className="text-white text-xs font-black">{badge}</span>
          </div>
        )}

        {/* Now Playing Indicator */}
        {isPlaying && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full flex items-center gap-1.5">
            <div className="flex gap-0.5">
              <div className="w-0.5 h-3 bg-white rounded-full animate-pulse" />
              <div className="w-0.5 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="w-0.5 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Play Button Overlay */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={() => onPlay(track)}
            className="w-14 h-14 bg-gradient-to-r from-purple-600 via-orange-500 to-cyan-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50 hover:scale-110 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white fill-white" />
            ) : (
              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Bottom Actions */}
        <div className={`absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between transition-transform ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}>
          <button
            onClick={() => onDownload(track)}
            className="p-2 bg-black/60 backdrop-blur-md rounded-full hover:bg-black/80 transition-colors"
          >
            <Download className="w-4 h-4 text-white" />
          </button>
          <button className="p-2 bg-black/60 backdrop-blur-md rounded-full hover:bg-black/80 transition-colors">
            <Heart className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Track Info */}
      <div className="px-1">
        <p className="text-white font-black text-sm truncate mb-1">{track.title}</p>
        <p className="text-gray-400 text-xs truncate">{track.artist || track.genre}</p>
      </div>
    </div>
  );
}

// Track Row Component (List View)
function TrackRow({ track, onPlay, onDownload, isPlaying }: any) {
  return (
    <div className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-purple-500/30 transition-all">
      {/* Album Art */}
      <div className="relative flex-shrink-0">
        <img
          src={track.thumbnailUrl}
          alt={track.title}
          className="w-14 h-14 rounded-lg object-cover"
        />
        {isPlaying && (
          <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
            <div className="flex gap-0.5">
              <div className="w-1 h-4 bg-white rounded-full animate-pulse" />
              <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-black text-sm truncate">{track.title}</p>
        <p className="text-gray-400 text-xs truncate">{track.artist || track.genre}</p>
      </div>

      {/* Duration */}
      <div className="hidden md:block text-gray-400 text-sm">
        {track.duration || '3:45'}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPlay(track)}
          className="w-10 h-10 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg shadow-purple-500/50"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-white fill-white" />
          ) : (
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          )}
        </button>
        <button
          onClick={() => onDownload(track)}
          className="p-2 hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
        >
          <Download className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
        </button>
      </div>
    </div>
  );
}