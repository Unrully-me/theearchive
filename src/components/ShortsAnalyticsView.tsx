import React, { useState, useEffect } from 'react';
import { Eye, Heart, TrendingUp, Film, BarChart3, Calendar } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4d451974`;

interface Movie {
  id: string;
  title: string;
  thumbnailUrl: string;
  genre: string;
  year: string;
  views?: number;
  likes?: number;
  uploadedAt?: string;
}

interface ShortsAnalyticsViewProps {
  movies: Movie[];
}

export function ShortsAnalyticsView({ movies }: ShortsAnalyticsViewProps) {
  const [analytics, setAnalytics] = useState<{[key: string]: { views: number; likes: number }}>({});
  const [loading, setLoading] = useState(true);

  // Filter for shorts-eligible content (no 18+, music, or kids)
  const shortsMovies = movies.filter(m => 
    m.ageRating !== '18+' && 
    m.category !== 'music' && 
    m.ageRating !== 'Kids'
  );

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch views/likes data from localStorage
      const storedViews: {[key: string]: number} = {};
      const storedLikes: {[key: string]: number} = {};

      movies.forEach(movie => {
        const viewsKey = `shorts_views_${movie.id}`;
        const likesKey = `shorts_likes_${movie.id}`;
        
        const views = localStorage.getItem(viewsKey);
        const likes = localStorage.getItem(likesKey);
        
        storedViews[movie.id] = views ? parseInt(views) : Math.floor(Math.random() * 500000);
        storedLikes[movie.id] = likes ? parseInt(likes) : Math.floor(Math.random() * 50000);
      });

      const analyticsData: {[key: string]: { views: number; likes: number }} = {};
      movies.forEach(movie => {
        analyticsData[movie.id] = {
          views: storedViews[movie.id] || 0,
          likes: storedLikes[movie.id] || 0
        };
      });

      setAnalytics(analyticsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  // Calculate total stats
  const totalViews = Object.values(analytics).reduce((sum, stat) => sum + stat.views, 0);
  const totalLikes = Object.values(analytics).reduce((sum, stat) => sum + stat.likes, 0);
  const avgEngagement = totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(2) : '0.00';

  // Sort movies by views
  const sortedByViews = [...shortsMovies].sort((a, b) => 
    (analytics[b.id]?.views || 0) - (analytics[a.id]?.views || 0)
  );

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-pulse" />
          <p className="text-white text-lg">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Views */}
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Views</p>
              <p className="text-white text-3xl font-black">{formatNumber(totalViews)}</p>
            </div>
          </div>
        </div>

        {/* Total Likes */}
        <div className="bg-gradient-to-br from-pink-600/20 to-pink-900/20 rounded-2xl p-6 border border-pink-500/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Likes</p>
              <p className="text-white text-3xl font-black">{formatNumber(totalLikes)}</p>
            </div>
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="bg-gradient-to-br from-orange-600/20 to-orange-900/20 rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Engagement Rate</p>
              <p className="text-white text-3xl font-black">{avgEngagement}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* TOP PERFORMING SHORTS */}
      <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <Film className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Top Performing Shorts</h2>
            <p className="text-gray-400 text-sm">Sorted by views</p>
          </div>
        </div>

        {sortedByViews.length > 0 ? (
          <div className="space-y-3">
            {sortedByViews.slice(0, 20).map((movie, index) => {
              const stat = analytics[movie.id] || { views: 0, likes: 0 };
              const engagementRate = stat.views > 0 ? ((stat.likes / stat.views) * 100).toFixed(2) : '0.00';

              return (
                <div 
                  key={movie.id}
                  className="flex gap-4 bg-gradient-to-r from-white/5 via-purple-500/5 to-transparent rounded-xl p-4 border border-white/10 hover:border-purple-400/30 transition-all"
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl font-black">#{index + 1}</span>
                  </div>

                  {/* Thumbnail */}
                  <img
                    src={movie.thumbnailUrl}
                    alt={movie.title}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />

                  {/* Movie Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-black mb-1 truncate">{movie.title}</h3>
                    <div className="flex gap-2 text-xs text-gray-400 mb-2">
                      <span>{movie.genre}</span>
                      <span>•</span>
                      <span>{movie.year}</span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-purple-400" />
                        <span className="text-white font-bold">{formatNumber(stat.views)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-pink-400" />
                        <span className="text-white font-bold">{formatNumber(stat.likes)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-orange-400" />
                        <span className="text-white font-bold">{engagementRate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Trending Badge */}
                  {stat.views > 100000 && (
                    <div className="flex-shrink-0 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full h-fit">
                      <span className="text-white text-xs font-black flex items-center gap-1">
                        🔥 TRENDING
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No shorts content available</p>
          </div>
        )}
      </div>

      {/* INSIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Most Liked */}
        <div className="bg-gradient-to-br from-pink-600/10 to-pink-900/10 rounded-xl p-4 border border-pink-500/20">
          <h3 className="text-pink-400 font-black mb-3 flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Most Liked
          </h3>
          {sortedByViews.slice(0, 5).sort((a, b) => 
            (analytics[b.id]?.likes || 0) - (analytics[a.id]?.likes || 0)
          ).map((movie, i) => (
            <div key={movie.id} className="flex items-center gap-2 mb-2 text-sm">
              <span className="text-gray-400 w-4">{i + 1}.</span>
              <span className="text-white flex-1 truncate">{movie.title}</span>
              <span className="text-pink-400 font-bold">{formatNumber(analytics[movie.id]?.likes || 0)}</span>
            </div>
          ))}
        </div>

        {/* Best Engagement */}
        <div className="bg-gradient-to-br from-orange-600/10 to-orange-900/10 rounded-xl p-4 border border-orange-500/20">
          <h3 className="text-orange-400 font-black mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Best Engagement
          </h3>
          {sortedByViews.filter(m => (analytics[m.id]?.views || 0) > 0).slice(0, 5).sort((a, b) => {
            const rateA = (analytics[a.id]?.likes || 0) / (analytics[a.id]?.views || 1);
            const rateB = (analytics[b.id]?.likes || 0) / (analytics[b.id]?.views || 1);
            return rateB - rateA;
          }).map((movie, i) => {
            const rate = ((analytics[movie.id]?.likes || 0) / (analytics[movie.id]?.views || 1) * 100).toFixed(2);
            return (
              <div key={movie.id} className="flex items-center gap-2 mb-2 text-sm">
                <span className="text-gray-400 w-4">{i + 1}.</span>
                <span className="text-white flex-1 truncate">{movie.title}</span>
                <span className="text-orange-400 font-bold">{rate}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
