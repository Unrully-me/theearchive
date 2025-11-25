import { useState } from 'react';
import { Plus, Music, ListMusic, TrendingUp, Globe, Heart, Play, X } from 'lucide-react';
// MovieCard not used here — removed to prevent unused import warnings
import type { Movie } from '../types/movie';
import { MuZIkiLogo } from './MuZIkiLogo';


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
  onDownload: (movie: Movie, type?: 'audio' | 'video') => void;
  currentTrack: Movie | null;
  isPlaying: boolean;
  onBack?: () => void; // Optional back handler for desktop
}

export function SpotifyMusicScreen({ 
  movies, 
  onMusicClick, 
  onDownload: _onDownload,
  currentTrack: _currentTrack,
  isPlaying: _isPlaying,
  onBack
}: SpotifyMusicScreenProps) {
  // intentionally-reference unused props to satisfy the linter/type-checker
  void _onDownload;
  void _currentTrack;
  void _isPlaying;
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

    // Check if song already exists
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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black pb-24">
        {/* Playlist Header */}
        <div className="relative h-64 bg-gradient-to-b from-purple-600/30 to-black">
          <button
            onClick={() => setViewMode('home')}
            className="absolute top-4 left-4 w-10 h-10 bg-black/50 backdrop-blur-xl rounded-full flex items-center justify-center z-10"
          >
            <span className="text-white text-xl">←</span>
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-end gap-4">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-2xl">
                <ListMusic className="w-16 h-16 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-400 mb-1">PLAYLIST</p>
                <h1 className="text-3xl font-black text-white mb-2">{selectedPlaylist.name}</h1>
                <p className="text-sm text-gray-400">{selectedPlaylist.description}</p>
                <p className="text-xs text-gray-500 mt-2">{selectedPlaylist.songs.length} songs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Play All Button */}
        {selectedPlaylist.songs.length > 0 && (
          <div className="px-6 py-4">
            <button
              onClick={() => onMusicClick(selectedPlaylist.songs[0])}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl font-black text-white text-lg flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-green-500/50 transition-all"
            >
              <Play className="w-6 h-6 fill-white" />
              PLAY ALL
            </button>
          </div>
        )}

        {/* Songs List */}
        <div className="px-4">
          {selectedPlaylist.songs.length === 0 ? (
            <div className="text-center py-12">
              <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No songs in this playlist yet</p>
              <button
                onClick={() => setViewMode('home')}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl"
              >
                Browse Music
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedPlaylist.songs.map((song, index) => (
                <div
                  key={song.id}
                  className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
                >
                  {/* Track Number */}
                  <div className="w-8 text-center">
                    <span className="text-gray-400 group-hover:hidden">{index + 1}</span>
                    <button
                      onClick={() => onMusicClick(song)}
                      className="hidden group-hover:inline text-white"
                    >
                      ▶
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <img
                    src={song.thumbnailUrl}
                    alt={song.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">{song.title}</p>
                    <p className="text-sm text-gray-400 truncate">{song.artist || song.genre}</p>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => handleRemoveFromPlaylist(selectedPlaylist.id, song.id)}
                    className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-300 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Playlist */}
        <div className="px-6 py-6">
          <button
            onClick={() => handleDeletePlaylist(selectedPlaylist.id)}
            className="w-full py-3 border border-red-500/30 text-red-400 font-bold rounded-xl hover:bg-red-500/10 transition-all"
          >
            Delete Playlist
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-xl border-b border-green-500/20">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            {/* Back Button - Only show on desktop when onBack is provided */}
            {onBack && (
              <button
                onClick={onBack}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all md:flex hidden"
              >
                <span className="text-white text-xl">←</span>
              </button>
            )}
            <MuZIkiLogo className="w-10 h-10" isActive={true} />
            <h1 className="text-2xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              muZIki
            </h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">{allMusic.length} tracks available</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowCreatePlaylist(true)}
          className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-4 text-left hover:border-purple-500/50 transition-all"
        >
          <Plus className="w-8 h-8 text-purple-400 mb-2" />
          <h3 className="font-black text-white">Create Playlist</h3>
        </button>

        <button
          onClick={() => alert('Liked Songs feature coming soon!')}
          className="bg-gradient-to-br from-pink-600/20 to-red-600/20 border border-pink-500/30 rounded-2xl p-4 text-left hover:border-pink-500/50 transition-all"
        >
          <Heart className="w-8 h-8 text-pink-400 mb-2" />
          <h3 className="font-black text-white">Liked Songs</h3>
        </button>
      </div>

      {/* Your Playlists */}
      {playlists.length > 0 && (
        <div className="px-4 py-4">
          <h2 className="text-xl font-black text-white mb-4">Your Playlists</h2>
          <div className="grid grid-cols-2 gap-3">
            {playlists.map(playlist => (
              <button
                key={playlist.id}
                onClick={() => viewPlaylist(playlist)}
                className="bg-white/5 hover:bg-white/10 rounded-xl p-4 text-left transition-all group"
              >
                <div className="w-full aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-3 flex items-center justify-center">
                  <ListMusic className="w-12 h-12 text-white" />
                </div>
                <h3 className="font-bold text-white truncate">{playlist.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{playlist.songs.length} songs</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trending Music */}
      {trendingMusic.length > 0 && (
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-black text-white">Trending Now</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {trendingMusic.slice(0, 10).map(song => (
              <div key={song.id} className="min-w-[160px]">
                <div className="relative group">
                  <img
                    src={song.thumbnailUrl}
                    alt={song.title}
                    className="w-40 h-40 rounded-xl object-cover"
                  />
                  <button
                    onClick={() => onMusicClick(song)}
                    className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-2xl"
                  >
                    <Play className="w-5 h-5 text-white fill-white ml-1" />
                  </button>
                  <button
                    onClick={() => openAddToPlaylistModal(song)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-xl rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
                <p className="font-bold text-white text-sm mt-2 truncate">{song.title}</p>
                <p className="text-xs text-gray-400 truncate">{song.artist || song.genre}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uganda Music */}
      {ugandaMusic.length > 0 && (
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-black text-white">Uganda Music 🇺🇬</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {ugandaMusic.slice(0, 10).map(song => (
              <div key={song.id} className="group">
                <div className="relative">
                  <img
                    src={song.thumbnailUrl}
                    alt={song.title}
                    className="w-full aspect-square rounded-xl object-cover"
                  />
                  <button
                    onClick={() => onMusicClick(song)}
                    className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-2xl"
                  >
                    <Play className="w-5 h-5 text-white fill-white ml-1" />
                  </button>
                  <button
                    onClick={() => openAddToPlaylistModal(song)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-xl rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
                <p className="font-bold text-white text-sm mt-2 truncate">{song.title}</p>
                <p className="text-xs text-gray-400 truncate">{song.artist || song.genre}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hip Hop & Rap */}
      {hipHopMusic.length > 0 && (
        <div className="px-4 py-4">
          <h2 className="text-xl font-black text-white mb-4">🎤 Hip Hop & Rap</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {hipHopMusic.slice(0, 10).map(song => (
              <div key={song.id} className="group">
                <div className="relative">
                  <img
                    src={song.thumbnailUrl}
                    alt={song.title}
                    className="w-full aspect-square rounded-xl object-cover"
                  />
                  <button
                    onClick={() => onMusicClick(song)}
                    className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-2xl"
                  >
                    <Play className="w-5 h-5 text-white fill-white ml-1" />
                  </button>
                  <button
                    onClick={() => openAddToPlaylistModal(song)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-xl rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
                <p className="font-bold text-white text-sm mt-2 truncate">{song.title}</p>
                <p className="text-xs text-gray-400 truncate">{song.artist || song.genre}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Afrobeat */}
      {afrobeatMusic.length > 0 && (
        <div className="px-4 py-4">
          <h2 className="text-xl font-black text-white mb-4">🔥 Afrobeat Vibes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {afrobeatMusic.slice(0, 10).map(song => (
              <div key={song.id} className="group">
                <div className="relative">
                  <img
                    src={song.thumbnailUrl}
                    alt={song.title}
                    className="w-full aspect-square rounded-xl object-cover"
                  />
                  <button
                    onClick={() => onMusicClick(song)}
                    className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-2xl"
                  >
                    <Play className="w-5 h-5 text-white fill-white ml-1" />
                  </button>
                  <button
                    onClick={() => openAddToPlaylistModal(song)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-xl rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
                <p className="font-bold text-white text-sm mt-2 truncate">{song.title}</p>
                <p className="text-xs text-gray-400 truncate">{song.artist || song.genre}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pop Music */}
      {popMusic.length > 0 && (
        <div className="px-4 py-4">
          <h2 className="text-xl font-black text-white mb-4">🌟 Pop Hits</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {popMusic.slice(0, 10).map(song => (
              <div key={song.id} className="group">
                <div className="relative">
                  <img
                    src={song.thumbnailUrl}
                    alt={song.title}
                    className="w-full aspect-square rounded-xl object-cover"
                  />
                  <button
                    onClick={() => onMusicClick(song)}
                    className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-2xl"
                  >
                    <Play className="w-5 h-5 text-white fill-white ml-1" />
                  </button>
                  <button
                    onClick={() => openAddToPlaylistModal(song)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-xl rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
                <p className="font-bold text-white text-sm mt-2 truncate">{song.title}</p>
                <p className="text-xs text-gray-400 truncate">{song.artist || song.genre}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Music */}
      <div className="px-4 py-4">
        <h2 className="text-xl font-black text-white mb-4">All Music</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {allMusic.map(song => (
            <div key={song.id} className="group">
              <div className="relative">
                <img
                  src={song.thumbnailUrl}
                  alt={song.title}
                  className="w-full aspect-square rounded-xl object-cover"
                />
                <button
                  onClick={() => onMusicClick(song)}
                  className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-2xl"
                >
                  <Play className="w-5 h-5 text-white fill-white ml-1" />
                </button>
                <button
                  onClick={() => openAddToPlaylistModal(song)}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-xl rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="font-bold text-white text-sm mt-2 truncate">{song.title}</p>
              <p className="text-xs text-gray-400 truncate">{song.artist || song.genre}</p>
            </div>
          ))}
        </div>
      </div>

      {allMusic.length === 0 && (
        <div className="text-center py-12">
          <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No music available yet</p>
        </div>
      )}

      {/* CREATE PLAYLIST MODAL */}
      {showCreatePlaylist && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black border border-purple-500/30 rounded-3xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-black text-white mb-4">Create Playlist</h2>
            
            <input
              type="text"
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 mb-3"
            />
            
            <textarea
              placeholder="Description (optional)"
              value={newPlaylistDesc}
              onChange={(e) => setNewPlaylistDesc(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 mb-4 h-24 resize-none"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreatePlaylist(false);
                  setNewPlaylistName('');
                  setNewPlaylistDesc('');
                }}
                className="flex-1 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlaylist}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD TO PLAYLIST MODAL */}
      {showAddToPlaylist && selectedSong && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black border border-purple-500/30 rounded-3xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-black text-white mb-2">Add to Playlist</h2>
            <p className="text-sm text-gray-400 mb-4">{selectedSong.title}</p>
            
            {playlists.length === 0 ? (
              <div className="text-center py-8">
                <ListMusic className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 mb-4">No playlists yet</p>
                <button
                  onClick={() => {
                    setShowAddToPlaylist(false);
                    setShowCreatePlaylist(true);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl"
                >
                  Create Your First Playlist
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {playlists.map(playlist => (
                  <button
                    key={playlist.id}
                    onClick={() => handleAddToPlaylist(playlist.id)}
                    className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-left"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <ListMusic className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white">{playlist.name}</p>
                      <p className="text-xs text-gray-400">{playlist.songs.length} songs</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setShowAddToPlaylist(false);
                setSelectedSong(null);
              }}
              className="w-full mt-4 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}