  const handleDownload = async (movie: Movie) => {
    console.log('🔥 =============================================');
    console.log('🔥 DOWNLOAD TRIGGERED - FULL DEBUG INFO');
    console.log('🔥 =============================================');
    console.log('🔥 Movie Title:', movie.title);
    console.log('🔥 Movie ID:', movie.id);
    console.log('🔥 Video URL:', movie.videoUrl);
    console.log('🔥 Video URL Length:', movie.videoUrl?.length || 0);
    console.log('🔥 Video URL Type:', typeof movie.videoUrl);
    console.log('🔥 Current User:', currentUser ? currentUser.email : 'NOT LOGGED IN!!!');
    console.log('🔥 =============================================');
    
    if (!currentUser) {
      alert('Please sign in to download!');
      setShowAuthModal(true);
      return;
    }
    
    // Validate video URL
    if (!movie.videoUrl || movie.videoUrl.trim() === '') {
      console.error('❌ =============================================');
      console.error('❌ ERROR: NO VIDEO URL!');
      console.error('❌ Movie:', movie.title);
      console.error('❌ Movie ID:', movie.id);
      console.error('❌ VideoURL value:', movie.videoUrl);
      console.error('❌ =============================================');
      alert(`❌ Cannot download "${movie.title}"\n\nReason: No video URL found!\n\nPlease upload a valid video file in the admin portal.`);
      return;
    }
    
    console.log('✅ Validation passed - proceeding with download');
    
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
    
    const filename = `${movie.title.replace(/[^a-z0-9\\s]/gi, '_')}.mp4`;
    
    console.log('📥 Filename:', filename);
    alert(`Starting download: ${movie.title}\n\nPlease wait...`);
    
    try {
      console.log('📥 =============================================');
      console.log('📥 STARTING DOWNLOAD PROCESS');
      console.log('📥 =============================================');
      console.log('📥 Movie:', movie.title);
      console.log('📥 Video URL:', movie.videoUrl);
      
      // FIXED: Use backend proxy to handle CORS issues with auth token
      const proxyUrl = `${API_URL}/download-proxy?url=${encodeURIComponent(movie.videoUrl)}&filename=${encodeURIComponent(filename)}`;
      console.log('📥 Proxy URL:', proxyUrl);
      console.log('📥 API_URL:', API_URL);
      console.log('📥 publicAnonKey:', publicAnonKey ? '✅ Present' : '❌ MISSING');
      
      // Fetch through proxy with auth header, then create blob URL
      console.log('📥 Calling fetch to proxy...');
      const response = await fetch(proxyUrl, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      console.log('📥 =============================================');
      console.log('📥 PROXY RESPONSE RECEIVED');
      console.log('📥 =============================================');
      console.log('📥 Response status:', response.status);
      console.log('📥 Response statusText:', response.statusText);
      console.log('📥 Response ok:', response.ok);
      console.log('📥 Response type:', response.type);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ =============================================');
        console.error('❌ PROXY FAILED!');
        console.error('❌ =============================================');
        console.error('❌ Status:', response.status);
        console.error('❌ Status Text:', response.statusText);
        console.error('❌ Error Response Body:', errorText);
        console.error('❌ =============================================');
        throw new Error(`Proxy failed: ${response.status} ${response.statusText}\n\nDetails: ${errorText}`);
      }
      
      // Get the blob from response
      console.log('📥 Creating blob from response...');
      const blob = await response.blob();
      console.log('✅ =============================================');
      console.log('✅ BLOB RECEIVED SUCCESSFULLY');
      console.log('✅ =============================================');
      console.log('✅ Blob size:', blob.size, 'bytes');
      console.log('✅ Blob size (MB):', (blob.size / 1024 / 1024).toFixed(2), 'MB');
      console.log('✅ Blob type:', blob.type);
      console.log('✅ =============================================');
      
      // Create object URL and download
      console.log('📥 Creating download link...');
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // Trigger download
      console.log('📥 Triggering download...');
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      
      console.log('✅ =============================================');
      console.log('✅ DOWNLOAD COMPLETED SUCCESSFULLY!');
      console.log('✅ =============================================');
      alert(`✅ Download started: ${movie.title}`);
    } catch (error) {
      console.error('❌ =============================================');
      console.error('❌ DOWNLOAD FAILED!');
      console.error('❌ =============================================');
      console.error('❌ Error:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ =============================================');
      alert(`❌ Download failed for: ${movie.title}\n\nError: ${error}\n\nThe file might be too large or unavailable. Try again or contact support.`);
    }
  };
