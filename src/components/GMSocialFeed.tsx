import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Share2, Send, Image as ImageIcon, Film, Type, Sparkles, MoreVertical, RefreshCw, ExternalLink } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Helper to extract Twitter/X tweet ID from URL
const extractTweetId = (url: string): string | null => {
  const patterns = [
    /twitter\.com\/.*\/status\/(\d+)/,
    /x\.com\/.*\/status\/(\d+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Helper to extract Instagram post ID from URL
const extractInstagramId = (url: string): string | null => {
  const patterns = [
    /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
    /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

interface GMPost {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  postType: 'text' | 'image' | 'video' | 'social_link';
  title: string;
  content: string;
  mediaUrl?: string;
  socialLink?: string; // X or Instagram post URL
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
  
  // Create post form
  const [postType, setPostType] = useState<'text' | 'image' | 'video' | 'social_link'>('text');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Debug: Log auth state on mount
  React.useEffect(() => {
    console.log('🔐 GM Feed Auth State:', {
      hasCurrentUser: !!currentUser,
      userEmail: currentUser?.email,
      hasAccessToken: !!accessToken,
      accessTokenLength: accessToken?.length,
      accessTokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : 'none',
      publicAnonKeyAvailable: !!publicAnonKey,
      publicAnonKeyLength: publicAnonKey?.length,
      publicAnonKeyPreview: publicAnonKey ? publicAnonKey.substring(0, 20) + '...' : 'none',
      projectId
    });
  }, [currentUser, accessToken]);

  // Fetch all posts
  const fetchPosts = async () => {
    try {
      console.log('📡 Fetching GM posts...');
      
      // ALWAYS use publicAnonKey for GET requests - it should be valid
      // User token is only needed for POST/PUT/DELETE operations
      const authToken = publicAnonKey;
      
      if (!authToken) {
        console.error('❌ No public anon key available!');
        alert('⚠️ Configuration Error: Missing Supabase credentials. Please check your setup.');
        throw new Error('Configuration error: Missing public anon key');
      }
      
      console.log('🔑 Using public anon key for GET request');
      console.log('🌐 URL:', `https://${projectId}.supabase.co/functions/v1/make-server-4d451974/gm-posts`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4d451974/gm-posts`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      ).catch(err => {
        console.error('❌ Network error:', err);
        throw new Error('Cannot connect to server. The Supabase Edge Function may not be deployed.');
      });
      
      console.log('📥 Response received:', {
        status: response.status,
        statusText: response.statusText,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error:', errorText);
        
        // Log full details for debugging
        console.error('Debug info:', {
          projectId,
          anonKeyLength: authToken.length,
          anonKeyStart: authToken.substring(0, 30),
          responseStatus: response.status,
          responseStatusText: response.statusText,
        });
        
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('📦 Fetched posts data:', data);
      console.log('📊 Posts count:', data.posts?.length || 0);
      
      if (data.success) {
        const validPosts = (data.posts || []).filter((p: any) => p && p.id);
        console.log(`✅ Loaded ${data.posts?.length || 0} posts, ${validPosts.length} valid`);
        
        if (validPosts.length > 0) {
          console.log('📄 Sample post:', validPosts[0]);
          console.log('📄 All post IDs:', validPosts.map(p => p.id));
        } else {
          console.warn('⚠️ No valid posts found after filtering');
        }
        
        console.log('🔄 Updating posts state with', validPosts.length, 'posts');
        setPosts(validPosts);
        console.log('✅ Posts state updated');
      } else {
        console.error('❌ Failed to fetch posts:', data.error);
      }
    } catch (error) {
      console.error('❌ Error fetching GM posts:', error);
      console.error('Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
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
      
      // SKIP AUTO-SEEDING FOR NOW - let users create their own posts
      console.log('⏭️ Skipping auto-seed - users will create their own posts');
      return;
      
      const seedUrl = `https://${projectId}.supabase.co/functions/v1/make-server-4d451974/admin/seed-gm-posts`;
      console.log('🌐 Seed URL:', seedUrl);
      
      const response = await fetch(seedUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ force: false }), // Don't force on auto-seed
      });
      
      console.log('Auto-seed response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Seed server error:', errorText);
        return;
      }
      
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
      console.error('Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
      });
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
    // Check authentication first
    if (!currentUser) {
      alert('Please login to create posts! 🎬\n\nClick on your profile icon to sign in.');
      return;
    }

    if (!accessToken || accessToken === 'undefined' || accessToken === 'null' || accessToken.length < 20) {
      alert('Authentication error - please log out and log in again to refresh your session.');
      console.error('❌ Invalid access token:', { 
        hasToken: !!accessToken, 
        tokenValue: accessToken,
        tokenLength: accessToken?.length 
      });
      return;
    }

    if (!postTitle.trim()) {
      alert('Please add a title');
      return;
    }

    // Validate social link if type is social_link
    if (postType === 'social_link' && !socialLink.trim()) {
      alert('Please paste your X or Instagram post link');
      return;
    }

    setUploading(true);
    try {
      console.log('🚀 Creating GM post...');
      console.log('📝 Post type:', postType);
      console.log('🔑 Access token:', accessToken ? 'Present' : 'MISSING');
      console.log('👤 User:', currentUser?.name, currentUser?.email);

      const formData = new FormData();
      formData.append('postType', postType);
      formData.append('title', postTitle);
      formData.append('content', postContent);
      if (postType === 'social_link') {
        formData.append('socialLink', socialLink);
      }
      if (mediaFile && postType !== 'social_link') {
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

      console.log('📥 Create response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          alert(`Failed to create post: ${errorData.error || response.statusText}`);
        } catch {
          alert(`Failed to create post: ${response.statusText}`);
        }
        return;
      }

      const data = await response.json();
      console.log('📦 Create response:', data);

      if (data.success) {
        console.log('✅ Post created successfully!');
        console.log('📝 Created post data:', data.post);
        setShowCreatePost(false);
        setPostTitle('');
        setPostContent('');
        setSocialLink('');
        setMediaFile(null);
        
        // Wait a bit for KV store to propagate
        console.log('⏳ Waiting for KV store to update...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('🔄 Refreshing posts...');
        await fetchPosts();
        alert('🎉 Post created successfully!');
      } else {
        console.error('❌ Create failed:', data.error);
        alert(data.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('❌ Error creating post:', error);
      console.error('Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
      });
      alert(`Failed to create post: ${(error as Error).message}`);
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

  // Debug: Log when posts state changes
  useEffect(() => {
    console.log('🔔 Posts state changed:', posts.length, 'posts');
  }, [posts]);

  useEffect(() => {
    // Check server health first, then seed and fetch
    const initPosts = async () => {
      try {
        console.log('🚀 Initializing GM posts...');
        
        // Health check (no auth required)
        console.log('🏥 Checking server health...');
        try {
          const healthUrl = `https://${projectId}.supabase.co/functions/v1/make-server-4d451974/health`;
          console.log('🌐 Health URL:', healthUrl);
          const healthResponse = await fetch(healthUrl, {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`, // Use public key for health check
            },
          });
          console.log('🏥 Health status:', healthResponse.status);
          if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('✅ Server is healthy:', healthData);
          } else {
            const errorText = await healthResponse.text();
            console.warn('⚠️ Server health check failed:', healthResponse.status, errorText);
          }
        } catch (healthError) {
          console.error('❌ Health check failed:', healthError);
          console.error('This means the server is not accessible. Check Supabase Edge Functions deployment.');
          
          // Show user-friendly error
          alert(`🚨 SERVER NOT DEPLOYED!\n\n` +
                `The Supabase Edge Function server is not running.\n\n` +
                `To fix this:\n` +
                `1. Open your terminal\n` +
                `2. Run: supabase functions deploy server\n` +
                `3. Or deploy all: supabase functions deploy\n\n` +
                `The GM feed will work once the server is deployed.`);
          
          setLoading(false);
          return;
        }
        
        await autoSeedPosts();
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
      <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <Sparkles className="w-8 h-8 text-orange-400 animate-pulse" />
          </div>
          
          <p className="text-white text-center text-xl font-bold">Loading Great Moments...</p>
          
          <div className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border border-purple-500/30 rounded-xl p-4 text-sm text-gray-300">
            <p className="font-bold text-purple-400 mb-2">🔍 Connecting to server...</p>
            <p className="text-xs">
              If this takes too long, your Supabase Edge Function may need to be deployed.
              Check the console for details.
            </p>
          </div>
        </div>
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
            
            {/* Social Link Embed in Detail View */}
            {selectedPost.postType === 'social_link' && selectedPost.socialLink && (
              <div className="mb-3 border border-purple-500/30 rounded-lg p-4 bg-gradient-to-br from-purple-900/20 to-cyan-900/20">
                <div className="flex items-start gap-3">
                  <Share2 className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-2">Shared from {selectedPost.socialLink.includes('instagram') ? 'Instagram' : 'X (Twitter)'}</p>
                    <a
                      href={selectedPost.socialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors break-all"
                    >
                      <span>{selectedPost.socialLink}</span>
                      <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    </a>
                    <button
                      onClick={() => window.open(selectedPost.socialLink, '_blank')}
                      className="mt-3 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:scale-105 transition-transform text-sm font-bold w-full"
                    >
                      View Post on {selectedPost.socialLink.includes('instagram') ? 'Instagram' : 'X'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {selectedPost.mediaUrl && selectedPost.postType !== 'social_link' && (
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
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setPostType('text')}
              className={`py-2 rounded flex items-center justify-center gap-2 ${
                postType === 'text' ? 'bg-[#7c3aed] text-white' : 'bg-[#1a1a1a] text-gray-400'
              }`}
            >
              <Type className="w-4 h-4" />
              <span className="text-sm">Text</span>
            </button>
            <button
              onClick={() => setPostType('social_link')}
              className={`py-2 rounded flex items-center justify-center gap-2 ${
                postType === 'social_link' ? 'bg-gradient-to-r from-purple-600 via-orange-500 to-cyan-600 text-white' : 'bg-[#1a1a1a] text-gray-400'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">X/IG Link</span>
            </button>
            <button
              onClick={() => setPostType('image')}
              className={`py-2 rounded flex items-center justify-center gap-2 ${
                postType === 'image' ? 'bg-[#7c3aed] text-white' : 'bg-[#1a1a1a] text-gray-400'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span className="text-sm">Image</span>
            </button>
            <button
              onClick={() => setPostType('video')}
              className={`py-2 rounded flex items-center justify-center gap-2 ${
                postType === 'video' ? 'bg-[#7c3aed] text-white' : 'bg-[#1a1a1a] text-gray-400'
              }`}
            >
              <Film className="w-4 h-4" />
              <span className="text-sm">Video</span>
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
            placeholder={postType === 'social_link' ? 'Add your thoughts about this post... (optional)' : "What's on your mind? (optional)"}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 mb-3 h-32 resize-none"
          />

          {/* Social Link Input */}
          {postType === 'social_link' && (
            <div className="mb-3">
              <input
                type="url"
                value={socialLink}
                onChange={(e) => setSocialLink(e.target.value)}
                placeholder="Paste your X or Instagram post link..."
                className="w-full bg-[#1a1a1a] border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500"
              />
              <p className="text-xs text-gray-400 mt-2">
                📱 Supported: X (Twitter) and Instagram post links
              </p>
            </div>
          )}

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
            <button
              onClick={async () => {
                setLoading(true);
                await fetchPosts();
                setLoading(false);
              }}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 via-orange-500 to-cyan-600 text-white rounded-lg font-bold hover:scale-105 transition-transform disabled:opacity-50"
            >
              🔄 Refresh Feed
            </button>
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

                {/* Social Link Embed */}
                {post.postType === 'social_link' && post.socialLink && (
                  <div className="mb-3 border border-purple-500/30 rounded-lg p-4 bg-gradient-to-br from-purple-900/20 to-cyan-900/20">
                    <div className="flex items-start gap-3">
                      <Share2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-400 mb-2">Shared from {post.socialLink.includes('instagram') ? 'Instagram' : 'X'}</p>
                        <a
                          href={post.socialLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm break-all"
                        >
                          <span className="line-clamp-1">{post.socialLink}</span>
                          <ExternalLink className="w-4 h-4 flex-shrink-0" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Media preview */}
                {post.mediaUrl && post.postType !== 'social_link' && (
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
