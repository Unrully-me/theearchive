import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Share2, Send, Image as ImageIcon, Film, Type, Sparkles, MoreVertical, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface GMPost {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  postType: 'text' | 'image' | 'video';
  title: string;
  content: string;
  mediaUrl?: string;
  gmCount: number; // Like count (GM reactions)
  commentCount: number;
  createdAt: string;
  hasUserGMed?: boolean; // Did current user GM this post?
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

interface GMSocialFeedProps {
  currentUser: any;
  accessToken: string;
  onBack?: () => void;
}

export function GMSocialFeed({ currentUser, accessToken, onBack }: GMSocialFeedProps) {
  const [posts, setPosts] = useState<GMPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<GMPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  // Create post form
  const [postType, setPostType] = useState<'text' | 'image' | 'video'>('text');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Fetch all posts
  const fetchPosts = async () => {
    try {
      console.log('📡 Fetching GM posts...');
      console.log('🔑 Using token:', accessToken ? 'User token' : publicAnonKey ? 'Public key' : 'NONE');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4d451974/gm-posts`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
          },
        }
      );
      
      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Fetched posts data:', data);
      console.log('📊 Posts count:', data.posts?.length || 0);
      
      if (data.success) {
        const validPosts = (data.posts || []).filter((p: any) => p && p.id);
        console.log(`✅ Loaded ${data.posts?.length || 0} posts, ${validPosts.length} valid`);
        
        // Update debug info
        setDebugInfo(`Fetched: ${data.posts?.length || 0} posts, Valid: ${validPosts.length}, Status: ${response.status}`);
        
        setPosts(validPosts);
      } else {
        console.error('❌ Failed to fetch posts:', data.error);
        setDebugInfo(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Error fetching GM posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Clear all posts
  const clearAllPosts = async () => {
    try {
      console.log('🗑️ Clearing all posts...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4d451974/admin/clear-gm-posts`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      console.log('Clear response:', data);
      return data.success;
    } catch (error) {
      console.error('Error clearing posts:', error);
      return false;
    }
  };

  // Auto-seed posts on first load (only if no posts exist)
  const autoSeedPosts = async () => {
    try {
      console.log('🌱 Auto-seeding GM posts (if needed)...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4d451974/admin/seed-gm-posts`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ force: false }), // Don't force on auto-seed
        }
      );
      
      console.log('Auto-seed response status:', response.status);
      const data = await response.json();
      console.log('Auto-seed response:', data);
      
      if (data.success) {
        if (data.forced) {
          console.log('✅ Auto-seeded posts successfully (forced)');
        } else {
          console.log('✅ Posts already exist or seeded successfully');
        }
      } else {
        console.error('❌ Auto-seed failed:', data.error);
      }
    } catch (error) {
      console.error('❌ Error auto-seeding posts:', error);
    }
  };
  
  // Fix corrupted data
  const fixAndReload = async () => {
    setLoading(true);
    try {
      console.log('🔧 Fixing data...');
      await clearAllPosts();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await autoSeedPosts();
      await new Promise(resolve => setTimeout(resolve, 1500));
      await fetchPosts();
    } catch (error) {
      console.error('Error fixing data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debug: Check raw KV data
  const debugKVData = async () => {
    try {
      console.log('🔍 Checking raw KV data...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4d451974/admin/debug-gm-posts`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      console.log('📊 Raw KV data:', data);
      alert(`KV Data: ${data.totalItems} items found. Check console for details.`);
    } catch (error) {
      console.error('Error checking KV data:', error);
      alert(`Error: ${error}`);
    }
  };

  // Force reseed - always clear and reseed
  const forceReseed = async () => {
    setLoading(true);
    try {
      console.log('🔄 Force reseeding...');
      console.log('Step 1: Sending seed request with force=true');
      
      // Use force mode to clear and reseed in one call
      const seedResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4d451974/admin/seed-gm-posts`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ force: true }),
        }
      );
      
      console.log('Step 2: Seed response status:', seedResponse.status);
      const seedData = await seedResponse.json();
      console.log('Step 3: Seed result:', seedData);
      
      if (!seedData.success) {
        console.error('❌ Seed failed:', seedData.error);
        alert(`Seed failed: ${seedData.error}`);
        return;
      }
      
      console.log(`✅ Seeded ${seedData.count} posts`);
      
      // Wait for KV to update
      console.log('Step 4: Waiting 2s for KV to stabilize...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Fetch posts
      console.log('Step 5: Fetching posts...');
      await fetchPosts();
      console.log('Step 6: Force reseed complete!');
    } catch (error) {
      console.error('❌ Error force reseeding:', error);
      alert(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments for a post
  const fetchComments = async (postId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4d451974/gm-posts/${postId}/comments`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Create a new post
  const handleCreatePost = async () => {
    if (!postTitle.trim()) {
      alert('Please add a title');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('postType', postType);
      formData.append('title', postTitle);
      formData.append('content', postContent);
      if (mediaFile) {
        formData.append('media', mediaFile);
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4d451974/gm-posts/create`,
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
        setShowCreatePost(false);
        setPostTitle('');
        setPostContent('');
        setMediaFile(null);
        fetchPosts();
      } else {
        alert(data.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setUploading(false);
    }
  };

  // Toggle GM (like) on a post
  const handleGM = async (postId: string) => {
    if (!currentUser) {
      alert('Please login to give GM reactions! 🎬');
      return;
    }
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4d451974/gm-posts/${postId}/gm`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        // Update post in local state
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, gmCount: data.gmCount, hasUserGMed: data.hasUserGMed }
            : p
        ));
      } else {
        alert(data.error || 'Failed to GM post');
      }
    } catch (error) {
      console.error('Error toggling GM:', error);
      alert('Failed to GM post');
    }
  };

  // Add a comment
  const handleAddComment = async () => {
    if (!currentUser) {
      alert('Please login to comment! 🎬');
      return;
    }
    
    if (!selectedPost || !commentText.trim()) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4d451974/gm-posts/${selectedPost.id}/comment`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: commentText }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setCommentText('');
        fetchComments(selectedPost.id);
        // Update comment count
        setPosts(posts.map(p => 
          p.id === selectedPost.id 
            ? { ...p, commentCount: p.commentCount + 1 }
            : p
        ));
      } else {
        alert(data.error || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    }
  };

  useEffect(() => {
    // Force seed first, then fetch
    const initPosts = async () => {
      try {
        console.log('🚀 Initializing GM posts...');
        await autoSeedPosts();
        // Wait a bit for KV store to update
        await new Promise(resolve => setTimeout(resolve, 1500));
        await fetchPosts();
        console.log('✅ GM posts initialized');
      } catch (error) {
        console.error('❌ Error initializing GM posts:', error);
        setLoading(false);
      }
    };
    initPosts();
    const interval = setInterval(fetchPosts, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // View post details
  const handleViewPost = (post: GMPost) => {
    setSelectedPost(post);
    fetchComments(post.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-white">Loading Great Moments...</div>
      </div>
    );
  }

  // Post details view (like Reddit post page)
  if (selectedPost) {
    return (
      <div className="min-h-screen bg-[#141414]">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-white/10 px-4 py-3 flex items-center gap-3 z-50">
          <button onClick={() => setSelectedPost(null)} className="text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg text-white">Post</h1>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Post */}
          <div className="bg-[#1a1a1a] border-b border-white/10 p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-orange-500 to-cyan-600 flex items-center justify-center">
                <span className="text-white text-sm font-black">{selectedPost.userName.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="text-white font-bold">{selectedPost.userName}</p>
                <p className="text-xs text-gray-400">{new Date(selectedPost.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <h2 className="text-xl text-white mb-2">{selectedPost.title}</h2>
            {selectedPost.content && (
              <p className="text-gray-300 mb-3">{selectedPost.content}</p>
            )}
            
            {selectedPost.mediaUrl && (
              <div className="mb-3 rounded overflow-hidden">
                {selectedPost.postType === 'image' ? (
                  <img src={selectedPost.mediaUrl} alt={selectedPost.title} className="w-full" />
                ) : (
                  <video src={selectedPost.mediaUrl} controls className="w-full" />
                )}
              </div>
            )}

            {/* GM and Comment counts */}
            <div className="flex items-center gap-4 pt-3 border-t border-white/10">
              <button
                onClick={() => handleGM(selectedPost.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                  selectedPost.hasUserGMed 
                    ? 'bg-gradient-to-r from-purple-600 via-orange-500 to-cyan-600 text-white' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-bold">GM {selectedPost.gmCount}</span>
              </button>
              <div className="flex items-center gap-2 text-gray-400">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">{selectedPost.commentCount} comments</span>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="bg-[#141414] p-4">
            <h3 className="text-white font-bold mb-4">Comments ({comments.length})</h3>
            
            {/* Add comment */}
            <div className="mb-6 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-[#1a1a1a] border border-white/10 rounded px-3 py-2 text-white placeholder-gray-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 via-orange-500 to-cyan-600 text-white rounded disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Comments list */}
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs">{comment.userName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 bg-[#1a1a1a] rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white text-sm font-bold">{comment.userName}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create post modal
  if (showCreatePost) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-white/10 px-4 py-3 flex items-center justify-between z-50">
          <button onClick={() => setShowCreatePost(false)} className="text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg text-white">Create Post</h1>
          <button
            onClick={handleCreatePost}
            disabled={uploading || !postTitle.trim()}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 via-orange-500 to-cyan-600 text-white rounded disabled:opacity-50 text-sm"
          >
            {uploading ? 'Posting...' : 'Post'}
          </button>
        </div>

        <div className="max-w-2xl mx-auto p-4">
          {/* Post type selector */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setPostType('text')}
              className={`flex-1 py-2 rounded flex items-center justify-center gap-2 ${
                postType === 'text' ? 'bg-[#7c3aed] text-white' : 'bg-[#1a1a1a] text-gray-400'
              }`}
            >
              <Type className="w-4 h-4" />
              <span>Text</span>
            </button>
            <button
              onClick={() => setPostType('image')}
              className={`flex-1 py-2 rounded flex items-center justify-center gap-2 ${
                postType === 'image' ? 'bg-[#7c3aed] text-white' : 'bg-[#1a1a1a] text-gray-400'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Image</span>
            </button>
            <button
              onClick={() => setPostType('video')}
              className={`flex-1 py-2 rounded flex items-center justify-center gap-2 ${
                postType === 'video' ? 'bg-[#7c3aed] text-white' : 'bg-[#1a1a1a] text-gray-400'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Video</span>
            </button>
          </div>

          {/* Title */}
          <input
            type="text"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            placeholder="Post title..."
            className="w-full bg-[#1a1a1a] border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 mb-3"
          />

          {/* Content */}
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="What's on your mind? (optional)"
            className="w-full bg-[#1a1a1a] border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 mb-3 h-32 resize-none"
          />

          {/* Media upload */}
          {(postType === 'image' || postType === 'video') && (
            <div className="mb-3">
              <input
                type="file"
                accept={postType === 'image' ? 'image/*' : 'video/*'}
                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded px-4 py-3 text-white"
              />
              {mediaFile && (
                <p className="text-sm text-gray-400 mt-2">Selected: {mediaFile.name}</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main feed (Reddit-style list)
  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Header */}
      <div className="sticky top-0 bg-[#1a1a1a] border-b border-white/10 px-4 py-3 flex items-center justify-between z-50">
        {onBack && (
          <button onClick={onBack} className="text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-xl font-black bg-gradient-to-r from-purple-400 via-orange-400 to-cyan-400 bg-clip-text text-transparent">
            Great Moments
          </h1>
          <p className="text-xs text-gray-500">
            {currentUser ? `Logged in as ${currentUser.name}` : 'Not logged in'} • {posts.length} posts
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              setRefreshing(true);
              await fetchPosts();
              setRefreshing(false);
            }}
            disabled={refreshing}
            className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              if (!currentUser) {
                alert('Please login to create posts! 🎬');
                return;
              }
              setShowCreatePost(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 via-orange-500 to-cyan-600 text-white rounded text-sm font-bold"
          >
            Create
          </button>
        </div>
      </div>

      {/* Posts feed */}
      <div className="max-w-3xl mx-auto">
        {posts.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="mb-4">No posts yet. Be the first to share a Great Moment!</p>
            <div className="space-y-3">
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={forceReseed}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 via-orange-500 to-cyan-600 text-white rounded-lg font-bold hover:scale-105 transition-transform disabled:opacity-50"
                >
                  🔄 Force Reseed Posts
                </button>
                <button
                  onClick={debugKVData}
                  disabled={loading}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg font-bold hover:scale-105 transition-transform disabled:opacity-50"
                >
                  🔍 Debug KV Store
                </button>
              </div>
              <button
                onClick={async () => {
                  setLoading(true);
                  await fetchPosts();
                  setLoading(false);
                }}
                disabled={loading}
                className="text-sm text-gray-500 hover:text-gray-300 underline disabled:opacity-50"
              >
                Or just refresh
              </button>
              {debugInfo && (
                <div className="mt-4 p-3 bg-[#1a1a1a] border border-orange-500/30 rounded text-xs text-gray-400 font-mono">
                  <div className="text-orange-400 font-bold mb-1">Debug Info:</div>
                  {debugInfo}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {posts.map(post => (
              <div
                key={post.id}
                className="bg-[#1a1a1a] p-4 hover:bg-[#1f1f1f] transition-colors cursor-pointer"
                onClick={() => handleViewPost(post)}
              >
                {/* User info */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-orange-500 to-cyan-600 flex items-center justify-center">
                    <span className="text-white text-sm font-black">{post.userName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold">{post.userName}</p>
                    <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Post content */}
                <h3 className="text-lg text-white mb-2">{post.title}</h3>
                {post.content && (
                  <p className="text-gray-300 mb-3 line-clamp-3">{post.content}</p>
                )}

                {/* Media preview */}
                {post.mediaUrl && (
                  <div className="mb-3 rounded overflow-hidden max-h-96">
                    {post.postType === 'image' ? (
                      <img src={post.mediaUrl} alt={post.title} className="w-full object-cover" />
                    ) : (
                      <div className="relative bg-black aspect-video flex items-center justify-center">
                        <Film className="w-12 h-12 text-white/50" />
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGM(post.id);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${
                      post.hasUserGMed 
                        ? 'bg-gradient-to-r from-purple-600 via-orange-500 to-cyan-600 text-white' 
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-bold">GM {post.gmCount}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{post.commentCount}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
