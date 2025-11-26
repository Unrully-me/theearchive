import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, List, Maximize2, Minimize2, Video, Music as MusicIcon, X, EyeOff } from 'lucide-react';

interface MusicTrack {
  id: string;
  title: string;
  artist?: string;
  thumbnail: string;
  fileUrl: string;
  contentType: 'music-video' | 'music-audio';
  duration?: number;
}

interface MusicPlayerProps {
  currentTrack: MusicTrack | null;
  queue: MusicTrack[];
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onClose: () => void;
  onTrackEnd: () => void;
  isVisible?: boolean; // New prop to control visibility without unmounting
}

export function MusicPlayer({
  currentTrack,
  queue,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onClose,
  onTrackEnd,
  isVisible = true
}: MusicPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVideoWindow, setShowVideoWindow] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const canToggleMode = currentTrack?.contentType === 'music-video';
  const isUsingVideo = canToggleMode && isVideoMode;

  // Play/Pause control
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentTrack) return;

    if (isPlaying) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  }, [isPlaying, currentTrack]);

  // Handle time updates and track end
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
    };

    const handleEnded = () => {
      if (isRepeat) {
        video.currentTime = 0;
        video.play().catch(console.error);
      } else {
        onTrackEnd();
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [isRepeat, onTrackEnd]);

  // Volume control
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    onSeek(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(false);
    onVolumeChange(newVolume);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  return (
    <>
      {/* Always-mounted Video Element - plays in background */}
      <video
        ref={videoRef}
        src={currentTrack.fileUrl}
        className={
          isUsingVideo && showVideoWindow && isVisible
            ? isExpanded
              ? "fixed inset-0 z-[9999] w-full h-full object-contain bg-black"
              : "fixed bottom-24 right-4 z-50 w-[380px] h-[240px] object-cover bg-black rounded-xl shadow-2xl"
            : "hidden"
        }
        style={
          isUsingVideo && showVideoWindow && !isExpanded && isVisible
            ? { boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 215, 0, 0.2)' }
            : undefined
        }
      />

      {/* Only show UI when isVisible is true */}
      {isVisible && (
        <>
          {/* Video Controls Overlay - IMPROVED: More visible and prominent */}
          {isUsingVideo && showVideoWindow && (
            <div
              className={
                isExpanded
                  ? "fixed top-4 right-4 z-[10000] flex gap-2"
                  : "fixed bottom-[calc(6rem+240px)] right-4 z-[60] flex gap-2"
              }
            >
              {/* Hide Video Button - Red and prominent */}
              <button
                onClick={() => setShowVideoWindow(false)}
                className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all shadow-2xl hover:scale-110 backdrop-blur-sm border-2 border-white/20"
                title="Hide Video (Audio Only)"
              >
                <EyeOff className={isExpanded ? "w-6 h-6" : "w-5 h-5"} />
              </button>
              
              {/* Expand/Minimize Button - Golden and prominent */}
              {isExpanded ? (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-full shadow-2xl hover:scale-110 transition-all backdrop-blur-sm border-2 border-white/20"
                  title="Minimize Video"
                >
                  <Minimize2 className="w-6 h-6" />
                </button>
              ) : (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="p-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-full shadow-2xl hover:scale-110 transition-all backdrop-blur-sm border-2 border-white/20"
                  title="Maximize Video"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Queue Sidebar */}
          {showQueue && (
            <div className="fixed bottom-20 right-4 w-96 max-h-96 bg-gradient-to-b from-gray-900 to-black border border-[#FFD700]/20 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-4 border-b border-[#FFD700]/20 flex items-center justify-between">
                <h3 className="text-white font-bold">Queue ({queue.length})</h3>
                <button
                  onClick={() => setShowQueue(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto max-h-80">
                {queue.map((track, index) => (
                  <div
                    key={track.id + index}
                    className={`p-3 flex items-center gap-3 hover:bg-white/5 cursor-pointer ${
                      track.id === currentTrack.id ? 'bg-[#FFD700]/10' : ''
                    }`}
                  >
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{track.title}</p>
                      {track.artist && (
                        <p className="text-gray-400 text-xs truncate">{track.artist}</p>
                      )}
                    </div>
                    {track.contentType === 'music-video' ? (
                      <Video className="w-4 h-4 text-[#FFD700]" />
                    ) : (
                      <MusicIcon className="w-4 h-4 text-[#FFD700]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Player Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black via-gray-900 to-gray-900/95 backdrop-blur-xl border-t border-[#FFD700]/20 pb-20">
            {/* Progress Bar */}
            <div className="px-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-12 text-right">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FFD700] 
                    [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:scale-110"
                  style={{
                    background: `linear-gradient(to right, #FFD700 0%, #FFD700 ${(currentTime / duration) * 100}%, #374151 ${(currentTime / duration) * 100}%, #374151 100%)`
                  }}
                />
                <span className="w-12">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main Controls */}
            <div className="px-4 py-3 flex items-center justify-between gap-4">
              {/* Left: Track Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <img
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  className="w-14 h-14 rounded-lg object-cover shadow-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold truncate">{currentTrack.title}</p>
                  {currentTrack.artist && (
                    <p className="text-gray-400 text-sm truncate">{currentTrack.artist}</p>
                  )}
                </div>
              </div>

              {/* Center: Playback Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`p-2 rounded-full transition-all ${
                    isShuffle ? 'bg-[#FFD700] text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                <button
                  onClick={onPrevious}
                  className="p-2 text-white hover:text-[#FFD700] transition-all"
                >
                  <SkipBack className="w-5 h-5 fill-current" />
                </button>

                <button
                  onClick={onPlayPause}
                  className="p-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-full hover:scale-110 transition-all shadow-lg shadow-purple-500/50"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current" />
                  )}
                </button>

                <button
                  onClick={onNext}
                  className="p-2 text-white hover:text-[#FFD700] transition-all"
                >
                  <SkipForward className="w-5 h-5 fill-current" />
                </button>

                <button
                  onClick={() => setIsRepeat(!isRepeat)}
                  className={`p-2 rounded-full transition-all ${
                    isRepeat ? 'bg-[#FFD700] text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Repeat className="w-4 h-4" />
                </button>
              </div>

              {/* Right: Extra Controls */}
              <div className="flex items-center gap-3 flex-1 justify-end">
                {/* Video/Audio Toggle (only for music videos) */}
                {canToggleMode && (
                  <button
                    onClick={() => {
                      // Check if video is CURRENTLY showing
                      const isCurrentlyShowingVideo = isVideoMode && showVideoWindow;
                      
                      if (isCurrentlyShowingVideo) {
                        // Switch to audio-only mode
                        setIsVideoMode(false);
                        setShowVideoWindow(false);
                      } else {
                        // Switch to video mode
                        setIsVideoMode(true);
                        setShowVideoWindow(true);
                      }
                    }}
                    className={`p-2 rounded-full transition-all ${
                      isVideoMode && showVideoWindow ? 'bg-[#FFD700] text-black' : 'bg-white/10 text-gray-400 hover:text-white'
                    }`}
                    title={isVideoMode && showVideoWindow ? 'Switch to Audio Mode' : 'Switch to Video Mode'}
                  >
                    {isVideoMode && showVideoWindow ? <Video className="w-4 h-4" /> : <MusicIcon className="w-4 h-4" />}
                  </button>
                )}

                {/* Volume */}
                <div className="flex items-center gap-2">
                  <button onClick={toggleMute} className="text-white hover:text-[#FFD700] transition-all">
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
                      [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>

                {/* Queue */}
                <button
                  onClick={() => setShowQueue(!showQueue)}
                  className={`p-2 rounded-full transition-all ${
                    showQueue ? 'bg-[#FFD700] text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>

                {/* Close */}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}