import React, { useState, useEffect } from 'react';
import CookieConsent from './components/CookieConsent';
import { MoviePlayer } from './components/MoviePlayer';
import { Film, Menu, X, Download, Eye, Lock, Plus, Edit2, Trash2, Save, Search, DollarSign, Play } from 'lucide-react';
import { projectId, publicAnonKey } from './utils/supabase/info';

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

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [movies, setMovies] = useState([] as Movie[]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null as Movie | null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adCountdown, setAdCountdown] = useState(50);
  const [downloadReady, setDownloadReady] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [autoPlayRequested, setAutoPlayRequested] = useState(false);
  
  // Admin Portal States
  const [redDotClicks, setRedDotClicks] = useState(0);
  const [showAdminPortal, setShowAdminPortal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminTab, setAdminTab] = useState('add' as 'add' | 'edit' | 'ads');
  const [editingMovie, setEditingMovie] = useState(null as Movie | null);
  interface AdminFormData {
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    genre: string;
    year: string;
    type: string;
    fileSize: string;
    shortUrl?: string;
  }

  const [adminFormData, setAdminFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    genre: '',
    year: '',
    type: 'movie',
    fileSize: '',
    shortUrl: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordError, setShowPasswordError] = useState(false);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchAdCountdown, setSearchAdCountdown] = useState(15);
  const [searchReady, setSearchReady] = useState(false);
  const [searchResults, setSearchResults] = useState([] as Movie[]);
  const [lastSearch, setLastSearch] = useState('');

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4d451974`;
  const ADMIN_PASSWORD = '0701680Kyamundu';

  // Ad countdown timer
  useEffect(() => {
    if (showAdModal && adCountdown > 0) {
      const timer = setTimeout(() => {
        setAdCountdown(adCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showAdModal && adCountdown === 0) {
      setDownloadReady(true);
    }
  }, [showAdModal, adCountdown]);

  // Advertising is now handled by Google Auto Ads; we keep a minimal client push
  // on user-driven actions (download/watch) to increase the chance Google
  // will display an ad. We removed inline ad placeholders so Google can
  // control placement site-wide.

  // Search ad countdown timer
  useEffect(() => {
    if (showSearchModal && searchAdCountdown > 0) {
      const timer = setTimeout(() => {
        setSearchAdCountdown(searchAdCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showSearchModal && searchAdCountdown === 0) {
      setSearchReady(true);
    }
  }, [showSearchModal, searchAdCountdown]);

  useEffect(() => {
    fetchMovies();
    fetchAdSettings();
    // If ?admin=1 is present in the URL, open the admin portal (useful for testing).
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === '1') {
        openAdminPortal();
        // hide other overlays so admin portal is visible
        setShowAdModal(false);
        setShowSearchModal(false);
      }
    } catch (e) {}
    // Also respect a persistent admin flag in localStorage (useful on deployed sites where query params might be removed)
    try {
      if (localStorage.getItem('thee_admin') === '1') openAdminPortal();
    } catch (e) {}

    // Close ad modal when the user uses browser back (popstate) so they don't get stuck
    const onPop = () => {
      if (showAdModal) {
        setShowAdModal(false);
        setSelectedMovie(null);
        return;
      }
      if (isWatching) {
        setIsWatching(false);
        setSelectedMovie(null);
        return;
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const [adSettings, setAdSettings] = useState({} as any);

  const fetchAdSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/settings`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      // read as text then attempt to parse JSON; avoids calling res.json() then res.text() which reads body twice
      const rawText = await res.text();
      let data: any = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch (parseErr) {
        console.warn('fetchAdSettings: non-JSON response', rawText);
        if (res.status === 404) {
          throw new Error('Settings endpoint not found (404). You may need to redeploy your Supabase function.');
        } else {
          throw new Error('Failed to parse settings response: ' + rawText);
        }
      }
      if (data && data.success) {
        setAdSettings(data.settings || {});
        try {
          (window as any).AD_SETTINGS = data.settings || {};
        } catch (e) {}
      } else if (data && data.settings) {
        setAdSettings(data.settings);
      }
    } catch (err) {
      console.error('Error fetching ad settings', err);
    }
  };

  const saveAdSettings = async (settings: any) => {
    try {
      const res = await fetch(`${API_URL}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ settings }),
      });
      // read text then try parse; prevents stream already read error
      const rawSaveText = await res.text();
      let json: any = null;
      try {
        json = rawSaveText ? JSON.parse(rawSaveText) : null;
      } catch (parseErr) {
        console.warn('saveAdSettings: non-JSON response', rawSaveText);
        if (res.status === 404) {
          throw new Error('Settings endpoint not found (404). Redeploy the Supabase function.');
        } else {
          throw new Error('Failed to parse save response: ' + rawSaveText);
        }
      }
      if (json && json.success) {
        setAdSettings(settings);
        try {
          (window as any).AD_SETTINGS = settings || {};
        } catch (e) {}
        alert('Ad settings saved');
      } else {
        console.error('Failed to save ad settings', json);
        alert('Failed to save ad settings');
      }
    } catch (e) {
      console.error('Error saving ad settings', e);
      alert('Error saving ad settings');
    }
  };

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
      const raw = await response.text();
      let data: any = null;
      try { data = raw ? JSON.parse(raw) : null; } catch (parseErr) { console.warn('handleAddMovie: non-JSON response', raw); alert('Failed to add movie (unexpected response): ' + raw); return; }
      console.log('Response data:', data);
      if (data.success) {
        setMovies(data.movies);
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

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setShowAdModal(true);
    setAdCountdown(50);
    setDownloadReady(false);
    // Removed older ad delay logic. Signal ad network to refresh
    // or insert an ad. This relies on Google Auto Ads being configured on
    // the site to decide where the ad should show.
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (e) {}
    // Push a shallow history entry so the browser Back closes the modal instead of going to a stale page
    try {
      window.history.pushState({ modal: movie.id }, '', `/movie/${movie.id}`);
    } catch (e) { /* ignore */ }
  };

  const handleDownload = () => {
    if (!selectedMovie) return;
    
    // Direct download from AWS
    // First attempt: programmatic anchor click (works when server sets CORS and Content-Disposition correctly)
    const directDownload = () => {
      const link = document.createElement('a');
      link.href = selectedMovie.videoUrl;
      link.download = `${selectedMovie.title}.mp4`;
      link.target = '_blank';
      document.body.appendChild(link);
      try { link.click(); } catch (e) { console.warn('Anchor click failed', e); }
      document.body.removeChild(link);
    };

    // If direct download doesn't start (cross-origin download attribute ignored), fetch and create Object URL as fallback
    const blobFallback = async () => {
      try {
        const resp = await fetch(selectedMovie.videoUrl, { method: 'GET', mode: 'cors' });
        if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selectedMovie.title}.mp4`;
        document.body.appendChild(link);
        try { link.click(); } catch (e) { console.warn('Blob anchor click failed', e); }
        document.body.removeChild(link);
        // release memory after some time
        setTimeout(() => URL.revokeObjectURL(url), 60 * 1000);
        return true;
      } catch (err: any) {
        console.error('Fetch fallback failed', err);
        try { window.open(selectedMovie.videoUrl, '_blank', 'noopener'); } catch (e) {}
        return false;
      }
    };

    // Try direct anchor, then if not, fallback to blob approach
    directDownload();
    // slight delay; after the click, attempt fallback to stream if the user didn't get a download
    setTimeout(async () => {
      // The fallback is safe to run even if direct succeeded; it will simply create another tab or trigger a download
      await blobFallback();
    }, 1500);
    // Signal Google to refresh ads on download
    try { (window as any).adsbygoogle = (window as any).adsbygoogle || []; (window as any).adsbygoogle.push({}); } catch (e) {}
    // Trigger an ad refresh when user downloads content
    try { (window as any).adsbygoogle = (window as any).adsbygoogle || []; (window as any).adsbygoogle.push({}); } catch (e) {}
    
    // Close modal after download starts
    setTimeout(() => {
      setShowAdModal(false);
      setSelectedMovie(null);
    }, 500);
  };

  const handleWatch = (movie?: Movie) => {
    // allow calling with a movie from the grid (direct watch) or when selectedMovie is already set
    const m = movie || selectedMovie;
    if (!m) return;
    setSelectedMovie(m);
    setShowAdModal(false);
    setIsWatching(true);
    // Signal the player that this open was triggered by a user click so it can try to autoplay
    try { setAutoPlayRequested(true); } catch (e) {}
    // Trigger an ad run when the user starts watching
    try { (window as any).adsbygoogle = (window as any).adsbygoogle || []; (window as any).adsbygoogle.push({}); } catch (e) {}
    // Push history entry so back closes player
    try { window.history.pushState({ player: m.id }, '', `/watch/${m.id}`); } catch (e) {}
  };

  const handleCloseModal = () => {
    // Replace history state to avoid going to external or stale pages when user hits Back
    try { window.history.replaceState({}, '', '/'); } catch (e) { /* ignore */ }
    setShowAdModal(false);
    setSelectedMovie(null);
    setAdCountdown(50);
    setDownloadReady(false);
    // reset history entry
    try { window.history.replaceState({}, '', '/'); } catch (e) { /* ignore */ }
    try { clearTimeout((window as any)._thee_ad_timer); } catch (e) {}
  };

  // Admin Portal Functions
  const handleRedDotClick = () => {
    const newClickCount = redDotClicks + 1;
    setRedDotClicks(newClickCount);
    
    if (newClickCount === 6) {
      setShowAdminPortal(true);
      // Make sure any other UI overlays are hidden when admin portal shows
      setShowAdModal(false);
      setShowSearchModal(false);
      setRedDotClicks(0);
    }
    
    // Reset clicks after 2 seconds
    setTimeout(() => setRedDotClicks(0), 2000);
  };

  // Support long press on the red dot to open admin in deployed builds
  const [redDotLongPressTimer, setRedDotLongPressTimer] = useState(null as number | null);

  const startRedDotPress = () => {
    try {
      const id = window.setTimeout(() => {
        openAdminPortal();
      }, 1500);
      setRedDotLongPressTimer(id as unknown as number);
    } catch (e) {}
  };

  const endRedDotPress = () => {
    if (redDotLongPressTimer) {
      clearTimeout(redDotLongPressTimer);
      setRedDotLongPressTimer(null);
    }
  };

  // Open admin portal via a single entrypoint for reuse
  const openAdminPortal = () => {
    setShowAdminPortal(true);
    setShowAdModal(false);
    setShowSearchModal(false);
    setAdminTab('add');
    try { localStorage.setItem('thee_admin', '1'); } catch (e) {}
  };

  const closeAdminPortal = () => {
    setShowAdminPortal(false);
    try { localStorage.removeItem('thee_admin'); } catch (e) {}
  };

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      try { localStorage.setItem('thee_admin', '1'); } catch (e) {}
    } else {
      alert('Incorrect password!');
    }
  };

  const handleAdminFormChange = (field: string, value: string) => {
    setAdminFormData((prev: AdminFormData) => ({ ...prev, [field]: value }));
  };

  const handleGenerateShortLink = async () => {
    if (!adminFormData.videoUrl) return alert('Please add a video URL to shorten');

    try {
      const res = await fetch(`${API_URL}/shorten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ url: adminFormData.videoUrl, adminPassword: ADMIN_PASSWORD })
      });
      // read text then parse JSON to avoid double-body read
      const raw = await res.text();
      let j = null;
      try { j = raw ? JSON.parse(raw) : null; } catch (parseErr) {
        return alert('Failed to create short link (unexpected response): ' + raw);
      }
      if (!j.success) return alert('Failed to create short link: ' + (j.error || 'unknown'));
      setAdminFormData((prev: AdminFormData) => ({ ...prev, shortUrl: j.shortUrl }));
      alert('Short link created: ' + j.shortUrl);
    } catch (e: any) {
      console.error('Shorten failed:', e);
      alert('Shorten failed: ' + (e.message || String(e)));
    }
    };

    const handleGetShortStats = async () => {
      if (!adminFormData.shortUrl) return alert('No short URL set');
      try {
        const code = adminFormData.shortUrl.split('/s/').pop();
        const res = await fetch(`${API_URL}/shorts/${code}/stats`, { headers: { Authorization: `Bearer ${publicAnonKey}` } });
        const raw = await res.text();
        let j: any = null;
        try { j = raw ? JSON.parse(raw) : null; } catch (e) { return alert('Failed to fetch stats (unexpected response): ' + raw); }
        if (!j.success) return alert('No stats found: ' + (j.error || 'unknown'));
        alert(`Short link visits: ${j.stats.count || 0}\nLast visit: ${j.stats.lastVisit || 'never'}`);
      } catch (e: any) {
        console.error(e);
        alert('Failed to fetch stats');
      }
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

      const rawMovies = await response.text();
      let data: any = null;
      try { data = rawMovies ? JSON.parse(rawMovies) : null; } catch (parseErr) { console.warn('fetchMovies: non-JSON response', rawMovies); }
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
          fileSize: '',
          shortUrl: ''
        });
        setConfirmPassword('');
        fetchMovies();
      } else {
        alert('Error adding movie: ' + data.error);
      }
    } catch (error) {
      console.error('Error adding movie:', error);
      alert('Error adding movie: ' + error);
    }
  };

  const handleEditMovie = (movie: Movie) => {
    setEditingMovie(movie);
    setAdminFormData({
      title: movie.title,
      description: movie.description,
      videoUrl: movie.videoUrl,
      thumbnailUrl: movie.thumbnailUrl,
      genre: movie.genre,
      year: movie.year,
      type: movie.type,
      fileSize: movie?.fileSize || '',
      shortUrl: (movie as any).shortUrl || ''
    });
    setAdminTab('add');
  };

  const handleUpdateMovie = async () => {
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

      const raw = await response.text();
      let data: any = null;
      try { data = raw ? JSON.parse(raw) : null; } catch (parseErr) { console.warn('handleUpdateMovie: non-JSON response', raw); alert('Failed to update movie (unexpected response): ' + raw); return; }
      if (data.success) {
        alert('Movie updated successfully!');
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
        setConfirmPassword('');
        fetchMovies();
        setAdminTab('edit');
      } else {
        alert('Error updating movie: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating movie:', error);
      alert('Error updating movie: ' + error);
    }
  };

  const handleDeleteMovie = async (movieId: string) => {
    const password = prompt('Enter admin password to delete:');
    if (password !== ADMIN_PASSWORD) {
      alert('Incorrect password!');
      return;
    }

    if (!confirm('Are you sure you want to delete this movie?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/movies/${movieId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const raw = await response.text();
      let data: any = null;
      try { data = raw ? JSON.parse(raw) : null; } catch (parseErr) { console.warn('handleDeleteMovie: non-JSON response', raw); alert('Failed to delete movie (unexpected response): ' + raw); return; }
      if (data.success) {
        alert('Movie deleted successfully!');
        fetchMovies();
      } else {
        alert('Error deleting movie: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('Error deleting movie: ' + error);
    }
  };

  // Search Functions
  const handleSearchChange = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      alert('Please enter a search query');
      return;
    }

    // Filter movies
    const filteredMovies = movies.filter((movie: Movie) =>
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.year.includes(searchQuery)
    );

    if (filteredMovies.length === 0) {
      alert('No movies found matching your search!');
      return;
    }

    // Protect against rapid duplicate searches
    if (searchQuery.trim() === lastSearch.trim()) {
      // same query - don't run again
      setShowSearchModal(true);
      return;
    }

    // Show ad modal first
    setShowSearchModal(true);
    setSearchAdCountdown(15);
    setSearchReady(false);
    setSearchResults(filteredMovies);
    setLastSearch(searchQuery);
    // Removed inline search ad timer; Google Auto Ads should control placement.
  };

  const handleSearchDownload = () => {
    if (!selectedMovie) return;
    // Try anchor + blob fallback like the regular download flow
    const directDownload = () => {
      const link = document.createElement('a');
      link.href = selectedMovie.videoUrl;
      link.download = `${selectedMovie.title}.mp4`;
      link.target = '_blank';
      document.body.appendChild(link);
      try { link.click(); } catch (e) { console.warn('Anchor click failed (search):', e); }
      document.body.removeChild(link);
    };

    const blobFallback = async () => {
      try {
        const resp = await fetch(selectedMovie.videoUrl, { method: 'GET', mode: 'cors' });
        if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selectedMovie.title}.mp4`;
        document.body.appendChild(link);
        try { link.click(); } catch (e) { console.warn('Blob anchor click failed (search)', e); }
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 60 * 1000);
      } catch (err: any) {
        console.error('Fetch fallback failed (search):', err);
        try { window.open(selectedMovie.videoUrl, '_blank', 'noopener'); } catch (e) {}
      }
    };

    directDownload();
    setTimeout(() => blobFallback(), 1500);
    
    // Close modal after download starts
    setTimeout(() => {
      setShowSearchModal(false);
      setSelectedMovie(null);
    }, 500);
  };

  const handleCloseSearchModal = () => {
    try { window.history.replaceState({}, '', '/'); } catch (e) { }
            setShowSearchModal(false);
            setSelectedMovie(null);
            setSearchAdCountdown(15);
            setSearchReady(false);
            setSearchResults([]);
            try { clearTimeout((window as any)._thee_search_ad_timer); } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] text-white">
      {/* Admin Portal Modal */}
      <CookieConsent />
      {showAdminPortal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
          <div className="relative max-w-5xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-2xl border-2 border-[#FFD700]/30">
                {/* Sticky footer with download button to keep visible */}
                <div className="mt-6 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 pt-4 -mx-6 sm:-mx-8 px-6 sm:px-8 pb-6 z-[90]">
                  <div className="max-w-3xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3">
                      <button
                        onClick={handleDownload}
                        disabled={!downloadReady}
                        className={`flex-1 py-3 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
                          downloadReady
                            ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FF4500] text-black shadow-lg shadow-[#FFD700]/50 hover:scale-105'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <Download className="w-6 h-6" />
                        {downloadReady ? 'GET CONTENT' : 'PREPARING CONTENT...'}
                      </button>

                      {selectedMovie?.fileSize && (
                        <p className="text-center text-gray-400 text-sm mt-2 sm:mt-0 sm:ml-4">File size: {selectedMovie?.fileSize}</p>
                      )}
                    </div>
                  </div>
                </div>
                {/* Admin Portal Login / Auth state */}
                {!isAdminAuthenticated ? (
                  <div className="p-4 sm:p-6">
                    <h2 className="text-3xl font-black mb-2 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF4500] bg-clip-text text-transparent">ADMIN PORTAL</h2>
                    <p className="text-gray-400 mb-8">Enter password to continue</p>

                    <input
                  type="password"
                  value={adminPassword}
                  onChange={(e: any) => setAdminPassword(e.target.value)}
                  onKeyPress={(e: any) => e.key === 'Enter' && handleAdminLogin()}
                  placeholder="Enter password"
                  className="w-full max-w-md px-4 py-3 bg-black/50 border-2 border-[#FFD700]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] mb-4"
                />
                
                <button
                  onClick={handleAdminLogin}
                  className="px-8 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FF4500] text-black font-black rounded-xl transition-all hover:scale-105"
                >
                  LOGIN
                </button>
                  </div>
                ) : (
              <div className="p-4 sm:p-6">
                {/* Admin Header */}
                <div className="mb-6">
                  <h2 className="text-3xl font-black mb-2 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF4500] bg-clip-text text-transparent">
                    ADMIN PORTAL
                  </h2>
                  <p className="text-gray-400">Manage your movie library</p>
                </div>
                {isAdminAuthenticated && (
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setIsAdminAuthenticated(false);
                        closeAdminPortal();
                      }}
                      className="px-4 py-2 bg-red-600 rounded text-white font-bold"
                    >
                      LOGOUT
                    </button>
                  </div>
                )}

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-[#FFD700]/20">
                  <button
                    onClick={() => setAdminTab('add')}
                    className={`px-6 py-3 font-bold transition-all ${
                      adminTab === 'add'
                        ? 'text-[#FFD700] border-b-2 border-[#FFD700]'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <Plus className="w-5 h-5 inline mr-2" />
                    {editingMovie ? 'EDIT MOVIE' : 'ADD MOVIE'}
                  </button>
                  <button
                    onClick={() => {
                      setAdminTab('edit');
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
                    className={`px-6 py-3 font-bold transition-all ${
                      adminTab === 'edit'
                        ? 'text-[#FFD700] border-b-2 border-[#FFD700]'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <Edit2 className="w-5 h-5 inline mr-2" />
                    MANAGE MOVIES
                  </button>
                  <button
                    onClick={() => setAdminTab('ads')}
                    className={`px-6 py-3 font-bold transition-all ${
                      adminTab === 'ads'
                        ? 'text-[#FFD700] border-b-2 border-[#FFD700]'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <DollarSign className="w-5 h-5 inline mr-2" />
                    ADS
                  </button>
                </div>

                {/* Add/Edit Movie Form */}
                {adminTab === 'add' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Title *</label>
                      <input
                        type="text"
                        value={adminFormData.title}
                        onChange={(e: any) => handleAdminFormChange('title', e.target.value)}
                        className="w-full px-4 py-3 bg-black/50 border-2 border-[#FFD700]/30 rounded-xl text-white focus:outline-none focus:border-[#FFD700]"
                        placeholder="Enter movie title"
                      />
                    </div>
                    <div className="mt-3 sm:mt-0">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleGenerateShortLink}
                          className="px-4 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition"
                        >
                          Generate Short Link
                        </button>
                        {adminFormData.shortUrl && (
                          <div className="flex items-center gap-2">
                            <input
                              readOnly
                              value={adminFormData.shortUrl}
                              className="px-3 py-2 rounded bg-black/50 border border-[#FFD700]/20 text-sm w-[320px]"
                              placeholder="ca-pub-5559193988562698"
                              />
                              <button
                                onClick={handleGetShortStats}
                                className="px-3 py-2 bg-gray-700 rounded text-white text-sm"
                              >
                                View Stats
                              </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(adminFormData.shortUrl);
                                alert('Short URL copied to clipboard');
                              }}
                              className="px-3 py-2 bg-[#FFD700] rounded text-black font-black"
                            >
                              Copy
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Description</label>
                      <textarea
                        value={adminFormData.description}
                        onChange={(e: any) => handleAdminFormChange('description', e.target.value)}
                        className="w-full px-4 py-3 bg-black/50 border-2 border-[#FFD700]/30 rounded-xl text-white focus:outline-none focus:border-[#FFD700] min-h-[100px]"
                        placeholder="Enter movie description"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">AWS Video URL *</label>
                        <input
                          type="url"
                          value={adminFormData.videoUrl}
                          onChange={(e: any) => handleAdminFormChange('videoUrl', e.target.value)}
                          className="w-full px-4 py-3 bg-black/50 border-2 border-[#FFD700]/30 rounded-xl text-white focus:outline-none focus:border-[#FFD700]"
                          placeholder="https://..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Thumbnail URL</label>
                        <input
                          type="url"
                          value={adminFormData.thumbnailUrl}
                          onChange={(e: any) => handleAdminFormChange('thumbnailUrl', e.target.value)}
                          className="w-full px-4 py-3 bg-black/50 border-2 border-[#FFD700]/30 rounded-xl text-white focus:outline-none focus:border-[#FFD700]"
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Genre</label>
                        <input
                          type="text"
                          value={adminFormData.genre}
                          onChange={(e: any) => handleAdminFormChange('genre', e.target.value)}
                          className="w-full px-4 py-3 bg-black/50 border-2 border-[#FFD700]/30 rounded-xl text-white focus:outline-none focus:border-[#FFD700]"
                          placeholder="Action, Comedy..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Year</label>
                        <input
                          type="text"
                          value={adminFormData.year}
                          onChange={(e: any) => handleAdminFormChange('year', e.target.value)}
                          className="w-full px-4 py-3 bg-black/50 border-2 border-[#FFD700]/30 rounded-xl text-white focus:outline-none focus:border-[#FFD700]"
                          placeholder="2024"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-2">File Size</label>
                        <input
                          type="text"
                          value={adminFormData.fileSize}
                          onChange={(e: any) => handleAdminFormChange('fileSize', e.target.value)}
                          className="w-full px-4 py-3 bg-black/50 border-2 border-[#FFD700]/30 rounded-xl text-white focus:outline-none focus:border-[#FFD700]"
                          placeholder="1.5 GB"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Type</label>
                      <select
                        value={adminFormData.type}
                        onChange={(e: any) => handleAdminFormChange('type', e.target.value)}
                        className="w-full px-4 py-3 bg-black/50 border-2 border-[#FFD700]/30 rounded-xl text-white focus:outline-none focus:border-[#FFD700]"
                      >
                        <option value="movie">Movie</option>
                        <option value="series">Series</option>
                      </select>
                    </div>

                    {/* Password Confirmation */}
                    <div className="pt-4 border-t-2 border-[#FFD700]/20">
                      <label className="block text-sm text-[#FFD700] mb-2 font-bold">
                        🔐 Confirm Password to Save *
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e: any) => {
                          setConfirmPassword(e.target.value);
                          setShowPasswordError(false);
                        }}
                        className={`w-full px-4 py-3 bg-black/50 border-2 ${
                          showPasswordError ? 'border-red-500' : 'border-[#FFD700]/30'
                        } rounded-xl text-white focus:outline-none focus:border-[#FFD700]`}
                        placeholder="Enter admin password"
                      />
                      {showPasswordError && (
                        <p className="text-red-500 text-sm mt-2">⚠️ Password is required to save</p>
                      )}
                    </div>

                    <button
                      onClick={editingMovie ? handleUpdateMovie : handleAddMovie}
                      className="w-full py-4 bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FF4500] text-black font-black rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      {editingMovie ? 'UPDATE MOVIE' : 'ADD MOVIE'}
                    </button>

                    {editingMovie && (
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
                        className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-all"
                      >
                        CANCEL EDIT
                      </button>
                    )}
                  </div>
                )}

                {/* Manage Movies List */}
                {adminTab === 'edit' && (
                  <div className="space-y-3">
                    {movies.length === 0 ? (
                      <p className="text-center text-gray-400 py-10">No movies in database</p>
                    ) : (
                      movies.map((movie: Movie) => (
                        <div
                          key={movie.id}
                          className="p-4 bg-black/30 border border-[#FFD700]/20 rounded-xl flex items-center gap-4 hover:border-[#FFD700]/50 transition-all"
                        >
                          {movie.thumbnailUrl ? (
                            <img
                              src={movie.thumbnailUrl}
                              alt={movie.title}
                              className="w-20 h-28 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-20 h-28 bg-gradient-to-br from-[#FFD700]/20 to-[#FF4500]/10 rounded-lg flex items-center justify-center">
                              <Film className="w-10 h-10 text-[#FFD700]/50" />
                            </div>
                          )}

                          <div className="flex-1">
                            <h4 className="font-black text-[#FFD700] mb-1">{movie.title}</h4>
                            <p className="text-sm text-gray-400">{movie.year} • {movie.genre}</p>
                            {movie?.fileSize && (
                              <p className="text-xs text-gray-500 mt-1">{movie?.fileSize}</p>
                            )}
                            {(movie as any).shortUrl && (
                              <div className="mt-2 flex items-center gap-2">
                                <a
                                  href={(movie as any).shortUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sm text-[#FFD700] underline"
                                >
                                  Short link
                                </a>
                                <button
                                  onClick={() => { navigator.clipboard.writeText((movie as any).shortUrl); alert('Short link copied'); }}
                                  className="text-xs px-2 py-1 rounded bg-[#FFD700] text-black"
                                >
                                  Copy
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditMovie(movie)}
                              className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMovie(movie.id)}
                              className="p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
                {adminTab === 'ads' && (
                  <div className="space-y-4">
                    <p className="text-gray-400">Add or update Google AdSense settings used across the site.</p>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">AdSense Publisher ID (data-ad-client)</label>
                      <input
                        type="text"
                        value={adSettings.client || ''}
                        onChange={(e: any) => setAdSettings({ ...adSettings, client: e.target.value })}
                        className="w-full px-4 py-3 bg-black/50 border-2 border-[#FFD700]/30 rounded-xl text-white focus:outline-none focus:border-[#FFD700]"
                        placeholder="ca-pub-5559193988562698"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Download Ad Slot (data-ad-slot)</label>
                        <input
                          type="text"
                          value={adSettings.downloadSlot || ''}
                          onChange={(e: any) => setAdSettings({ ...adSettings, downloadSlot: e.target.value })}
                          className="w-full px-4 py-3 bg-black/50 border-2 border-[#FFD700]/30 rounded-xl text-white focus:outline-none focus:border-[#FFD700]"
                          placeholder="1234567890"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Search Ad Slot</label>
                        <input
                          type="text"
                          value={adSettings.searchSlot || ''}
                          onChange={(e: any) => setAdSettings({ ...adSettings, searchSlot: e.target.value })}
                          className="w-full px-4 py-3 bg-black/50 border-2 border-[#FFD700]/30 rounded-xl text-white focus:outline-none focus:border-[#FFD700]"
                          placeholder="2345678901"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Player Ad Slot (optional)</label>
                      <input
                        type="text"
                        value={adSettings.playerSlot || ''}
                        onChange={(e: any) => setAdSettings({ ...adSettings, playerSlot: e.target.value })}
                        className="w-full px-4 py-3 bg-black/50 border-2 border-[#FFD700]/30 rounded-xl text-white focus:outline-none focus:border-[#FFD700]"
                        placeholder="3456789012"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => saveAdSettings(adSettings || {})}
                        className="px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FF4500] text-black font-black rounded-xl transition-all hover:scale-105"
                      >
                        Save Ads
                      </button>
                      <button
                        onClick={() => {
                          setAdSettings({});
                        }}
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Movie Player Overlay */}
      {isWatching && selectedMovie && (
        <MoviePlayer
          movie={selectedMovie}
            autoPlayRequested={autoPlayRequested}
            onAutoPlayHandled={() => setAutoPlayRequested(false)}
          onClose={() => {
            setIsWatching(false);
            setSelectedMovie(null);
            window.history.replaceState({}, '', '/');
          }}
        />
      )}

      {/* Ad Modal with Download */}
      {showAdModal && selectedMovie && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 backdrop-blur-sm">
          {/* Constrain modal height so it doesn't expand half-way on small screens */}
          <div
            className="relative w-full mx-4"
            style={{
              width: 'min(95vw, 900px)',
              maxHeight: '85vh',
              overflow: 'auto',
              resize: 'both',
            }}
          >
            {/* Close Button */}
            <div className="absolute top-4 left-4 flex gap-2 z-50">
              <button
                onClick={() => {
                  handleCloseModal();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition"
                aria-label="Back to Home"
              >
                ← Back to Home
              </button>
            </div>

            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors z-50"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Movie Info */}
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-2xl border-2 border-[#FFD700]/30 overflow-hidden">
              {/* Compact header - removed full-size thumbnail to reduce modal height */}
              <div className="px-6 pt-6 sm:px-8 sm:pt-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#111827] flex items-center justify-center border border-[#FFD700]/10">
                    <Film className="w-6 h-6 text-[#FFD700]/50" />
                  </div>
                  <div>
                    <div className="text-lg font-black">{selectedMovie.title}</div>
                    <div className="text-sm text-gray-400">{selectedMovie.year} • {selectedMovie.genre}</div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                <h3 className="text-2xl sm:text-3xl font-black mb-3 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF4500] bg-clip-text text-transparent">
                  {selectedMovie.title}
                </h3>
                <p className="text-gray-400 mb-2">{selectedMovie.year} • {selectedMovie.genre}</p>
                {selectedMovie.description && (
                  <p className="text-gray-300 mb-4 line-clamp-2">{selectedMovie.description}</p>
                )}

                {/* Ad Space - Replace with real ad code */}
                <div className="my-4 p-4 sm:p-6 bg-gradient-to-r from-[#FFD700]/10 to-[#FF4500]/10 rounded-xl border-2 border-[#FFD700]/20 flex flex-col items-center justify-center min-h-[80px]">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-[#FFD700] rounded-full flex items-center justify-center animate-pulse">
                      <Eye className="w-8 h-8 text-black" />
                    </div>
                    {!downloadReady ? (
                      <>
                        <p className="text-[#FFD700] font-bold text-lg mb-2">Please wait...</p>
                        <p className="text-gray-400 text-sm mb-4">Your download will be ready in</p>
                        <div className="text-3xl sm:text-4xl md:text-5xl font-black text-[#FFD700]">{adCountdown}</div>
                        <div className="mt-4">
                          {/* Google will control ad placement. Show a neutral message */}
                          <div className="mb-2 text-sm text-gray-500">Sponsored — supports the free movie library</div>
                          <div className="text-gray-500 text-sm">Ads will appear as provided by Google.</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-[#FFD700] font-bold text-xl mb-2">Ready!</p>
                        <p className="text-gray-400">Use the button below to proceed to content</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  disabled={!downloadReady}
                  className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
                    downloadReady
                      ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FF4500] text-black shadow-lg shadow-[#FFD700]/50 hover:scale-105'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Download className="w-6 h-6" />
                  {downloadReady ? 'GET CONTENT' : 'PREPARING CONTENT...'}
                </button>

                {/* Watch Button - streams in player overlay */}
                <button
                  onClick={handleWatch}
                  className="w-full mt-3 py-3 rounded-xl font-black text-lg flex items-center justify-center gap-3 bg-[#111827] hover:bg-[#111111]/80 text-white border border-[#303134] transition-all"
                >
                  <Play className="w-5 h-5" />
                  WATCH
                </button>

                {selectedMovie?.fileSize && (
                  <p className="text-center text-gray-500 text-sm mt-3">
                    File size: {selectedMovie?.fileSize}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Ad Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/95 backdrop-blur-sm">
          <div
            className="relative w-full mx-4"
            style={{
              width: 'min(95vw, 1100px)',
              maxHeight: '90vh',
              overflow: 'auto',
              resize: 'both',
            }}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseSearchModal}
              className="absolute -top-12 right-0 p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="absolute -top-12 left-0">
              <button
                onClick={() => {
                  handleCloseSearchModal();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition"
                aria-label="Back to Home"
              >
                ← Back to Home
              </button>
            </div>

            {/* Ad Content */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-2xl border-2 border-[#FFD700]/30 overflow-hidden p-12 pb-28">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-[#FFD700]/50">
                  <Search className="w-10 h-10 text-black" />
                </div>
                
                {!searchReady ? (
                  <>
                    <h3 className="text-3xl font-black mb-4 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF4500] bg-clip-text text-transparent">
                      SEARCHING...
                    </h3>
                    <p className="text-gray-400 text-lg mb-6">Your results will appear in</p>
                    <div className="text-7xl font-black text-[#FFD700] mb-6">{searchAdCountdown}</div>
                    <div className="p-6 bg-gradient-to-r from-[#FFD700]/10 to-[#FF4500]/10 rounded-xl border-2 border-[#FFD700]/20">
                      {/* Google AdSense unit for search ads */}
                      <div className="mb-2 text-sm text-gray-500">Sponsored — supports the free library</div>
                      <div className="text-gray-500">Ads appear based on Google’s placement decisions.</div>
                    </div>
                    {/* Add a small 'popular picks' content area to avoid screens-without-content issues */}
                    <div className="mt-6 text-left">
                      <h4 className="text-gray-300 font-bold mb-3">Popular picks while you wait</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {movies.slice(0, 6).map((m: Movie) => (
                          <div key={m.id} className="flex items-center gap-2 p-2 bg-black/40 rounded">
                            {m.thumbnailUrl ? (
                              <img src={m.thumbnailUrl} alt={m.title} className="w-12 h-16 object-cover rounded" />
                            ) : (
                              <div className="w-12 h-16 bg-[#FFD700]/20 rounded flex items-center justify-center">
                                <Film className="w-6 h-6 text-[#FFD700]/50" />
                              </div>
                            )}
                            <div className="text-sm">
                              <div className="font-bold line-clamp-1">{m.title}</div>
                              <div className="text-gray-400 text-xs">{m.year}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-3xl font-black mb-4 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF4500] bg-clip-text text-transparent">
                      SEARCH COMPLETE!
                    </h3>
                    <p className="text-gray-400 text-lg mb-6">
                      Found {searchResults.length} movie{searchResults.length !== 1 ? 's' : ''}
                    </p>
                    <button
                      onClick={() => {
                        setShowSearchModal(false);
                        setSearchAdCountdown(15);
                        setSearchReady(false);
                      }}
                      className="px-8 py-4 bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FF4500] text-black font-black rounded-xl transition-all hover:scale-105"
                    >
                      VIEW RESULTS
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 w-full z-40 transition-all duration-300 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-md border-b border-[#FFD700]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo - click to go home */}
            <a href="/" onClick={(e: any) => { e.preventDefault(); window.location.replace('/'); }} className="flex items-center space-x-4 cursor-pointer">
              <div className="relative p-2 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-xl shadow-lg shadow-[#FFD700]/30">
                <Film className="w-8 h-8 text-black" strokeWidth={2.5} />
                <div 
                  onClick={(e: any) => { e.preventDefault(); e.stopPropagation(); handleRedDotClick(); }}
                  onPointerDown={(e: any) => { e.preventDefault(); e.stopPropagation(); startRedDotPress(); }}
                  onPointerUp={(e: any) => { e.preventDefault(); e.stopPropagation(); endRedDotPress(); }}
                  onPointerLeave={(e: any) => { e.preventDefault(); e.stopPropagation(); endRedDotPress(); }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF4500] rounded-full border-2 border-black animate-pulse cursor-pointer hover:scale-125 transition-transform"
                  aria-hidden="true"
                ></div>
              </div>
              <div>
                <h1 className="font-black tracking-tight text-[24px] leading-[24px] bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] bg-clip-text text-transparent">
                  THEE ARCHIVE
                </h1>
                <p className="text-[11px] text-[#FFD700] tracking-[0.2em] font-semibold">FREE MOVIE LIBRARY</p>
              </div>
            </a>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 hover:bg-[#FFD700]/20 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-[#FFD700]" /> : <Menu className="w-6 h-6 text-[#FFD700]" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-lg border-t border-[#FFD700]/20">
            <nav className="max-w-7xl mx-auto px-4 py-6 text-center">
              <p className="text-gray-400 text-sm">Browse movies below</p>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1739433437912-cca661ba902f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHRoZWF0ZXIlMjBjaW5lbWF8ZW58MXx8fHwxNzYyODg5OTMyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Movie Theater"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-[#0a0a0a]/60"></div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-40 right-10 w-64 h-64 bg-[#FFD700]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#FF4500]/20 rounded-full blur-3xl"></div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-6 text-[48px] sm:text-[64px] lg:text-[72px] leading-[1.1] font-black">
            <span className="block">Your Free</span>
            <span className="block bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF4500] bg-clip-text text-transparent">
              Movie Library
            </span>
          </h2>
          
          <p className="mb-12 max-w-2xl mx-auto text-gray-300 text-[18px] leading-relaxed">
            Watch movies and series with Luganda translations. 
            100% free streaming - No subscriptions, no credit cards.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 pt-8 border-t border-[#FFD700]/20">
            <div>
              <p className="text-[#FFD700] text-[32px] font-black">{movies.length}</p>
              <p className="text-gray-400 text-sm">Total Movies</p>
            </div>
            <div className="w-px bg-[#FFD700]/20"></div>
            <div>
              <p className="text-[#FFA500] text-[32px] font-black">100%</p>
              <p className="text-gray-400 text-sm">Free</p>
            </div>
            <div className="w-px bg-[#FFD700]/20"></div>
            <div>
              <p className="text-[#FF4500] text-[32px] font-black">HD</p>
              <p className="text-gray-400 text-sm">Quality</p>
            </div>
          </div>
        </div>
      </section>

      {/* Movies Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={(e: any) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for movies by title, genre, or year..."
              className="w-full px-6 py-4 bg-black/50 border-2 border-[#FFD700]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] text-lg"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-2 p-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FF4500] rounded-lg transition-colors"
            >
              <Search className="w-6 h-6 text-black" />
            </button>
          </div>
        </div>

        <div className="mb-12">
          <h3 className="text-[32px] font-black text-center mb-12">
            <span className="bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF4500] bg-clip-text text-transparent">
              Available Movies
            </span>
          </h3>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-16 h-16 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400">Loading movies from database...</p>
            </div>
          ) : movies.length === 0 ? (
            <div className="text-center py-20">
              <Film className="w-20 h-20 text-[#FFD700]/30 mx-auto mb-4" />
              <h4 className="text-[24px] text-[#FFD700] mb-2 font-bold">No Movies Available</h4>
              <p className="text-gray-400 max-w-md mx-auto">
                Check back soon for new content!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {searchResults.length === 0 && movies.map((movie: Movie, index: number) => (
                <div
                  key={movie.id}
                  onClick={() => handleMovieClick(movie)}
                  className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-2 border-[#FFD700]/30 hover:border-[#FFD700] transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-[#FFD700]/50"
                >
                  {/* Play Icon Overlay - Always visible on mobile, hover on desktop */}
                  <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20 group-hover:scale-110 transition-transform">
                      <Download className="w-8 h-8 text-black" />
                    </div>
                  </div>
                  {/* WATCH CTA on the movie card */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <button
                      onClick={(e: any) => { e.stopPropagation(); handleWatch(movie); }}
                      className="px-3 py-1 bg-[#111827]/80 border border-[#FFD700]/30 rounded-lg text-sm font-bold hover:bg-[#111827]"
                    >
                      <Play className="w-4 h-4 inline mr-1" /> WATCH
                    </button>
                  </div>

                  {/* Movie Thumbnail or Placeholder */}
                  {movie.thumbnailUrl ? (
                    <img 
                      src={movie.thumbnailUrl} 
                      alt={movie.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/30 via-[#FFA500]/20 to-[#FF4500]/10 flex items-center justify-center">
                      <Film className="w-16 h-16 text-[#FFD700]/50" />
                    </div>
                  )}

                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent group-hover:via-black/50 transition-all duration-300"></div>

                  {/* Movie info at bottom (always visible) */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                    <h4 className="line-clamp-2 font-black mb-1 text-shadow">{movie.title}</h4>
                    <p className="text-sm text-[#FFD700] font-bold">{movie.year} • {movie.genre}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {searchResults.map((movie: Movie, index: number) => (
              <div
                key={movie.id}
                onClick={() => handleMovieClick(movie)}
                className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-2 border-[#FFD700]/30 hover:border-[#FFD700] transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-[#FFD700]/50"
              >
                {/* Play Icon Overlay - Always visible on mobile, hover on desktop */}
                <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20 group-hover:scale-110 transition-transform">
                    <Download className="w-8 h-8 text-black" />
                  </div>
                </div>

                {/* Movie Thumbnail or Placeholder */}
                {movie.thumbnailUrl ? (
                  <img 
                    src={movie.thumbnailUrl} 
                    alt={movie.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/30 via-[#FFA500]/20 to-[#FF4500]/10 flex items-center justify-center">
                      <Film className="w-16 h-16 text-[#FFD700]/50" />
                  </div>
                )}

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent group-hover:via-black/50 transition-all duration-300"></div>

                {/* Movie info at bottom (always visible) */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                  <h4 className="line-clamp-2 font-black mb-1 text-shadow">{movie.title}</h4>
                  <p className="text-sm text-[#FFD700] font-bold">{movie.year} • {movie.genre}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-[#FFD700]/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-lg">
                <Film className="w-6 h-6 text-black" />
              </div>
              <span className="font-black text-[#FFD700] text-[20px]">THEE ARCHIVE</span>
            </div>
            <p className="text-gray-400 text-sm max-w-md">
              Your free Luganda movie library. Watch unlimited movies and series with Luganda translations.
            </p>
            <p className="text-gray-500 text-xs pt-4">
              © 2025 THEE ARCHIVE. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}