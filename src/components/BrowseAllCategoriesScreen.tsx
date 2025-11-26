import React from 'react';
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
  Globe
} from 'lucide-react';

interface BrowseAllCategoriesScreenProps {
  onClose: () => void;
  onCategorySelect: (title: string, emoji: string, filterFn: (movie: any) => boolean) => void;
  movies: any[];
}

export function BrowseAllCategoriesScreen({ 
  onClose, 
  onCategorySelect,
  movies 
}: BrowseAllCategoriesScreenProps) {
  
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
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
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
              onClick={() => {
                onCategorySelect(category.title, category.emoji, category.filterFn);
                onClose();
              }}
              className="glass-card glass-card-hover rounded-2xl p-6 text-left group relative overflow-hidden slide-in-up"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color}/10 opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color}/20 flex items-center justify-center mb-3 float-animation`}>
                  <Icon className={`w-6 h-6 text-${category.color.split(' ')[1].replace('to-', '')}`} strokeWidth={2} />
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
