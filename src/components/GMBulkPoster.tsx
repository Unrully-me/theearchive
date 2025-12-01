import React, { useState } from 'react';
import { Upload, Share2, Plus, Trash2, Sparkles, User } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4d451974`;

interface BulkPost {
  id: string;
  userName: string;
  userEmail: string;
  title: string;
  content: string;
  socialLink: string;
}

export function GMBulkPoster() {
  const [posts, setPosts] = useState<BulkPost[]>([]);
  const [posting, setPosting] = useState(false);
  
  // Form states
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [socialLink, setSocialLink] = useState('');

  const addPost = () => {
    if (!userName.trim() || !userEmail.trim() || !title.trim() || !socialLink.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const newPost: BulkPost = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userName,
      userEmail,
      title,
      content,
      socialLink,
    };

    setPosts([...posts, newPost]);

    // Clear form
    setTitle('');
    setContent('');
    setSocialLink('');
    // Keep userName and userEmail for next post
  };

  const removePost = (id: string) => {
    setPosts(posts.filter(p => p.id !== id));
  };

  const handleBulkPost = async () => {
    if (posts.length === 0) {
      alert('No posts to submit!');
      return;
    }

    if (!confirm(`Post ${posts.length} social links to GM feed?`)) {
      return;
    }

    setPosting(true);
    let successCount = 0;
    let failCount = 0;

    try {
      const response = await fetch(`${API_URL}/admin/bulk-create-gm-posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ posts }),
      });

      const data = await response.json();
      
      if (data.success) {
        successCount = data.successCount || 0;
        failCount = data.failCount || 0;
        alert(`✅ Bulk post complete!\n${successCount} successful, ${failCount} failed`);
        setPosts([]);
      } else {
        alert(`❌ Bulk post failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error bulk posting:', error);
      alert('❌ Bulk post failed!');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
          <Share2 className="w-7 h-7 text-purple-400" />
          GM Bulk Social Poster
        </h2>
        <p className="text-gray-400">
          Post X/Instagram links to GM feed under different user accounts
        </p>
      </div>

      {/* Add Post Form */}
      <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-cyan-400" />
          Add Post to Queue
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-white font-bold mb-2 text-sm">User Name *</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div>
            <label className="block text-white font-bold mb-2 text-sm">User Email *</label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-white font-bold mb-2 text-sm">Post Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Check out this amazing scene from..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div>
            <label className="block text-white font-bold mb-2 text-sm">X or Instagram Link *</label>
            <input
              type="url"
              value={socialLink}
              onChange={(e) => setSocialLink(e.target.value)}
              placeholder="https://x.com/username/status/123... or https://instagram.com/p/ABC..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            <p className="text-xs text-gray-400 mt-1">
              📱 Paste the full URL from X (Twitter) or Instagram
            </p>
          </div>

          <div>
            <label className="block text-white font-bold mb-2 text-sm">Additional Thoughts (Optional)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add your commentary about this post..."
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
            />
          </div>

          <button
            onClick={addPost}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-black rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Add to Queue ({posts.length})
          </button>
        </div>
      </div>

      {/* Posts Queue */}
      {posts.length > 0 && (
        <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-400" />
              Post Queue ({posts.length})
            </h3>

            <button
              onClick={handleBulkPost}
              disabled={posting}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 via-purple-500 to-cyan-600 text-white font-black rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all disabled:opacity-50"
            >
              {posting ? 'Posting...' : `🚀 Post All (${posts.length})`}
            </button>
          </div>

          <div className="space-y-3">
            {posts.map((post, index) => (
              <div
                key={post.id}
                className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{post.userName}</p>
                        <p className="text-xs text-gray-400">{post.userEmail}</p>
                      </div>
                    </div>

                    <h4 className="text-white font-bold mb-1">{post.title}</h4>
                    {post.content && (
                      <p className="text-gray-300 text-sm mb-2 line-clamp-2">{post.content}</p>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <Share2 className="w-4 h-4 text-cyan-400" />
                      <a
                        href={post.socialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 line-clamp-1 flex-1"
                      >
                        {post.socialLink}
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={() => removePost(post.id)}
                    className="ml-3 px-3 py-2 bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-lg hover:bg-red-500/30 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Notice */}
      <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-xl p-4">
        <p className="text-sm text-gray-300">
          <strong className="text-purple-400">💡 How it works:</strong> Add multiple posts with different user accounts (your team members' accounts), then post them all at once. Each post will appear in the GM feed as if posted by that user, with their X/Instagram link embedded.
        </p>
      </div>
    </div>
  );
}
