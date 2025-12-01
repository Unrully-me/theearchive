import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, Play, Trash2, Clock, User, Heart, MessageCircle, Share2, ArrowLeft, Send, Eye, Bookmark, MoreVertical, Sparkles } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface WContent {
  id: string;
  userId: string;
  userEmail: string;
  caption: string;
  contentType: 'video' | 'image';
  fileUrl: string;
  fileName: string;
  uploadedAt: string;
  expiresAt: string;
}

interface WFeedProps {
  currentUser: any;
  accessToken: string;
  onBack?: () => void;
}

export function WFeed({ currentUser, accessToken, onBack }: WFeedProps) {
  const [content, setContent] = useState<WContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch GM (Great Moments) feed content
  const fetchContent = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4d451974/w-feed`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setContent(data.content);
      }
    } catch (error) {
      console.error('Error fetching GM feed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchContent, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-cleanup expired content on mount
  useEffect(() => {
    const cleanup = async () => {
      try {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-4d451974/w-feed/cleanup`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );
      } catch (error) {
        console.error('Auto-cleanup error:', error);
      }
    };
    cleanup();
  }, []);

  // Handle scroll to snap to content
  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const scrollPosition = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollPosition / itemHeight);
    
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [currentIndex]);

  // Handle file upload
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    
    setUploading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4d451974/w-feed/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      if (data.success) {
        setShowUpload(false);
        fetchContent(); // Refresh feed
        formElement.reset();
      } else {
        alert(`Upload failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Upload failed!');
    } finally {
      setUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async (contentId: string) => {
    if (!confirm('Delete this content?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4d451974/w-feed/${contentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchContent(); // Refresh feed
      } else {
        alert(`Delete failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Delete failed!');
    }
  };

  // Calculate time remaining
  const getTimeRemaining = (expiresAt: string) => {
    const now = Date.now();
    const expiry = new Date(expiresAt).getTime();
    const hoursLeft = Math.max(0, (expiry - now) / (1000 * 60 * 60));
    return Math.floor(hoursLeft);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white font-bold">Loading Great Moments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black relative">
      {/* Back Button - Desktop Only */}
      {onBack && (
        <button
          onClick={onBack}
          className="hidden md:flex fixed top-20 left-6 z-[60] items-center gap-2 px-4 py-2 rounded-xl bg-black/80 backdrop-blur-xl border border-white/20 hover:bg-white/10 transition-all group"
        >
          <ArrowLeft className="w-5 h-5 text-white group-hover:text-orange-400 transition-colors" />
          <span className="text-white font-bold group-hover:text-orange-400 transition-colors">Back to Home</span>
        </button>
      )}

      {/* TikTok-style vertical scroll container */}
      <div 
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        {content.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 snap-start">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 blur-2xl opacity-50 animate-pulse" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
            </div>
            <h3 className="text-white font-black text-2xl mb-2">No Great Moments Yet!</h3>
            <p className="text-gray-400 text-center mb-6 max-w-xs">
              Be the first to share your moment. Upload photos & GIFs!
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 via-orange-500 to-pink-500 text-white font-black rounded-full hover:scale-105 transition-all shadow-2xl shadow-orange-500/50"
            >
              Upload Now
            </button>
          </div>
        ) : (
          content.map((item, index) => (
            <WContentCard
              key={item.id}
              content={item}
              isActive={index === currentIndex}
              currentUser={currentUser}
              onDelete={handleDelete}
              timeRemaining={getTimeRemaining(item.expiresAt)}
            />
          ))
        )}
      </div>

      {/* Floating Upload Button - Always visible so users can post! */}
      <button
        onClick={() => setShowUpload(true)}
        className="fixed bottom-28 md:bottom-24 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 shadow-2xl shadow-orange-500/60 flex items-center justify-center hover:scale-110 transition-all group"
      >
        <Upload className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
      </button>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[200] flex items-center justify-center p-6">
          <div className="bg-gradient-to-br from-purple-900/95 via-black to-black border border-orange-500/30 rounded-3xl p-8 max-w-md w-full relative shadow-2xl shadow-purple-500/20">
            <button
              onClick={() => setShowUpload(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/50">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent mb-2">Upload Great Moment</h2>
              <p className="text-gray-400 text-sm">Share for 72 hours ⏰</p>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-white font-bold mb-2">File</label>
                <input
                  type="file"
                  name="file"
                  accept="image/*"
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gradient-to-r file:from-orange-500 file:to-pink-500 file:text-white file:font-bold hover:file:shadow-lg transition-all backdrop-blur-xl"
                />
                <p className="text-xs text-gray-400 mt-2">📸 Images & GIFs only (Max 50MB)</p>
              </div>

              <div>
                <label className="block text-white font-bold mb-2">Caption (Optional)</label>
                <textarea
                  name="caption"
                  rows={3}
                  placeholder="What's happening?"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 backdrop-blur-xl transition-all"
                />
              </div>

              {/* Hidden field for content type - always image */}
              <input type="hidden" name="contentType" value="image" />

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 via-orange-500 to-pink-500 text-white font-black rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl hover:shadow-orange-500/50"
              >
                {uploading ? 'Uploading...' : 'Share Great Moment 🚀'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Individual Content Card Component with Enhanced Social Features
function WContentCard({ content, isActive, currentUser, onDelete, timeRemaining }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Array<{id: string; user: string; text: string; time: string}>>([]);
  const [commentText, setCommentText] = useState('');

  // Generate CONSISTENT fake engagement based on content ID (won't change on re-render!)
  const generateConsistentNumber = (str: string, min: number, max: number) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return min + (Math.abs(hash) % (max - min + 1));
  };

  // These will ALWAYS be the same for each content ID
  const likeCount = generateConsistentNumber(content.id, 10, 150);
  const viewCount = generateConsistentNumber(content.id + 'views', 50, 1000);
  const [currentLikeCount, setCurrentLikeCount] = useState(likeCount);

  // Auto-play video when active
  useEffect(() => {
    if (isActive && videoRef.current && content.contentType === 'video') {
      videoRef.current.play();
      setIsPlaying(true);
    } else if (!isActive && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive, content.contentType]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    setCurrentLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    
    const newComment = {
      id: Date.now().toString(),
      user: currentUser?.email?.split('@')[0] || 'Anonymous',
      text: commentText,
      time: 'Just now'
    };
    
    setComments([newComment, ...comments]);
    setCommentText('');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this Great Moment!',
          text: content.caption || 'Amazing content on THEE ARCHIVE!',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard! 📋');
    }
  };

  const isOwner = currentUser && currentUser.id === content.userId;

  return (
    <div className="relative h-screen w-full snap-start flex items-center justify-center bg-black">
      {/* Content (Video or Image) */}
      {content.contentType === 'video' ? (
        <video
          ref={videoRef}
          src={content.fileUrl}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          playsInline
          muted
          onClick={togglePlay}
          onError={(e) => {
            console.error('❌ Video playback error:', e);
            console.error('Video URL:', content.fileUrl);
          }}
          onLoadStart={() => console.log('📹 Video loading started...')}
          onCanPlay={() => console.log('✅ Video can play!')}
          crossOrigin="anonymous"
        />
      ) : (
        <img
          src={content.fileUrl}
          alt={content.caption}
          className="absolute inset-0 w-full h-full object-cover"
          onClick={togglePlay}
          onError={(e) => {
            console.error('❌ Image load error:', e);
            console.error('Image URL:', content.fileUrl);
          }}
        />
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

      {/* Top Info - User Profile */}
      <div className="absolute top-4 md:top-6 left-4 md:left-6 right-4 md:right-6 flex items-start justify-between z-20">
        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 via-purple-600 to-cyan-500 flex items-center justify-center shadow-lg">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-black text-sm">{content.userEmail.split('@')[0]}</p>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <Clock className="w-3 h-3" />
              <span className="font-bold">{timeRemaining}h left</span>
            </div>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={() => onDelete(content.id)}
            className="w-10 h-10 rounded-full bg-red-500/90 backdrop-blur-xl flex items-center justify-center hover:bg-red-500 transition-all border border-white/20 shadow-lg"
          >
            <Trash2 className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* Right Side Actions - TikTok Style (Mobile) */}
      <div className="absolute right-4 bottom-32 flex flex-col gap-4 z-20 md:hidden">
        {/* Like Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleLike}
            className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:scale-110 transition-all shadow-xl group"
          >
            <Heart className={`w-7 h-7 transition-all ${liked ? 'fill-red-500 text-red-500 scale-110' : 'text-white'}`} />
          </button>
          <span className="text-white font-black text-xs mt-1 drop-shadow-lg">{currentLikeCount}</span>
        </div>

        {/* Comment Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => setShowComments(!showComments)}
            className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:scale-110 transition-all shadow-xl"
          >
            <MessageCircle className="w-7 h-7 text-white" />
          </button>
          <span className="text-white font-black text-xs mt-1 drop-shadow-lg">{comments.length}</span>
        </div>

        {/* Save Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => setSaved(!saved)}
            className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:scale-110 transition-all shadow-xl"
          >
            <Bookmark className={`w-7 h-7 transition-all ${saved ? 'fill-yellow-400 text-yellow-400' : 'text-white'}`} />
          </button>
        </div>

        {/* Share Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleShare}
            className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:scale-110 transition-all shadow-xl"
          >
            <Share2 className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>

      {/* Bottom Caption & Actions (Desktop) */}
      <div className="absolute bottom-4 md:bottom-8 left-4 md:left-6 right-20 md:right-6 z-20">
        {/* Caption */}
        {content.caption && (
          <div className="mb-4 bg-black/40 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/10 max-w-2xl">
            <p className="text-white font-medium text-sm md:text-base line-clamp-3">
              {content.caption}
            </p>
          </div>
        )}

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 hover:scale-105 transition-all group"
          >
            <Heart className={`w-5 h-5 transition-all ${liked ? 'fill-red-500 text-red-500' : 'text-white group-hover:text-red-400'}`} />
            <span className="text-white font-bold text-sm">{currentLikeCount}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 hover:scale-105 transition-all"
          >
            <MessageCircle className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-sm">{comments.length}</span>
          </button>

          <button
            onClick={() => setSaved(!saved)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 hover:scale-105 transition-all"
          >
            <Bookmark className={`w-5 h-5 transition-all ${saved ? 'fill-yellow-400 text-yellow-400' : 'text-white'}`} />
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 hover:scale-105 transition-all"
          >
            <Share2 className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10">
            <Eye className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 font-bold text-sm">{viewCount} views</span>
          </div>
        </div>
      </div>

      {/* Play/Pause indicator (for videos) */}
      {content.contentType === 'video' && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-2xl">
            <Play className="w-10 h-10 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Comments Panel */}
      {showComments && (
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black via-black/95 to-transparent backdrop-blur-2xl border-t border-white/10 rounded-t-3xl max-h-[60vh] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white font-black text-lg">Comments ({comments.length})</h3>
            <button
              onClick={() => setShowComments(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No comments yet. Be the first!</p>
              </div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm">{comment.user}</p>
                    <p className="text-gray-300 text-sm mt-1">{comment.text}</p>
                    <p className="text-gray-500 text-xs mt-1">{comment.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment Input */}
          <div className="p-4 border-t border-white/10 bg-black/50 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm"
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}