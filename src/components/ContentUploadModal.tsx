import React, { useState } from 'react';
import { X, Upload, Film, Tv, Music as MusicIcon, Loader, Plus, FileUp } from 'lucide-react';

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
  ageRating?: 'G' | 'PG' | 'PG-13' | 'R' | '18+' | 'Kids';
  section?: string;
  uploadedAt?: string;
  // Series fields
  seriesTitle?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  // Music fields
  contentType?: 'music-video' | 'music-audio';
  artist?: string;
}

interface ContentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  apiUrl: string;
  apiKey: string;
}

export function ContentUploadModal({
  isOpen,
  onClose,
  onSuccess,
  apiUrl,
  apiKey
}: ContentUploadModalProps) {
  const [uploadMode, setUploadMode] = useState<'single' | 'bulk' | 'series-bulk'>('single');
  const [contentType, setContentType] = useState<'movie' | 'series' | 'music' | '18+' | 'kido'>('movie');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Movie>>({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    genre: '',
    year: new Date().getFullYear().toString(),
    type: 'movie',
    category: 'movie',
    ageRating: 'PG',
    section: 'Movies',
  });

  // Bulk upload state
  const [bulkItems, setBulkItems] = useState<Array<Partial<Movie>>>([]);
  
  // Series bulk upload state (NEW!)
  const [seriesBulkData, setSeriesBulkData] = useState({
    seriesTitle: '',
    description: '',
    thumbnailUrl: '',
    genre: '',
    year: new Date().getFullYear().toString(),
    ageRating: 'PG' as 'G' | 'PG' | 'PG-13' | 'R' | '18+' | 'Kids',
    section: 'Series' as string,
    seasonNumber: 1,
    videoUrls: '', // Textarea with one URL per line
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.videoUrl || !formData.thumbnailUrl) {
      alert('❌ Please fill in Title, Video URL, and Thumbnail URL!');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Set proper category and type based on content selection
      let finalData = { ...formData };
      
      if (contentType === 'music') {
        finalData.type = 'music';
        finalData.category = 'music';
        finalData.section = 'Music';
        if (!finalData.contentType) finalData.contentType = 'music-video';
      } else if (contentType === 'series') {
        finalData.type = 'series';
        finalData.category = 'series';
        finalData.section = 'Series';
      } else if (contentType === '18+') {
        finalData.type = 'movie';
        finalData.category = 'movie';
        finalData.section = '18+';
        finalData.ageRating = '18+';
      } else if (contentType === 'kido') {
        finalData.type = 'movie';
        finalData.category = 'movie';
        finalData.section = 'KIDo';
        finalData.ageRating = 'Kids';
      } else {
        finalData.type = 'movie';
        finalData.category = 'movie';
        finalData.section = 'Movies';
      }

      setUploadProgress(30);

      const response = await fetch(`${apiUrl}/movies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });

      setUploadProgress(70);

      const data = await response.json();

      if (data.success) {
        setUploadProgress(100);
        alert('✅ Content uploaded successfully!');
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          videoUrl: '',
          thumbnailUrl: '',
          genre: '',
          year: new Date().getFullYear().toString(),
          type: 'movie',
          category: 'movie',
          ageRating: 'PG',
          section: 'Movies',
        });
        
        onSuccess();
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          onClose();
        }, 1000);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`❌ Upload failed: ${error}`);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleBulkSubmit = async () => {
    if (bulkItems.length === 0) {
      alert('❌ No items to upload!');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < bulkItems.length; i++) {
      try {
        const item = bulkItems[i];
        
        // Set proper category and type
        if (contentType === 'music') {
          item.type = 'music';
          item.category = 'music';
          item.section = 'Music';
          if (!item.contentType) item.contentType = 'music-video';
        } else if (contentType === 'series') {
          item.type = 'series';
          item.category = 'series';
          item.section = 'Series';
        } else if (contentType === '18+') {
          item.type = 'movie';
          item.category = 'movie';
          item.section = '18+';
          item.ageRating = '18+';
        } else if (contentType === 'kido') {
          item.type = 'movie';
          item.category = 'movie';
          item.section = 'KIDo';
          item.ageRating = 'Kids';
        } else {
          item.type = 'movie';
          item.category = 'movie';
          item.section = 'Movies';
        }

        const response = await fetch(`${apiUrl}/movies`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item),
        });

        const data = await response.json();

        if (data.success) {
          successCount++;
        } else {
          errorCount++;
        }

        setUploadProgress(((i + 1) / bulkItems.length) * 100);
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        errorCount++;
        console.error('Bulk upload error for item:', bulkItems[i], error);
      }
    }

    alert(`✅ Bulk upload complete!\n\nSuccessfully uploaded: ${successCount}\nErrors: ${errorCount}`);
    
    setBulkItems([]);
    onSuccess();
    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
      onClose();
    }, 1000);
  };

  const handleSeriesBulkSubmit = async () => {
    if (!seriesBulkData.seriesTitle || !seriesBulkData.videoUrls) {
      alert('❌ Please fill in Series Title and Video URLs!');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    let successCount = 0;
    let errorCount = 0;

    const videoUrlArray = seriesBulkData.videoUrls.split('\n').filter(url => url.trim() !== '');

    for (let i = 0; i < videoUrlArray.length; i++) {
      try {
        const videoUrl = videoUrlArray[i];
        
        // Set proper category and type
        const item: Partial<Movie> = {
          title: `${seriesBulkData.seriesTitle} S${seriesBulkData.seasonNumber}E${i + 1}`,
          description: seriesBulkData.description,
          videoUrl: videoUrl,
          thumbnailUrl: seriesBulkData.thumbnailUrl,
          genre: seriesBulkData.genre,
          year: seriesBulkData.year,
          type: 'series',
          category: 'series',
          ageRating: contentType === 'kido' ? 'Kids' : seriesBulkData.ageRating,
          section: contentType === 'kido' ? 'KIDo' : contentType === '18+' ? '18+' : 'Series',
          seriesTitle: seriesBulkData.seriesTitle,
          seasonNumber: seriesBulkData.seasonNumber,
          episodeNumber: i + 1,
        };

        const response = await fetch(`${apiUrl}/movies`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item),
        });

        const data = await response.json();

        if (data.success) {
          successCount++;
        } else {
          errorCount++;
        }

        setUploadProgress(((i + 1) / videoUrlArray.length) * 100);
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        errorCount++;
        console.error('Series bulk upload error for URL:', videoUrlArray[i], error);
      }
    }

    alert(`✅ Series bulk upload complete!\n\nSuccessfully uploaded: ${successCount}\nErrors: ${errorCount}`);
    
    setSeriesBulkData({
      seriesTitle: '',
      description: '',
      thumbnailUrl: '',
      genre: '',
      year: new Date().getFullYear().toString(),
      ageRating: 'PG' as 'G' | 'PG' | 'PG-13' | 'R' | '18+' | 'Kids',
      section: 'Series' as string,
      seasonNumber: 1,
      videoUrls: '', // Textarea with one URL per line
    });
    onSuccess();
    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
      onClose();
    }, 1000);
  };

  const addBulkItem = () => {
    setBulkItems([...bulkItems, {
      title: '',
      description: '',
      videoUrl: '',
      thumbnailUrl: '',
      genre: '',
      year: new Date().getFullYear().toString(),
      type: 'movie',
      category: 'movie',
      ageRating: 'PG',
    }]);
  };

  const removeBulkItem = (index: number) => {
    setBulkItems(bulkItems.filter((_, i) => i !== index));
  };

  const updateBulkItem = (index: number, field: string, value: any) => {
    const updated = [...bulkItems];
    updated[index] = { ...updated[index], [field]: value };
    setBulkItems(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-black/95 backdrop-blur-xl p-6 border-b border-white/10 flex items-center justify-between z-10">
          <div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-[#FFD700] to-[#FF4500] bg-clip-text text-transparent">
              📤 UPLOAD CONTENT
            </h2>
            <p className="text-sm text-gray-400 mt-1">Add movies, series, music, 18+ content, or KIDo content</p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all disabled:opacity-50"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Upload Mode Toggle */}
          <div className="flex gap-3">
            <button
              onClick={() => setUploadMode('single')}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                uploadMode === 'single'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              📄 Single Upload
            </button>
            <button
              onClick={() => setUploadMode('bulk')}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                uploadMode === 'bulk'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              📚 Bulk Upload
            </button>
            <button
              onClick={() => setUploadMode('series-bulk')}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                uploadMode === 'series-bulk'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              📺 Series Bulk Upload
            </button>
          </div>

          {/* Content Type Selection */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">Content Category</label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { value: 'movie', icon: '🎬', label: 'Movie' },
                { value: 'series', icon: '📺', label: 'Series' },
                { value: 'music', icon: '🎵', label: 'Music' },
                { value: '18+', icon: '🔞', label: '18+' },
                { value: 'kido', icon: '👶', label: 'KIDo' },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setContentType(type.value as any)}
                  className={`py-3 px-2 rounded-xl font-bold text-sm transition-all ${
                    contentType === type.value
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/50'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  {type.label}
                </button>
              ))}
            </div>
            
            {/* KIDo Helper Banner */}
            {contentType === 'kido' && (
              <div className="mt-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                <h4 className="text-cyan-400 font-black text-sm mb-2 flex items-center gap-2">
                  👶 KIDo Corner Info
                </h4>
                <p className="text-gray-300 text-xs leading-relaxed">
                  ✨ Content will appear in the <span className="font-bold text-cyan-400">KIDo Corner</span> section<br/>
                  🎯 Perfect for: Tom & Jerry, Cartoon Network, Disney, Kids Shows<br/>
                  🔒 Age Rating will be automatically set to <span className="font-bold">"Kids"</span><br/>
                  📺 Works for both <span className="font-bold">Single Upload</span> and <span className="font-bold">Series Bulk Upload</span>
                </p>
              </div>
            )}
          </div>

          {/* SINGLE UPLOAD FORM */}
          {uploadMode === 'single' && (
            <div className="space-y-4">
              {/* AWS S3 INSTRUCTIONS */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-400" />
                  📁 STEP 1: Upload Your Files to AWS S3
                </h3>
                <p className="text-sm text-gray-400 mb-2">
                  Upload your video file and thumbnail image to your AWS S3 bucket, then paste the URLs below.
                </p>
                <p className="text-xs text-gray-500">
                  💡 AWS S3 URL format: <code className="bg-black/50 px-2 py-1 rounded">https://your-bucket.s3.amazonaws.com/filename.mp4</code>
                </p>
              </div>

              {/* VIDEO FORMAT WARNING */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                  ⚠️ IMPORTANT: Supported Video Formats
                </h3>
                <div className="text-sm space-y-2">
                  <div>
                    <p className="text-green-400 font-bold mb-1">✅ SUPPORTED (Use These!):</p>
                    <ul className="text-gray-300 text-xs space-y-1 ml-4">
                      <li>• MP4 with H.264 video codec + AAC audio (RECOMMENDED)</li>
                      <li>• WebM with VP8/VP9 codec</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-red-400 font-bold mb-1">❌ NOT SUPPORTED:</p>
                    <ul className="text-gray-400 text-xs space-y-1 ml-4">
                      <li>• AVI, MKV, MOV, FLV, WMV, MPG</li>
                      <li>• Videos with unsupported codecs</li>
                    </ul>
                  </div>
                  <p className="text-cyan-400 text-xs mt-2">
                    💡 TIP: Convert your videos to MP4 (H.264) using tools like HandBrake or FFmpeg before uploading to AWS S3!
                  </p>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., The Dark Knight, Breaking Bad S01E01, Blinding Lights..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter a brief description..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-all"
                />
              </div>

              {/* Video URL (AWS S3) */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Video URL (AWS S3) *
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://your-bucket.s3.amazonaws.com/video.mp4"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-all"
                />
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Thumbnail URL (AWS S3) *
                </label>
                <input
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  placeholder="https://your-bucket.s3.amazonaws.com/thumbnail.jpg"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-all"
                />
              </div>

              {/* Genre & Year */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Genre/Category *</label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FFD700] transition-all"
                  >
                    <option value="">Select Genre...</option>
                    <optgroup label="🎬 Movie Genres">
                      <option value="Action">💥 Action</option>
                      <option value="Horror">👻 Horror</option>
                      <option value="Comedy">😂 Comedy</option>
                      <option value="Sci-Fi">🚀 Sci-Fi</option>
                      <option value="Drama">🎭 Drama</option>
                      <option value="Romance">❤️ Romance</option>
                      <option value="Thriller">🔪 Thriller</option>
                      <option value="Adventure">🗺️ Adventure</option>
                      <option value="Fantasy">🧙 Fantasy</option>
                      <option value="Crime">🚨 Crime</option>
                    </optgroup>
                    <optgroup label="🌍 Regional Content">
                      <option value="Uganda Drama">🇺🇬 Uganda Soaps/Drama</option>
                      <option value="Nigerian Drama">🇳🇬 Nigerian Drama/Nollywood</option>
                      <option value="High School">🎓 High School/Teen</option>
                    </optgroup>
                    <optgroup label="📺 Series Types">
                      <option value="Series">📺 TV Series</option>
                      <option value="Anime">🎌 Anime</option>
                      <option value="Documentary">📽️ Documentary</option>
                    </optgroup>
                    <optgroup label="🎵 Music">
                      <option value="Hip Hop">🎤 Hip Hop</option>
                      <option value="Afrobeat">🥁 Afrobeat</option>
                      <option value="Pop">🎸 Pop</option>
                      <option value="Uganda Music">🇺🇬 Uganda Music</option>
                      <option value="R&B">🎹 R&B</option>
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Year *</label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="2024"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-all"
                  />
                </div>
              </div>

              {/* Age Rating */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">Age Rating *</label>
                <select
                  value={formData.ageRating || 'PG'}
                  onChange={(e) => setFormData({ ...formData, ageRating: e.target.value as any })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FFD700] transition-all"
                >
                  <option value="G">G - General Audiences</option>
                  <option value="PG">PG - Parental Guidance</option>
                  <option value="PG-13">PG-13 - Parents Strongly Cautioned</option>
                  <option value="R">R - Restricted</option>
                  <option value="18+">18+ - Adults Only</option>
                  <option value="Kids">Kids - For Children 3+</option>
                </select>
              </div>

              {/* SERIES-SPECIFIC FIELDS */}
              {contentType === 'series' && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 space-y-3">
                  <h3 className="font-black text-white flex items-center gap-2">
                    <Tv className="w-5 h-5 text-purple-400" />
                    📺 Series Information
                  </h3>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Series Title</label>
                    <input
                      type="text"
                      value={formData.seriesTitle || ''}
                      onChange={(e) => setFormData({ ...formData, seriesTitle: e.target.value })}
                      placeholder="e.g., Breaking Bad, Game of Thrones..."
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#FFD700] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">Season Number</label>
                      <input
                        type="number"
                        value={formData.seasonNumber || 1}
                        onChange={(e) => setFormData({ ...formData, seasonNumber: parseInt(e.target.value) || 1 })}
                        min="1"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#FFD700] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">Episode Number</label>
                      <input
                        type="number"
                        value={formData.episodeNumber || 1}
                        onChange={(e) => setFormData({ ...formData, episodeNumber: parseInt(e.target.value) || 1 })}
                        min="1"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#FFD700] transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* MUSIC-SPECIFIC FIELDS */}
              {contentType === 'music' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 space-y-3">
                  <h3 className="font-black text-white flex items-center gap-2">
                    <MusicIcon className="w-5 h-5 text-green-400" />
                    🎵 Music Information
                  </h3>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Artist Name *</label>
                    <input
                      type="text"
                      value={formData.artist || ''}
                      onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                      placeholder="e.g., Drake, Rihanna, The Weeknd..."
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#FFD700] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Content Type</label>
                    <select
                      value={formData.contentType || 'music-video'}
                      onChange={(e) => setFormData({ ...formData, contentType: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#FFD700] transition-all"
                    >
                      <option value="music-video">🎬 Music Video (has video)</option>
                      <option value="music-audio">🎵 Audio Only (mp3/audio file)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.contentType === 'music-audio' 
                        ? '💡 Audio-only: User can only listen, no video player'
                        : '💡 Music Video: User can switch between video and audio-only mode'}
                    </p>
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="bg-black/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-bold">Uploading...</span>
                    <span className="text-[#FFD700] font-bold">{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className="flex-1 py-4 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-black text-lg rounded-xl hover:shadow-2xl hover:shadow-[#FFD700]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader className="w-6 h-6 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6" />
                      Upload Content
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  disabled={isUploading}
                  className="px-6 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* BULK UPLOAD FORM */}
          {uploadMode === 'bulk' && (
            <div className="space-y-4">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <h3 className="text-white font-bold mb-2">📚 Bulk Upload Instructions</h3>
                <p className="text-sm text-gray-400 mb-2">
                  Add multiple items below. Each item must have a title, video URL (AWS S3), and thumbnail URL.
                </p>
                <p className="text-xs text-gray-500">
                  💡 Perfect for uploading multiple episodes of a series or multiple songs!
                </p>
              </div>

              {bulkItems.map((item, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-bold">Item #{index + 1}</h4>
                    <button
                      onClick={() => removeBulkItem(index)}
                      className="px-3 py-1 bg-red-500/20 text-red-400 text-sm font-bold rounded-lg hover:bg-red-500/30 transition-all"
                    >
                      Remove
                    </button>
                  </div>

                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateBulkItem(index, 'title', e.target.value)}
                    placeholder="Title"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-all"
                  />

                  <textarea
                    value={item.description}
                    onChange={(e) => updateBulkItem(index, 'description', e.target.value)}
                    placeholder="Description"
                    rows={2}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-all"
                  />

                  <input
                    type="url"
                    value={item.videoUrl}
                    onChange={(e) => updateBulkItem(index, 'videoUrl', e.target.value)}
                    placeholder="Video URL (AWS S3)"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-all"
                  />

                  <input
                    type="url"
                    value={item.thumbnailUrl}
                    onChange={(e) => updateBulkItem(index, 'thumbnailUrl', e.target.value)}
                    placeholder="Thumbnail URL (AWS S3)"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-all"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={item.genre}
                      onChange={(e) => updateBulkItem(index, 'genre', e.target.value)}
                      placeholder="Genre"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-all"
                    />
                    <input
                      type="text"
                      value={item.year}
                      onChange={(e) => updateBulkItem(index, 'year', e.target.value)}
                      placeholder="Year"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-all"
                    />
                  </div>

                  {/* Series fields for bulk */}
                  {contentType === 'series' && (
                    <div className="grid grid-cols-3 gap-2 bg-purple-500/10 p-2 rounded-lg">
                      <input
                        type="text"
                        value={item.seriesTitle || ''}
                        onChange={(e) => updateBulkItem(index, 'seriesTitle', e.target.value)}
                        placeholder="Series Title"
                        className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#FFD700]"
                      />
                      <input
                        type="number"
                        value={item.seasonNumber || 1}
                        onChange={(e) => updateBulkItem(index, 'seasonNumber', parseInt(e.target.value) || 1)}
                        placeholder="Season"
                        className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs focus:outline-none focus:border-[#FFD700]"
                      />
                      <input
                        type="number"
                        value={item.episodeNumber || 1}
                        onChange={(e) => updateBulkItem(index, 'episodeNumber', parseInt(e.target.value) || 1)}
                        placeholder="Episode"
                        className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs focus:outline-none focus:border-[#FFD700]"
                      />
                    </div>
                  )}

                  {/* Music fields for bulk */}
                  {contentType === 'music' && (
                    <input
                      type="text"
                      value={item.artist || ''}
                      onChange={(e) => updateBulkItem(index, 'artist', e.target.value)}
                      placeholder="Artist Name"
                      className="w-full px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-[#FFD700] transition-all"
                    />
                  )}
                </div>
              ))}

              <button
                onClick={addBulkItem}
                className="w-full py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Item
              </button>

              {/* Upload Progress */}
              {isUploading && (
                <div className="bg-black/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-bold">Bulk Uploading... ({Math.round(uploadProgress)}%)</span>
                    <span className="text-[#FFD700] font-bold">{bulkItems.length} items</span>
                  </div>
                  <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleBulkSubmit}
                  disabled={isUploading || bulkItems.length === 0}
                  className="flex-1 py-4 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white font-black text-lg rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader className="w-6 h-6 animate-spin" />
                      Uploading {bulkItems.length} items...
                    </>
                  ) : (
                    <>
                      <FileUp className="w-6 h-6" />
                      Upload {bulkItems.length} Items
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  disabled={isUploading}
                  className="px-6 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* SERIES BULK UPLOAD FORM */}
          {uploadMode === 'series-bulk' && (
            <div className="space-y-4">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <h3 className="text-white font-bold mb-2">📺 Series Bulk Upload Instructions</h3>
                <p className="text-sm text-gray-400 mb-2">
                  Add a series title, description, thumbnail URL, genre, year, age rating, and a list of video URLs (one per line).
                </p>
                <p className="text-xs text-gray-500">
                  💡 Perfect for uploading multiple episodes of a series!
                </p>
              </div>

              <input
                type="text"
                value={seriesBulkData.seriesTitle}
                onChange={(e) => setSeriesBulkData({ ...seriesBulkData, seriesTitle: e.target.value })}
                placeholder="Series Title"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-all"
              />

              <textarea
                value={seriesBulkData.description}
                onChange={(e) => setSeriesBulkData({ ...seriesBulkData, description: e.target.value })}
                placeholder="Description"
                rows={2}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-all"
              />

              <input
                type="url"
                value={seriesBulkData.thumbnailUrl}
                onChange={(e) => setSeriesBulkData({ ...seriesBulkData, thumbnailUrl: e.target.value })}
                placeholder="Thumbnail URL (AWS S3)"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-all"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={seriesBulkData.genre}
                  onChange={(e) => setSeriesBulkData({ ...seriesBulkData, genre: e.target.value })}
                  placeholder="Genre"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-all"
                />
                <input
                  type="text"
                  value={seriesBulkData.year}
                  onChange={(e) => setSeriesBulkData({ ...seriesBulkData, year: e.target.value })}
                  placeholder="Year"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Age Rating *</label>
                <select
                  value={seriesBulkData.ageRating}
                  onChange={(e) => setSeriesBulkData({ ...seriesBulkData, ageRating: e.target.value as any })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FFD700] transition-all"
                >
                  <option value="G">G - General Audiences</option>
                  <option value="PG">PG - Parental Guidance</option>
                  <option value="PG-13">PG-13 - Parents Strongly Cautioned</option>
                  <option value="R">R - Restricted</option>
                  <option value="18+">18+ - Adults Only</option>
                  <option value="Kids">Kids - For Children 3+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Season Number *</label>
                <input
                  type="number"
                  value={seriesBulkData.seasonNumber}
                  onChange={(e) => setSeriesBulkData({ ...seriesBulkData, seasonNumber: parseInt(e.target.value) || 1 })}
                  min="1"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-all"
                />
              </div>

              <textarea
                value={seriesBulkData.videoUrls}
                onChange={(e) => setSeriesBulkData({ ...seriesBulkData, videoUrls: e.target.value })}
                placeholder="Video URLs (one per line)"
                rows={5}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FFD700] transition-all"
              />

              {/* Upload Progress */}
              {isUploading && (
                <div className="bg-black/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-bold">Bulk Uploading... ({Math.round(uploadProgress)}%)</span>
                    <span className="text-[#FFD700] font-bold">{seriesBulkData.videoUrls.split('\n').filter(url => url.trim() !== '').length} items</span>
                  </div>
                  <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-cyan-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSeriesBulkSubmit}
                  disabled={isUploading || !seriesBulkData.seriesTitle || !seriesBulkData.videoUrls}
                  className="flex-1 py-4 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white font-black text-lg rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader className="w-6 h-6 animate-spin" />
                      Uploading {seriesBulkData.videoUrls.split('\n').filter(url => url.trim() !== '').length} items...
                    </>
                  ) : (
                    <>
                      <FileUp className="w-6 h-6" />
                      Upload {seriesBulkData.videoUrls.split('\n').filter(url => url.trim() !== '').length} Items
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  disabled={isUploading}
                  className="px-6 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}