import React, { useState } from 'react';
import { Share2, Sparkles, ExternalLink, Send, Zap } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface QuickPostProps {
  onSuccess?: () => void;
}

export function GMQuickPoster({ onSuccess }: QuickPostProps) {
  const [userName, setUserName] = useState('THEE ARCHIVE Team');
  const [userEmail, setUserEmail] = useState('admin@theearchive.com');
  const [title, setTitle] = useState('🎬 NTV Uganda - Entertainment News');
  const [content, setContent] = useState('Check out this amazing update from NTV Uganda! Stay tuned for the latest in entertainment and media.');
  const [socialLink, setSocialLink] = useState('https://x.com/ntvuganda/status/1994657578161254873?t=nz-wSoutKjkb8h_dtjp_dQ&s=19');
  const [posting, setPosting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Debug log
  React.useEffect(() => {
    console.log('🚀 GMQuickPoster component mounted!');
    console.log('📝 Pre-filled with NTV Uganda link:', socialLink);
  }, []);

  const handlePost = async () => {
    if (!userName.trim() || !userEmail.trim() || !title.trim() || !socialLink.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (!confirm('Post this to GM feed?')) {
      return;
    }

    setPosting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4d451974/admin/bulk-create-gm-posts`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            posts: [{
              id: `quick_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              userName,
              userEmail,
              title,
              content,
              socialLink,
            }]
          }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        alert('✅ Post created successfully in GM feed!');
        if (onSuccess) onSuccess();
      } else {
        alert(`❌ Failed to post: ${data.error}`);
      }
    } catch (error) {
      console.error('Error posting:', error);
      alert('❌ Failed to post!');
    } finally {
      setPosting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-black text-white mb-2">
          ✅ Posted Successfully!
        </h3>
        <p className="text-gray-300 mb-4">
          The NTV Uganda post is now live in the GM feed
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-black rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
        >
          Post Another
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bright Notice Banner */}
      <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-2xl p-6 shadow-2xl shadow-orange-500/50 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <Zap className="w-10 h-10 text-orange-500" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white mb-1">
              ⚡ QUICK POST - NTV UGANDA LINK READY!
            </h3>
            <p className="text-white font-bold">
              The NTV Uganda Twitter link is pre-loaded below. Just click "Post to GM Feed" to share it!
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 via-orange-500/20 to-cyan-600/20 border border-purple-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-orange-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">
              Quick GM Post
            </h2>
            <p className="text-sm text-gray-300">
              Add social link to Great Moments feed
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white font-bold mb-2 text-sm">User Name *</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div>
            <label className="block text-white font-bold mb-2 text-sm">User Email *</label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-white font-bold mb-2 text-sm">Post Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        <div>
          <label className="block text-white font-bold mb-2 text-sm">X/Instagram Link *</label>
          <input
            type="url"
            value={socialLink}
            onChange={(e) => setSocialLink(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
          <a
            href={socialLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm mt-2 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Preview link
          </a>
        </div>

        <div>
          <label className="block text-white font-bold mb-2 text-sm">Additional Thoughts (Optional)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
          />
        </div>

        <button
          onClick={handlePost}
          disabled={posting}
          className="w-full py-4 bg-gradient-to-r from-purple-600 via-orange-500 to-cyan-600 text-white font-black rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
        >
          {posting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              Posting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Post to GM Feed
            </>
          )}
        </button>
      </div>

      {/* Preview */}
      <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-black text-white mb-4">Preview</h3>
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-orange-500 to-cyan-600 flex items-center justify-center">
              <span className="text-white text-sm font-black">{userName.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <p className="text-white font-bold">{userName}</p>
              <p className="text-xs text-gray-400">Just now</p>
            </div>
          </div>
          
          <h4 className="text-white font-bold mb-2">{title}</h4>
          {content && (
            <p className="text-gray-300 text-sm mb-3">{content}</p>
          )}
          
          <div className="border border-purple-500/30 rounded-lg p-3 bg-gradient-to-br from-purple-900/20 to-cyan-900/20">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-purple-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">
                  Shared from {socialLink.includes('instagram') ? 'Instagram' : 'X (Twitter)'}
                </p>
                <p className="text-cyan-400 text-xs break-all line-clamp-1">{socialLink}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white/10 text-gray-300 rounded text-sm">
              <Sparkles className="w-4 h-4" />
              <span>GM 0</span>
            </button>
            <span className="text-gray-400 text-sm">0 comments</span>
          </div>
        </div>
      </div>
    </div>
  );
}
