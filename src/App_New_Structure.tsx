import React, { useState, useEffect } from 'react';
import { Film } from 'lucide-react';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { VideoPlayer } from './components/VideoPlayer';
import { AuthModal } from './components/AuthModal';
import { FourTabBottomNav } from './components/FourTabBottomNav';
import { SearchBar } from './components/SearchBar';
import { TopCategoryTabs } from './components/TopCategoryTabs';
import { CategoryGrid } from './components/CategoryGrid';
import { SectionWithAll } from './components/SectionWithAll';
import { ProfileMenuList } from './components/ProfileMenuList';
import { DownloadsScreen } from './components/DownloadsScreen';
import { MovieCard } from './components/MovieCard';

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
}

interface User {
  id: string;
  email: string;
  name: string;
  accessToken?: string;
}

interface DownloadedMovie extends Movie {
  downloadedAt: string;
}

export default function App() {
  // Navigation State
  const [activeBottomTab, setActiveBottomTab] = useState<'home' | 'browse' | 'downloads' | 'me'>('home');
  const [activeTopTab, setActiveTopTab] = useState('trending');
  
  // Data States
  const [movies, setMovies] = useState<Movie[]>([]);
  const [downloads, setDownloads] = useState<DownloadedMovie[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Player States
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  
  // Auth States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  
  // Admin Portal States (keep existing functionality)
  const [redDotClicks, setRedDotClicks] = useState(0);
  
  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4d451974`;

  // Load data on mount
  useEffect(() => {
    fetchMovies();
    loadUserSession();
    loadDownloads();
  }, []);

  const loadUserSession = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error loading user session:', e);
      }
    }
  };

  const loadDownloads = () => {
    const storedDownloads = localStorage.getItem('downloads');
    if (storedDownloads) {
      try {
        setDownloads(JSON.parse(storedDownloads));
      } catch (e) {
        console.error('Error loading downloads:', e);
      }
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
    } finally {
      setLoading(false);
    }
  };

  const handleRedDotClick = () => {
    setRedDotClicks(prev => {
      const newCount = prev + 1;
      if (newCount === 6) {
        window.location.href = '/admin';
      }
      return newCount;
    });
  };

  const handleWatch = (movie: Movie) => {
    if (!currentUser) {
      alert('Please sign in to watch movies!');
      setShowAuthModal(true);
      return;
    }
    setSelectedMovie(movie);
    setShowPlayer(true);
  };

  const handleDownload = (movie: Movie) => {
    if (!currentUser) {
      alert('Please sign in to download!');
      setShowAuthModal(true);
      return;
    }
    
    // Add to downloads
    const newDownload: DownloadedMovie = {
      ...movie,
      downloadedAt: new Date().toISOString()
    };
    
    const updatedDownloads = [newDownload, ...downloads];
    setDownloads(updatedDownloads);
    localStorage.setItem('downloads', JSON.stringify(updatedDownloads));
    
    alert(`Downloading: ${movie.title}`);
    // Trigger actual download
    window.open(movie.videoUrl, '_blank');
  };

  const handleDeleteDownload = (id: string) => {
    const updatedDownloads = downloads.filter(d => d.id !== id);
    setDownloads(updatedDownloads);
    localStorage.setItem('downloads', JSON.stringify(updatedDownloads));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
  };

  const handleMusicClick = (movie: Movie) => {
    alert('Music player coming soon!');
  };

  // Filter movies based on active top tab
  const getFilteredMovies = () => {
    if (activeTopTab === 'trending') return movies;
    if (activeTopTab === 'movies') return movies.filter(m => m.type === 'movie');
    if (activeTopTab === 'series') return movies.filter(m => m.type === 'series');
    if (activeTopTab === 'music') return movies.filter(m => m.category === 'music');
    if (activeTopTab === 'kids') return movies.filter(m => m.ageRating === 'Kids');
    if (activeTopTab === '18+') return movies.filter(m => m.ageRating === '18+');
    return movies;
  };

  const getSearchResults = () => {
    if (!searchQuery) return [];
    return movies.filter(m => 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'hollywood', name: 'Hollywood', backgroundImage: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400' },
    { id: 'nollywood', name: 'Nollywood', backgroundImage: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400' },
  ];

  const filteredMovies = getFilteredMovies();
  const searchResults = getSearchResults();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black">
      {/* HEADER - Desktop Only */}
      <header className="hidden md:flex sticky top-0 z-50 bg-black/95 backdrop-blur-2xl border-b border-[#FFD700]/20 shadow-[0_8px_32px_0_rgba(255,215,0,0.15)]">
        <div className="max-w-7xl mx-auto px-8 w-full">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700] to-[#FFA500] blur-xl opacity-40 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-[#FFD700] to-[#FF4500] p-2.5 rounded-2xl shadow-2xl">
                  <Film className="w-7 h-7 text-black" />
                </div>
                <div 
                  onClick={handleRedDotClick}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full cursor-pointer hover:scale-125 transition-transform shadow-lg shadow-red-500/50 animate-pulse"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-red-500 text-[10px] font-black px-2.5 py-1 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-lg border border-red-500/30 animate-pulse">
                    🔴 LIVE
                  </span>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF4500] bg-clip-text text-transparent">
                    THEE ARCHIVE
                  </h1>
                </div>
                <p className="text-[10px] font-bold text-gray-400 tracking-wider">ULTIMATE ENTERTAINMENT HUB 🎬</p>
              </div>
            </div>

            {/* Auth Button */}
            {!currentUser && (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-black rounded-xl hover:shadow-lg hover:shadow-[#FFD700]/50 transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="pb-4">
        {/* HOME TAB */}
        {activeBottomTab === 'home' && (
          <>
            {/* Search Bar */}
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search movies, series, music..."
            />

            {/* Show Search Results if searching */}
            {searchQuery ? (
              <div className="px-4 py-6">
                <h2 className="text-2xl font-black text-white mb-4">
                  Search Results ({searchResults.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {searchResults.map(movie => (
                    <MovieCard
                      key={movie.id}
                      movie={movie as any}
                      onWatch={handleWatch}
                      onDownload={handleDownload}
                      onMusicClick={handleMusicClick}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Top Category Tabs */}
                <TopCategoryTabs
                  activeTab={activeTopTab}
                  onTabChange={setActiveTopTab}
                  has18Plus={currentUser !== null}
                />

                {/* Hero Section - First Movie */}
                {filteredMovies[0] && (
                  <div 
                    className="relative h-[50vh] bg-cover bg-center mb-6"
                    style={{ backgroundImage: `url(${filteredMovies[0].thumbnailUrl})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                    <div className="absolute bottom-8 left-4 right-4">
                      <h2 className="text-3xl font-black text-white mb-2">{filteredMovies[0].title}</h2>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-[#FFD700] text-black px-3 py-1 rounded-lg font-black text-sm">
                          {filteredMovies[0].ageRating || 'PG'}
                        </span>
                        <span className="text-[#FFD700] font-bold">{filteredMovies[0].year}</span>
                        <span className="text-gray-300">{filteredMovies[0].genre}</span>
                      </div>
                      <button
                        onClick={() => handleWatch(filteredMovies[0])}
                        className="px-8 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-black rounded-xl hover:shadow-lg hover:shadow-[#FFD700]/50 transition-all"
                      >
                        ▶ WATCH NOW
                      </button>
                    </div>
                  </div>
                )}

                {/* Category Grid */}
                <CategoryGrid
                  categories={categories}
                  onCategoryClick={(id) => alert(`Category: ${id}`)}
                />

                {/* Sections with "All >" button */}
                <SectionWithAll
                  title="Trending Now"
                  emoji="🔥"
                  movies={filteredMovies.slice(0, 20)}
                  onWatch={handleWatch}
                  onDownload={handleDownload}
                  onMusicClick={handleMusicClick}
                  onViewAll={() => alert('View all trending')}
                />

                <SectionWithAll
                  title="Hollywood Movie"
                  movies={filteredMovies.filter(m => m.genre?.includes('Action')).slice(0, 20)}
                  onWatch={handleWatch}
                  onDownload={handleDownload}
                  onMusicClick={handleMusicClick}
                  onViewAll={() => alert('View all Hollywood')}
                />

                <SectionWithAll
                  title="New Releases"
                  emoji="🆕"
                  movies={[...filteredMovies].sort((a, b) => 
                    new Date(b.uploadedAt || '').getTime() - new Date(a.uploadedAt || '').getTime()
                  ).slice(0, 20)}
                  onWatch={handleWatch}
                  onDownload={handleDownload}
                  onMusicClick={handleMusicClick}
                />
              </>
            )}
          </>
        )}

        {/* BROWSE TAB */}
        {activeBottomTab === 'browse' && (
          <div className="px-4 py-6">
            <h1 className="text-3xl font-black bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent mb-6">
              Browse All Content
            </h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {movies.map(movie => (
                <MovieCard
                  key={movie.id}
                  movie={movie as any}
                  onWatch={handleWatch}
                  onDownload={handleDownload}
                  onMusicClick={handleMusicClick}
                />
              ))}
            </div>
          </div>
        )}

        {/* DOWNLOADS TAB */}
        {activeBottomTab === 'downloads' && (
          <DownloadsScreen
            downloads={downloads}
            onPlay={handleWatch}
            onDelete={handleDeleteDownload}
          />
        )}

        {/* ME/PROFILE TAB */}
        {activeBottomTab === 'me' && (
          <>
            {currentUser ? (
              <ProfileMenuList
                userName={currentUser.name}
                userEmail={currentUser.email}
                userId={currentUser.id}
                onLogout={handleLogout}
              />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-screen px-4 pb-24">
                <div className="text-center">
                  <h2 className="text-2xl font-black text-white mb-4">Sign in to continue</h2>
                  <p className="text-gray-400 mb-6">Access your profile, downloads, and watch history</p>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="px-8 py-4 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-black rounded-xl hover:shadow-lg hover:shadow-[#FFD700]/50 transition-all"
                  >
                    Sign In / Sign Up
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* BOTTOM NAVIGATION */}
      <FourTabBottomNav
        activeTab={activeBottomTab}
        onTabChange={setActiveBottomTab}
        downloadCount={downloads.length}
      />

      {/* MODALS */}
      {showPlayer && selectedMovie && (
        <VideoPlayer
          videoUrl={selectedMovie.videoUrl}
          title={selectedMovie.title}
          description={selectedMovie.description}
          year={selectedMovie.year}
          genre={selectedMovie.genre}
          onClose={() => {
            setShowPlayer(false);
            setSelectedMovie(null);
          }}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={(user) => {
            setCurrentUser(user);
            setShowAuthModal(false);
          }}
        />
      )}
    </div>
  );
}
