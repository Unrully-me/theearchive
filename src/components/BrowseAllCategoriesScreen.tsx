import React, { useState } from 'react';
import { 
  Clapperboard, 
  Tv, 
  Video, 
  Skull, 
  Laugh, 
  Rocket, 
  Flag, 
  Film, 
  GraduationCap, 
  Headphones,
  X,
  Globe,
  ArrowLeft,
  Play,
  Download,
  Star
} from 'lucide-react';
import { groupSeriesEpisodes } from '../utils/seriesGrouping';

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
  episodes?: any[];
}

interface BrowseAllCategoriesScreenProps {
  movies: Movie[];
  onWatch: (movie: Movie) => void;
  onDownload: (movie: Movie) => void;
  onBack: () => void;
  currentUser?: any;
}

export function BrowseAllCategoriesScreen({ 
  movies,
  onWatch,
  onDownload,
  onBack,
  currentUser
}: BrowseAllCategoriesScreenProps) {
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  
  const categories = [
    {
      title: 'All Movies',
      emoji: '🎬',
      icon: Clapperboard,
      color: 'from-purple-600 to-pink-600',
      filterFn: (m: any) => m.type !== 'series' && m.category !== 'music' && m.ageRating !== '18+',
      count: movies.filter((m: any) => m.type !== 'series' && m.category !== 'music' && m.ageRating !== '18+').length
    },
    {
      title: 'Series',
      emoji: '📺',
      icon: Tv,
      color: 'from-purple-600 to-pink-600',
      filterFn: (m: any) => m.type === 'series' && m.ageRating !== '18+',
      count: movies.filter((m: any) => m.type === 'series' && m.ageRating !== '18+').length
    },
    {
      title: 'Action',
      emoji: '💥',
      icon: Video,
      color: 'from-red-600 to-pink-600',
      filterFn: (m: any) => (m.genre?.toLowerCase().includes('action') || m.section?.toLowerCase().includes('action')) && m.ageRating !== '18+' && m.category !== 'music',
      count: movies.filter((m: any) => (m.genre?.toLowerCase().includes('action') || m.section?.toLowerCase().includes('action')) && m.ageRating !== '18+' && m.category !== 'music').length
    },
    {
      title: 'Horror',
      emoji: '👻',
      icon: Skull,
      color: 'from-red-600 to-purple-600',
      filterFn: (m: any) => (m.genre?.toLowerCase().includes('horror') || m.section?.toLowerCase().includes('horror')) && m.ageRating !== '18+' && m.category !== 'music',
      count: movies.filter((m: any) => (m.genre?.toLowerCase().includes('horror') || m.section?.toLowerCase().includes('horror')) && m.ageRating !== '18+' && m.category !== 'music').length
    },
    {
      title: 'Comedy',
      emoji: '😂',
      icon: Laugh,
      color: 'from-yellow-600 to-amber-700',
      filterFn: (m: any) => (m.genre?.toLowerCase().includes('comedy') || m.section?.toLowerCase().includes('comedy')) && m.ageRating !== '18+' && m.category !== 'music',
      count: movies.filter((m: any) => (m.genre?.toLowerCase().includes('comedy') || m.section?.toLowerCase().includes('comedy')) && m.ageRating !== '18+' && m.category !== 'music').length
    },
    {
      title: 'Sci-Fi',
      emoji: '🚀',
      icon: Rocket,
      color: 'from-indigo-600 to-purple-600',
      filterFn: (m: any) => (m.genre?.toLowerCase().includes('sci-fi') || m.genre?.toLowerCase().includes('science fiction') || m.section?.toLowerCase().includes('sci-fi')) && m.ageRating !== '18+' && m.category !== 'music',
      count: movies.filter((m: any) => (m.genre?.toLowerCase().includes('sci-fi') || m.genre?.toLowerCase().includes('science fiction') || m.section?.toLowerCase().includes('sci-fi')) && m.ageRating !== '18+' && m.category !== 'music').length
    },
    {
      title: 'Uganda Drama',
      emoji: '🇺🇬',
      icon: Flag,
      color: 'from-amber-600 to-red-600',
      filterFn: (m: any) => (m.genre?.toLowerCase().includes('uganda') || m.section?.toLowerCase().includes('uganda')) && m.ageRating !== '18+' && m.category !== 'music',
      count: movies.filter((m: any) => (m.genre?.toLowerCase().includes('uganda') || m.section?.toLowerCase().includes('uganda')) && m.ageRating !== '18+' && m.category !== 'music').length
    },
    {
      title: 'Nigerian Drama',
      emoji: '🇳🇬',
      icon: Film,
      color: 'from-green-600 to-emerald-600',
      filterFn: (m: any) => m.genre?.toLowerCase().includes('nigerian') || m.section?.toLowerCase().includes('nigerian') || m.genre?.toLowerCase().includes('nollywood'),
      count: movies.filter((m: any) => m.genre?.toLowerCase().includes('nigerian') || m.section?.toLowerCase().includes('nigerian') || m.genre?.toLowerCase().includes('nollywood')).length
    },
    {
      title: 'High School',
      emoji: '🎓',
      icon: GraduationCap,
      color: 'from-blue-600 to-cyan-600',
      filterFn: (m: any) => m.genre?.toLowerCase().includes('high school') || m.section?.toLowerCase().includes('high school') || m.genre?.toLowerCase().includes('teen'),
      count: movies.filter((m: any) => m.genre?.toLowerCase().includes('high school') || m.section?.toLowerCase().includes('high school') || m.genre?.toLowerCase().includes('teen')).length
    },
    {
      title: 'Music',
      emoji: '🎵',
      icon: Headphones,
      color: 'from-green-600 to-emerald-600',
      filterFn: (m: any) => m.category === 'music',
      count: movies.filter((m: any) => m.category === 'music').length
    }
  ];

  const handleCategoryClick = (category: any) => {
    const filtered = movies.filter(category.filterFn);
    setFilteredMovies(groupSeriesEpisodes(filtered));
    setSelectedCategory(category.title);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setFilteredMovies([]);
  };

  // If a category is selected, show the movies list
  if (selectedCategory) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-b from-black via-purple-950/20 to-black backdrop-blur-xl border-b border-purple-500/20 shadow-lg shadow-purple-500/10">
          <div className="px-4 py-4 flex items-center gap-4">
            <button
              onClick={handleBackToCategories}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 border border-white/20 hover:border-purple-400/50 transition-all shadow-lg hover:shadow-purple-500/50"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-black bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent flex items-center gap-2 drop-shadow-lg">
              {selectedCategory}
            </h1>
          </div>
        </div>

        {/* Scrollable Movie List */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-6 space-y-4 pb-24">
            {filteredMovies.length > 0 ? (
              filteredMovies.map((movie, index) => (
                <div 
                  key={movie.id}
                  className="flex gap-3 bg-gradient-to-r from-white/5 via-purple-500/5 to-transparent rounded-2xl p-3 border border-white/10 hover:border-purple-400/30 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
                >
                  {/* Rank Badge + Poster */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={movie.thumbnailUrl}
                      alt={movie.title}
                      className="w-24 h-36 rounded-xl object-cover shadow-xl"
                    />
                    <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center border-2 border-black shadow-lg">
                      <span className="text-white text-xs font-black">{index + 1}</span>
                    </div>
                    {movie.type === 'series' && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-purple-600/90 backdrop-blur-sm rounded-md flex items-center gap-1">
                        <Tv className="w-3 h-3 text-white" />
                        <span className="text-white text-xs font-black">
                          {movie.episodes?.length || 0} EP
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Movie Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="text-white font-black text-lg mb-1 line-clamp-1">{movie.title}</h3>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-2">{movie.description}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="px-2 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-purple-300 text-xs font-black">
                          {movie.genre}
                        </span>
                        <span className="px-2 py-1 bg-cyan-600/20 border border-cyan-500/30 rounded-full text-cyan-300 text-xs font-black">
                          {movie.year}
                        </span>
                        {movie.ageRating && (
                          <span className="px-2 py-1 bg-orange-600/20 border border-orange-500/30 rounded-full text-orange-300 text-xs font-black">
                            {movie.ageRating}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => onWatch(movie)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
                      >
                        <Play className="w-4 h-4 text-white fill-white" />
                        <span className="text-white text-sm font-black">Watch</span>
                      </button>
                      <button
                        onClick={() => onDownload(movie)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 hover:border-cyan-400/50 transition-all"
                      >
                        <Download className="w-4 h-4 text-cyan-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Film className="w-12 h-12 text-gray-600" />
                </div>
                <p className="text-gray-400 text-lg">No content found in this category</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show category grid
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-black to-black z-[100] overflow-y-auto pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 glass-card backdrop-blur-strong border-b border-purple-500/30">
        <div className="px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Browse All
              </h1>
              <p className="text-gray-400 text-xs">Explore entertainment library</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Category Grid */}
      <div className="px-4 py-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <button
              key={index}
              onClick={() => handleCategoryClick(category)}
              className="glass-card glass-card-hover rounded-2xl p-6 text-left group relative overflow-hidden slide-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color}/10 opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color}/20 flex items-center justify-center mb-3 float-animation`}>
                  <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <h3 className="font-black text-white mb-1">{category.title}</h3>
                <p className="text-sm text-gray-400">
                  {category.count} {category.title === 'Music' ? 'tracks' : category.title === 'All Movies' ? 'movies' : 'items'}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
