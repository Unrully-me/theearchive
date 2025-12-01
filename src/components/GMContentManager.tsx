import React, { useState, useEffect } from 'react';
import { Upload, Film, Trash2, Eye, Heart, MessageCircle, Sparkles, Clock, Share2, Zap } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { GMBulkPoster } from './GMBulkPoster';
import { GMQuickPoster } from './GMQuickPoster';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4d451974`;

interface GMContent {
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

export function GMContentManager() {
  const [gmContent, setGmContent] = useState<GMContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [uploadMode, setUploadMode] = useState<'single' | 'bulk'>('single');
  const [activeTab, setActiveTab] = useState<'content' | 'social' | 'quick'>('quick');
  
  // GM Account token (hardcoded for GM official account)
  const GM_ACCESS_TOKEN = publicAnonKey; // Using public key for now - would need special GM account

  useEffect(() => {
    fetchGMContent();
  }, []);

  const fetchGMContent = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/w-feed`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();
      if (data.success) {
        setGmContent(data.content || []);
      }
    } catch (error) {
      console.error('Error fetching GM content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSingleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    setUploading(true);
    try {
      const response = await fetch(`${API_URL}/w-feed/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GM_ACCESS_TOKEN}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Content uploaded successfully!');
        fetchGMContent();
        e.currentTarget.reset();
      } else {
        alert(`❌ Upload failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert('❌ Upload failed!');
    } finally {
      setUploading(false);
    }
  };

  const handleBulkUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const files = (formData.get('files') as File[] | FileList);
    
    if (!files || files.length === 0) {
      alert('❌ Please select files to upload!');
      return;
    }

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const singleFormData = new FormData();
      singleFormData.append('file', file);
      singleFormData.append('caption', `Great Moment ${i + 1}`);
      singleFormData.append('contentType', file.type.startsWith('video/') ? 'video' : 'image');

      try {
        const response = await fetch(`${API_URL}/w-feed/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GM_ACCESS_TOKEN}`,
          },
          body: singleFormData,
        });

        const data = await response.json();
        if (data.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(`Error uploading file ${i + 1}:`, error);
        failCount++;
      }
    }

    setUploading(false);
    alert(`✅ Upload complete!\n${successCount} successful, ${failCount} failed`);
    fetchGMContent();
    e.currentTarget.reset();
  };

  const handleDelete = async (contentId: string, fileName: string) => {
    if (!confirm('Delete this GM content?')) return;

    try {
      const response = await fetch(`${API_URL}/w-feed/${contentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${GM_ACCESS_TOKEN}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Content deleted!');
        fetchGMContent();
      } else {
        alert(`❌ Delete failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('❌ Delete failed!');
    }
  };

  const handleSeedSocialPosts = async () => {
    if (!confirm('🌱 Seed 15 initial social posts? This will create discussion posts for users to engage with!')) return;

    setSeeding(true);
    try {
      const response = await fetch(`${API_URL}/admin/seed-gm-posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ ${data.message}`);
      } else {
        alert(`❌ Seeding failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error seeding social posts:', error);
      alert('❌ Seeding failed!');
    } finally {
      setSeeding(false);
    }
  };

  const handleSeedContent = async () => {
    if (!confirm('🌱 Add 100 sample GM posts? This will add cinematic/romantic content to your feed!')) return;

    setSeeding(true);
    try {
      const response = await fetch(`${API_URL}/admin/seed-gm-content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ ${data.totalCreated} GM content items created successfully!`);
        fetchGMContent();
      } else {
        alert(`❌ Seeding failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error seeding content:', error);
      alert('❌ Seeding failed!');
    } finally {
      setSeeding(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = Date.now();
    const expiry = new Date(expiresAt).getTime();
    const hoursLeft = Math.max(0, (expiry - now) / (1000 * 60 * 60));
    return Math.floor(hoursLeft);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-orange-400" />
            GM Content Management
          </h2>
          <p className="text-gray-400">
            Upload and manage official Great Moments content
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSeedSocialPosts}
            disabled={seeding}
            className="px-5 py-3 bg-gradient-to-r from-purple-600 via-orange-500 to-cyan-600 text-white font-black rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            {seeding ? 'Seeding...' : '🎯 Seed Social Posts'}
          </button>
          <button
            onClick={handleSeedContent}
            disabled={seeding}
            className="px-6 py-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white font-black rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            {seeding ? 'Seeding...' : '🌱 Add 100 Samples'}
          </button>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setActiveTab('quick')}
          className={`py-3 rounded-xl font-black transition-all flex items-center justify-center gap-2 ${
            activeTab === 'quick'
              ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50'
              : 'bg-white/10 text-gray-400 hover:bg-white/20'
          }`}
        >
          <Zap className="w-5 h-5" />
          Quick Post
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`py-3 rounded-xl font-black transition-all flex items-center justify-center gap-2 ${
            activeTab === 'social'
              ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/50'
              : 'bg-white/10 text-gray-400 hover:bg-white/20'
          }`}
        >
          <Share2 className="w-5 h-5" />
          Bulk Social Posts
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`py-3 rounded-xl font-black transition-all flex items-center justify-center gap-2 ${
            activeTab === 'content'
              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/50'
              : 'bg-white/10 text-gray-400 hover:bg-white/20'
          }`}
        >
          <Film className="w-5 h-5" />
          Video/Image Content
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'quick' ? (
        <GMQuickPoster onSuccess={fetchGMContent} />
      ) : activeTab === 'social' ? (
        <GMBulkPoster />
      ) : (
        <>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-xl p-4 border border-orange-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Film className="w-5 h-5 text-orange-400" />
            <span className="text-sm font-bold text-gray-400">Total Content</span>
          </div>
          <p className="text-3xl font-black text-orange-400">{gmContent.length}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-xl p-4 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-bold text-gray-400">Active Posts</span>
          </div>
          <p className="text-3xl font-black text-purple-400">{gmContent.length}</p>
        </div>
        
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-4 border border-cyan-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-bold text-gray-400">72H Auto-Delete</span>
          </div>
          <p className="text-lg font-black text-cyan-400">Active</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-orange-400" />
            Upload GM Content
          </h3>
          
          <div className="flex gap-2">
            <button
              onClick={() => setUploadMode('single')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                uploadMode === 'single'
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                  : 'bg-white/10 text-gray-400'
              }`}
            >
              Single Upload
            </button>
            <button
              onClick={() => setUploadMode('bulk')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                uploadMode === 'bulk'
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                  : 'bg-white/10 text-gray-400'
              }`}
            >
              Bulk Upload
            </button>
          </div>
        </div>

        {uploadMode === 'single' ? (
          <form onSubmit={handleSingleUpload} className="space-y-4">
            <div>
              <label className="block text-white font-bold mb-2">File (Video or Image)</label>
              <input
                type="file"
                name="file"
                accept="video/*,image/*"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gradient-to-r file:from-orange-500 file:to-pink-500 file:text-white file:font-bold"
              />
            </div>

            <div>
              <label className="block text-white font-bold mb-2">Caption</label>
              <textarea
                name="caption"
                rows={3}
                placeholder="What's this Great Moment about?"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            <div>
              <label className="block text-white font-bold mb-2">Content Type</label>
              <select
                name="contentType"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              >
                <option value="video">Video</option>
                <option value="image">Image</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-4 bg-gradient-to-r from-orange-500 via-purple-500 to-pink-500 text-white font-black rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Content 🚀'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleBulkUpload} className="space-y-4">
            <div>
              <label className="block text-white font-bold mb-2">
                Files (Multiple videos/images)
              </label>
              <input
                type="file"
                name="files"
                accept="video/*,image/*"
                multiple
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gradient-to-r file:from-orange-500 file:to-pink-500 file:text-white file:font-bold"
              />
              <p className="text-xs text-gray-400 mt-2">
                💡 Select multiple files to upload them all at once!
              </p>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-4 bg-gradient-to-r from-orange-500 via-purple-500 to-pink-500 text-white font-black rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all disabled:opacity-50"
            >
              {uploading ? 'Uploading Bulk...' : 'Bulk Upload Content 🚀'}
            </button>
          </form>
        )}
      </div>

      {/* Content List */}
      <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
          <Film className="w-5 h-5 text-cyan-400" />
          All GM Content ({gmContent.length})
        </h3>

        {gmContent.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No GM content yet. Upload your first Great Moment!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {gmContent.map((content) => (
              <div
                key={content.id}
                className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-orange-500/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {content.contentType === 'video' ? (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Film className="w-6 h-6 text-white" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-white text-sm">
                          {content.contentType.toUpperCase()} Content
                        </p>
                        <p className="text-xs text-gray-400">{content.userEmail}</p>
                      </div>
                    </div>

                    {content.caption && (
                      <p className="text-white text-sm mb-2 line-clamp-2">{content.caption}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Expires in {getTimeRemaining(content.expiresAt)}h
                      </span>
                      <span>Uploaded: {formatDate(content.uploadedAt)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(content.id, content.fileName)}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition-all"
                  >
                    <Trash2 className="w-4 h-4 inline mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Notice */}
      <div className="bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20 rounded-xl p-4">
        <p className="text-sm text-gray-300">
          <strong className="text-orange-400">💡 Info:</strong> Content uploaded here appears in the GM feed for all users. Videos are only allowed for the official GM account. Content auto-deletes after 72 hours.
        </p>
      </div>
      </>
      )}
    </div>
  );
}