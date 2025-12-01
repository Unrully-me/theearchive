import React, { useState, useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2, PictureInPicture, Play, Pause, Volume2, VolumeX, SkipForward, SkipBack } from 'lucide-react';
import { Resizable } from 're-resizable';
/* eslint-disable react/no-inline-styles */

interface MoviePlayerProps {
  movie: {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    genre: string;
    year: string;
  } | null;
  onClose: () => void;
}

type PlayerMode = 'theater' | 'mini' | 'minimized';

export function MoviePlayer({ movie, onClose }: MoviePlayerProps) {
  const [mode, setMode] = useState<PlayerMode>('theater');
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  // PiP + overlay states (add proper PiP lifecycle handling similar to VideoPlayer)
  const [isInPiP, setIsInPiP] = useState(false);
  const [overlayHidden, setOverlayHidden] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [playerSize, setPlayerSize] = useState({ width: 250, height: 250 });
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [savedTime, setSavedTime] = useState(0);
  const [showSkipIndicator, setShowSkipIndicator] = useState<'forward' | 'backward' | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLInputElement | null>(null);
  // use number for browser timeouts to avoid NodeJS namespace errors in the editor
  // Use platform-safe timeout return type so Node/Browser variants work correctly
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const skipIndicatorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved position from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('minimizedPlayerPosition');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPosition(parsed);
      } catch (e) {
        setPosition(null);
      }
    }
  }, []);

  // Save position to localStorage
  useEffect(() => {
    if (position) {
      localStorage.setItem('minimizedPlayerPosition', JSON.stringify(position));
    }
  }, [position]);

  // Set default position in top right on first minimize
  useEffect(() => {
    if (mode === 'minimized' && position === null) {
      const isMobile = window.innerWidth < 640;
      setPosition({
        x: window.innerWidth - (isMobile ? 220 : 340),
        y: 16
      });
    }
  }, [mode, position]);

  // Auto-resume playing after mode change if it was playing before
  useEffect(() => {
    if (shouldAutoPlay && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setShouldAutoPlay(false);
          })
          .catch((err: unknown) => {
            console.log('Auto-play prevented:', err);
            setShouldAutoPlay(false);
          });
      }
    }
  }, [mode, shouldAutoPlay]);

  // Restore saved time when video loads
  useEffect(() => {
    if (videoRef.current && savedTime > 0) {
      videoRef.current.currentTime = savedTime;
      setSavedTime(0); // Clear after restoring
    }
  }, [mode, savedTime]);

  // Enhanced mode change handler
  const handleModeChange = (newMode: PlayerMode) => {
    if (videoRef.current) {
      // Save current time
      setSavedTime(videoRef.current.currentTime);
      // Check if video is currently playing
      if (!videoRef.current.paused) {
        setShouldAutoPlay(true);
      }
    }
    setMode(newMode);
  };

  // Toggle Picture-in-Picture on the video element
  const togglePictureInPicture = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    try {
      if ((document as any).pictureInPictureElement) {
        await (document as any).exitPictureInPicture();
        console.log('✅ Exited PiP mode (MoviePlayer)');
      } else {
        await video.requestPictureInPicture();
        console.log('✅ Entered PiP mode (MoviePlayer)');
      }
    } catch (err) {
      console.log('PiP error (MoviePlayer):', err);
      // silent fallback: go to minimized mode on devices that don't support PiP
      setMode('minimized');
    }
  };

  // Dragging handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (mode !== 'minimized') return;
    
    e.stopPropagation();
    setIsDragging(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const rect = containerRef.current?.getBoundingClientRect();
    
    if (rect) {
      setDragOffset({
        x: clientX - rect.left,
        y: clientY - rect.top
      });
    }
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || mode !== 'minimized') return;
      
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      const newX = clientX - dragOffset.x;
      const newY = clientY - dragOffset.y;
      
      // Keep within viewport
      const maxX = window.innerWidth - (containerRef.current?.offsetWidth || 200);
      const maxY = window.innerHeight - (containerRef.current?.offsetHeight || 150);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove);
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, dragOffset, mode]);

  // Lock scroll in theater and mini modes
  useEffect(() => {
    if (movie && (mode === 'theater' || mode === 'mini')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [movie, mode]);

  // Auto-hide controls in theater mode
  const resetHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    setShowControls(true);
    if (mode === 'theater') {
      hideTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [mode]);

  // Picture-in-Picture lifecycle handlers (when supported)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onEnterPiP = () => {
      console.log('➡️ MoviePlayer entered PiP');
      setIsInPiP(true);
      setOverlayHidden(true);
      setShowControls(false);
    };

    const onLeavePiP = () => {
      console.log('⬅️ MoviePlayer left PiP');
      setIsInPiP(false);
      setOverlayHidden(false);
      setShowControls(true);
      // restore focus so UI becomes visible again
      containerRef.current?.focus?.();
    };

    try {
      video.addEventListener('enterpictureinpicture', onEnterPiP as EventListener);
      video.addEventListener('leavepictureinpicture', onLeavePiP as EventListener);
      document.addEventListener('enterpictureinpicture', onEnterPiP as EventListener);
      document.addEventListener('leavepictureinpicture', onLeavePiP as EventListener);
    } catch (err) {
      // Some browsers may not support these events; ignore
      console.debug('MoviePlayer PiP event listeners not supported:', err);
    }

    return () => {
      try {
        video.removeEventListener('enterpictureinpicture', onEnterPiP as EventListener);
        video.removeEventListener('leavepictureinpicture', onLeavePiP as EventListener);
        document.removeEventListener('enterpictureinpicture', onEnterPiP as EventListener);
        document.removeEventListener('leavepictureinpicture', onLeavePiP as EventListener);
      } catch (err) {
        // ignore cleanup errors
      }
    };
  }, []);

  // Video event handlers
  const handlePlayPause = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Update visual progress background dynamically at runtime (no JSX inline styles)
  useEffect(() => {
    const el = progressRef.current;
    if (!el || !duration) return;
    const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
    try {
      el.style.background = `linear-gradient(to right, #FFD700 0%, #FFD700 ${pct}%, rgba(255,255,255,0.3) ${pct}%, rgba(255,255,255,0.3) 100%)`;
    } catch (err) {
      // safely ignore style assignment errors in weird environments
    }
  }, [currentTime, duration]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
  };

  // Skip forward 10 seconds
  const handleSkipForward = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
      setShowSkipIndicator('forward');
      if (skipIndicatorTimerRef.current) {
        clearTimeout(skipIndicatorTimerRef.current);
      }
      skipIndicatorTimerRef.current = setTimeout(() => {
        setShowSkipIndicator(null);
      }, 1000);
    }
  };

  // Skip backward 10 seconds
  const handleSkipBackward = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
      setShowSkipIndicator('backward');
      if (skipIndicatorTimerRef.current) {
        clearTimeout(skipIndicatorTimerRef.current);
      }
      skipIndicatorTimerRef.current = setTimeout(() => {
        setShowSkipIndicator(null);
      }, 1000);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!movie) return null;

  return (
    <>
      {/* THEATER MODE - Full screen immersive */}
      {mode === 'theater' && (
        <div 
          className="fixed inset-0 bg-black z-[60] flex items-center justify-center"
          onMouseMove={resetHideTimer}
          onTouchStart={resetHideTimer}
        >
          {/* Skip Backward Zone (Left Third) */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-1/3 z-5 cursor-pointer flex items-center justify-start pl-12"
            onClick={handleSkipBackward}
          >
            {/* Skip Backward Indicator */}
            {showSkipIndicator === 'backward' && (
              <div className="animate-ping">
                <div className="bg-black/80 rounded-full p-6 flex items-center gap-3">
                  <SkipBack className="w-10 h-10 text-[#FFD700]" />
                  <span className="text-[#FFD700] font-black text-2xl">10s</span>
                </div>
              </div>
            )}
          </div>

          {/* Skip Forward Zone (Right Third) */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-1/3 z-5 cursor-pointer flex items-center justify-end pr-12"
            onClick={handleSkipForward}
          >
            {/* Skip Forward Indicator */}
            {showSkipIndicator === 'forward' && (
              <div className="animate-ping">
                <div className="bg-black/80 rounded-full p-6 flex items-center gap-3">
                  <span className="text-[#FFD700] font-black text-2xl">10s</span>
                  <SkipForward className="w-10 h-10 text-[#FFD700]" />
                </div>
              </div>
            )}
          </div>

          <video
            ref={videoRef}
            src={movie.videoUrl}
            className="max-w-full max-h-full w-auto h-auto object-contain cursor-pointer"
            onClick={handlePlayPause}
            poster={movie.thumbnailUrl}
            autoPlay
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onError={() => console.error('Video error loading:', movie.videoUrl)}
          />

          {/* Top Controls */}
          <div 
            className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 to-transparent p-4 sm:p-6 z-10 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-black text-lg sm:text-2xl truncate">{movie.title}</h2>
                <p className="text-[#FFD700] text-xs sm:text-sm">{movie.year} • {movie.genre}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleModeChange('mini')}
                  className="p-2 sm:p-3 bg-black/60 hover:bg-black/80 rounded-lg transition-all text-white"
                  title="Exit Theater Mode"
                >
                  <Minimize2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={togglePictureInPicture}
                  className="p-2 sm:p-3 bg-black/60 hover:bg-black/80 rounded-lg transition-all text-white hidden sm:block"
                  title="Float Player (Desktop Only)"
                >
                  <PictureInPicture className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 sm:p-3 bg-red-600/80 hover:bg-red-600 rounded-lg transition-all text-white"
                  title="Close Player"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Video Controls */}
          <div 
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 sm:p-6 z-10 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Progress Bar */}
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              ref={progressRef}
              title="Seek"
              aria-label="Seek"
              className="w-full h-1 mb-4 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
            />

          {/* update progress bar background programmatically to avoid static inline-style in JSX */}
          {/* progress style applied at runtime via useEffect */}

            <div className="flex items-center justify-between gap-2 sm:gap-4">
              {/* Left Controls */}
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Skip Backward Button */}
                <button
                  onClick={handleSkipBackward}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white"
                  title="Skip backward 10s"
                >
                  <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <button
                  onClick={handlePlayPause}
                  title={isPlaying ? 'Pause' : 'Play'}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  className="p-2 sm:p-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-full transition-all text-white shadow-lg shadow-purple-500/50"
                >
                  {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />}
                </button>

                {/* Skip Forward Button */}
                <button
                  onClick={handleSkipForward}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white"
                  title="Skip forward 10s"
                >
                  <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                
                <div className="flex items-center gap-2">
                  <button onClick={handleMuteToggle} className="text-white hover:text-[#FFD700] transition-colors">
                    {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    title="Volume"
                    aria-label="Volume"
                    className="w-16 sm:w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <span className="text-white text-xs sm:text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MINI MODE */}
      {mode === 'mini' && (
        <>
          <div className="fixed inset-0 bg-black/95 z-[60] overflow-y-auto">
            <div className="min-h-screen py-8 px-4">
              <div className="max-w-5xl mx-auto">
                {/* Video Player */}
                <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-2xl mb-6">
                  <video
                    ref={videoRef}
                    src={movie.videoUrl}
                    className="w-full h-auto object-contain"
                    controls
                    poster={movie.thumbnailUrl}
                    playsInline
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onError={() => console.error('Video error loading:', movie.videoUrl)}
                  />
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-white font-black text-xl sm:text-2xl">{movie.title}</h2>
                    <p className="text-[#FFD700] text-sm">{movie.year} • {movie.genre}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleModeChange('theater')}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-lg transition-all text-white font-bold flex items-center gap-2 shadow-lg shadow-purple-500/50"
                    >
                      <Maximize2 className="w-4 h-4" />
                      Theater Mode
                    </button>
                    <button
                      onClick={togglePictureInPicture}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white hidden sm:block"
                      title="Float Player (Desktop Only)"
                    >
                      <PictureInPicture className="w-5 h-5" />
                    </button>
                    <button
                      onClick={onClose}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all text-white"
                      title="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {movie.description && (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
                    <h3 className="text-[#FFD700] font-bold mb-3">About This Movie</h3>
                    <p className="text-gray-300 leading-relaxed">{movie.description}</p>
                  </div>
                )}

                {/* Ad Space */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-black border border-[#FFD700]/30 rounded-lg p-8 text-center">
                  <p className="text-[#FFD700] font-bold text-lg mb-2">Advertisement Space</p>
                  <p className="text-gray-400 text-sm">Ads keep THEE ARCHIVE free for everyone</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* MINIMIZED MODE - Floating draggable and resizable player */}
      {mode === 'minimized' && position && (
        <Resizable
          size={{ width: playerSize.width, height: playerSize.height }}
          onResizeStop={(e: any, direction: any, ref: any, d: any) => {
            setPlayerSize({
              width: playerSize.width + d.width,
              height: playerSize.height + d.height
            });
          }}
          minWidth={150}
          minHeight={150}
          maxWidth={600}
          maxHeight={600}
          lockAspectRatio={false}
          enable={{
            top: true,
            right: true,
            bottom: true,
            left: true,
            topRight: true,
            bottomRight: true,
            bottomLeft: true,
            topLeft: true
          }}
          style={{
            position: 'fixed',
            left: `${position!.x}px`,
            top: `${position!.y}px`,
            zIndex: 9999
          }} /* eslint-disable-line react/no-inline-styles */
          className="bg-black rounded-lg border-2 border-[#FFD700] shadow-2xl overflow-hidden"
        >
          <div
            ref={containerRef}
            className={`${isDragging ? 'cursor-grabbing' : 'cursor-grab'} touch-none w-full h-full`}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <video
              ref={videoRef}
              src={movie.videoUrl}
              className="block w-full h-full object-contain"
              poster={movie.thumbnailUrl}
              playsInline
              controls
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onError={() => console.error('Video error loading:', movie.videoUrl)}
            />

            {/* Hover Controls */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/90 opacity-0 hover:opacity-100 active:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2 sm:p-3 pointer-events-none">
              {/* Top Bar */}
              <div className="flex items-center justify-between pointer-events-auto">
                <p className="text-white text-xs font-bold truncate flex-1">{movie.title}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="p-1.5 bg-red-600 hover:bg-red-700 rounded text-white ml-2"
                  title="Close"
                  aria-label="Close"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Bottom Controls */}
              <div className="flex items-center justify-between gap-2 pointer-events-auto">
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSkipBackward();
                    }}
                    className="p-2 bg-black/80 hover:bg-black rounded text-white"
                    title="-10s"
                  >
                    <SkipBack className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayPause();
                    }}
                    className="p-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded text-white shadow-lg shadow-purple-500/50"
                    title={isPlaying ? 'Pause' : 'Play'}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-3 h-3 sm:w-4 sm:h-4" /> : <Play className="w-3 h-3 sm:w-4 sm:h-4" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSkipForward();
                    }}
                    className="p-2 bg-black/80 hover:bg-black rounded text-white"
                    title="+10s"
                  >
                    <SkipForward className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleModeChange('mini');
                    }}
                    className="p-2 bg-black/80 hover:bg-black rounded text-white"
                    title="Expand"
                  >
                    <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleModeChange('theater');
                    }}
                    className="p-2 bg-black/80 hover:bg-black rounded text-white"
                    title="Theater"
                  >
                    <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Resizable>
      )}

      {/* PiP restore/close controls (show when overlayHidden due to entering PiP) */}
      {overlayHidden && (
        <div className="fixed bottom-6 left-6 z-[10000] pointer-events-auto">
          <div className="flex flex-col gap-2 items-start">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOverlayHidden(false);
                setShowControls(true);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg border border-white/10"
            >
              Restore Player
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-lg shadow-lg border border-white/10"
            >
              Close Player
            </button>
          </div>
        </div>
      )}

      {/* Custom Slider Styles */}
      <style>{`
        input[type="range"].slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #FFD700;
          cursor: pointer;
          border: 2px solid #000;
        }
        input[type="range"].slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #FFD700;
          cursor: pointer;
          border: 2px solid #000;
        }
      `}</style>
    </>
  );
}