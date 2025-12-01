import React from 'react';
import { ArrowLeft, Play, Trash2, Clock } from 'lucide-react';

interface Movie {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  genre: string;
  year: string;
  type: string;
  watchedAt?: string;
}

interface WatchHistoryScreenProps {
  history: Movie[];
  onPlay: (movie: Movie) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export function WatchHistoryScreen({ history, onPlay, onDelete, onBack }: WatchHistoryScreenProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-[#FFD700]/20">
        <div className="px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#FF4500]" />
              Watch History
            </h1>
            <p className="text-xs text-gray-400">{history.length} videos watched</p>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="px-4 py-6">
        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((movie) => (
              <div
                key={`${movie.id}-${movie.watchedAt}`}
                className="flex gap-3 bg-gradient-to-r from-white/5 to-transparent rounded-xl p-3 border border-white/10 hover:border-[#FFD700]/30 transition-all group"
              >
                {/* Thumbnail */}
                <div className="relative flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden">
                  <img
                    src={movie.thumbnailUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-[#FFD700]/90 flex items-center justify-center">
                      <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <h3 className="text-base font-black text-white line-clamp-1 mb-1">
                      {movie.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                      <span>{movie.year}</span>
                      <span>•</span>
                      <span>{movie.genre}</span>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(movie.watchedAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => onPlay(movie)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-black text-sm py-2 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                    >
                      <Play className="w-4 h-4" />
                      Watch Again
                    </button>
                    <button
                      onClick={() => onDelete(movie.id)}
                      className="w-10 h-10 flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
              <Clock className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">No Watch History</h3>
            <p className="text-gray-400 text-sm">
              Movies you watch will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}