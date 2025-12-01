import React, { useState, useEffect } from 'react';
import { ArrowLeft, Film, Edit, Trash2, Save, X, Search, Tv, Zap, Plus, Upload, FileUp, Loader, Music } from 'lucide-react';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { extractSeriesTitle, extractEpisodeInfo } from './utils/seriesGrouping';
import { ContentUploadModal } from './components/ContentUploadModal';
import { ShortsAnalyticsView } from './components/ShortsAnalyticsView';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4d451974`;

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
  // Series fields
  seriesTitle?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  // Music fields
  contentType?: 'music-video' | 'music-audio';
  artist?: string;
}

interface MovieAdminPortalProps {
  skipAuth?: boolean;
  onNavigateBack?: () => void;
}

export default function MovieAdminPortal({ skipAuth = false, onNavigateBack }: MovieAdminPortalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(skipAuth);
  const [password, setPassword] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'series' | 'music'>('all');
  const [activeTab, setActiveTab] = useState<'content' | 'analytics'>('content');
  
  // Helper function to clean movie objects and remove circular references
  const cleanMovie = (movie: Movie): Movie => {
    return {
      id: movie.id,
      title: movie.title,
      description: movie.description,
      videoUrl: movie.videoUrl,
      thumbnailUrl: movie.thumbnailUrl,
      genre: movie.genre,
      year: movie.year,
      type: movie.type,
      fileSize: movie.fileSize,
      category: movie.category,
      ageRating: movie.ageRating,
      section: movie.section,
      uploadedAt: movie.uploadedAt,
      seriesTitle: movie.seriesTitle,
      seasonNumber: movie.seasonNumber,
      episodeNumber: movie.episodeNumber,
      contentType: movie.contentType,
      artist: movie.artist
    };
  };
  
  // Bulk grouping states
  const [showBulkGrouping, setShowBulkGrouping] = useState(false);
  const [detectedSeries, setDetectedSeries] = useState<{ [key: string]: Movie[] }>({});
  const [alreadyGroupedSeries, setAlreadyGroupedSeries] = useState<{ [key: string]: Movie[] }>({});
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  
  // Upload states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadMode, setUploadMode] = useState<'single' | 'bulk'>('single');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // New content form
  const [newContent, setNewContent] = useState<Partial<Movie>>({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    genre: '',
    year: new Date().getFullYear().toString(),
    type: 'movie',
    category: 'movie',
    ageRating: 'PG',
    section: 'Movies',
  });
  
  // Debug: Component mounted
  console.log('🎬 MovieAdminPortal MOUNTED - Component is rendering!');
  console.log('Is authenticated:', isAuthenticated);
  console.log('Current path:', window.location.pathname);
  
  // Force show that we're alive
  useEffect(() => {
    console.log('✅ MovieAdminPortal useEffect triggered!');
    document.title = '🎬 MOVIE ADMIN - THEE ARCHIVE';
  }, []);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchMovies();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    if (password === '0701680Kyamundu') {
      setIsAuthenticated(true);
    } else {
      alert('❌ Invalid password!');
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await fetch(`${API_URL}/movies`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();
      if (data.success) {
        setMovies(data.movies || []);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const handleEditMovie = (movie: Movie) => {
    setEditingMovie({ ...movie });
  };

  const handleAutoFillSeries = () => {
    if (!editingMovie) return;
    
    const episodeInfo = extractEpisodeInfo(editingMovie.title);
    const seriesTitle = extractSeriesTitle(editingMovie.title);
    
    setEditingMovie({
      ...editingMovie,
      seriesTitle: seriesTitle,
      seasonNumber: episodeInfo?.season || 1,
      episodeNumber: episodeInfo?.episode || 1,
      type: 'series'
    });
  };

  const handleSaveMovie = async () => {
    if (!editingMovie) return;

    try {
      // Clean the movie to remove any circular references before sending
      const cleanedMovie = cleanMovie(editingMovie);
      
      const response = await fetch(`${API_URL}/movies/${editingMovie.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanedMovie)
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Movie updated successfully!');
        setEditingMovie(null);
        fetchMovies();
      } else {
        alert('❌ Error updating movie: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving movie:', error);
      alert('❌ Error saving movie');
    }
  };

  const handleDeleteMovie = async (movieId: string) => {
    if (!confirm('Are you sure you want to delete this movie? This cannot be undone.')) return;

    try {
      const response = await fetch(`${API_URL}/movies/${movieId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Movie deleted successfully!');
        fetchMovies();
      } else {
        alert('❌ Error deleting movie: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('❌ Error deleting movie');
    }
  };

  // BULK SERIES GROUPING FUNCTIONS
  const detectAndGroupSeries = async () => {
    // PART 1: Find ALREADY GROUPED series
    const alreadyGrouped: { [key: string]: Movie[] } = {};
    movies.forEach(movie => {
      if (movie.seriesTitle && movie.type === 'series') {
        const key = movie.seriesTitle.toLowerCase();
        if (!alreadyGrouped[key]) {
          alreadyGrouped[key] = [];
        }
        alreadyGrouped[key].push(movie);
      }
    });
    
    // Sort episodes within each series
    Object.keys(alreadyGrouped).forEach(key => {
      alreadyGrouped[key].sort((a, b) => {
        const seasonDiff = (a.seasonNumber || 1) - (b.seasonNumber || 1);
        if (seasonDiff !== 0) return seasonDiff;
        return (a.episodeNumber || 1) - (b.episodeNumber || 1);
      });
    });
    
    // PART 2: Find NEW series to group (movies without seriesTitle)
    const seriesGroups: { [key: string]: Movie[] } = {};
    
    // NEW LOGIC: Group by similar titles (even if tagged as "movie")
    movies.forEach(movie => {
      // Skip if already has seriesTitle (already grouped)
      if (movie.seriesTitle) return;
      
      // Extract base series name more intelligently
      let baseTitle = movie.title;
      
      // Remove common episode indicators and numbers AFTER them
      baseTitle = baseTitle.replace(/\s*[:-]?\s*(Episode|EP|Part|Vol|Volume|Chapter)\s*\d+.*$/gi, '');
      baseTitle = baseTitle.replace(/\s*[:-]?\s*(Season|S)\s*\d+.*$/gi, '');
      baseTitle = baseTitle.replace(/\s*[:-]?\s*\d+\s*$/, ''); // Remove trailing numbers like "Hostage 5"
      
      // Remove quality tags and technical info
      baseTitle = baseTitle.replace(/\b(720p|1080p|4K|HD|BluRay|WEB-DL|WEBRip|HDTV|DVDRip|BRRip)\b/gi, '');
      
      // Remove years in parentheses
      baseTitle = baseTitle.replace(/\s*\(\d{4}\)\s*/g, ' ');
      
      // Clean up separators and extra spaces
      baseTitle = baseTitle.replace(/[_\-\.]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
      
      // If the cleaned title is too short, skip (likely not a series)
      if (baseTitle.length < 2) return;
      
      // Group by cleaned base title
      if (!seriesGroups[baseTitle]) {
        seriesGroups[baseTitle] = [];
      }
      seriesGroups[baseTitle].push(movie);
    });
    
    // Only keep groups with 2+ episodes (multiple movies with same name = series!)
    const filteredGroups: { [key: string]: Movie[] } = {};
    Object.keys(seriesGroups).forEach(key => {
      if (seriesGroups[key].length >= 2) {
        // Sort by title to maintain order
        seriesGroups[key].sort((a, b) => a.title.localeCompare(b.title));
        filteredGroups[key] = seriesGroups[key];
      }
    });
    
    console.log('🔍 Detected series groups:', filteredGroups);
    console.log('📊 Total series found:', Object.keys(filteredGroups).length);
    console.log('📺 Total episodes:', Object.values(filteredGroups).reduce((sum, eps) => sum + eps.length, 0));
    
    setDetectedSeries(filteredGroups);
    setAlreadyGroupedSeries(alreadyGrouped);
    setShowBulkGrouping(true);
    
    // AUTO-GROUP THE SERIES
    const totalEpisodes = Object.values(detectedSeries).reduce((sum, eps) => sum + eps.length, 0);
    
    if (!confirm(`This will update ${totalEpisodes} episodes across ${Object.keys(detectedSeries).length} series. Continue?`)) {
      return;
    }
    
    setIsBulkProcessing(true);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const [seriesKey, episodes] of Object.entries(detectedSeries)) {
      // Use the first episode's title to extract series name
      const seriesTitle = episodes[0] ? extractSeriesTitle(episodes[0].title) : seriesKey;
      
      // Process each episode
      for (let i = 0; i < episodes.length; i++) {
        const episode = episodes[i];
        
        try {
          // Try to extract episode info from title
          const episodeInfo = extractEpisodeInfo(episode.title);
          
          // If no episode info found, use index + 1 as episode number
          const episodeNumber = episodeInfo?.episode || (i + 1);
          const seasonNumber = episodeInfo?.season || 1;
          
          const updatedMovie = {
            ...episode,
            type: 'series',
            seriesTitle: seriesTitle,
            seasonNumber: seasonNumber,
            episodeNumber: episodeNumber,
          };
          
          console.log(`📺 Updating: ${episode.title} → ${seriesTitle} S${seasonNumber}E${episodeNumber}`);
          
          const response = await fetch(`${API_URL}/movies/${episode.id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedMovie)
          });
          
          const data = await response.json();
          if (data.success) {
            successCount++;
          } else {
            errorCount++;
            console.error('Error updating episode:', episode.title, data.error);
          }
          
          // Small delay to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          errorCount++;
          console.error('Error updating episode:', episode.title, error);
        }
      }
    }
    
    setIsBulkProcessing(false);
    setShowBulkGrouping(false);
    
    alert(`✅ Bulk grouping complete!\n\nSuccessfully updated: ${successCount}\nErrors: ${errorCount}`);
    
    fetchMovies();
  };
  
  const handleBulkGroupSeries = async () => {
    const totalEpisodes = Object.values(detectedSeries).reduce((sum, eps) => sum + eps.length, 0);
    
    if (!confirm(`This will update ${totalEpisodes} episodes across ${Object.keys(detectedSeries).length} series. Continue?`)) {
      return;
    }
    
    setIsBulkProcessing(true);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const [seriesKey, episodes] of Object.entries(detectedSeries)) {
      // Use the first episode's title to extract series name
      const seriesTitle = episodes[0] ? extractSeriesTitle(episodes[0].title) : seriesKey;
      
      // Process each episode
      for (let i = 0; i < episodes.length; i++) {
        const episode = episodes[i];
        
        try {
          // Try to extract episode info from title
          const episodeInfo = extractEpisodeInfo(episode.title);
          
          // If no episode info found, use index + 1 as episode number
          const episodeNumber = episodeInfo?.episode || (i + 1);
          const seasonNumber = episodeInfo?.season || 1;
          
          const updatedMovie = {
            ...episode,
            type: 'series',
            category: 'series',
            seriesTitle: seriesTitle,
            seasonNumber: seasonNumber,
            episodeNumber: episodeNumber,
          };
          
          console.log(`📺 Updating: ${episode.title} → ${seriesTitle} S${seasonNumber}E${episodeNumber}`);
          
          const response = await fetch(`${API_URL}/movies/${episode.id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedMovie)
          });
          
          const data = await response.json();
          if (data.success) {
            successCount++;
          } else {
            errorCount++;
            console.error('Error updating episode:', episode.title, data.error);
          }
          
          // Small delay to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          errorCount++;
          console.error('Error updating episode:', episode.title, error);
        }
      }
    }
    
    setIsBulkProcessing(false);
    setShowBulkGrouping(false);
    
    alert(`✅ Bulk grouping complete!\n\nSuccessfully updated: ${successCount}\nErrors: ${errorCount}`);
    
    fetchMovies();
  };

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         movie.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || movie.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Debug: Show raw count
  console.log('Total movies in database:', movies.length);
  console.log('Filtered movies:', filteredMovies.length);

  // Login Screen
  if (!isAuthenticated) {
    console.log('🔒 Rendering LOGIN screen');
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        {/* BRIGHT TEST BANNER */}
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 font-black text-xl z-[9999]">
          ✅ MOVIE ADMIN PORTAL LOADED!
        </div>
        
        <div className="w-full max-w-md bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black bg-gradient-to-r from-[#FFD700] to-[#FF4500] bg-clip-text text-transparent mb-2">
              🎬 MOVIE ADMIN
            </h1>
            <p className="text-gray-400 text-sm">THEE ARCHIVE Movie Management</p>
          </div>
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Enter admin password..."
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-all mb-4"
          />
          
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-black rounded-xl hover:shadow-lg hover:shadow-[#FFD700]/50 transition-all"
          >
            🔐 LOGIN
          </button>
        </div>
      </div>
    );
  }

  // Main Admin Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-[#FFD700]/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigateBack ? onNavigateBack() : window.location.href = '/'}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                title={onNavigateBack ? "Back to Admin Portal" : "Back to Home"}
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-[#FFD700] to-[#FF4500] bg-clip-text text-transparent">
                  CONTENT MANAGER
                </h1>
                {onNavigateBack && (
                  <p className="text-xs text-gray-400">Admin Portal • Content Management</p>
                )}
              </div>
            </div>
            
            <div className="text-sm text-gray-400">
              Total Movies: <span className="text-[#FFD700] font-bold">{movies.length}</span>
              {searchQuery && (
                <span className="ml-2">
                  | Showing: <span className="text-cyan-400 font-bold">{filteredMovies.length}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* TAB NAVIGATION */}
        <div className="mb-6 flex gap-2 justify-center">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-8 py-4 rounded-xl font-black text-lg transition-all ${
              activeTab === 'content'
                ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black shadow-2xl shadow-[#FFD700]/50'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            🎬 CONTENT MANAGER
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-8 py-4 rounded-xl font-black text-lg transition-all ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white shadow-2xl shadow-purple-500/50'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            📊 SHORTS ANALYTICS
          </button>
        </div>

        {/* CONTENT TAB */}
        {activeTab === 'content' && (
          <>
            {/* UPLOAD BUTTON - BIG AND PROMINENT */}
            <div className="mb-6 flex items-center justify-center">
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-12 py-6 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF4500] text-black font-black text-2xl rounded-2xl hover:shadow-2xl hover:shadow-[#FFD700]/50 transition-all transform hover:scale-105 flex items-center gap-4"
              >
                <Upload className="w-8 h-8" />
                📤 UPLOAD NEW CONTENT
                <Plus className="w-8 h-8" />
              </button>
            </div>

            {/* BULK SERIES GROUPING BUTTON */}
            <div className="mb-6 flex flex-col items-center gap-4">
              <button
                onClick={detectAndGroupSeries}
                disabled={isBulkProcessing}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white font-black text-xl rounded-2xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBulkProcessing ? (
                  <>⏳ Processing...</>
                ) : (
                  <>🚀 AUTO-GROUP ALL SERIES</>
                )}
              </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="mb-6 flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies..."
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-all"
                />
              </div>
              
              <div className="flex gap-2">
                {['all', 'movie', 'series', 'music'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type as any)}
                    className={`px-4 py-3 rounded-xl font-bold transition-all ${
                      filterType === type
                        ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Movies List */}
            <div className="grid gap-4">
              {filteredMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="relative bg-gradient-to-r from-white/10 to-white/5 rounded-xl p-4 border border-white/10"
                  style={{ willChange: 'border-color' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.5)';
                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(255, 215, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <img
                      src={movie.thumbnailUrl}
                      alt={movie.title}
                      className="w-24 h-36 object-cover rounded-lg flex-shrink-0"
                    />
                    
                    {/* Movie Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-black text-white mb-1">{movie.title}</h3>
                          <div className="flex gap-2 items-center flex-wrap">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              movie.type === 'series' ? 'bg-purple-500/20 text-purple-400' :
                              movie.type === 'music' ? 'bg-green-500/20 text-green-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {movie.type}
                            </span>
                            <span className="text-xs text-gray-400">{movie.year}</span>
                            {movie.ageRating && (
                              <span className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                                {movie.ageRating}
                              </span>
                            )}
                            {movie.seriesTitle && (
                              <span className="px-2 py-1 bg-[#FFD700]/20 rounded text-xs text-[#FFD700]">
                                📺 {movie.seriesTitle} S{movie.seasonNumber}E{movie.episodeNumber}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditMovie(movie)}
                            className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMovie(movie.id)}
                            className="px-3 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-sm rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">{movie.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{movie.genre}</p>
                    </div>
                  </div>
                </div>
              ))}

              {filteredMovies.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No movies found</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ANALYTICS TAB - MOVIE SHORTS STATS */}
        {activeTab === 'analytics' && (
          <ShortsAnalyticsView movies={movies} />
        )}
      </main>

      {/* Edit Modal */}
      {editingMovie && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-black/95 backdrop-blur-xl p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-2xl font-black text-white">Edit Movie</h2>
              <button
                onClick={() => setEditingMovie(null)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">Title</label>
                <input
                  type="text"
                  value={editingMovie.title}
                  onChange={(e) => setEditingMovie({ ...editingMovie, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FFD700] transition-all"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">Type</label>
                <select
                  value={editingMovie.type}
                  onChange={(e) => setEditingMovie({ ...editingMovie, type: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FFD700] transition-all"
                >
                  <option value="movie">Movie</option>
                  <option value="series">Series</option>
                  <option value="music">Music</option>
                </select>
              </div>

              {/* Series Fields */}
              {editingMovie.type === 'series' && (
                <>
                  <div className="bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Tv className="w-5 h-5 text-[#FFD700]" />
                        <h3 className="font-black text-white">Series Information</h3>
                      </div>
                      <button
                        onClick={handleAutoFillSeries}
                        className="px-3 py-1.5 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black text-xs font-bold rounded-lg hover:shadow-lg transition-all"
                      >
                        Auto-Fill from Title
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">Series Title</label>
                        <input
                          type="text"
                          value={editingMovie.seriesTitle || ''}
                          onChange={(e) => setEditingMovie({ ...editingMovie, seriesTitle: e.target.value })}
                          placeholder="e.g., Breaking Bad"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#FFD700] transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-300 mb-1">Season Number</label>
                          <input
                            type="number"
                            value={editingMovie.seasonNumber || 1}
                            onChange={(e) => setEditingMovie({ ...editingMovie, seasonNumber: parseInt(e.target.value) || 1 })}
                            min="1"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#FFD700] transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-300 mb-1">Episode Number</label>
                          <input
                            type="number"
                            value={editingMovie.episodeNumber || 1}
                            onChange={(e) => setEditingMovie({ ...editingMovie, episodeNumber: parseInt(e.target.value) || 1 })}
                            min="1"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#FFD700] transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">Description</label>
                <textarea
                  value={editingMovie.description}
                  onChange={(e) => setEditingMovie({ ...editingMovie, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FFD700] transition-all"
                />
              </div>

              {/* Genre */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">Genre</label>
                <input
                  type="text"
                  value={editingMovie.genre}
                  onChange={(e) => setEditingMovie({ ...editingMovie, genre: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FFD700] transition-all"
                />
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">Year</label>
                <input
                  type="text"
                  value={editingMovie.year}
                  onChange={(e) => setEditingMovie({ ...editingMovie, year: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FFD700] transition-all"
                />
              </div>

              {/* Age Rating */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">Age Rating</label>
                <select
                  value={editingMovie.ageRating || 'PG'}
                  onChange={(e) => setEditingMovie({ ...editingMovie, ageRating: e.target.value as any })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FFD700] transition-all"
                >
                  <option value="G">G</option>
                  <option value="PG">PG</option>
                  <option value="PG-13">PG-13</option>
                  <option value="R">R</option>
                  <option value="18+">18+</option>
                  <option value="Kids">Kids</option>
                </select>
              </div>

              {/* MUSIC FIELDS - Only show if type is music */}
              {editingMovie.type === 'music' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Music className="w-5 h-5 text-green-400" />
                    </div>
                    <h3 className="font-black text-white">Music Information</h3>
                  </div>

                  {/* Content Type */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Content Type</label>
                    <select
                      value={editingMovie.contentType || 'music-video'}
                      onChange={(e) => setEditingMovie({ ...editingMovie, contentType: e.target.value as any, category: 'music' })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#FFD700] transition-all"
                    >
                      <option value="music-video">🎬 Music Video (has video)</option>
                      <option value="music-audio">🎵 Audio Only (mp3/audio file)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {editingMovie.contentType === 'music-audio' 
                        ? '💡 Audio-only mode: User can only listen, no video player'
                        : '💡 Music Video: User can switch between video and audio-only mode'}
                    </p>
                  </div>

                  {/* Artist Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Artist Name</label>
                    <input
                      type="text"
                      value={editingMovie.artist || ''}
                      onChange={(e) => setEditingMovie({ ...editingMovie, artist: e.target.value })}
                      placeholder="e.g., Drake, Rihanna, The Weeknd..."
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#FFD700] transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Will be displayed as subtitle in music player
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveMovie}
                  className="flex-1 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-black rounded-xl hover:shadow-lg hover:shadow-[#FFD700]/50 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingMovie(null)}
                  className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Grouping Modal */}
      {showBulkGrouping && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-black/95 backdrop-blur-xl p-6 border-b border-purple-500/30 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  📺 Series Library Overview
                </h2>
                <div className="flex gap-4 mt-2 text-sm">
                  <div>
                    <span className="text-gray-400">✅ Already Grouped: </span>
                    <span className="text-green-400 font-bold">
                      {Object.keys(alreadyGroupedSeries).length} series ({Object.values(alreadyGroupedSeries).reduce((sum, eps) => sum + eps.length, 0)} episodes)
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">🆕 Newly Detected: </span>
                    <span className="text-purple-400 font-bold">
                      {Object.keys(detectedSeries).length} series ({Object.values(detectedSeries).reduce((sum, eps) => sum + eps.length, 0)} episodes)
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowBulkGrouping(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6">
              {/* ALREADY GROUPED SERIES SECTION */}
              {Object.keys(alreadyGroupedSeries).length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-emerald-400 rounded"></div>
                    <h3 className="text-xl font-black text-white">✅ Already Grouped Series</h3>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-bold rounded-lg">
                      {Object.keys(alreadyGroupedSeries).length} series
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(alreadyGroupedSeries).map(([seriesKey, episodes]) => {
                      const seriesTitle = episodes[0]?.seriesTitle || seriesKey;
                      return (
                        <div key={seriesKey} className="bg-green-500/5 rounded-xl p-3 border border-green-500/20">
                          <div className="flex items-center gap-2 mb-1">
                            <Tv className="w-4 h-4 text-green-400" />
                            <h4 className="font-bold text-white text-sm">{seriesTitle}</h4>
                          </div>
                          <p className="text-xs text-gray-400">{episodes.length} episodes grouped</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* NEWLY DETECTED SERIES SECTION */}
              {Object.keys(detectedSeries).length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-green-400 mb-2">🎉 All series are already grouped!</p>
                  <p className="text-sm text-gray-500">Your series library is fully organized.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {Object.entries(detectedSeries).map(([seriesKey, episodes]) => {
                      const seriesTitle = episodes[0] ? extractSeriesTitle(episodes[0].title) : seriesKey;
                      return (
                        <div key={seriesKey} className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <div className="flex items-center gap-3 mb-3">
                            <Tv className="w-5 h-5 text-purple-400" />
                            <h3 className="font-black text-white text-lg">{seriesTitle}</h3>
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded">
                              {episodes.length} episodes
                            </span>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {episodes.slice(0, 3).map(ep => (
                              <div key={ep.id} className="text-sm text-gray-400 pl-8">
                                • {ep.title}
                              </div>
                            ))}
                            {episodes.length > 3 && (
                              <div className="text-sm text-gray-500 pl-8">
                                ... and {episodes.length - 3} more episodes
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleBulkGroupSeries}
                      disabled={isBulkProcessing}
                      className="flex-1 py-4 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white font-black text-lg rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isBulkProcessing ? '⏳ Processing...' : '✅ GROUP ALL SERIES NOW'}
                    </button>
                    <button
                      onClick={() => setShowBulkGrouping(false)}
                      disabled={isBulkProcessing}
                      className="px-6 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Upload Modal */}
      <ContentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={fetchMovies}
        apiUrl={API_URL}
        apiKey={publicAnonKey}
      />
    </div>
  );
}