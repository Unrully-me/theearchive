import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, Minimize2, RotateCcw, RotateCw, PictureInPicture } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  description: string;
  year: string;
  genre: string;
  onClose: () => void;
}

export function VideoPlayer({ videoUrl, title, description, year, genre, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  console.log('🎬 VideoPlayer Mounted');
  console.log('📹 Video URL:', videoUrl);
  console.log('🎞️ Title:', title);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [skipIndicator, setSkipIndicator] = useState<'forward' | 'backward' | null>(null);
  const [buffering, setBuffering] = useState(true);
  
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Play/Pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(err => console.log('Play error:', err));
    } else {
      video.pause();
    }
  };

  // Skip forward 10s
  const skipForward = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.min(video.currentTime + 10, video.duration);
    setSkipIndicator('forward');
    setTimeout(() => setSkipIndicator(null), 800);
  };

  // Skip backward 10s
  const skipBackward = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.max(video.currentTime - 10, 0);
    setSkipIndicator('backward');
    setTimeout(() => setSkipIndicator(null), 800);
  };

  // Toggle mute
  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // Volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newVolume = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;
    
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  // Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newTime = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Fullscreen
  const toggleFullscreen = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.log('Fullscreen error:', error);
    }
  };

  // Picture-in-Picture
  const togglePictureInPicture = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        console.log('✅ Exited PiP mode');
      } else {
        await video.requestPictureInPicture();
        console.log('✅ Entered PiP mode');
      }
    } catch (error) {
      console.log('PiP error:', error);
      alert('Picture-in-Picture is not supported on this device/browser');
    }
  };

  // Auto-hide controls
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => {
      setDuration(video.duration);
      setBuffering(false);
    };
    const onWaiting = () => setBuffering(true);
    const onCanPlay = () => setBuffering(false);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForward();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-hide controls effect
  useEffect(() => {
    resetControlsTimeout();
  }, [isPlaying]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // FORCE AUTOPLAY - Some browsers block autoplay, so we force it
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const attemptAutoplay = async () => {
      try {
        console.log('🎬 Attempting autoplay...');
        await video.play();
        console.log('✅ Autoplay successful!');
      } catch (error) {
        console.log('⚠️ Autoplay blocked by browser. User needs to click play.');
      }
    };

    // Try autoplay after a short delay to ensure video is loaded
    const timer = setTimeout(attemptAutoplay, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-black"
      onMouseMove={resetControlsTimeout}
      onTouchStart={resetControlsTimeout}
    >
      {/* Video Element - DIRECT URL NO PROXY */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-contain"
        src={videoUrl}
        autoPlay
        playsInline
        onClick={togglePlay}
      />

      {/* Buffering Indicator */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
          <div className="w-16 h-16 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Skip Indicator */}
      {skipIndicator && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-black/80 rounded-2xl px-8 py-6 backdrop-blur-sm scale-110 animate-in fade-in zoom-in duration-200">
            {skipIndicator === 'forward' ? (
              <div className="flex items-center gap-4">
                <RotateCw className="w-10 h-10 text-purple-400" />
                <span className="text-white text-3xl font-black">+10s</span>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <RotateCcw className="w-10 h-10 text-purple-400" />
                <span className="text-white text-3xl font-black">-10s</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div 
        className={`absolute inset-0 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'} pointer-events-none`}
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 px-6 py-5 bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-auto">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">{title}</h1>
              <p className="text-purple-400 text-sm sm:text-base font-bold">{year} • {genre}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="ml-4 p-3 bg-red-600 hover:bg-red-700 rounded-full transition-all hover:scale-110 shadow-2xl"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Center Play/Pause */}
        {!isPlaying && !buffering && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-24 h-24 rounded-full bg-purple-600/90 hover:bg-purple-700 flex items-center justify-center transition-all hover:scale-110 shadow-2xl"
            >
              <Play className="w-12 h-12 text-white ml-1" />
            </button>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-5 bg-gradient-to-t from-black/95 via-black/70 to-transparent pointer-events-auto">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer z-10"
              />
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-purple-500 rounded-full transition-all"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-300 mt-2 font-semibold">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="p-3 sm:p-4 bg-purple-600 hover:bg-purple-700 rounded-full transition-all hover:scale-110 shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white" />
                )}
              </button>

              {/* Skip Backward 10s */}
              <button
                onClick={skipBackward}
                className="p-3 sm:p-4 bg-white/20 hover:bg-white/30 rounded-full transition-all hover:scale-110 shadow-lg"
                title="Rewind 10 seconds"
              >
                <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>

              {/* Skip Forward 10s */}
              <button
                onClick={skipForward}
                className="p-3 sm:p-4 bg-white/20 hover:bg-white/30 rounded-full transition-all hover:scale-110 shadow-lg"
                title="Forward 10 seconds"
              >
                <RotateCw className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="p-3 sm:p-4 bg-white/20 hover:bg-white/30 rounded-full transition-all hover:scale-110 shadow-lg"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  )}
                </button>
                
                {/* Volume Slider - Desktop Only */}
                <div className="hidden sm:block">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-1 appearance-none bg-white/20 rounded-full cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              {/* Picture-in-Picture Button */}
              <button
                onClick={togglePictureInPicture}
                className="p-3 sm:p-4 bg-white/20 hover:bg-white/30 rounded-full transition-all hover:scale-110 shadow-lg"
                title="Picture-in-Picture (multitask while watching)"
              >
                <PictureInPicture className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="p-3 sm:p-4 bg-white/20 hover:bg-white/30 rounded-full transition-all hover:scale-110 shadow-lg"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                ) : (
                  <Maximize className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}