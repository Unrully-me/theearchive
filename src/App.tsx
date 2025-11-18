import React, { useState, useEffect } from 'react';
import { Film, Menu, X, Download, Play, Lock, Plus, Edit2, Trash2, Save, Search, Users, LogOut, Ban, CheckCircle, User } from 'lucide-react';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { VideoPlayer } from './components/VideoPlayer';
import { AuthModal } from './components/AuthModal';

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
}

interface User {
  id: string;
  email: string;
  name: string;
  accessToken?: string;
}

interface UserRecord {
  id: string;
  email: string;
  name: string;
  isBlocked: boolean;
  createdAt: string;
  blockedAt?: string;
  unblockedAt?: string;
}

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  
  // Auth States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Admin Portal States
  const [redDotClicks, setRedDotClicks] = useState(0);
  const [showAdminPortal, setShowAdminPortal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminTab, setAdminTab] = useState<'add' | 'edit' | 'users' | 'background'>('add');
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [adminFormData, setAdminFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    genre: '',
    year: '',
    type: 'movie',
    fileSize: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordError, setShowPasswordError] = useState(false);

  // User Management States
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);

  // Background Settings States
  const [backgroundType, setBackgroundType] = useState<'video' | 'image'>('image');
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState('');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
  const [backgroundPassword, setBackgroundPassword] = useState('');

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4d451974`;
  const ADMIN_PASSWORD = '0701680Kyamundu';

  useEffect(() => {
    fetchMovies();
  }, []);

  // Load background settings on mount
  useEffect(() => {
    fetchBackgroundSettings();
  }, []);

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken');
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      }
    }
  }, []);

  // Filter movies when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMovies(movies);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = movies.filter(movie =>
        movie.title.toLowerCase().includes(query) ||
        movie.description.toLowerCase().includes(query) ||
        movie.genre.toLowerCase().includes(query) ||
        movie.year.includes(query)
      );
      setFilteredMovies(filtered);
    }
  }, [searchQuery, movies]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      console.log('Fetching movies from:', `${API_URL}/movies`);
      const response = await fetch(`${API_URL}/movies`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      if (data.success) {
        setMovies(data.movies);
        setFilteredMovies(data.movies);
        console.log('Movies loaded:', data.movies.length);
      } else {
        console.error('Failed to fetch movies:', data.error);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchClick = (movie: Movie) => {
    // Check if user is logged in
    if (!currentUser) {
      alert('Please sign in to watch movies!');
      setShowAuthModal(true);
      return;
    }

    setSelectedMovie(movie);
    setShowPlayer(true);
    // Trigger Google AdSense
    triggerGoogleAd();
  };

  const handleDownloadClick = (movie: Movie) => {
    // Check if user is logged in
    if (!currentUser) {
      alert('Please sign in to download movies!');
      setShowAuthModal(true);
      return;
    }

    // Trigger Google AdSense before download
    triggerGoogleAd();
    
    // Start download - open in new tab for user to download
    setTimeout(() => {
      // Create a hidden link that opens the video URL
      const link = document.createElement('a');
      link.href = movie.videoUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Try to set download attribute (works for same-origin or properly configured CORS)
      link.download = `${movie.title}.mp4`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Notify user
      alert(`Opening download for "${movie.title}". If download doesn't start automatically, right-click the video and select "Save video as..."`);
    }, 500);
  };

  const triggerGoogleAd = () => {
    // This will trigger Google AdSense
    // Google will handle ad display automatically
    try {
      // @ts-ignore
      if (window.adsbygoogle && window.adsbygoogle.loaded) {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.log('AdSense not loaded yet');
    }
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
    setSelectedMovie(null);
  };

  // Admin Portal Functions
  const handleRedDotClick = () => {
    const newClickCount = redDotClicks + 1;
    setRedDotClicks(newClickCount);
    
    if (newClickCount === 6) {
      setShowAdminPortal(true);
      setRedDotClicks(0);
    }
    
    setTimeout(() => setRedDotClicks(0), 2000);
  };

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
    } else {
      alert('Incorrect password!');
    }
  };

  const handleAdminFormChange = (field: string, value: string) => {
    setAdminFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddMovie = async () => {
    if (!adminFormData.title || !adminFormData.videoUrl) {
      alert('Please fill in at least Title and Video URL');
      return;
    }

    if (!confirmPassword) {
      setShowPasswordError(true);
      return;
    }

    if (confirmPassword !== ADMIN_PASSWORD) {
      alert('Incorrect password!');
      setShowPasswordError(true);
      return;
    }

    setShowPasswordError(false);

    try {
      const response = await fetch(`${API_URL}/movies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminFormData),
      });

      const data = await response.json();
      if (data.success) {
        alert('Movie added successfully!');
        setAdminFormData({
          title: '',
          description: '',
          videoUrl: '',
          thumbnailUrl: '',
          genre: '',
          year: '',
          type: 'movie',
          fileSize: ''
        });
        setConfirmPassword('');
        fetchMovies();
      } else {
        alert('Error adding movie: ' + data.error);
      }
    } catch (error) {
      console.error('Error adding movie:', error);
      alert('Error adding movie. Check console.');
    }
  };

  const handleEditMovie = async () => {
    if (!editingMovie) return;

    if (!confirmPassword) {
      setShowPasswordError(true);
      return;
    }

    if (confirmPassword !== ADMIN_PASSWORD) {
      alert('Incorrect password!');
      setShowPasswordError(true);
      return;
    }

    setShowPasswordError(false);

    try {
      const response = await fetch(`${API_URL}/movies/${editingMovie.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminFormData),
      });

      const data = await response.json();
      if (data.success) {
        alert('Movie updated successfully!');
        setEditingMovie(null);
        setConfirmPassword('');
        fetchMovies();
      } else {
        alert('Error updating movie: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating movie:', error);
      alert('Error updating movie. Check console.');
    }
  };

  const handleDeleteMovie = async (movieId: string) => {
    if (!confirm('Are you sure you want to delete this movie?')) return;

    const password = prompt('Enter admin password to confirm deletion:');
    if (password !== ADMIN_PASSWORD) {
      alert('Incorrect password!');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/movies/${movieId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        alert('Movie deleted successfully!');
        fetchMovies();
      } else {
        alert('Error deleting movie: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('Error deleting movie. Check console.');
    }
  };

  const selectMovieForEdit = (movie: Movie) => {
    setEditingMovie(movie);
    setAdminFormData({
      title: movie.title,
      description: movie.description,
      videoUrl: movie.videoUrl,
      thumbnailUrl: movie.thumbnailUrl,
      genre: movie.genre,
      year: movie.year,
      type: movie.type,
      fileSize: movie.fileSize || ''
    });
    setAdminTab('add');
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      console.log('Fetching users from:', `${API_URL}/admin/users`);
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      if (data.success) {
        setUsers(data.users);
        console.log('Users loaded:', data.users.length);
      } else {
        console.error('Failed to fetch users:', data.error);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleBlockUser = async (userId: string) => {
    if (!confirm('Are you sure you want to block this user?')) return;

    const password = prompt('Enter admin password to confirm blocking:');
    if (password !== ADMIN_PASSWORD) {
      alert('Incorrect password!');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/block`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        alert('User blocked successfully!');
        fetchUsers();
      } else {
        alert('Error blocking user: ' + data.error);
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Error blocking user. Check console.');
    }
  };

  const handleUnblockUser = async (userId: string) => {
    if (!confirm('Are you sure you want to unblock this user?')) return;

    const password = prompt('Enter admin password to confirm unblocking:');
    if (password !== ADMIN_PASSWORD) {
      alert('Incorrect password!');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/unblock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        alert('User unblocked successfully!');
        fetchUsers();
      } else {
        alert('Error unblocking user: ' + data.error);
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      alert('Error unblocking user. Check console.');
    }
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      setCurrentUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    }
  };

  const fetchBackgroundSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/background`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();
      if (data.success && data.settings) {
        const settings = data.settings;
        setBackgroundType(settings.type || 'image');
        setBackgroundVideoUrl(settings.videoUrl || '');
        setBackgroundImageUrl(settings.imageUrl || '');
      }
    } catch (error) {
      console.error('Error fetching background settings:', error);
      // Set defaults on error
      setBackgroundType('image');
      setBackgroundVideoUrl('');
      setBackgroundImageUrl('');
    }
  };

  const handleSaveBackground = async () => {
    if (!backgroundPassword) {
      alert('Please enter admin password!');
      return;
    }

    if (backgroundPassword !== ADMIN_PASSWORD) {
      alert('Incorrect password!');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/background`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: backgroundType,
          videoUrl: backgroundVideoUrl,
          imageUrl: backgroundImageUrl,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Background settings saved successfully!');
        setBackgroundPassword('');
        fetchBackgroundSettings(); // Reload to apply
      } else {
        alert('Error saving background: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving background:', error);
      alert('Error saving background. Check console.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-[#FFD700]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Film className="w-10 h-10 text-[#FFD700]" />
                <div 
                  onClick={handleRedDotClick}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full cursor-pointer hover:scale-110 transition-transform"
                />
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF4500] bg-clip-text text-transparent">
                  THEE ARCHIVE
                </h1>
                <p className="text-xs text-gray-400">Your Ultimate Movie Library</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#movies" className="text-gray-300 hover:text-[#FFD700] transition-colors">Movies</a>
              <a href="#about" className="text-gray-300 hover:text-[#FFD700] transition-colors">About</a>
              
              {/* Auth Buttons */}
              {currentUser ? (
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <p className="text-[#FFD700] font-bold">{currentUser.name}</p>
                    <p className="text-gray-500 text-xs">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold rounded-lg hover:scale-105 transition-all shadow-lg"
                >
                  <Lock className="w-4 h-4" />
                  Sign In
                </button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-lg hover:scale-110 transition-all shadow-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-black" /> : <Menu className="w-6 h-6 text-black" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-lg border-t border-gray-800">
            <nav className="flex flex-col p-4 gap-2">
              <a href="#movies" className="px-4 py-3 text-gray-300 hover:text-[#FFD700] hover:bg-white/5 rounded-lg transition-all">Movies</a>
              <a href="#about" className="px-4 py-3 text-gray-300 hover:text-[#FFD700] hover:bg-white/5 rounded-lg transition-all">About</a>
              
              {/* Mobile Auth Section */}
              {currentUser ? (
                <div className="mt-4 pt-4 border-t border-gray-800">
                  {/* User Profile */}
                  <div className="px-4 py-3 bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 rounded-lg mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center">
                        <User className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <p className="text-[#FFD700] font-bold text-sm">{currentUser.name}</p>
                        <p className="text-gray-500 text-xs">{currentUser.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <button
                    onClick={() => {
                      setShowAuthModal(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold rounded-lg hover:scale-105 transition-all shadow-lg"
                  >
                    <Lock className="w-4 h-4" />
                    Sign In
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Dynamic Background */}
        {backgroundType === 'video' && backgroundVideoUrl ? (
          <video
            src={backgroundVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        ) : backgroundType === 'image' && backgroundImageUrl ? (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
          />
        ) : null}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFD700]/5 to-transparent" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF4500] bg-clip-text text-transparent">
            Stream & Download
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Watch your favorite movies anytime, anywhere
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies by title, genre, year..."
                className="w-full pl-14 pr-6 py-4 bg-white/10 border-2 border-[#FFD700]/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-[#FFD700] transition-all"
              />
            </div>
            {searchQuery && (
              <p className="mt-3 text-sm text-gray-400">
                Found {filteredMovies.length} movie{filteredMovies.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Movies Grid */}
      <section id="movies" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-black text-[#FFD700] mb-8">Available Movies</h3>
          
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-gray-400">Loading movies...</p>
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="text-center py-20">
              <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                {searchQuery ? 'No movies found matching your search' : 'No movies available yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filteredMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl overflow-hidden border border-[#FFD700]/20 hover:border-[#FFD700] transition-all hover:scale-105"
                >
                  {/* Thumbnail */}
                  <div className="aspect-[2/3] relative overflow-hidden bg-gray-800">
                    {movie.thumbnailUrl ? (
                      <img
                        src={movie.thumbnailUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-12 h-12 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Lock Icon for Non-Logged Users */}
                    {!currentUser && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="text-center">
                          <Lock className="w-10 h-10 text-[#FFD700] mx-auto mb-2" />
                          <p className="text-white text-xs font-bold">Sign in to watch</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2">
                    <h4 className="font-bold text-white text-sm mb-1 line-clamp-1">{movie.title}</h4>
                    <p className="text-xs text-gray-400 mb-2 line-clamp-1">{movie.description}</p>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <span className="bg-[#FFD700]/20 text-[#FFD700] px-1.5 py-0.5 rounded text-xs">{movie.genre}</span>
                      <span className="text-xs">{movie.year}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleWatchClick(movie)}
                        className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black px-2 py-1.5 rounded-lg hover:shadow-lg hover:shadow-[#FFD700]/50 transition-all font-bold text-xs"
                      >
                        <Play className="w-3 h-3" />
                        Watch
                      </button>
                      <button
                        onClick={() => handleDownloadClick(movie)}
                        className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-[#FF4500] to-[#FFA500] text-white px-2 py-1.5 rounded-lg hover:shadow-lg hover:shadow-[#FF4500]/50 transition-all font-bold text-xs"
                      >
                        <Download className="w-3 h-3" />
                        DL
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Professional Video Player */}
      {showPlayer && selectedMovie && (
        <VideoPlayer
          videoUrl={selectedMovie.videoUrl}
          title={selectedMovie.title}
          description={selectedMovie.description}
          year={selectedMovie.year}
          genre={selectedMovie.genre}
          onClose={handleClosePlayer}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* Admin Portal Modal */}
      {showAdminPortal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-gradient-to-br from-gray-900 to-black rounded-2xl border-2 border-red-600/50 my-8">
            {/* Admin Header */}
            <div className="flex items-center justify-between p-6 border-b border-red-600/30">
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-black text-red-600">ADMIN PORTAL</h2>
              </div>
              <button
                onClick={() => {
                  setShowAdminPortal(false);
                  setIsAdminAuthenticated(false);
                  setAdminPassword('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {!isAdminAuthenticated ? (
                <div className="max-w-md mx-auto">
                  <p className="text-gray-400 mb-4">Enter admin password to access the portal</p>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                    placeholder="Admin Password"
                    className="w-full px-4 py-3 bg-white/10 border border-red-600/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-600 mb-4"
                  />
                  <button
                    onClick={handleAdminLogin}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-red-600/50 transition-all font-bold"
                  >
                    LOGIN
                  </button>
                </div>
              ) : (
                <div>
                  {/* Admin Tabs */}
                  <div className="flex gap-4 mb-6 border-b border-red-600/30 overflow-x-auto">
                    <button
                      onClick={() => setAdminTab('add')}
                      className={`px-6 py-3 font-bold transition-colors whitespace-nowrap ${
                        adminTab === 'add'
                          ? 'text-red-600 border-b-2 border-red-600'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {editingMovie ? 'EDIT MOVIE' : 'ADD MOVIE'}
                    </button>
                    <button
                      onClick={() => {
                        setAdminTab('edit');
                        setEditingMovie(null);
                      }}
                      className={`px-6 py-3 font-bold transition-colors whitespace-nowrap ${
                        adminTab === 'edit'
                          ? 'text-red-600 border-b-2 border-red-600'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      MANAGE MOVIES
                    </button>
                    <button
                      onClick={() => {
                        setAdminTab('users');
                        fetchUsers();
                      }}
                      className={`px-6 py-3 font-bold transition-colors whitespace-nowrap ${
                        adminTab === 'users'
                          ? 'text-red-600 border-b-2 border-red-600'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      MANAGE USERS
                    </button>
                    <button
                      onClick={() => setAdminTab('background')}
                      className={`px-6 py-3 font-bold transition-colors whitespace-nowrap ${
                        adminTab === 'background'
                          ? 'text-red-600 border-b-2 border-red-600'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      BACKGROUND
                    </button>
                  </div>

                  {/* Add/Edit Movie Tab */}
                  {adminTab === 'add' && (
                    <div className="space-y-4">
                      {editingMovie && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
                          <p className="text-yellow-500 font-bold">Editing: {editingMovie.title}</p>
                          <button
                            onClick={() => {
                              setEditingMovie(null);
                              setAdminFormData({
                                title: '',
                                description: '',
                                videoUrl: '',
                                thumbnailUrl: '',
                                genre: '',
                                year: '',
                                type: 'movie',
                                fileSize: ''
                              });
                            }}
                            className="text-sm text-yellow-500 hover:text-yellow-400 mt-2"
                          >
                            Cancel editing
                          </button>
                        </div>
                      )}

                      <input
                        type="text"
                        value={adminFormData.title}
                        onChange={(e) => handleAdminFormChange('title', e.target.value)}
                        placeholder="Movie Title *"
                        className="w-full px-4 py-3 bg-white/10 border border-red-600/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
                      />
                      <textarea
                        value={adminFormData.description}
                        onChange={(e) => handleAdminFormChange('description', e.target.value)}
                        placeholder="Description"
                        rows={3}
                        className="w-full px-4 py-3 bg-white/10 border border-red-600/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-600 resize-none"
                      />
                      <input
                        type="text"
                        value={adminFormData.videoUrl}
                        onChange={(e) => handleAdminFormChange('videoUrl', e.target.value)}
                        placeholder="AWS Video URL *"
                        className="w-full px-4 py-3 bg-white/10 border border-red-600/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
                      />
                      <input
                        type="text"
                        value={adminFormData.thumbnailUrl}
                        onChange={(e) => handleAdminFormChange('thumbnailUrl', e.target.value)}
                        placeholder="Thumbnail Image URL"
                        className="w-full px-4 py-3 bg-white/10 border border-red-600/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={adminFormData.genre}
                          onChange={(e) => handleAdminFormChange('genre', e.target.value)}
                          placeholder="Genre"
                          className="w-full px-4 py-3 bg-white/10 border border-red-600/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
                        />
                        <input
                          type="text"
                          value={adminFormData.year}
                          onChange={(e) => handleAdminFormChange('year', e.target.value)}
                          placeholder="Year"
                          className="w-full px-4 py-3 bg-white/10 border border-red-600/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <input
                        type="text"
                        value={adminFormData.fileSize}
                        onChange={(e) => handleAdminFormChange('fileSize', e.target.value)}
                        placeholder="File Size (e.g., 1.5 GB)"
                        className="w-full px-4 py-3 bg-white/10 border border-red-600/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
                      />
                      
                      <div className="border-t border-red-600/30 pt-4 mt-6">
                        <p className="text-gray-400 text-sm mb-2">Confirm password to {editingMovie ? 'update' : 'add'} movie:</p>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setShowPasswordError(false);
                          }}
                          placeholder="Enter admin password"
                          className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-500 focus:outline-none mb-4 ${
                            showPasswordError ? 'border-red-500' : 'border-red-600/30 focus:border-red-600'
                          }`}
                        />
                        {showPasswordError && (
                          <p className="text-red-500 text-sm mb-4">Password required</p>
                        )}
                        <button
                          onClick={editingMovie ? handleEditMovie : handleAddMovie}
                          className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-red-600/50 transition-all font-bold flex items-center justify-center gap-2"
                        >
                          <Save className="w-5 h-5" />
                          {editingMovie ? 'UPDATE MOVIE' : 'ADD MOVIE'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Manage Movies Tab */}
                  {adminTab === 'edit' && (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {movies.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No movies to manage</p>
                      ) : (
                        movies.map((movie) => (
                          <div
                            key={movie.id}
                            className="bg-white/5 border border-red-600/30 rounded-xl p-4 hover:border-red-600/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-bold text-white mb-1">{movie.title}</h4>
                                <p className="text-sm text-gray-400 mb-2 line-clamp-2">{movie.description}</p>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span className="bg-red-600/20 text-red-400 px-2 py-1 rounded">{movie.genre}</span>
                                  <span>{movie.year}</span>
                                  {movie.fileSize && <span>{movie.fileSize}</span>}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => selectMovieForEdit(movie)}
                                  className="p-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMovie(movie.id)}
                                  className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Manage Users Tab */}
                  {adminTab === 'users' && (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {usersLoading ? (
                        <div className="text-center py-20">
                          <div className="inline-block w-12 h-12 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin" />
                          <p className="mt-4 text-gray-400">Loading users...</p>
                        </div>
                      ) : users.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No users to manage</p>
                      ) : (
                        users.map((user) => (
                          <div
                            key={user.id}
                            className="bg-white/5 border border-red-600/30 rounded-xl p-4 hover:border-red-600/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-bold text-white mb-1">{user.name}</h4>
                                <p className="text-sm text-gray-400 mb-2 line-clamp-2">{user.email}</p>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span className="bg-red-600/20 text-red-400 px-2 py-1 rounded">{user.isBlocked ? 'Blocked' : 'Active'}</span>
                                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                                  {user.blockedAt && <span>Blocked on {new Date(user.blockedAt).toLocaleDateString()}</span>}
                                  {user.unblockedAt && <span>Unblocked on {new Date(user.unblockedAt).toLocaleDateString()}</span>}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {user.isBlocked ? (
                                  <button
                                    onClick={() => handleUnblockUser(user.id)}
                                    className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors"
                                    title="Unblock"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleBlockUser(user.id)}
                                    className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                                    title="Block"
                                  >
                                    <Ban className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Background Tab */}
                  {adminTab === 'background' && (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      <div className="bg-white/5 border border-red-600/30 rounded-xl p-4 hover:border-red-600/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-white mb-1">Background Settings</h4>
                            <p className="text-sm text-gray-400 mb-2 line-clamp-2">Configure the background for the portal</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="bg-red-600/20 text-red-400 px-2 py-1 rounded">{backgroundType}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveBackground()}
                              className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors"
                              title="Save"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <label className="text-gray-400">Type:</label>
                          <select
                            value={backgroundType}
                            onChange={(e) => setBackgroundType(e.target.value as 'video' | 'image')}
                            className="w-full px-4 py-3 bg-white/10 border border-red-600/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
                          >
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                          </select>
                        </div>

                        {backgroundType === 'image' && (
                          <div className="flex items-center gap-4">
                            <label className="text-gray-400">Image URL:</label>
                            <input
                              type="text"
                              value={backgroundImageUrl}
                              onChange={(e) => setBackgroundImageUrl(e.target.value)}
                              placeholder="Enter image URL"
                              className="w-full px-4 py-3 bg-white/10 border border-red-600/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
                            />
                          </div>
                        )}

                        {backgroundType === 'video' && (
                          <div className="flex items-center gap-4">
                            <label className="text-gray-400">Video URL:</label>
                            <input
                              type="text"
                              value={backgroundVideoUrl}
                              onChange={(e) => setBackgroundVideoUrl(e.target.value)}
                              placeholder="Enter video URL"
                              className="w-full px-4 py-3 bg-white/10 border border-red-600/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-4">
                          <label className="text-gray-400">Admin Password:</label>
                          <input
                            type="password"
                            value={backgroundPassword}
                            onChange={(e) => setBackgroundPassword(e.target.value)}
                            placeholder="Enter admin password"
                            className="w-full px-4 py-3 bg-white/10 border border-red-600/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black/50 border-t border-[#FFD700]/20 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2025 THEE ARCHIVE. Stream & Download Your Favorite Movies.
          </p>
        </div>
      </footer>

      {/* Google AdSense Script - Add your AdSense code here */}
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX"
        crossOrigin="anonymous"
      ></script>
    </div>
  );
}