import React, { useState } from 'react';
import { ArrowLeft, Play, Download, Calendar, Star } from 'lucide-react';

interface Episode {
  id: string;
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration?: string;
  releaseDate?: string;
}

interface Series {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  genre: string;
  year: string;
  rating?: string;
  episodes: Episode[];
}

interface SeriesDetailScreenProps {
  series: Series;
  onBack: () => void;
  onPlayEpisode: (episode: Episode) => void;
  onDownloadEpisode: (episode: Episode) => void;
}

export function SeriesDetailScreen({ 
  series, 
  onBack, 
  onPlayEpisode, 
  onDownloadEpisode 
}: SeriesDetailScreenProps) {
  const [selectedSeason, setSelectedSeason] = useState(1);

  // Use first episode thumbnail as fallback if series thumbnail is missing
  const heroThumbnail = series.thumbnailUrl || series.episodes[0]?.thumbnailUrl || '';

  // DEBUG: Log thumbnail for DOPE and HOSTAGE
  if (series.title.toLowerCase().includes('dope') || series.title.toLowerCase().includes('hostage')) {
    console.log('🎬 SeriesDetailScreen - HERO THUMBNAIL:', {
      seriesTitle: series.title,
      seriesThumbnailUrl: series.thumbnailUrl,
      firstEpisodeThumbnail: series.episodes?.[0]?.thumbnailUrl,
      finalHeroThumbnail: heroThumbnail,
      hasThumbnail: !!heroThumbnail,
      episodeCount: series.episodes?.length
    });
  }

  // Group episodes by season
  const seasons = series.episodes.reduce((acc, episode) => {
    const season = episode.seasonNumber || 1;
    if (!acc[season]) acc[season] = [];
    acc[season].push(episode);
    return acc;
  }, {} as Record<number, Episode[]>);

  const seasonNumbers = Object.keys(seasons).map(Number).sort((a, b) => a - b);
  const currentSeasonEpisodes = seasons[selectedSeason] || [];

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-y-auto">
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
            <h1 className="text-xl font-black text-white">{series.title}</h1>
            <p className="text-xs text-gray-400">{series.year} • {series.genre}</p>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative h-[40vh] bg-cover bg-center" style={{ backgroundImage: `url(${heroThumbnail})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-3 mb-3">
            {series.rating && (
              <div className="flex items-center gap-1 bg-[#FFD700]/20 px-3 py-1 rounded-lg">
                <Star className="w-4 h-4 text-[#FFD700] fill-[#FFD700]" />
                <span className="text-[#FFD700] font-black">{series.rating}</span>
              </div>
            )}
            <span className="text-gray-300 text-sm">{series.episodes.length} Episodes</span>
          </div>
          <p className="text-gray-300 text-sm line-clamp-3">{series.description}</p>
        </div>
      </div>

      {/* Season Selector */}
      {seasonNumbers.length > 1 && (
        <div className="sticky top-[72px] z-40 bg-black/95 backdrop-blur-xl border-b border-white/10">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-3">
            {seasonNumbers.map((seasonNum) => (
              <button
                key={seasonNum}
                onClick={() => setSelectedSeason(seasonNum)}
                className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  selectedSeason === seasonNum
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                Season {seasonNum}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Episodes List */}
      <div className="px-4 py-6 space-y-3 pb-24">
        <h2 className="text-xl font-black text-white mb-4">
          Season {selectedSeason} Episodes
        </h2>
        
        {currentSeasonEpisodes
          .sort((a, b) => a.episodeNumber - b.episodeNumber)
          .map((episode, index) => (
            <div
              key={episode.id}
              className="bg-gradient-to-r from-white/5 to-transparent rounded-xl overflow-hidden border border-white/10 hover:border-[#FFD700]/30 transition-all group"
            >
              <div className="flex gap-3 p-3">
                {/* Episode Thumbnail */}
                <div 
                  onClick={() => onPlayEpisode(episode)}
                  className="relative flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden cursor-pointer"
                >
                  <img
                    src={episode.thumbnailUrl || series.thumbnailUrl}
                    alt={episode.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-[#FFD700]/90 flex items-center justify-center">
                      <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                    </div>
                  </div>
                  {/* Episode Number Badge */}
                  <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded text-xs font-black text-[#FFD700]">
                    EP {episode.episodeNumber}
                  </div>
                </div>

                {/* Episode Info */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <h3 className="text-base font-black text-white line-clamp-1 mb-1">
                      {episode.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                      {episode.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {episode.duration && (
                        <>
                          <span>{episode.duration}</span>
                          <span>•</span>
                        </>
                      )}
                      {episode.releaseDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {episode.releaseDate}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => onPlayEpisode(episode)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-black text-sm py-2 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                    >
                      <Play className="w-4 h-4" />
                      Play
                    </button>
                    <button
                      onClick={() => onDownloadEpisode(episode)}
                      className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                    >
                      <Download className="w-4 h-4 text-[#FFD700]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}