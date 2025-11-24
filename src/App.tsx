import React, { useState, useEffect } from 'react';
import { Film, User, Globe, Video, Skull, Tv, Flag, Laugh, Rocket, GraduationCap, Headphones, Clapperboard, Play, Lock, AlertCircle, Clock, Download as DownloadIcon, History } from 'lucide-react';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { VideoPlayer } from './components/VideoPlayer';
import { AuthModal } from './components/AuthModal';
import { FourTabBottomNav } from './components/FourTabBottomNav';
import { SearchBar } from './components/SearchBar';
import { TopCategoryTabs } from './components/TopCategoryTabs';
import { SectionWithAll } from './components/SectionWithAll';
import { ProfileMenuList } from './components/ProfileMenuList';
import { DownloadsScreen } from './components/DownloadsScreen';
import { WatchHistoryScreen } from './components/WatchHistoryScreen';
import { MovieCard } from './components/MovieCard';
import { AgeVerificationModal } from './components/AgeVerificationModal';
import { PinLockModal } from './components/PinLockModal';
import { KidoModeScreen } from './components/KidoModeScreen';
import { ViewAllScreen } from './components/ViewAllScreen';
import { SeriesDetailScreen } from './components/SeriesDetailScreen';
import { MovieDetailModal } from './components/MovieDetailModal';
import { MusicPlayer } from './components/MusicPlayer';
import { SpotifyMusicScreen } from './components/SpotifyMusicScreen';
import { groupSeriesEpisodes } from './utils/seriesGrouping';
import MovieAdminPortal from './movie-admin';
import AdminPortal from './admin';
import AddTestMusic from './add-test-music';
import { Footer } from './components/Footer';
import { CookieConsent } from './components/CookieConsent';
import { PrivacyPolicy } from './components/legal/PrivacyPolicy';
import { TermsOfService } from './components/legal/TermsOfService';
import { AboutUs } from './components/legal/AboutUs';
import { ContactUs } from './components/legal/ContactUs';
import { SetPersonalPinModal } from './components/SetPersonalPinModal';
import { VerifyPasswordModal } from './components/VerifyPasswordModal';
import { AnimatedBackground } from './components/AnimatedBackground';
import { PropellerAd } from './components/PropellerAd';
import { AdSterraAd } from './components/AdSterraAd';

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
  contentType?: 'music-video' | 'music-audio'; // For music section
  artist?: string; // For music section
  ageRating?: 'G' | 'PG' | 'PG-13' | 'R' | '18+' | 'Kids';
  section?: string;
  uploadedAt?: string;
  episodes?: Episode[];
  rating?: string;
  seriesTitle?: string;
}

interface Episode {
  id: string;
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration?: string;
  releaseDate?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  accessToken?: string;
  personalPin?: string; // User's personal 18+ PIN (4 digits)
}

interface DownloadedMovie extends Movie {
  downloadedAt: string;
}

export default function App() {
  // Navigation State
  const [activeBottomTab, setActiveBottomTab] = useState<'home' | '18plus' | 'browse' | 'kido' | 'music'>('home');
  const [activeTopTab, setActiveTopTab] = useState('trending');
  
  // TEST MUSIC STATE
  const [showAddTestMusic, setShowAddTestMusic] = useState(false);
  
  // Profile sub-screens
  const [showDownloadsScreen, setShowDownloadsScreen] = useState(false);
  const [showWatchHistoryScreen, setShowWatchHistoryScreen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Data States
  const [movies, setMovies] = useState<Movie[]>([]);
  const [downloads, setDownloads] = useState<DownloadedMovie[]>([]);
  const [watchHistory, setWatchHistory] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Player States
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  
  // Auth States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  
  // Admin Portal States - Red dot click counter for secret access
  const [redDotClicks, setRedDotClicks] = useState(0);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  
  // 18+ Security States
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [showPinLock, setShowPinLock] = useState(false);
  const [showSetPersonalPin, setShowSetPersonalPin] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [is18PlusUnlocked, setIs18PlusUnlocked] = useState(false);
  const [previousTab, setPreviousTab] = useState<string>('');
  const [userPersonalPin, setUserPersonalPin] = useState<string>(''); // User's personal PIN
  
  // View All Screen States
  const [showViewAllScreen, setShowViewAllScreen] = useState(false);
  const [viewAllTitle, setViewAllTitle] = useState('');
  const [viewAllEmoji, setViewAllEmoji] = useState('');
  const [viewAllMovies, setViewAllMovies] = useState<Movie[]>([]);
  
  // Series Detail Screen State
  const [showSeriesDetail, setShowSeriesDetail] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<any>(null);
  const [currentMusicTrack, setCurrentMusicTrack] = useState<any>(null);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  
  // Movie Detail Modal State
  const [showMovieDetail, setShowMovieDetail] = useState(false);
  const [selectedMovieDetail, setSelectedMovieDetail] = useState<Movie | null>(null);
  
  // Music Player States
  const [musicQueue, setMusicQueue] = useState<Movie[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Movie | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  
  // HERO SLIDER STATE - Auto-rotate trending movies
  const [heroIndex, setHeroIndex] = useState(0);
  
  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4d451974`;

  // Load data on mount
  useEffect(() => {
    fetchMovies();
    loadUserSession();
    loadDownloads();
    loadWatchHistory();
    
    // Check for admin URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'movie') {
      setAdminScreen('movie-admin');
      // Clean URL
      window.history.replaceState({}, document.title, '/');
    }
  }, []);
  
  // REFRESH DATA when page becomes visible (e.g., returning from admin portal)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page visible again - refreshing movies...');
        fetchMovies();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
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

  const loadWatchHistory = () => {
    const storedWatchHistory = localStorage.getItem('watchHistory');
    if (storedWatchHistory) {
      try {
        setWatchHistory(JSON.parse(storedWatchHistory));
      } catch (e) {
        console.error('Error loading watch history:', e);
      }
    }
  };

  const fetchMovies = async () => {
    try {
      console.log('🎬 Fetching movies from:', `${API_URL}/movies`);
      const response = await fetch(`${API_URL}/movies`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Movies fetched successfully:', data);
      
      if (data.success && data.movies) {
        setMovies(data.movies);
      } else {
        console.warn('⚠️ No movies in response, using empty array');
        setMovies([]);
      }
    } catch (error) {
      console.error('❌ Error fetching movies:', error);
      // Don't crash the app - just show empty movies
      setMovies([]);
      
      // Show user-friendly error message only once
      if (!sessionStorage.getItem('serverErrorShown')) {
        sessionStorage.setItem('serverErrorShown', 'true');
        console.log('💡 TIP: The backend server may be starting up. Please wait a moment and refresh.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRedDotClick = () => {
    setRedDotClicks(prev => {
      const newCount = prev + 1;
      if (newCount === 6) {
        // Open admin portal after 6 clicks
        setAdminScreen('user-admin');
        // Reset counter
        return 0;
      }
      return newCount;
    });
  };

  const handleWatch = (movie: Movie) => {
    if (!currentUser) {
      alert('Please sign in to watch movies!')
      setShowAuthModal(true);
      return;
    }
    
    // BLOCK MUSIC FROM OPENING VIDEO PLAYER
    if (movie.category === 'music') {
      console.log('🚫 Blocked video player for music - use music player instead!');
      return;
    }
    
    // If it's a series, show series detail screen instead
    if (movie.type === 'series' && movie.episodes && movie.episodes.length > 0) {
      handleSeriesClick(movie);
      return;
    }
    
    // Track activity
    trackActivity(movie.id, 'watch', movie.title);
    
    // Add to watch history
    const watchedMovie = {
      ...movie,
      watchedAt: new Date().toISOString()
    };
    
    // Remove duplicates and add to beginning
    const updatedHistory = [
      watchedMovie,
      ...watchHistory.filter(m => m.id !== movie.id)
    ].slice(0, 50); // Keep last 50 watched movies
    
    setWatchHistory(updatedHistory);
    localStorage.setItem('watchHistory', JSON.stringify(updatedHistory));
    
    setSelectedMovie(movie);
    setShowPlayer(true);
  };

  const handleMovieInfo = (movie: Movie) => {
    setSelectedMovieDetail(movie);
    setShowMovieDetail(true);
  };

  const handleDownload = (movie: Movie) => {
    if (!currentUser) {
      alert('Please sign in to download!');
      setShowAuthModal(true);
      return;
    }
    
    // Track activity
    trackActivity(movie.id, 'download', movie.title);
    
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

  const trackActivity = async (movieId: string, action: 'watch' | 'download', movieTitle: string) => {
    if (!currentUser?.accessToken) return;
    
    try {
      await fetch(`${API_URL}/activity/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.accessToken}`
        },
        body: JSON.stringify({ movieId, action, movieTitle })
      });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  const handleDeleteDownload = (id: string) => {
    const updatedDownloads = downloads.filter(d => d.id !== id);
    setDownloads(updatedDownloads);
    localStorage.setItem('downloads', JSON.stringify(updatedDownloads));
  };

  const handleDeleteFromHistory = (id: string) => {
    const updatedHistory = watchHistory.filter(m => m.id !== id);
    setWatchHistory(updatedHistory);
    localStorage.setItem('watchHistory', JSON.stringify(updatedHistory));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
  };

  const handleMusicClick = (movie: Movie) => {
    if (!currentUser) {
      alert('Please sign in to play music!');
      setShowAuthModal(true);
      return;
    }
    
    // Get all music tracks
    const allMusic = movies.filter(m => m.category === 'music');
    
    // Find index of clicked song
    const clickedIndex = allMusic.findIndex(m => m.id === movie.id);
    
    // Create queue starting from clicked song
    const queue = [
      ...allMusic.slice(clickedIndex),
      ...allMusic.slice(0, clickedIndex)
    ];
    
    setMusicQueue(queue);
    setCurrentTrack(movie);
    setIsMusicPlaying(true);
    setShowMusicPlayer(true);
    
    // Track activity
    trackActivity(movie.id, 'watch', movie.title);
  };

  // Handle Series Click - Show Series Detail Screen
  const handleSeriesClick = (series: Movie) => {
    if (!currentUser) {
      alert('Please sign in to watch series!');
      setShowAuthModal(true);
      return;
    }
    
    setSelectedSeries(series);
    setShowSeriesDetail(true);
  };

  const handlePlayEpisode = (episode: any) => {
    if (!currentUser) {
      alert('Please sign in to watch episodes!');
      setShowAuthModal(true);
      return;
    }
    
    // Create a movie object from episode
    const episodeAsMovie: Movie = {
      id: episode.id,
      title: episode.title,
      description: episode.description,
      videoUrl: episode.videoUrl,
      thumbnailUrl: episode.thumbnailUrl,
      genre: selectedSeries?.genre || '',
      year: selectedSeries?.year || '',
      type: 'episode',
      category: 'series'
    };
    
    // Track activity
    trackActivity(selectedSeries?.id || episode.id, 'watch', `${selectedSeries?.title} - ${episode.title}`);
    
    // Add to watch history
    const watchedEpisode = {
      ...episodeAsMovie,
      watchedAt: new Date().toISOString()
    };
    
    const updatedHistory = [
      watchedEpisode,
      ...watchHistory.filter(m => m.id !== episode.id)
    ].slice(0, 50);
    
    setWatchHistory(updatedHistory);
    localStorage.setItem('watchHistory', JSON.stringify(updatedHistory));
    
    // Hide series detail screen temporarily (keep selectedSeries so we can return to it)
    setShowSeriesDetail(false);
    
    setSelectedMovie(episodeAsMovie);
    setShowPlayer(true);
  };

  const handleDownloadEpisode = (episode: any) => {
    if (!currentUser) {
      alert('Please sign in to download!');
      setShowAuthModal(true);
      return;
    }
    
    // Track activity
    trackActivity(selectedSeries?.id || episode.id, 'download', `${selectedSeries?.title} - ${episode.title}`);
    
    alert(`Downloading: ${episode.title}`);
    window.open(episode.videoUrl, '_blank');
  };

  // Handle 18+ Tab Change with Security
  const handle18PlusAccess = () => {
    if (!currentUser) {
      alert('Please sign in first to access 18+ content!');
      setShowAuthModal(true);
      return;
    }
    
    // Check user-specific PIN
    const hasPinSetup = localStorage.getItem(`user_pin_${currentUser.id}`);
    
    if (!hasPinSetup) {
      // First time - need age verification and PIN setup
      setShowAgeVerification(true);
    } else if (!is18PlusUnlocked) {
      // PIN exists but locked - Load PIN and show lock modal
      setUserPersonalPin(hasPinSetup);
      setShowPinLock(true);
    } else {
      // Already unlocked - Show 18+ content in ViewAllScreen
      setViewAllTitle('18+ Content');
      setViewAllEmoji('🔞');
      setViewAllMovies(groupSeriesEpisodes(movies.filter(m => m.ageRating === '18+')));
      setShowViewAllScreen(true);
      setActiveTopTab('18+');
    }
  };

  const handleTopTabChange = (tab: string) => {
    // Lock 18+ when leaving
    if (previousTab === '18+' && tab !== '18+') {
      setIs18PlusUnlocked(false);
    }
    
    setPreviousTab(activeTopTab);
    
    if (tab === '18+') {
      handle18PlusAccess();
    } else if (tab === 'kids') {
      setActiveTopTab('kids');
    } else if (tab === 'music') {
      // Music tab should go directly to the Music section (bottom tab)
      setActiveBottomTab('music');
      setActiveTopTab('trending'); // Reset top tab
    } else {
      setActiveTopTab(tab);
    }
  };

  const handleAgeVerified = (pin: string) => {
    setShowAgeVerification(false);
    setUserPersonalPin(pin); // Save PIN to state
    setIs18PlusUnlocked(true);
    setActiveBottomTab('18plus'); // Switch to 18+ tab after age verification
    setActiveTopTab('18+');
    // Show 18+ content in ViewAllScreen
    setViewAllTitle('18+ Content');
    setViewAllEmoji('🔞');
    setViewAllMovies(groupSeriesEpisodes(movies.filter(m => m.ageRating === '18+')));
    setShowViewAllScreen(true);
    alert('✓ Age verified! 18+ content unlocked.');
  };

  const handlePinUnlocked = () => {
    setShowPinLock(false);
    setIs18PlusUnlocked(true);
    setActiveBottomTab('18plus'); // Switch to 18+ tab after unlock
    setActiveTopTab('18+');
    // Show 18+ content in ViewAllScreen
    setViewAllTitle('18+ Content');
    setViewAllEmoji('🔞');
    setViewAllMovies(groupSeriesEpisodes(movies.filter(m => m.ageRating === '18+')));
    setShowViewAllScreen(true);
  };

  // Filter movies based on active top tab
  const getFilteredMovies = () => {
    let filtered = movies;
    
    // CRITICAL: EXCLUDE 18+ and MUSIC from ALL home screen tabs
    if (activeTopTab === 'trending') {
      filtered = movies.filter(m => m.ageRating !== '18+' && m.category !== 'music');
    }
    else if (activeTopTab === 'movies') {
      filtered = movies.filter(m => m.type === 'movie' && m.ageRating !== '18+' && m.category !== 'music');
    }
    else if (activeTopTab === 'series') {
      filtered = movies.filter(m => m.type === 'series' && m.ageRating !== '18+' && m.category !== 'music');
    }
    else if (activeTopTab === 'music') {
      filtered = movies.filter(m => m.category === 'music');
    }
    else if (activeTopTab === 'kids') {
      filtered = movies.filter(m => m.ageRating === 'Kids');
    }
    else if (activeTopTab === '18+') {
      filtered = movies.filter(m => m.ageRating === '18+');
    }
    else {
      // Default: exclude 18+ and music
      filtered = movies.filter(m => m.ageRating !== '18+' && m.category !== 'music');
    }
    
    // Group series episodes into single cards
    return groupSeriesEpisodes(filtered);
  };

  // Search functionality - EXCLUDE 18+ and MUSIC from search results
  const searchResults = searchQuery
    ? groupSeriesEpisodes(movies.filter(movie =>
        (movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.genre.toLowerCase().includes(searchQuery.toLowerCase())) &&
        movie.ageRating !== '18+' && // Never show 18+ in search
        movie.category !== 'music' // Never show music in search
      ))
    : [];

  const filteredMovies = getFilteredMovies();
  
  // HERO SLIDER - Show newest MOVIE/SERIES uploads only (NO MUSIC, NO 18+)
  const heroMovies = [...filteredMovies]
    .filter(m => m.category !== 'music' && m.ageRating !== '18+') // Exclude music and 18+ from hero slider
    .sort((a, b) => {
      const dateA = new Date(a.uploadedAt || '2000-01-01').getTime();
      const dateB = new Date(b.uploadedAt || '2000-01-01').getTime();
      return dateB - dateA; // Newest first
    })
    .slice(0, 10); // Top 10 newest movies/series
  
  // Auto-rotate hero slider every 5 seconds
  useEffect(() => {
    if (heroMovies.length === 0) return;
    
    const heroInterval = setInterval(() => {
      setHeroIndex((prev) => {
        const maxIndex = heroMovies.length - 1;
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 5000);
    
    return () => clearInterval(heroInterval);
  }, [heroMovies.length]);
  
  // DEBUG: Log grouping results
  console.log('📊 Total movies after grouping:', filteredMovies.length);
  console.log('🎬 Grouped items sample:', filteredMovies.slice(0, 5).map(m => ({
    title: m.title,
    type: m.type,
    hasEpisodes: !!m.episodes,
    episodeCount: m.episodes?.length || 0,
    seriesTitle: m.seriesTitle
  })));
  
  // Log first few items in full detail
  if (filteredMovies.length > 0) {
    console.log('🔎 FIRST ITEM FULL DETAILS:', filteredMovies[0]);
  }

  // ROUTING - State-based routing for admin portals and legal pages
  const [adminScreen, setAdminScreen] = useState('');
  const [legalPage, setLegalPage] = useState<'' | 'privacy' | 'terms' | 'about' | 'contact'>('');
  
  console.log('Admin Screen State:', adminScreen);
  console.log('Legal Page State:', legalPage);
  
  // Show Legal Pages
  if (legalPage === 'privacy') {
    return <PrivacyPolicy onClose={() => setLegalPage('')} />;
  }
  if (legalPage === 'terms') {
    return <TermsOfService onClose={() => setLegalPage('')} />;
  }
  if (legalPage === 'about') {
    return <AboutUs onClose={() => setLegalPage('')} />;
  }
  if (legalPage === 'contact') {
    return <ContactUs onClose={() => setLegalPage('')} />;
  }
  
  // Show Movie Admin Portal as a modal
  if (adminScreen === 'movie-admin') {
    console.log('Rendering MovieAdminPortal');
    return <MovieAdminPortal 
      skipAuth={isAdminAuthenticated} 
      onNavigateBack={() => setAdminScreen('user-admin')}
    />;
  }
  
  // Show User Admin Portal as a modal
  if (adminScreen === 'user-admin') {
    console.log('Rendering AdminPortal');
    return <AdminPortal 
      onAuthenticated={setIsAdminAuthenticated}
      onNavigateToMovieAdmin={() => setAdminScreen('movie-admin')}
    />;
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* MOBILE HEADER */}
      <header className="md:hidden sticky top-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-[#FFD700]/30 shadow-[0_4px_24px_rgba(255,215,0,0.2)]">
        <div className="px-4 py-3 flex items-center justify-between relative">
          {/* Animated glow line at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFD700] to-transparent animate-pulse" />
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative group/logo">
              {/* Rotating outer glow */}
              <div className="absolute inset-[-4px] bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF4500] rounded-xl opacity-30 blur-lg group-hover/logo:opacity-60 transition-opacity animate-spin-slow" />
              
              {/* Pulsing glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700] to-[#FFA500] blur-xl opacity-50 animate-pulse" />
              
              {/* Logo box */}
              <div className="relative bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF4500] p-1.5 rounded-lg shadow-2xl transform group-hover/logo:scale-105 transition-transform">
                <Film className="w-5 h-5 text-black" />
                {/* SECRET ADMIN SWITCH - Red dot with vibrating animation - 6 clicks to open */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRedDotClick();
                  }}
                  className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full animate-pulse"
                  style={{ animation: 'vibrate 2s ease-in-out infinite' }}
                ></div>
              </div>
            </div>
            <div className="relative">
              {/* Text glow effect */}
              <div className="absolute inset-0 blur-md bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF4500] opacity-30" />
              <h1 className="relative text-lg font-black bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF4500] bg-clip-text text-transparent tracking-tight">
                THEE ARCHIVE
              </h1>
            </div>
          </div>
          
          {/* Profile Icon / Sign In */}
          {currentUser ? (
            <button
              onClick={() => {
                setShowProfileMenu(true);
                setActiveBottomTab('home');
              }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF4500] flex items-center justify-center"
            >
              <User className="w-5 h-5 text-black" />
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold text-sm rounded-lg"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* DESKTOP HEADER */}
      <header className="hidden md:flex sticky top-0 z-50 bg-black/80 backdrop-blur-3xl border-b border-[#FFD700]/30 shadow-[0_8px_32px_0_rgba(255,215,0,0.25)]">
        <div className="max-w-7xl mx-auto px-8 w-full relative">
          {/* Animated glow line at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-50 animate-pulse" />
          
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="relative group/logo">
                {/* Rotating outer ring */}
                <div className="absolute inset-[-6px] bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF4500] rounded-2xl opacity-30 blur-xl group-hover/logo:opacity-60 transition-opacity animate-spin-slow" />
                
                {/* Pulsing glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700] to-[#FFA500] blur-2xl opacity-40 animate-pulse" />
                
                {/* Logo box */}
                <div className="relative bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF4500] p-2.5 rounded-2xl shadow-2xl transform group-hover/logo:scale-105 transition-all duration-300">
                  <Film className="w-7 h-7 text-black" />
                  {/* SECRET ADMIN SWITCH - Red dot with vibrating animation - 6 clicks to open */}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRedDotClick();
                    }}
                    className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-600 rounded-full"
                    style={{ animation: 'vibrate 2s ease-in-out infinite' }}
                  ></div>
                </div>
              </div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-1 relative">
                  {/* Title glow effect */}
                  <div className="absolute inset-0 blur-xl bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF4500] opacity-20" />
                  
                  <h1 className="relative text-3xl font-black bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF4500] bg-clip-text text-transparent tracking-tight drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]">
                    THEE ARCHIVE
                  </h1>
                </div>
                <p className="text-[10px] font-bold text-gray-400 tracking-wider flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-[#FFD700] rounded-full animate-pulse" />
                  ULTIMATE ENTERTAINMENT HUB 🎬
                </p>
              </div>
            </div>

            {/* Auth / Profile Button */}
            {currentUser ? (
              <>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF4500] flex items-center justify-center hover:shadow-lg hover:shadow-[#FFD700]/50 transition-all relative z-50"
                >
                  <User className="w-6 h-6 text-black" />
                </button>
                
                {/* Profile Dropdown Menu - Fixed to top-right corner */}
                {showProfileMenu && (
                  <>
                    {/* Invisible backdrop to close menu */}
                    <div 
                      className="fixed inset-0 z-[60]" 
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <div className="fixed top-20 right-8 w-64 bg-black/95 backdrop-blur-xl border border-[#FFD700]/20 rounded-xl shadow-2xl overflow-hidden z-[70]">
                      <div className="p-4 border-b border-white/10">
                        <p className="text-sm font-black text-white">{currentUser.name}</p>
                        <p className="text-xs text-gray-400">{currentUser.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowWatchHistoryScreen(true);
                          setShowProfileMenu(false);
                          setActiveBottomTab('home');
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-white/10 transition-all text-white flex items-center gap-2"
                      >
                        <Clock className="w-4 h-4 text-[#FFD700]" />
                        <span>Watch History ({watchHistory.length})</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowDownloadsScreen(true);
                          setShowProfileMenu(false);
                          setActiveBottomTab('home');
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-white/10 transition-all text-white flex items-center gap-2"
                      >
                        <DownloadIcon className="w-4 h-4 text-cyan-400" />
                        <span>Downloads ({downloads.length})</span>
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-red-500/20 transition-all text-red-400 font-bold border-t border-white/10"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
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
      <main className="pb-28">
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
                      onSeriesClick={handleSeriesClick}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Top Category Tabs */}
                <TopCategoryTabs
                  activeTab={activeTopTab}
                  onTabChange={handleTopTabChange}
                  has18Plus={true}
                />

                {/* KIDS MODE - Special Screen */}
                {activeTopTab === 'kids' ? (
                  <KidoModeScreen
                    movies={movies}
                    onWatch={handleWatch}
                    onDownload={handleDownload}
                    onMusicClick={handleMusicClick}
                    onSeriesClick={handleSeriesClick}
                  />
                ) : (
                  <>
                    {/* Hero Section - AUTO-ROTATING SLIDER */}
                    {heroMovies[heroIndex] && (
                      <div 
                        key={heroMovies[heroIndex].id}
                        className="relative h-[60vh] md:h-[70vh] mb-8 overflow-hidden transition-all duration-1000 bg-gradient-to-br from-gray-900 via-black to-gray-900"
                      >
                        {/* Background Image with Error Handling */}
                        {heroMovies[heroIndex].thumbnailUrl && (
                          <img
                            src={heroMovies[heroIndex].thumbnailUrl}
                            alt={heroMovies[heroIndex].title}
                            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        
                        {/* Animated Gradient Overlays - Multiple Layers for Depth */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
                        
                        {/* Shimmer Effect on Load */}
                        <div className="absolute inset-0 shimmer opacity-20" />
                        
                        {/* Navigation Dots - Modern Glassmorphism */}
                        <div className="absolute top-6 right-6 flex gap-2 glass-card rounded-full px-3 py-2">
                          {heroMovies.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setHeroIndex(index)}
                              className={`h-2 rounded-full transition-all duration-500 ${
                                index === heroIndex 
                                  ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] w-8 shadow-2xl shadow-[#FFD700]/60' 
                                  : 'bg-white/30 w-2 hover:bg-white/50 hover:w-4'
                              }`}
                            />
                          ))}
                        </div>
                        
                        {/* Content Container - Bottom Left with Glassmorphism */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                          <div className="max-w-2xl slide-in-up">
                            {/* Title with Glow Effect */}
                            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-2xl leading-tight">
                              {heroMovies[heroIndex].title}
                            </h2>
                            
                            {/* Meta Info - Glassmorphism Pills */}
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                              <span className="glass-card px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${
                                  heroMovies[heroIndex].ageRating === '18+' ? 'bg-red-500' : 'bg-[#FFD700]'
                                } animate-pulse`}></span>
                                <span className="text-white">{heroMovies[heroIndex].ageRating || 'PG'}</span>
                              </span>
                              <span className="glass-card px-4 py-2 rounded-xl">
                                <span className="text-[#FFD700] font-black text-sm">{heroMovies[heroIndex].year}</span>
                              </span>
                              <span className="glass-card px-4 py-2 rounded-xl">
                                <span className="text-gray-300 font-bold text-sm">{heroMovies[heroIndex].genre}</span>
                              </span>
                              {heroMovies[heroIndex].episodes && heroMovies[heroIndex].episodes.length > 0 && (
                                <span className="glass-card px-4 py-2 rounded-xl bg-purple-500/20 border-purple-400/30">
                                  <span className="text-purple-300 font-black text-sm">{heroMovies[heroIndex].episodes.length} Episodes</span>
                                </span>
                              )}
                            </div>
                            
                            {/* Description */}
                            <p className="text-gray-300 text-sm md:text-base mb-6 line-clamp-2 md:line-clamp-3 max-w-xl drop-shadow-lg font-medium">
                              {heroMovies[heroIndex].description}
                            </p>
                            
                            {/* Action Buttons - Modern 3D Style */}
                            <div className="flex flex-wrap gap-4">
                              {/* WATCH NOW - Premium 3D Button */}
                              <button
                                onClick={() => handleWatch(heroMovies[heroIndex])}
                                className="relative group modern-button"
                              >
                                {/* 3D Shadow Layers */}
                                <div className="absolute inset-0 bg-gradient-to-b from-[#FF6B00] to-[#FF4500] rounded-2xl transform translate-y-2 group-hover:translate-y-3 transition-transform" />
                                <div className="absolute inset-0 bg-gradient-to-b from-[#FFA500] to-[#FF6B00] rounded-2xl transform translate-y-1 group-hover:translate-y-1.5 transition-transform" />
                                
                                {/* Main Button */}
                                <div className="relative px-8 py-4 bg-gradient-to-b from-[#FFD700] via-[#FFA500] to-[#FF8C00] rounded-2xl font-black text-black text-base transform transition-all group-hover:translate-y-0.5 group-hover:shadow-2xl group-hover:shadow-[#FFD700]/60 flex items-center gap-3 border border-[#FFD700]/30">
                                  <div className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center">
                                    <div className="w-0 h-0 border-l-[10px] border-l-white border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent ml-1" />
                                  </div>
                                  <span className="text-lg">WATCH NOW</span>
                                </div>
                              </button>
                              
                              {/* INFO BUTTON - Glassmorphism */}
                              <button
                                onClick={() => handleMovieInfo(heroMovies[heroIndex])}
                                className="glass-card glass-card-hover px-8 py-4 rounded-2xl font-black text-white text-base flex items-center gap-3"
                              >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>More Info</span>
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Vignette Effect - Dramatic Edges */}
                        <div className="absolute inset-0 pointer-events-none" style={{
                          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8), inset 0 0 200px rgba(0,0,0,0.5)'
                        }} />
                      </div>
                    )}

                    {/* Sections with "All >" button */}
                    <SectionWithAll
                      title="Trending Now"
                      emoji="🔥"
                      movies={filteredMovies.slice(0, 20)}
                      onWatch={handleWatch}
                      onDownload={handleDownload}
                      onMusicClick={handleMusicClick}
                      onSeriesClick={handleSeriesClick}
                      onViewAll={() => {
                        setViewAllTitle('Trending Now');
                        setViewAllEmoji('🔥');
                        setViewAllMovies(filteredMovies);
                        setShowViewAllScreen(true);
                      }}
                    />

                    <SectionWithAll
                      title="Action Movies"
                      emoji="💥"
                      movies={filteredMovies.filter(m => m.genre?.includes('Action')).slice(0, 20)}
                      onWatch={handleWatch}
                      onDownload={handleDownload}
                      onMusicClick={handleMusicClick}
                      onSeriesClick={handleSeriesClick}
                      onViewAll={() => {
                        setViewAllTitle('Action Movies');
                        setViewAllEmoji('💥');
                        setViewAllMovies(filteredMovies.filter(m => m.genre?.includes('Action')));
                        setShowViewAllScreen(true);
                      }}
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
                      onSeriesClick={handleSeriesClick}
                      onViewAll={() => {
                        const newReleases = [...filteredMovies].sort((a, b) => 
                          new Date(b.uploadedAt || '').getTime() - new Date(a.uploadedAt || '').getTime()
                        );
                        setViewAllTitle('New Releases');
                        setViewAllEmoji('🆕');
                        setViewAllMovies(newReleases);
                        setShowViewAllScreen(true);
                      }}
                    />

                    <SectionWithAll
                      title="Horror"
                      emoji="👻"
                      movies={filteredMovies.filter(m => m.genre?.toLowerCase().includes('horror') || m.section?.toLowerCase().includes('horror')).slice(0, 20)}
                      onWatch={handleWatch}
                      onDownload={handleDownload}
                      onMusicClick={handleMusicClick}
                      onSeriesClick={handleSeriesClick}
                      onViewAll={() => {
                        setViewAllTitle('Horror');
                        setViewAllEmoji('👻');
                        setViewAllMovies(filteredMovies.filter(m => m.genre?.toLowerCase().includes('horror') || m.section?.toLowerCase().includes('horror')));
                        setShowViewAllScreen(true);
                      }}
                    />

                    <SectionWithAll
                      title="Comedy"
                      emoji="😂"
                      movies={filteredMovies.filter(m => m.genre?.toLowerCase().includes('comedy') || m.section?.toLowerCase().includes('comedy')).slice(0, 20)}
                      onWatch={handleWatch}
                      onDownload={handleDownload}
                      onMusicClick={handleMusicClick}
                      onSeriesClick={handleSeriesClick}
                      onViewAll={() => {
                        setViewAllTitle('Comedy');
                        setViewAllEmoji('😂');
                        setViewAllMovies(filteredMovies.filter(m => m.genre?.toLowerCase().includes('comedy') || m.section?.toLowerCase().includes('comedy')));
                        setShowViewAllScreen(true);
                      }}
                    />

                    <SectionWithAll
                      title="Uganda Soaps & Drama"
                      emoji="🇺🇬"
                      movies={filteredMovies.filter(m => m.genre?.toLowerCase().includes('uganda') || m.section?.toLowerCase().includes('uganda')).slice(0, 20)}
                      onWatch={handleWatch}
                      onDownload={handleDownload}
                      onMusicClick={handleMusicClick}
                      onSeriesClick={handleSeriesClick}
                      onViewAll={() => {
                        setViewAllTitle('Uganda Soaps & Drama');
                        setViewAllEmoji('🇺🇬');
                        setViewAllMovies(filteredMovies.filter(m => m.genre?.toLowerCase().includes('uganda') || m.section?.toLowerCase().includes('uganda')));
                        setShowViewAllScreen(true);
                      }}
                    />

                    <SectionWithAll
                      title="Nigerian Drama"
                      emoji="🇳🇬"
                      movies={filteredMovies.filter(m => m.genre?.toLowerCase().includes('nigerian') || m.section?.toLowerCase().includes('nigerian') || m.genre?.toLowerCase().includes('nollywood')).slice(0, 20)}
                      onWatch={handleWatch}
                      onDownload={handleDownload}
                      onMusicClick={handleMusicClick}
                      onSeriesClick={handleSeriesClick}
                      onViewAll={() => {
                        setViewAllTitle('Nigerian Drama');
                        setViewAllEmoji('🇳🇬');
                        setViewAllMovies(filteredMovies.filter(m => m.genre?.toLowerCase().includes('nigerian') || m.section?.toLowerCase().includes('nigerian') || m.genre?.toLowerCase().includes('nollywood')));
                        setShowViewAllScreen(true);
                      }}
                    />

                    <SectionWithAll
                      title="High School & Teen"
                      emoji="🎓"
                      movies={filteredMovies.filter(m => m.genre?.toLowerCase().includes('high school') || m.section?.toLowerCase().includes('high school') || m.genre?.toLowerCase().includes('teen')).slice(0, 20)}
                      onWatch={handleWatch}
                      onDownload={handleDownload}
                      onMusicClick={handleMusicClick}
                      onSeriesClick={handleSeriesClick}
                      onViewAll={() => {
                        setViewAllTitle('High School & Teen');
                        setViewAllEmoji('🎓');
                        setViewAllMovies(filteredMovies.filter(m => m.genre?.toLowerCase().includes('high school') || m.section?.toLowerCase().includes('high school') || m.genre?.toLowerCase().includes('teen')));
                        setShowViewAllScreen(true);
                      }}
                    />

                    <SectionWithAll
                      title="Sci-Fi"
                      emoji="🚀"
                      movies={filteredMovies.filter(m => m.genre?.toLowerCase().includes('sci-fi') || m.genre?.toLowerCase().includes('science fiction') || m.section?.toLowerCase().includes('sci-fi')).slice(0, 20)}
                      onWatch={handleWatch}
                      onDownload={handleDownload}
                      onMusicClick={handleMusicClick}
                      onSeriesClick={handleSeriesClick}
                      onViewAll={() => {
                        setViewAllTitle('Sci-Fi');
                        setViewAllEmoji('🚀');
                        setViewAllMovies(filteredMovies.filter(m => m.genre?.toLowerCase().includes('sci-fi') || m.genre?.toLowerCase().includes('science fiction') || m.section?.toLowerCase().includes('sci-fi')));
                        setShowViewAllScreen(true);
                      }}
                    />

                    <SectionWithAll
                      title="Series Collection"
                      emoji="📺"
                      movies={groupSeriesEpisodes(filteredMovies.filter(m => m.type === 'series')).slice(0, 20)}
                      onWatch={handleWatch}
                      onDownload={handleDownload}
                      onMusicClick={handleMusicClick}
                      onSeriesClick={handleSeriesClick}
                      onViewAll={() => {
                        setViewAllTitle('Series Collection');
                        setViewAllEmoji('📺');
                        setViewAllMovies(groupSeriesEpisodes(filteredMovies.filter(m => m.type === 'series')));
                        setShowViewAllScreen(true);
                      }}
                    />
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* 18+ TAB */}
        {activeBottomTab === '18plus' && (
          <div className="min-h-screen bg-gradient-to-b from-red-950 via-black to-black pb-24">
            {/* 18+ Header - Modern Red Theme */}
            <div className="sticky top-0 z-40 glass-card backdrop-blur-strong border-b border-red-500/30">
              <div className="px-4 py-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-red-500/20 border-2 border-red-500 rounded-full flex items-center justify-center">
                    <span className="text-red-500 font-black text-lg">18+</span>
                  </div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent neon-glow mb-1">
                    Adult Content
                  </h1>
                </div>
                <p className="text-gray-400 text-sm font-medium">For mature audiences only • Age verification required</p>
              </div>
            </div>

            {/* 18+ Content Grid - Red Theme */}
            <div className="px-4 py-6">
              <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
                {/* All 18+ Content */}
                <button
                  onClick={() => handle18PlusAccess()}
                  className="glass-card glass-card-hover rounded-3xl p-8 text-center group relative overflow-hidden slide-in-up border-2 border-red-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center float-animation border-4 border-red-500/50">
                      <AlertCircle className="w-16 h-16 text-red-400" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3">Create PIN to Access</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Set up a 4-digit PIN to unlock 18+ content
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-red-400 font-bold">
                      <Lock className="w-3 h-3" />
                      <span>PIN REQUIRED</span>
                      <span>•</span>
                      <span>{movies.filter(m => m.category === '18+' || m.ageRating === '18+').length} items</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Latest 18+ Content - Only show if unlocked */}
            {is18PlusUnlocked && (
              <div className="px-4 pb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-1 bg-red-500 rounded-full animate-pulse" />
                  <h2 className="text-2xl font-black bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">Latest Adult Content</h2>
                  <div className="h-1 flex-1 bg-gradient-to-r from-red-500/20 to-transparent rounded-full" />
                </div>
                
                {/* Content grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {groupSeriesEpisodes(movies.filter(m => m.category === '18+' || m.ageRating === '18+'))
                    .slice(0, 10)
                    .map(movie => (
                      <MovieCard
                        key={movie.id}
                        movie={movie as any}
                        onWatch={handleWatch}
                        onDownload={handleDownload}
                        onMusicClick={handleMusicClick}
                        onSeriesClick={handleSeriesClick}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* BROWSE TAB - All Categories */}
        {activeBottomTab === 'browse' && (
          <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black pb-24">
            {/* Browse Header */}
            <div className="sticky top-0 z-40 glass-card backdrop-blur-strong border-b border-[#FFD700]/30">
              <div className="px-4 py-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center">
                    <Globe className="w-6 h-6 text-black" strokeWidth={2.5} />
                  </div>
                  <h1 className="text-3xl font-black gradient-gold neon-glow">
                    Browse All
                  </h1>
                </div>
                <p className="text-gray-400 text-sm font-medium">Explore our complete entertainment library</p>
              </div>
            </div>

            {/* Category Grid */}
            <div className="px-4 py-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* All Movies */}
              <button
                onClick={() => {
                  setViewAllTitle('All Movies');
                  setViewAllEmoji('🎬');
                  setViewAllMovies(groupSeriesEpisodes(movies.filter(m => m.type !== 'series' && m.category !== 'music' && m.ageRating !== '18+')));
                  setShowViewAllScreen(true);
                }}
                className="glass-card glass-card-hover rounded-2xl p-6 text-left group relative overflow-hidden slide-in-up"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/10 to-[#FFA500]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/20 flex items-center justify-center mb-3 float-animation">
                    <Clapperboard className="w-6 h-6 text-[#FFD700]" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-black text-white mb-1">All Movies</h3>
                  <p className="text-sm text-gray-400">
                    {movies.filter(m => m.type !== 'series' && m.category !== 'music' && m.ageRating !== '18+').length} movies
                  </p>
                </div>
              </button>

              {/* Series */}
              <button
                onClick={() => {
                  setViewAllTitle('Series');
                  setViewAllEmoji('📺');
                  setViewAllMovies(groupSeriesEpisodes(movies.filter(m => m.type === 'series' && m.ageRating !== '18+')));
                  setShowViewAllScreen(true);
                }}
                className="glass-card glass-card-hover rounded-2xl p-6 text-left group relative overflow-hidden slide-in-up"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center mb-3 float-animation">
                    <Tv className="w-6 h-6 text-purple-400" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-black text-white mb-1">Series</h3>
                  <p className="text-sm text-gray-400">
                    {groupSeriesEpisodes(movies.filter(m => m.type === 'series' && m.ageRating !== '18+')).length} series
                  </p>
                </div>
              </button>

              {/* Action */}
              <button
                onClick={() => {
                  setViewAllTitle('Action');
                  setViewAllEmoji('💥');
                  setViewAllMovies(movies.filter(m => (m.genre?.toLowerCase().includes('action') || m.section?.toLowerCase().includes('action')) && m.ageRating !== '18+' && m.category !== 'music'));
                  setShowViewAllScreen(true);
                }}
                className="glass-card glass-card-hover rounded-2xl p-6 text-left group relative overflow-hidden slide-in-up"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600/20 to-orange-600/20 flex items-center justify-center mb-3 float-animation">
                    <Video className="w-6 h-6 text-red-400" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-black text-white mb-1">Action</h3>
                  <p className="text-sm text-gray-400">
                    {movies.filter(m => (m.genre?.toLowerCase().includes('action') || m.section?.toLowerCase().includes('action')) && m.ageRating !== '18+' && m.category !== 'music').length} movies
                  </p>
                </div>
              </button>

              {/* Horror */}
              <button
                onClick={() => {
                  setViewAllTitle('Horror');
                  setViewAllEmoji('👻');
                  setViewAllMovies(movies.filter(m => (m.genre?.toLowerCase().includes('horror') || m.section?.toLowerCase().includes('horror')) && m.ageRating !== '18+' && m.category !== 'music'));
                  setShowViewAllScreen(true);
                }}
                className="glass-card glass-card-hover rounded-2xl p-6 text-left group relative overflow-hidden slide-in-up"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600/20 to-purple-600/20 flex items-center justify-center mb-3 float-animation">
                    <Skull className="w-6 h-6 text-red-400" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-black text-white mb-1">Horror</h3>
                  <p className="text-sm text-gray-400">
                    {movies.filter(m => (m.genre?.toLowerCase().includes('horror') || m.section?.toLowerCase().includes('horror')) && m.ageRating !== '18+' && m.category !== 'music').length} items
                  </p>
                </div>
              </button>

              {/* Comedy */}
              <button
                onClick={() => {
                  setViewAllTitle('Comedy');
                  setViewAllEmoji('😂');
                  setViewAllMovies(movies.filter(m => (m.genre?.toLowerCase().includes('comedy') || m.section?.toLowerCase().includes('comedy')) && m.ageRating !== '18+' && m.category !== 'music'));
                  setShowViewAllScreen(true);
                }}
                className="glass-card glass-card-hover rounded-2xl p-6 text-left group relative overflow-hidden slide-in-up"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-600/20 to-orange-600/20 flex items-center justify-center mb-3 float-animation">
                    <Laugh className="w-6 h-6 text-yellow-400" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-black text-white mb-1">Comedy</h3>
                  <p className="text-sm text-gray-400">
                    {movies.filter(m => (m.genre?.toLowerCase().includes('comedy') || m.section?.toLowerCase().includes('comedy')) && m.ageRating !== '18+' && m.category !== 'music').length} laughs
                  </p>
                </div>
              </button>

              {/* Sci-Fi */}
              <button
                onClick={() => {
                  setViewAllTitle('Sci-Fi');
                  setViewAllEmoji('🚀');
                  setViewAllMovies(movies.filter(m => (m.genre?.toLowerCase().includes('sci-fi') || m.genre?.toLowerCase().includes('science fiction') || m.section?.toLowerCase().includes('sci-fi')) && m.ageRating !== '18+' && m.category !== 'music'));
                  setShowViewAllScreen(true);
                }}
                className="glass-card glass-card-hover rounded-2xl p-6 text-left group relative overflow-hidden slide-in-up"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center mb-3 float-animation">
                    <Rocket className="w-6 h-6 text-indigo-400" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-black text-white mb-1">Sci-Fi</h3>
                  <p className="text-sm text-gray-400">
                    {movies.filter(m => (m.genre?.toLowerCase().includes('sci-fi') || m.genre?.toLowerCase().includes('science fiction') || m.section?.toLowerCase().includes('sci-fi')) && m.ageRating !== '18+' && m.category !== 'music').length} films
                  </p>
                </div>
              </button>

              {/* Uganda Soaps */}
              <button
                onClick={() => {
                  setViewAllTitle('Uganda Soaps & Drama');
                  setViewAllEmoji('🇺🇬');
                  setViewAllMovies(movies.filter(m => (m.genre?.toLowerCase().includes('uganda') || m.section?.toLowerCase().includes('uganda')) && m.ageRating !== '18+' && m.category !== 'music'));
                  setShowViewAllScreen(true);
                }}
                className="glass-card glass-card-hover rounded-2xl p-6 text-left group relative overflow-hidden slide-in-up"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-600/20 to-red-600/20 flex items-center justify-center mb-3 float-animation">
                    <Flag className="w-6 h-6 text-yellow-400" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-black text-white mb-1">Uganda Drama</h3>
                  <p className="text-sm text-gray-400">
                    {movies.filter(m => (m.genre?.toLowerCase().includes('uganda') || m.section?.toLowerCase().includes('uganda')) && m.ageRating !== '18+' && m.category !== 'music').length} shows
                  </p>
                </div>
              </button>

              {/* Nigerian Drama */}
              <button
                onClick={() => {
                  setViewAllTitle('Nigerian Drama');
                  setViewAllEmoji('🇳🇬');
                  setViewAllMovies(movies.filter(m => m.genre?.toLowerCase().includes('nigerian') || m.section?.toLowerCase().includes('nigerian') || m.genre?.toLowerCase().includes('nollywood')));
                  setShowViewAllScreen(true);
                }}
                className="glass-card glass-card-hover rounded-2xl p-6 text-left group relative overflow-hidden slide-in-up"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 flex items-center justify-center mb-3 float-animation">
                    <Film className="w-6 h-6 text-green-400" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-black text-white mb-1">Nigerian Drama</h3>
                  <p className="text-sm text-gray-400">
                    {movies.filter(m => m.genre?.toLowerCase().includes('nigerian') || m.section?.toLowerCase().includes('nigerian') || m.genre?.toLowerCase().includes('nollywood')).length} movies
                  </p>
                </div>
              </button>

              {/* High School */}
              <button
                onClick={() => {
                  setViewAllTitle('High School');
                  setViewAllEmoji('🎓');
                  setViewAllMovies(movies.filter(m => m.genre?.toLowerCase().includes('high school') || m.section?.toLowerCase().includes('high school') || m.genre?.toLowerCase().includes('teen')));
                  setShowViewAllScreen(true);
                }}
                className="glass-card glass-card-hover rounded-2xl p-6 text-left group relative overflow-hidden slide-in-up"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 flex items-center justify-center mb-3 float-animation">
                    <GraduationCap className="w-6 h-6 text-blue-400" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-black text-white mb-1">High School</h3>
                  <p className="text-sm text-gray-400">
                    {movies.filter(m => m.genre?.toLowerCase().includes('high school') || m.section?.toLowerCase().includes('high school') || m.genre?.toLowerCase().includes('teen')).length} shows
                  </p>
                </div>
              </button>

              {/* Music */}
              <button
                onClick={() => {
                  setViewAllTitle('Music');
                  setViewAllEmoji('🎵');
                  setViewAllMovies(movies.filter(m => m.category === 'music'));
                  setShowViewAllScreen(true);
                }}
                className="glass-card glass-card-hover rounded-2xl p-6 text-left group relative overflow-hidden slide-in-up"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 flex items-center justify-center mb-3 float-animation">
                    <Headphones className="w-6 h-6 text-green-400" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-black text-white mb-1">Music</h3>
                  <p className="text-sm text-gray-400">
                    {movies.filter(m => m.category === 'music').length} tracks
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* KIDO TAB */}
        {activeBottomTab === 'kido' && (
          <KidoModeScreen
            movies={movies}
            onWatch={handleWatch}
            onDownload={handleDownload}
            onMusicClick={handleMusicClick}
            onSeriesClick={handleSeriesClick}
          />
        )}

        {/* MUSIC TAB */}
        {activeBottomTab === 'music' && (
          <SpotifyMusicScreen
            movies={movies}
            onMusicClick={handleMusicClick}
            onDownload={handleDownload}
            currentTrack={currentTrack}
            isPlaying={isMusicPlaying}
            onBack={() => {
              setActiveBottomTab('home');
              setActiveTopTab('trending');
            }}
          />
        )}
      </main>

      {/* BOTTOM NAVIGATION */}
      <FourTabBottomNav
        activeTab={activeBottomTab}
        isMusicPlaying={isMusicPlaying && currentTrack !== null}
        onTabChange={(tab) => {
          // If trying to access 18+ tab, always require PIN verification
          if (tab === '18plus') {
            // Lock 18+ section every time they try to enter
            setIs18PlusUnlocked(false);
            handle18PlusAccess();
            // Don't change the tab yet - let the PIN unlock do it
          } else {
            // Lock 18+ when leaving
            if (activeBottomTab === '18plus') {
              setIs18PlusUnlocked(false);
            }
            
            // Reset activeTopTab when going back to home
            if (tab === 'home') {
              setActiveTopTab('trending');
              // Close ViewAllScreen if it's open
              if (showViewAllScreen) {
                setShowViewAllScreen(false);
              }
            }
            
            setActiveBottomTab(tab);
          }
        }}
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
            
            // If we were watching from a series, return to series detail screen
            if (selectedSeries && selectedMovie?.category === 'series') {
              setShowSeriesDetail(true);
            }
          }}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            setShowAuthModal(false);
            
            // Check if user has a personal PIN set
            // In a real app, this would come from the backend
            const storedPin = localStorage.getItem(`user_pin_${user.id}`);
            if (storedPin) {
              setUserPersonalPin(storedPin);
            }
          }}
        />
      )}

      {showAgeVerification && currentUser && (
        <AgeVerificationModal
          onClose={() => setShowAgeVerification(false)}
          onVerified={handleAgeVerified}
          userId={currentUser.id}
        />
      )}

      {showPinLock && (
        <PinLockModal
          onClose={() => setShowPinLock(false)}
          onUnlock={handlePinUnlocked}
          userPersonalPin={userPersonalPin} // Pass user's personal PIN
        />
      )}

      {/* VERIFY PASSWORD MODAL - Required before changing PIN */}
      {showVerifyPassword && currentUser && (
        <VerifyPasswordModal
          onClose={() => setShowVerifyPassword(false)}
          userEmail={currentUser.email}
          onVerified={() => {
            // Password verified successfully - Now show PIN modal
            setShowVerifyPassword(false);
            setShowSetPersonalPin(true);
          }}
        />
      )}

      {/* SET PERSONAL PIN MODAL */}
      {showSetPersonalPin && currentUser && (
        <SetPersonalPinModal
          onClose={() => setShowSetPersonalPin(false)}
          currentPin={userPersonalPin || undefined}
          onSave={(newPin) => {
            // Save PIN to localStorage (in real app, save to backend)
            localStorage.setItem(`user_pin_${currentUser.id}`, newPin);
            setUserPersonalPin(newPin);
            alert('✅ Your personal 18+ PIN has been set successfully!');
          }}
        />
      )}

      {/* PROFILE MODAL (Mobile) */}
      {showProfileMenu && currentUser && (
        <>
          {/* Backdrop to close */}
          <div 
            className="fixed inset-0 z-[60] bg-black/50" 
            onClick={() => setShowProfileMenu(false)}
          />
          
          {/* Profile Dropdown - Slides from right */}
          <div className="fixed top-[60px] right-4 w-80 max-w-[calc(100vw-2rem)] bg-black/95 backdrop-blur-xl border border-[#FFD700]/20 rounded-2xl overflow-hidden z-[70] shadow-2xl">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF4500] flex items-center justify-center">
                  <User className="w-8 h-8 text-black" />
                </div>
                <div>
                  <p className="font-black text-white">{currentUser.name}</p>
                  <p className="text-sm text-gray-400">{currentUser.email}</p>
                </div>
              </div>
            </div>
            
            <div className="p-2">
              <button
                onClick={() => {
                  setShowWatchHistoryScreen(true);
                  setShowProfileMenu(false);
                }}
                className="w-full px-4 py-4 text-left hover:bg-white/10 rounded-xl transition-all text-white flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FFD700]" />
                  <span>Watch History</span>
                </span>
                <span className="text-sm bg-white/10 px-2 py-1 rounded">{watchHistory.length}</span>
              </button>
              <button
                onClick={() => {
                  setShowDownloadsScreen(true);
                  setShowProfileMenu(false);
                }}
                className="w-full px-4 py-4 text-left hover:bg-white/10 rounded-xl transition-all text-white flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <DownloadIcon className="w-4 h-4 text-cyan-400" />
                  <span>Downloads</span>
                </span>
                <span className="text-sm bg-white/10 px-2 py-1 rounded">{downloads.length}</span>
              </button>
              <button
                onClick={() => {
                  // If changing PIN (already has PIN), require password verification
                  if (userPersonalPin) {
                    setShowVerifyPassword(true);
                  } else {
                    // First time setting PIN - no verification needed
                    setShowSetPersonalPin(true);
                  }
                  setShowProfileMenu(false);
                }}
                className="w-full px-4 py-4 text-left hover:bg-white/10 rounded-xl transition-all text-white flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-red-400" />
                  <span>{userPersonalPin ? 'Change' : 'Set'} 18+ PIN</span>
                </span>
                <span className="text-xs bg-red-500/20 px-2 py-1 rounded text-red-400">
                  {userPersonalPin ? '✓ Set' : 'Not Set'}
                </span>
              </button>
            </div>
            
            <div className="p-4 border-t border-white/10">
              <button
                onClick={() => {
                  handleLogout();
                  setShowProfileMenu(false);
                }}
                className="w-full px-4 py-3 text-center bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-all text-red-400 font-bold"
              >
                🚪 Logout
              </button>
              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full px-4 py-3 text-center hover:bg-white/10 rounded-xl transition-all text-gray-400 font-bold mt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* VIEW ALL SCREEN */}
      {showViewAllScreen && (
        <div className="fixed inset-0 z-[100] bg-black">
          <ViewAllScreen
            title={viewAllTitle}
            emoji={viewAllEmoji}
            movies={viewAllMovies}
            onWatch={handleWatch}
            onDownload={handleDownload}
            onSeriesClick={handleSeriesClick}
            onBack={() => {
              setShowViewAllScreen(false);
              
              // Lock 18+ and return to home with trending tab
              if (viewAllTitle === '18+ Content') {
                setIs18PlusUnlocked(false);
                setActiveBottomTab('home');
                setActiveTopTab('trending');
              }
            }}
          />
        </div>
      )}

      {/* SERIES DETAIL SCREEN */}
      {showSeriesDetail && selectedSeries && (
        <SeriesDetailScreen
          series={{
            id: selectedSeries.id,
            title: selectedSeries.title,
            description: selectedSeries.description,
            thumbnailUrl: selectedSeries.thumbnailUrl,
            genre: selectedSeries.genre,
            year: selectedSeries.year,
            rating: selectedSeries.rating,
            episodes: selectedSeries.episodes || []
          }}
          onBack={() => {
            setShowSeriesDetail(false);
            setSelectedSeries(null);
          }}
          onPlayEpisode={handlePlayEpisode}
          onDownloadEpisode={handleDownloadEpisode}
        />
      )}

      {/* WATCH HISTORY SCREEN */}
      {showWatchHistoryScreen && (
        <div className="fixed inset-0 z-[100] bg-black overflow-y-auto">
          <WatchHistoryScreen
            history={watchHistory}
            onPlay={handleWatch}
            onDelete={handleDeleteFromHistory}
            onBack={() => setShowWatchHistoryScreen(false)}
          />
        </div>
      )}

      {/* DOWNLOADS SCREEN */}
      {showDownloadsScreen && (
        <div className="fixed inset-0 z-[100] bg-black overflow-y-auto">
          <DownloadsScreen
            downloads={downloads}
            onPlay={handleWatch}
            onDelete={handleDeleteDownload}
            onBack={() => setShowDownloadsScreen(false)}
          />
        </div>
      )}

      {/* MUSIC PLAYER - Always mounted for background playback */}
      {showMusicPlayer && currentTrack && (
        <MusicPlayer
          currentTrack={{
            id: currentTrack.id,
            title: currentTrack.title,
            artist: currentTrack.artist || currentTrack.genre,
            thumbnail: currentTrack.thumbnailUrl,
            fileUrl: currentTrack.videoUrl,
            contentType: currentTrack.contentType || 'music-video',
            duration: currentTrack.duration
          }}
          queue={musicQueue.map(track => ({
            id: track.id,
            title: track.title,
            artist: track.artist || track.genre,
            thumbnail: track.thumbnailUrl,
            fileUrl: track.videoUrl,
            contentType: track.contentType || 'music-video',
            duration: track.duration
          }))}
          isPlaying={isMusicPlaying}
          isVisible={activeBottomTab === 'music'}
          onPlayPause={() => setIsMusicPlaying(!isMusicPlaying)}
          onNext={() => {
            const currentIndex = musicQueue.findIndex(t => t.id === currentTrack.id);
            const nextIndex = (currentIndex + 1) % musicQueue.length;
            setCurrentTrack(musicQueue[nextIndex]);
            setIsMusicPlaying(true);
          }}
          onPrevious={() => {
            const currentIndex = musicQueue.findIndex(t => t.id === currentTrack.id);
            const prevIndex = (currentIndex - 1 + musicQueue.length) % musicQueue.length;
            setCurrentTrack(musicQueue[prevIndex]);
            setIsMusicPlaying(true);
          }}
          onSeek={(time) => {
            // Seek handled by player internally
          }}
          onVolumeChange={(volume) => {
            // Volume handled by player internally
          }}
          onClose={() => {
            setShowMusicPlayer(false);
            setIsMusicPlaying(false);
          }}
          onTrackEnd={() => {
            // Auto-play next track
            const currentIndex = musicQueue.findIndex(t => t.id === currentTrack.id);
            const nextIndex = (currentIndex + 1) % musicQueue.length;
            setCurrentTrack(musicQueue[nextIndex]);
            setIsMusicPlaying(true);
          }}
        />
      )}
      
      {/* TEST MUSIC ADDER MODAL */}
      {showAddTestMusic && <AddTestMusic />}

      {/* MOVIE DETAIL MODAL */}
      {showMovieDetail && selectedMovieDetail && (
        <MovieDetailModal
          movie={selectedMovieDetail}
          onClose={() => {
            setShowMovieDetail(false);
            setSelectedMovieDetail(null);
          }}
          onWatch={(movie) => {
            setShowMovieDetail(false);
            handleWatch(movie);
          }}
          onDownload={(movie) => {
            setShowMovieDetail(false);
            handleDownload(movie);
          }}
        />
      )}

      {/* FOOTER - Only show on main screens (not on player/modals) */}
      {!showPlayer && !showSeriesDetail && !showViewAllScreen && !showDownloadsScreen && !showWatchHistoryScreen && !showMovieDetail && (
        <Footer
          onNavigateToPrivacy={() => setLegalPage('privacy')}
          onNavigateToTerms={() => setLegalPage('terms')}
          onNavigateToAbout={() => setLegalPage('about')}
          onNavigateToContact={() => setLegalPage('contact')}
        />
      )}

      {/* COOKIE CONSENT BANNER */}
      <CookieConsent onNavigateToPrivacy={() => setLegalPage('privacy')} />
    </div>
  );
}