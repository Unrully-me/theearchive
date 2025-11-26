import React, { useState, useRef, useEffect } from 'react';
import { Plus, Music, ListMusic, TrendingUp, Globe, Heart, Play, X, ArrowLeft, Sparkles, Flame, Star } from 'lucide-react';
import { MovieCard } from './MovieCard';
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

interface Playlist {
  id: string;
  name: string;
  description: string;
  songs: Movie[];
  createdAt: string;
  coverImage?: string;
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
  isPlaying,
  onBack
}: SpotifyMusicScreenProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('music_playlists');
    return saved ? JSON.parse(saved) : [];
  });
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Movie | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [viewMode, setViewMode] = useState<'home' | 'playlist'>('home');

  // Filter music only
  const allMusic = movies.filter(m => m.category === 'music');
  
  // Music sections
  const trendingMusic = allMusic.slice(0, 20);
  const ugandaMusic = allMusic.filter(m => 
    m.genre?.toLowerCase().includes('uganda') || 
    m.genre?.toLowerCase().includes('afrobeat') ||
    m.description?.toLowerCase().includes('uganda')
  );
  const hipHopMusic = allMusic.filter(m => 
    m.genre?.toLowerCase().includes('hip hop') || 
    m.genre?.toLowerCase().includes('rap')
  );
  const popMusic = allMusic.filter(m => 
    m.genre?.toLowerCase().includes('pop')
  );
  const afrobeatMusic = allMusic.filter(m => 
    m.genre?.toLowerCase().includes('afrobeat') ||
    m.genre?.toLowerCase().includes('afro')
  );

  const savePlaylist = (updatedPlaylists: Playlist[]) => {
    setPlaylists(updatedPlaylists);
    localStorage.setItem('music_playlists', JSON.stringify(updatedPlaylists));
  };

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) {
      alert('Please enter a playlist name!');
      return;
    }

    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName,
      description: newPlaylistDesc,
      songs: [],
      createdAt: new Date().toISOString(),
      coverImage: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400'
    };

    const updatedPlaylists = [newPlaylist, ...playlists];
    savePlaylist(updatedPlaylists);
    
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setShowCreatePlaylist(false);
    
    alert(`✅ Playlist "${newPlaylist.name}" created!`);
  };

  const handleAddToPlaylist = (playlistId: string) => {
    if (!selectedSong) return;

    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    if (playlist.songs.some(s => s.id === selectedSong.id)) {
      alert('This song is already in the playlist!');
      return;
    }

    const updatedPlaylists = playlists.map(p => {
      if (p.id === playlistId) {
        return {
          ...p,
          songs: [...p.songs, selectedSong]
        };
      }
      return p;
    });

    savePlaylist(updatedPlaylists);
    setShowAddToPlaylist(false);
    setSelectedSong(null);
    
    alert(`✅ Added to "${playlist.name}"!`);
  };

  const handleRemoveFromPlaylist = (playlistId: string, songId: string) => {
    const updatedPlaylists = playlists.map(p => {
      if (p.id === playlistId) {
        return {
          ...p,
          songs: p.songs.filter(s => s.id !== songId)
        };
      }
      return p;
    });

    savePlaylist(updatedPlaylists);
  };

  const handleDeletePlaylist = (playlistId: string) => {
    if (!confirm('Delete this playlist?')) return;
    
    const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
    savePlaylist(updatedPlaylists);
    
    if (selectedPlaylist?.id === playlistId) {
      setSelectedPlaylist(null);
      setViewMode('home');
    }
  };

  const openAddToPlaylistModal = (song: Movie) => {
    setSelectedSong(song);
    setShowAddToPlaylist(true);
  };

  const viewPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setViewMode('playlist');
  };

  if (viewMode === 'playlist' && selectedPlaylist) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 via-black to-black pb-24">
        {/* Playlist Header with Glassmorphism */}
        <div className="relative h-72 bg-gradient-to-b from-purple-600/40 via-cyan-600/20 to-black overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.15),transparent_50%)]" />
          
          <button
            onClick={() => setViewMode('home')}
            className="absolute top-6 left-6 w-12 h-12 bg-black/40 backdrop-blur-2xl rounded-full flex items-center justify-center z-10 border border-white/10 hover:bg-white/20 hover:border-cyan-400/50 transition-all group"
          >
            <ArrowLeft className="w-5 h-5 text-white group-hover:text-cyan-400 transition-colors" />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-6 backdrop-blur-xl bg-black/30">
            <div className="flex items-end gap-4">
              <div className="w-36 h-36 bg-gradient-to-br from-purple-500 via-orange-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.3),transparent_70%)]" />
                <ListMusic className="w-16 h-16 text-white relative z-10" />
              </div>
              <div className="flex-1 pb-2">
                <p className="text-xs font-black text-cyan-400 mb-1 tracking-wider">PLAYLIST</p>
                <h1 className="text-4xl font-black text-white mb-2 leading-tight">{selectedPlaylist.name}</h1>
                <p className="text-sm text-gray-300">{selectedPlaylist.description}</p>
                <div className="flex items-center gap-3 mt-3">
                  <p className="text-xs text-gray-400">{selectedPlaylist.songs.length} songs</p>
                  <div className="w-1 h-1 rounded-full bg-gray-600" />
                  <p className="text-xs text-gray-400">Created {new Date(selectedPlaylist.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Play All Button */}
        {selectedPlaylist.songs.length > 0 && (
          <div className="px-6 py-6">
            <button
              onClick={() => onMusicClick(selectedPlaylist.songs[0])}
              className="w-full py-5 bg-gradient-to-r from-purple-600 via-orange-500 to-pink-500 rounded-2xl font-black text-white text-lg flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-orange-500/60 transition-all hover:scale-[1.02] group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/20 to-cyan-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <Play className="w-6 h-6 fill-white relative z-10" />
              <span className="relative z-10">PLAY ALL</span>
            </button>
          </div>
        )}

        {/* Songs List */}
        <div className="px-4">
          {selectedPlaylist.songs.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600/20 to-cyan-600/20 backdrop-blur-xl border border-purple-500/30 flex items-center justify-center mx-auto mb-6">
                <Music className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Empty Playlist</h3>
              <p className="text-gray-400 text-base mb-6">Add some tracks to get started!</p>
              <button
                onClick={() => setViewMode('home')}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-black rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all"
              >
                Browse Music
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedPlaylist.songs.map((song, index) => (
                <div
                  key={song.id}
                  className="flex items-center gap-4 p-4 bg-white/5 hover:bg-gradient-to-r hover:from-purple-600/10 hover:to-cyan-600/10 rounded-xl transition-all group border border-transparent hover:border-purple-500/30 backdrop-blur-xl"
                >
                  {/* Track Number */}
                  <div className="w-10 text-center">
                    <span className="text-gray-400 group-hover:hidden font-bold">{index + 1}</span>
                    <button
                      onClick={() => onMusicClick(song)}
                      className="hidden group-hover:inline w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center"
                    >
                      <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative">
                    <img
                      src={song.thumbnailUrl}
                      alt={song.title}
                      className="w-14 h-14 rounded-lg object-cover shadow-lg"
                    />
                    {currentTrack?.id === song.id && (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/50 to-orange-500/50 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center animate-pulse">
                          <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-black truncate ${currentTrack?.id === song.id ? 'text-orange-400' : 'text-white'}`}>
                      {song.title}
                    </p>
                    <p className="text-sm text-gray-400 truncate">{song.artist || song.genre}</p>
                  </div>

                  {/* Duration */}
                  {song.duration && (
                    <p className="text-sm text-gray-500 hidden md:block">{song.duration}</p>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveFromPlaylist(selectedPlaylist.id, song.id)}
                    className="opacity-0 group-hover:opacity-100 w-10 h-10 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Playlist */}
        <div className="px-6 py-8">
          <button
            onClick={() => handleDeletePlaylist(selectedPlaylist.id)}
            className="w-full py-4 border-2 border-red-500/30 text-red-400 font-black rounded-xl hover:bg-red-500/10 hover:border-red-500/50 transition-all backdrop-blur-xl"
          >
            Delete Playlist
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-black to-black pb-24 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header - Glassmorphism Design */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl bg-black/60 border-b border-purple-500/20 shadow-lg shadow-purple-900/10">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Back Button - Desktop Only */}
              {onBack && (
                <button
                  onClick={onBack}
                  className="hidden md:flex w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 rounded-full items-center justify-center transition-all group backdrop-blur-xl"
                >
                  <ArrowLeft className="w-5 h-5 text-white group-hover:text-cyan-400 transition-colors" />
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <MuZIkiLogo className="w-12 h-12" isActive={true} />
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full opacity-20 blur-xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 via-orange-400 to-cyan-400 bg-clip-text text-transparent">
                    muZIki
                  </h1>
                  <p className="text-xs text-gray-400 font-bold">{allMusic.length} tracks in library</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Modern Cards */}
      <div className="px-6 py-8 relative z-10">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setShowCreatePlaylist(true)}
            className="group relative bg-gradient-to-br from-purple-600/20 via-purple-600/10 to-transparent border border-purple-500/30 rounded-2xl p-6 text-left hover:border-purple-500/60 transition-all backdrop-blur-xl overflow-hidden hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/50 group-hover:scale-110 transition-transform">
                <Plus className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-black text-white text-lg mb-1">Create Playlist</h3>
              <p className="text-xs text-gray-400">Make your own mix</p>
            </div>
          </button>

          <button
            onClick={() => alert('Liked Songs feature coming soon!')}
            className="group relative bg-gradient-to-br from-pink-600/20 via-orange-600/10 to-transparent border border-pink-500/30 rounded-2xl p-6 text-left hover:border-pink-500/60 transition-all backdrop-blur-xl overflow-hidden hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-600/0 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-600 via-orange-500 to-pink-400 flex items-center justify-center mb-4 shadow-lg shadow-pink-500/50 group-hover:scale-110 transition-transform">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-black text-white text-lg mb-1">Liked Songs</h3>
              <p className="text-xs text-gray-400">Your favorites</p>
            </div>
          </button>
        </div>
      </div>

      {/* Your Playlists */}
      {playlists.length > 0 && (
        <div className="px-6 py-6 relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-2xl font-black text-white">Your Playlists</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {playlists.map(playlist => (
              <button
                key={playlist.id}
                onClick={() => viewPlaylist(playlist)}
                className="group bg-white/5 hover:bg-white/10 rounded-xl p-4 text-left transition-all border border-white/10 hover:border-purple-500/50 backdrop-blur-xl"
              >
                <div className="w-full aspect-square bg-gradient-to-br from-purple-600 via-orange-500 to-pink-500 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden shadow-lg group-hover:shadow-2xl group-hover:shadow-purple-500/50 transition-all">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_70%)]" />
                  <ListMusic className="w-12 h-12 text-white relative z-10" />
                </div>
                <h3 className="font-black text-white truncate group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all">{playlist.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{playlist.songs.length} songs</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trending Music - Hero Section */}
      {trendingMusic.length > 0 && (
        <div className="px-6 py-6 relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <Flame className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-black text-white">Trending Now</h2>
            <div className="ml-auto px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 backdrop-blur-xl">
              <span className="text-xs font-black text-orange-400">HOT</span>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {trendingMusic.slice(0, 10).map(song => (
              <div key={song.id} className="min-w-[180px] snap-start">
                <div className="relative group">
                  <img
                    src={song.thumbnailUrl}
                    alt={song.title}
                    className="w-full aspect-square rounded-2xl object-cover shadow-xl"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 rounded-2xl" />
                  
                  {/* Play Button */}
                  <button
                    onClick={() => onMusicClick(song)}
                    className="absolute bottom-3 right-3 w-14 h-14 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-2xl shadow-orange-500/50 hover:scale-110"
                  >
                    <Play className="w-6 h-6 text-white fill-white ml-1" />
                  </button>
                  
                  {/* Add to Playlist */}
                  <button
                    onClick={() => openAddToPlaylistModal(song)}
                    className="absolute top-3 right-3 w-10 h-10 bg-black/50 backdrop-blur-xl rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-white/20 hover:bg-white/20"
                  >
                    <Plus className="w-5 h-5 text-white" />
                  </button>

                  {/* Now Playing Indicator */}
                  {currentTrack?.id === song.id && (
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-orange-500 backdrop-blur-xl flex items-center gap-2 animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full" />
                      <span className="text-xs font-black text-white">Playing</span>
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <p className="font-black text-white text-sm truncate">{song.title}</p>
                  <p className="text-xs text-gray-400 truncate mt-1">{song.artist || song.genre}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uganda Music */}
      {ugandaMusic.length > 0 && (
        <div className="px-6 py-6 relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="text-2xl">🇺🇬</div>
            <h2 className="text-2xl font-black text-white">Uganda Vibes</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {ugandaMusic.slice(0, 12).map(song => (
              <MusicCard key={song.id} song={song} onMusicClick={onMusicClick} openAddToPlaylistModal={openAddToPlaylistModal} currentTrack={currentTrack} />
            ))}
          </div>
        </div>
      )}

      {/* Hip Hop & Rap */}
      {hipHopMusic.length > 0 && (
        <div className="px-6 py-6 relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="text-2xl">🎤</div>
            <h2 className="text-2xl font-black text-white">Hip Hop & Rap</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {hipHopMusic.slice(0, 12).map(song => (
              <MusicCard key={song.id} song={song} onMusicClick={onMusicClick} openAddToPlaylistModal={openAddToPlaylistModal} currentTrack={currentTrack} />
            ))}
          </div>
        </div>
      )}

      {/* Afrobeat */}
      {afrobeatMusic.length > 0 && (
        <div className="px-6 py-6 relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="text-2xl">🔥</div>
            <h2 className="text-2xl font-black text-white">Afrobeat Vibes</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {afrobeatMusic.slice(0, 12).map(song => (
              <MusicCard key={song.id} song={song} onMusicClick={onMusicClick} openAddToPlaylistModal={openAddToPlaylistModal} currentTrack={currentTrack} />
            ))}
          </div>
        </div>
      )}

      {/* Pop Hits */}
      {popMusic.length > 0 && (
        <div className="px-6 py-6 relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-black text-white">Pop Hits</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {popMusic.slice(0, 12).map(song => (
              <MusicCard key={song.id} song={song} onMusicClick={onMusicClick} openAddToPlaylistModal={openAddToPlaylistModal} currentTrack={currentTrack} />
            ))}
          </div>
        </div>
      )}

      {/* All Music */}
      <div className="px-6 py-6 relative z-10">
        <h2 className="text-2xl font-black text-white mb-6">All Music</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {allMusic.map(song => (
            <MusicCard key={song.id} song={song} onMusicClick={onMusicClick} openAddToPlaylistModal={openAddToPlaylistModal} currentTrack={currentTrack} />
          ))}
        </div>
      </div>

      {allMusic.length === 0 && (
        <div className="text-center py-20 relative z-10">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-600/20 to-cyan-600/20 backdrop-blur-xl border border-purple-500/30 flex items-center justify-center mx-auto mb-6">
            <Music className="w-14 h-14 text-purple-400" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">No Music Available</h3>
          <p className="text-gray-400">Check back soon for new tracks!</p>
        </div>
      )}

      {/* CREATE PLAYLIST MODAL */}
      {showCreatePlaylist && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900/90 via-black to-black border border-purple-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-purple-500/20 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-600/20 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6">Create Playlist</h2>
              
              <input
                type="text"
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 mb-4 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />
              
              <textarea
                placeholder="Description (optional)"
                value={newPlaylistDesc}
                onChange={(e) => setNewPlaylistDesc(e.target.value)}
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 mb-6 h-28 resize-none backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreatePlaylist(false);
                    setNewPlaylistName('');
                    setNewPlaylistDesc('');
                  }}
                  className="flex-1 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all backdrop-blur-xl border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePlaylist}
                  className="flex-1 py-4 bg-gradient-to-r from-purple-600 via-orange-500 to-pink-600 text-white font-black rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-[1.02]"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD TO PLAYLIST MODAL */}
      {showAddToPlaylist && selectedSong && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900/90 via-black to-black border border-purple-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-purple-500/20 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-600/20 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-3xl font-black text-white mb-2">Add to Playlist</h2>
              <p className="text-sm text-gray-400 mb-6">{selectedSong.title}</p>
              
              {playlists.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600/20 to-cyan-600/20 flex items-center justify-center mx-auto mb-4">
                    <ListMusic className="w-10 h-10 text-purple-400" />
                  </div>
                  <p className="text-gray-400 mb-6">No playlists yet</p>
                  <button
                    onClick={() => {
                      setShowAddToPlaylist(false);
                      setShowCreatePlaylist(true);
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 via-orange-500 to-pink-600 text-white font-black rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all"
                  >
                    Create Your First Playlist
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
                    {playlists.map(playlist => (
                      <button
                        key={playlist.id}
                        onClick={() => handleAddToPlaylist(playlist.id)}
                        className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-cyan-600/20 rounded-xl transition-all text-left border border-white/10 hover:border-purple-500/50 backdrop-blur-xl group"
                      >
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-600 via-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-purple-500/50 transition-all">
                          <ListMusic className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all">{playlist.name}</p>
                          <p className="text-xs text-gray-400">{playlist.songs.length} songs</p>
                        </div>
                        <Plus className="w-5 h-5 text-gray-400 group-hover:text-orange-400 transition-colors" />
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setShowAddToPlaylist(false);
                      setSelectedSong(null);
                    }}
                    className="w-full py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all backdrop-blur-xl border border-white/10"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Music Card Component
function MusicCard({ song, onMusicClick, openAddToPlaylistModal, currentTrack }: any) {
  return (
    <div className="group">
      <div className="relative rounded-xl overflow-hidden shadow-lg">
        <img
          src={song.thumbnailUrl}
          alt={song.title}
          className="w-full aspect-square object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Play Button */}
        <button
          onClick={() => onMusicClick(song)}
          className="absolute bottom-2 right-2 w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-2xl shadow-orange-500/50 hover:scale-110"
        >
          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
        </button>
        
        {/* Add to Playlist */}
        <button
          onClick={() => openAddToPlaylistModal(song)}
          className="absolute top-2 right-2 w-9 h-9 bg-black/50 backdrop-blur-xl rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-white/20 hover:bg-white/20"
        >
          <Plus className="w-4 h-4 text-white" />
        </button>

        {/* Now Playing Indicator */}
        {currentTrack?.id === song.id && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-gradient-to-r from-purple-600 to-orange-500 backdrop-blur-xl flex items-center gap-1.5 animate-pulse">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
            <span className="text-[10px] font-black text-white">NOW</span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="font-black text-white text-sm truncate">{song.title}</p>
        <p className="text-xs text-gray-400 truncate mt-1">{song.artist || song.genre}</p>
      </div>
    </div>
  );
}
