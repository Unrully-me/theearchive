import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Search, 
  X, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Download, 
  Eye,
  TrendingUp,
  Clock,
  Star,
  Film,
  ChevronLeft,
  MoreVertical,
  Send,
  Trash2
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Movie {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  year: number;
  genre: string;
  type: 'movie' | 'series';
  rating?: number;
  duration?: string;
  ageRating?: string;
  views?: number;
  likes?: number;
  category?: string;
}

interface MovieShortsScreenProps {
  movies: Movie[];
  onWatch: (movie: Movie) => void;
  onDownload: (movie: Movie) => void;
  onBack: () => void;
  currentUser?: any;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  text: string;
  timestamp: string;
}

export function MovieShortsScreen({ 
  movies, 
  onWatch, 
  onDownload, 
  onBack,
  currentUser 
}: MovieShortsScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  // Tracks whether the user manually toggled mute/unmute. If true, we should
  // respect the user's preference and not override it during autoplay failures
  // or when switching between shorts.
  const [userSetMute, setUserSetMute] = useState(false);
  // If autoplay-with-sound is blocked we show a small prompt to let the
  // user enable sound (requires user interaction). This prevents forcing
  // mute across the whole session when the browser blocks autoplay.
  const [soundBlocked, setSoundBlocked] = useState(false);

  // Persist user preference for shorts mute/unmute in localStorage so it survives
  // navigation/back/refresh. Read existing preference on mount.
  useEffect(() => {
    try {
      const pref = localStorage.getItem('shorts_isMuted');
      const userSet = localStorage.getItem('shorts_userSetMute');
      if (pref !== null) {
        setIsMuted(pref === 'true');
      }
      if (userSet === 'true') {
        setUserSetMute(true);
      }
    } catch (e) {
      // ignore localStorage errors
    }
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<{[key: string]: number}>({});
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [localViews, setLocalViews] = useState<{[key: string]: number}>({});
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{[key: number]: HTMLVideoElement}>({});
  const touchStartY = useRef(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Filter movies for shorts (exclude 18+, music, and kids content from main shorts feed)
  const shortsMovies = useMemo(() => 
    movies.filter(m => 
      m.ageRating !== '18+' && 
      m.category !== 'music' && 
      m.ageRating !== 'Kids'
    ), [movies]);

  // Search filtering
  const filteredMovies = useMemo(() => 
    searchQuery
      ? shortsMovies.filter(m =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : shortsMovies,
    [searchQuery, shortsMovies]
  );

  const currentMovie = filteredMovies[currentIndex];

  // Initialize views from movie data or use random realistic numbers - only once on mount or when movies change
  useEffect(() => {
    if (filteredMovies.length === 0) return;
    
    setLocalViews(prev => {
      const initialViews: {[key: string]: number} = { ...prev };
      filteredMovies.forEach(movie => {
        // Only initialize if not already set
        if (!initialViews[movie.id]) {
          initialViews[movie.id] = movie.views || Math.floor(Math.random() * 500000) + 10000;
        }
      });
      return initialViews;
    });
  }, [filteredMovies.length]); // Only when the count changes

  // Auto-play management
  useEffect(() => {
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      if (isPlaying) {
        currentVideo.play().catch(() => {
          // Auto-play with sound is blocked by the browser. Instead of forcing
          // mute globally (which makes all subsequent shorts silent), we show
          // an enable-sound prompt so the user can interact to allow sound.
          if (!userSetMute) {
            setSoundBlocked(true);
            console.debug('Autoplay blocked; prompting user to enable sound');
          } else {
            // user explicitly set a preference — respect it
            console.debug('Autoplay blocked but user preference present — not forcing change');
          }
        });
      } else {
        currentVideo.pause();
      }
    }

    // Pause other videos
    Object.keys(videoRefs.current).forEach(key => {
      const index = parseInt(key);
      if (index !== currentIndex && videoRefs.current[index]) {
        videoRefs.current[index].pause();
      }
    });
  }, [currentIndex, isPlaying]);

  // Sync mute state with video element
  useEffect(() => {
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      currentVideo.muted = isMuted;
    }
  }, [isMuted, currentIndex]);

  // Increment views when video starts playing
  useEffect(() => {
    if (!currentMovie) return;
    
    // Simulate view increment after 3 seconds
    const timer = setTimeout(() => {
      setLocalViews(prev => {
        // Only increment if the movie doesn't already have a view count
        const currentViews = prev[currentMovie.id] || 0;
        return {
          ...prev,
          [currentMovie.id]: currentViews + 1
        };
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentMovie?.id]); // Only depend on the movie ID, not the whole object

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isTransitioning) return;
    
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (Math.abs(diff) > 50) {
      setIsTransitioning(true);
      if (diff > 0 && currentIndex < filteredMovies.length - 1) {
        // Swipe up - next video
        setCurrentIndex(prev => prev + 1);
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe down - previous video
        setCurrentIndex(prev => prev - 1);
      }
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  // Mouse wheel for desktop
  const handleWheel = (e: React.WheelEvent) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    if (e.deltaY > 0 && currentIndex < filteredMovies.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Load likes and comments when current movie changes
  useEffect(() => {
    if (!currentMovie) return;
    
    // Load likes
    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4d451974/shorts/likes/${currentMovie.id}`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    })
      .then(res => res.json())
      .then(data => {
        setLikeCounts(prev => ({ ...prev, [currentMovie.id]: data.count || 0 }));
        if (currentUser && data.userLiked) {
          setLiked(prev => new Set(prev).add(currentMovie.id));
        }
      })
      .catch(console.error);
  }, [currentMovie?.id, currentUser]);

  // Toggle like with backend
  const handleLike = async () => {
    if (!currentUser) {
      alert('Please sign in to like movies!');
      return;
    }
    if (!currentMovie) return;

    const isLiked = liked.has(currentMovie.id);
    
    // Optimistic update
    setLiked(prev => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.delete(currentMovie.id);
      } else {
        newSet.add(currentMovie.id);
      }
      return newSet;
    });

    setLikeCounts(prev => ({
      ...prev,
      [currentMovie.id]: (prev[currentMovie.id] || 0) + (isLiked ? -1 : 1)
    }));

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4d451974/shorts/like/${currentMovie.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: isLiked ? 'unlike' : 'like' })
      });

      if (!response.ok) {
        throw new Error('Failed to update like');
      }

      const data = await response.json();
      setLikeCounts(prev => ({ ...prev, [currentMovie.id]: data.count }));
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert on error
      setLiked(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(currentMovie.id);
        } else {
          newSet.delete(currentMovie.id);
        }
        return newSet;
      });
      setLikeCounts(prev => ({
        ...prev,
        [currentMovie.id]: (prev[currentMovie.id] || 0) + (isLiked ? 1 : -1)
      }));
    }
  };

  // Load comments
  const loadComments = async () => {
    if (!currentMovie) return;
    
    setLoadingComments(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4d451974/shorts/comments/${currentMovie.id}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  // Post comment
  const postComment = async () => {
    if (!currentUser) {
      alert('Please sign in to comment!');
      return;
    }
    if (!commentText.trim()) return;

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4d451974/shorts/comment/${currentMovie.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: commentText.trim() })
      });

      if (response.ok) {
        setCommentText('');
        loadComments(); // Reload comments
      } else {
        alert('Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    }
  };

  // Delete comment (admin only)
  const deleteComment = async (commentId: string) => {
    if (!currentUser?.email?.includes('admin')) {
      alert('Only admins can delete comments');
      return;
    }

    if (!confirm('Delete this comment?')) return;

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4d451974/shorts/comment/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.accessToken}`
        }
      });

      if (response.ok) {
        loadComments(); // Reload comments
      } else {
        alert('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  // Open comments modal
  const openComments = () => {
    setShowComments(true);
    loadComments();
  };

  const toggleLike = () => {
    if (!currentMovie) return;
    setLiked(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentMovie.id)) {
        newSet.delete(currentMovie.id);
      } else {
        newSet.add(currentMovie.id);
      }
      return newSet;
    });
  };

  const toggleBookmark = () => {
    if (!currentMovie) return;
    setBookmarked(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentMovie.id)) {
        newSet.delete(currentMovie.id);
      } else {
        newSet.add(currentMovie.id);
      }
      return newSet;
    });
  };

  const handleShare = async () => {
    if (!currentMovie) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentMovie.title,
          text: `Check out ${currentMovie.title} on THEE ARCHIVE!`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  if (!currentMovie) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[101]">
        <div className="text-center">
          <Film className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-pulse" />
          <p className="text-white text-lg">No movie shorts available</p>
          <button
            onClick={onBack}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black z-[101] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Video Container - Full Screen */}
      <div className="relative w-full h-full">
        {/* Background Video/Thumbnail */}
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          {/* Background blur */}
          <div className="absolute inset-0 bg-black">
            <img
              src={currentMovie.thumbnailUrl}
              alt={currentMovie.title}
              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30"
            />
          </div>
          
          {/* Main Video Player */}
          <video
            ref={(el) => {
              if (el) videoRefs.current[currentIndex] = el;
            }}
            src={currentMovie.videoUrl}
            poster={currentMovie.thumbnailUrl}
            className="relative w-full h-full object-contain"
            loop
            playsInline
            muted={isMuted}
            onLoadedMetadata={(e) => {
              // Start from 40% through the movie (the good part!)
              const video = e.target as HTMLVideoElement;
              if (video.duration && video.duration > 120) {
                // Start at 40% through the movie
                video.currentTime = video.duration * 0.4;
              } else if (video.duration && video.duration > 60) {
                // For shorter videos, start at 30%
                video.currentTime = video.duration * 0.3;
              }
            }}
            onEnded={() => {
              // Auto advance to next short when video ends
              if (currentIndex < filteredMovies.length - 1) {
                setCurrentIndex(prev => prev + 1);
              }
            }}
          />
          
          {/* Play/Pause overlay on tap */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute inset-0 flex items-center justify-center bg-transparent"
          >
            {!isPlaying && (
              <div className="w-20 h-20 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center">
                <Play className="w-10 h-10 text-white ml-1" />
              </div>
            )}
          </button>

          {/* Autoplay blocked overlay: browsers often prevent autoplay with sound.
              Show a small actionable prompt so the user can explicitly enable sound
              for all future shorts (persisted) without having to unmute each one. */}
          {soundBlocked && (
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
              <div className="pointer-events-auto bg-black/80 px-6 py-4 rounded-xl text-center max-w-sm">
                <p className="text-white font-bold mb-2">Autoplay with sound blocked</p>
                <p className="text-gray-300 text-sm mb-3">Tap enable to allow audio for shorts (your choice will be remembered).</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(false);
                      setUserSetMute(true);
                      setSoundBlocked(false);
                      try { localStorage.setItem('shorts_isMuted', 'false'); localStorage.setItem('shorts_userSetMute', 'true'); } catch (err) {}
                      const v = videoRefs.current[currentIndex];
                      if (v) {
                        v.muted = false;
                        v.play().catch(() => {});
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold"
                    title="Enable sound"
                    aria-label="Enable sound"
                  >
                    Enable sound
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSoundBlocked(false); }}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg"
                    title="Keep muted"
                    aria-label="Keep muted"
                  >
                    Keep muted
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Bar - Gradient Overlay */}
        <div className="absolute top-0 left-0 right-0 z-20 pt-safe bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center justify-between px-3 py-3">
            {/* Logo - THEE ARCHIVE */}
            <div className="flex items-center gap-2">
              <Film className="w-6 h-6 text-purple-500" />
              <div>
                <h1 className="text-white font-black text-sm tracking-wider drop-shadow-2xl">
                  THEE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">ARCHIVE</span>
                </h1>
                <p className="text-[10px] text-gray-400 font-bold">SHORTS</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 hover:bg-white/10 rounded-full transition-all"
                title={showSearch ? 'Close search' : 'Open search'}
                aria-label={showSearch ? 'Close search' : 'Open search'}
              >
                {showSearch ? <X className="w-5 h-5 text-white drop-shadow-2xl" /> : <Search className="w-5 h-5 text-white drop-shadow-2xl" />}
              </button>
              
              <button
                onClick={onBack}
                className="p-2 hover:bg-white/10 rounded-full transition-all"
                title="Go back"
                aria-label="Go back"
              >
                <X className="w-5 h-5 text-white drop-shadow-2xl" />
              </button>
            </div>
          </div>

          {/* Search Bar - Expandable */}
          {showSearch && (
            <div className="px-3 pb-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-4 py-2 rounded-lg bg-black/50 backdrop-blur-xl border border-white/20 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-white/40 transition-all"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                    title="Clear search"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Info - Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/95 via-black/60 to-transparent pb-20 pt-32">
          <div className="px-4 pb-4">
            {/* Movie Title */}
            <h2 className="text-white font-black text-lg mb-1.5 drop-shadow-2xl">
              {currentMovie.title}
            </h2>

            {/* Stats Row - Minimal */}
            <div className="flex items-center gap-2 mb-2 text-white/90 text-xs">
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span className="font-semibold">{formatViews(localViews[currentMovie.id] || 0)}</span>
              </div>
              <span>•</span>
              <span className="font-semibold">{currentMovie.year}</span>
              <span>•</span>
              <span className="font-semibold">{currentMovie.type}</span>
            </div>

            {/* Description */}
            <p className="text-white/80 text-sm line-clamp-2 mb-3">
              {currentMovie.description}
            </p>

            {/* Action Button */}
            <button
              onClick={() => onWatch(currentMovie)}
              className="w-full bg-white text-black font-black py-3 rounded-lg transition-all hover:bg-white/90 flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-black" />
              WATCH NOW
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
          {filteredMovies.slice(Math.max(0, currentIndex - 2), Math.min(filteredMovies.length, currentIndex + 3)).map((_, idx) => {
            const actualIdx = Math.max(0, currentIndex - 2) + idx;
            const isCurrent = actualIdx === currentIndex;
            return (
              <div
                key={actualIdx}
                className={`w-1 rounded-full transition-all ${
                  isCurrent 
                    ? 'h-12 bg-white' 
                    : 'h-6 bg-white/30'
                }`}
              />
            );
          })}
        </div>

        {/* Trending Badge (for high-view movies) */}
        {localViews[currentMovie.id] > 100000 && (
          <div className="absolute left-4 top-20 z-20 px-3 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 backdrop-blur-md flex items-center gap-2 animate-pulse">
            <TrendingUp className="w-4 h-4 text-white" />
            <span className="text-white text-xs font-black">TRENDING</span>
          </div>
        )}

        {/* Right Side Actions - TikTok Style */}
        <div className="absolute right-3 bottom-32 z-20 flex flex-col gap-4">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className="flex flex-col items-center gap-1 group"
            title={liked.has(currentMovie.id) ? 'Unlike' : 'Like'}
            aria-label={liked.has(currentMovie.id) ? 'Unlike' : 'Like'}
          >
            <div className="p-2 hover:bg-white/10 rounded-full transition-all">
              <Heart 
                className={`w-7 h-7 drop-shadow-2xl transition-all ${
                  liked.has(currentMovie.id) 
                    ? 'fill-red-500 text-red-500 scale-110' 
                    : 'text-white'
                }`} 
              />
            </div>
            <span className="text-white text-xs font-bold drop-shadow-2xl">
              {formatViews(likeCounts[currentMovie.id] || 0)}
            </span>
          </button>

          {/* Volume/Mute Button */}
          <button
            onClick={() => { 
              const newMuted = !isMuted;
              setIsMuted(newMuted); 
              setUserSetMute(true); 
              setSoundBlocked(false);
              try { localStorage.setItem('shorts_isMuted', String(newMuted)); localStorage.setItem('shorts_userSetMute', 'true'); } catch (e) {}
            }}
            className="flex flex-col items-center gap-1 group"
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            <div className="p-2 hover:bg-white/10 rounded-full transition-all">
              {isMuted ? (
                <VolumeX className="w-7 h-7 text-white drop-shadow-2xl" />
              ) : (
                <Volume2 className="w-7 h-7 text-cyan-400 drop-shadow-2xl" />
              )}
            </div>
          </button>

          {/* Comment Button */}
          <button
            onClick={openComments}
            className="flex flex-col items-center gap-1 group"
            title="Open comments"
            aria-label="Open comments"
          >
            <div className="p-2 hover:bg-white/10 rounded-full transition-all">
              <MessageCircle className="w-7 h-7 text-white drop-shadow-2xl" />
            </div>
            <span className="text-white text-xs font-bold drop-shadow-2xl">
              {comments.length}
            </span>
          </button>

          {/* Preview Button */}
          <button
            onClick={() => setShowPreview(true)}
            className="flex flex-col items-center gap-1 group"
            title="Preview"
            aria-label="Preview"
          >
            <div className="p-2 hover:bg-white/10 rounded-full transition-all bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/40">
              <Play className="w-7 h-7 text-purple-400 drop-shadow-2xl fill-purple-400" />
            </div>
            <span className="text-purple-300 text-xs font-bold drop-shadow-2xl">Preview</span>
          </button>
        </div>
      </div>

      {/* Comments Modal */}
      {showComments && (
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-black/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl max-h-[70vh] overflow-hidden flex flex-col animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-white font-black">{comments.length} Comments</h3>
            <button
              onClick={() => setShowComments(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-all"
              title="Close comments"
              aria-label="Close comments"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {loadingComments ? (
              <div className="text-center py-8">
                <MessageCircle className="w-8 h-8 text-purple-500 mx-auto mb-2 animate-pulse" />
                <p className="text-gray-400 text-sm">Loading comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400">No comments yet</p>
                <p className="text-gray-500 text-sm">Be the first to comment!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">{comment.userName}</p>
                      <p className="text-gray-400 text-xs">{new Date(comment.timestamp).toLocaleDateString()}</p>
                    </div>
                    {currentUser?.email?.includes('admin') && (
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="p-1.5 hover:bg-red-500/20 rounded-full transition-all group"
                        title="Delete comment"
                        aria-label="Delete comment"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                      </button>
                    )}
                  </div>
                  <p className="text-white/90 text-sm">{comment.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Comment Input */}
          {currentUser ? (
            <div className="px-4 py-3 border-t border-white/10 bg-black/80">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && postComment()}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2.5 rounded-full bg-white/10 border border-white/20 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-all"
                />
                <button
                  onClick={postComment}
                  disabled={!commentText.trim()}
                  className="p-2.5 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Post comment"
                  aria-label="Post comment"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 py-3 border-t border-white/10 bg-black/80 text-center">
              <p className="text-gray-400 text-sm">Sign in to comment</p>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal - 1 Minute Sneak Peek */}
      {showPreview && (
        <div className="absolute inset-0 z-40 bg-black/98 backdrop-blur-xl flex items-center justify-center">
          <div className="relative w-full h-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 z-50 p-2 bg-black/60 hover:bg-black/80 rounded-full transition-all"
              title="Close preview"
              aria-label="Close preview"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Preview Header */}
            <div className="absolute top-4 left-4 z-50 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full">
              <p className="text-white text-sm font-bold">
                🎬 1-Minute Preview
              </p>
            </div>

            {/* Video Player Placeholder */}
            <div className="flex-1 flex items-center justify-center bg-black rounded-lg overflow-hidden">
              <video
                src={currentMovie.videoUrl}
                poster={currentMovie.thumbnailUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
                onLoadedMetadata={(e) => {
                  // Start from middle of the video
                  const video = e.target as HTMLVideoElement;
                  if (video.duration && video.duration > 120) {
                    // Start at 40% through the movie (usually the good part)
                    video.currentTime = video.duration * 0.4;
                  } else if (video.duration && video.duration > 60) {
                    // For shorter videos, start at 30%
                    video.currentTime = video.duration * 0.3;
                  }
                }}
                onTimeUpdate={(e) => {
                  // Stop at 60 seconds from start point
                  const video = e.target as HTMLVideoElement;
                  const startTime = video.duration ? video.duration * 0.4 : 0;
                  if (video.currentTime >= startTime + 60) {
                    video.pause();
                  }
                }}
              />
            </div>

            {/* Preview Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-t from-black/90 to-transparent p-4 rounded-lg">
              <h3 className="text-white font-black text-xl mb-2">{currentMovie.title}</h3>
              <p className="text-gray-300 text-sm mb-3 line-clamp-2">{currentMovie.description}</p>
              <button
                onClick={() => {
                  setShowPreview(false);
                  onWatch(currentMovie);
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-black py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-white" />
                WATCH FULL MOVIE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safe area spacer for bottom */}
      <style>{`
        @supports (padding-top: env(safe-area-inset-top)) {
          .pt-safe {
            padding-top: env(safe-area-inset-top);
          }
        }
        
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}