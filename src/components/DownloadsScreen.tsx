import React from 'react';
import { Download, Trash2, Play, Film, ArrowLeft } from 'lucide-react';

interface DownloadedMovie {
  id: string;
  title: string;
  thumbnailUrl: string;
  year: string;
  genre: string;
  fileSize?: string;
  downloadedAt: string;
}

interface DownloadsScreenProps {
  downloads: DownloadedMovie[];
  onPlay: (movie: DownloadedMovie) => void;
  onDelete: (id: string) => void;
  onBack?: () => void;
}

export function DownloadsScreen({ downloads, onPlay, onDelete, onBack }: DownloadsScreenProps) {
  if (downloads.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black flex flex-col items-center justify-center px-4 pb-24">
        {onBack && (
          <div className="absolute top-4 left-4">
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          </div>
        )}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 blur-2xl opacity-20"></div>
          <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-3xl border border-purple-500/20">
            <Download className="w-20 h-20 text-purple-400" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-white mb-2">No Downloads Yet</h2>
        <p className="text-gray-400 text-center max-w-sm">
          Movies and series you download will appear here for offline viewing
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black px-4 py-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        {onBack && (
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all mb-4"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        )}
        <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          My Downloads
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {downloads.length} {downloads.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>

      {/* Downloads List */}
      <div className="space-y-3">
        {downloads.map((download) => (
          <div
            key={download.id}
            className="bg-gray-800/50 rounded-xl p-3 border border-white/5 hover:border-[#FFD700]/30 transition-all group"
          >
            <div className="flex gap-3">
              {/* Thumbnail */}
              <div className="relative w-24 h-36 rounded-lg overflow-hidden flex-shrink-0">
                {download.thumbnailUrl ? (
                  <img
                    src={download.thumbnailUrl}
                    alt={download.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                    <Film className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h3 className="font-black text-white text-sm line-clamp-2 mb-1">
                    {download.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    <span className="text-[#FFD700] font-bold">{download.year}</span>
                    <span>•</span>
                    <span>{download.genre}</span>
                  </div>
                  {download.fileSize && (
                    <p className="text-xs text-gray-500">{download.fileSize}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => onPlay(download)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-4 py-2 rounded-lg font-black text-xs shadow-lg hover:shadow-cyan-500/50 transition-all"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    Play
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this download?')) {
                        onDelete(download.id);
                      }
                    }}
                    className="flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 text-red-500 px-3 py-2 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}