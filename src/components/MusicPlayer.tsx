import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, List, X } from 'lucide-react';

interface MusicTrack {
  id: string;
  title: string;
  artist?: string;
  thumbnail: string;
  fileUrl: string;
  contentType: 'music-video' | 'music-audio';
}

interface MusicPlayerProps {
  currentTrack: MusicTrack | null;
  queue: MusicTrack[];
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  isVisible?: boolean;
}

// Helper to extract YouTube video ID
function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Check if URL is YouTube
function isYouTubeUrl(url: string): boolean {
  return url && (url.includes('youtube.com') || url.includes('youtu.be'));
}

export function MusicPlayer({
  currentTrack,
  queue,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onClose,
  isVisible = true
}: MusicPlayerProps) {
  const [showQueue, setShowQueue] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!currentTrack) return null;

  const isYouTube = isYouTubeUrl(currentTrack.fileUrl);
  const youtubeVideoId = isYouTube ? getYouTubeVideoId(currentTrack.fileUrl) : null;

  // Handle video playback for NON-YouTube videos only
  useEffect(() => {
    if (isYouTube || !videoRef.current) return;
    
    const video = videoRef.current;
    
    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, isYouTube]);

  // Time updates for NON-YouTube videos only
  useEffect(() => {
    if (isYouTube || !videoRef.current) return;
    
    const video = videoRef.current;
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
    };
    
    const handleEnded = () => {
      onNext();
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
  }, [isYouTube, onNext]);

  // Volume control for NON-YouTube videos only
  useEffect(() => {
    if (isYouTube || !videoRef.current) return;
    videoRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted, isYouTube]);

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* YouTube Player */}
      {isYouTube && youtubeVideoId && isVisible && (
        <div className="fixed bottom-24 right-4 z-50 w-[400px] h-[250px] bg-black rounded-xl shadow-2xl overflow-hidden"
          style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 215, 0, 0.2)' }}>
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=${isPlaying ? 1 : 0}&controls=1&modestbranding=1&rel=0`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Regular Video Player (hidden) */}
      {!isYouTube && (
        <video
          ref={videoRef}
          src={currentTrack.fileUrl}
          className="hidden"
        />
      )}

      {/* Queue Sidebar */}
      {showQueue && isVisible && (
        <div className="fixed bottom-20 right-4 w-96 max-h-96 bg-gradient-to-b from-gray-900 to-black border border-[#FFD700]/20 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="p-4 border-b border-[#FFD700]/20 flex items-center justify-between">
            <h3 className="text-white font-bold">Queue ({queue.length})</h3>
            <button onClick={() => setShowQueue(false)} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="overflow-y-auto max-h-80">
            {queue.map((track, index) => (
              <div
                key={track.id + '-' + index}
                className={`p-3 flex items-center gap-3 hover:bg-white/5 cursor-pointer ${
                  track.id === currentTrack.id ? 'bg-[#FFD700]/10' : ''
                }`}
              >
                <img src={track.thumbnail} alt={track.title} className="w-12 h-12 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{track.title}</p>
                  {track.artist && <p className="text-gray-400 text-xs truncate">{track.artist}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Player Bar - Only show when visible */}
      {isVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black via-gray-900 to-gray-900/95 backdrop-blur-xl border-t border-[#FFD700]/20 pb-20">
          {/* Progress Bar - Only for non-YouTube */}
          {!isYouTube && (
            <div className="px-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-12 text-right">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  value={currentTime}
                  onChange={(e) => {
                    const time = parseFloat(e.target.value);
                    setCurrentTime(time);
                    if (videoRef.current) videoRef.current.currentTime = time;
                  }}
                  className="flex-1 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FFD700] 
                    [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:scale-110"
                  style={{
                    background: `linear-gradient(to right, #FFD700 0%, #FFD700 ${(currentTime / (duration || 1)) * 100}%, #374151 ${(currentTime / (duration || 1)) * 100}%, #374151 100%)`
                  }}
                />
                <span className="w-12">{formatTime(duration)}</span>
              </div>
            </div>
          )}

          {/* Main Controls */}
          <div className="px-4 py-3 flex items-center justify-between gap-4">
            {/* Track Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img src={currentTrack.thumbnail} alt={currentTrack.title} className="w-14 h-14 rounded-lg object-cover shadow-lg" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold truncate">{currentTrack.title}</p>
                {currentTrack.artist && <p className="text-gray-400 text-sm truncate">{currentTrack.artist}</p>}
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-3">
              <button onClick={onPrevious} className="p-2 text-white hover:text-[#FFD700] transition-all">
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={onPlayPause}
                className="p-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-full hover:scale-110 transition-all shadow-lg shadow-purple-500/50"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
              </button>

              <button onClick={onNext} className="p-2 text-white hover:text-[#FFD700] transition-all">
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
            </div>

            {/* Extra Controls */}
            <div className="flex items-center gap-3 flex-1 justify-end">
              {/* Volume - Only for non-YouTube */}
              {!isYouTube && (
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-[#FFD700] transition-all">
                    {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const newVolume = parseFloat(e.target.value);
                      setVolume(newVolume);
                      setIsMuted(false);
                    }}
                    className="w-20 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
                      [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>
              )}

              {/* Queue */}
              <button
                onClick={() => setShowQueue(!showQueue)}
                className={`p-2 rounded-full transition-all ${showQueue ? 'bg-[#FFD700] text-black' : 'text-gray-400 hover:text-white'}`}
              >
                <List className="w-5 h-5" />
              </button>

              {/* Close */}
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
