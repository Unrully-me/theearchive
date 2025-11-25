/**
 * Groups series episodes into single series cards
 * Returns movies and grouped series
 */
import type { Movie, Episode } from '../types/movie';

export function groupSeriesEpisodes(movies: Movie[]): Movie[] {
  const seriesGroups: { [key: string]: Movie[] } = {};
  const standaloneContent: Movie[] = [];
  
  console.log('🔍 Starting groupSeriesEpisodes with', movies.length, 'movies');
  
  // Separate series episodes from standalone content
  movies.forEach(movie => {
    if (movie.type === 'series' && movie.seriesTitle) {
      // Normalize the series title for grouping (case-insensitive, trim spaces)
      const key = movie.seriesTitle.toLowerCase().trim();
      if (!seriesGroups[key]) {
        seriesGroups[key] = [];
      }
      seriesGroups[key].push(movie);
      console.log(`📺 Grouped episode: "${movie.title}" → Series: "${movie.seriesTitle}"`);
    } else {
      // Keep standalone movies and music
      standaloneContent.push(movie);
    }
  });
  
  console.log('📊 Series groups found:', Object.keys(seriesGroups).length);
  console.log('📊 Standalone content:', standaloneContent.length);
  
  // Convert series groups into single series cards
  const groupedSeries: Movie[] = Object.entries(seriesGroups).map(([key, episodes]) => {
    console.log(`🎬 Creating series card for "${key}" with ${episodes.length} episodes`);
    
    // Sort episodes by season and episode number
    episodes.sort((a, b) => {
      if (a.seasonNumber !== b.seasonNumber) {
        return (a.seasonNumber || 0) - (b.seasonNumber || 0);
      }
      return (a.episodeNumber || 0) - (b.episodeNumber || 0);
    });
    
    // Find the first episode WITH a valid thumbnail
    const firstEpisodeWithThumbnail = episodes.find(ep => ep.thumbnailUrl && ep.thumbnailUrl.trim() !== '') || episodes[0];
    
    console.log(`🖼️ Series "${key}" - Using thumbnail from:`, firstEpisodeWithThumbnail.title);
    console.log(`🖼️ Thumbnail URL:`, firstEpisodeWithThumbnail.thumbnailUrl || '❌ MISSING!');
    
    // Convert episodes to Episode interface
    const episodeList: Episode[] = episodes.map(ep => ({
      id: ep.id,
      episodeNumber: ep.episodeNumber || 1,
      seasonNumber: ep.seasonNumber || 1,
      title: ep.title,
      description: ep.description,
      videoUrl: ep.videoUrl,
      thumbnailUrl: ep.thumbnailUrl,
      duration: ep.fileSize,
      releaseDate: ep.uploadedAt
    }));
    
    console.log(`✅ Series card created: "${firstEpisodeWithThumbnail.seriesTitle}" with ${episodeList.length} episodes`);
    
    // Create a series card using the episode with a valid thumbnail
    return {
      ...firstEpisodeWithThumbnail,
      title: firstEpisodeWithThumbnail.seriesTitle || firstEpisodeWithThumbnail.title,
      description: `${episodes.length} Episodes • ${firstEpisodeWithThumbnail.genre}`,
      thumbnailUrl: firstEpisodeWithThumbnail.thumbnailUrl, // Explicitly set thumbnail
      episodes: episodeList,
      type: 'series',
      id: `series-${firstEpisodeWithThumbnail.seriesTitle?.toLowerCase().replace(/\s+/g, '-')}-grouped`
    };
  });
  
  console.log('✅ Final result:', groupedSeries.length, 'series +', standaloneContent.length, 'standalone');
  
  // Combine grouped series with standalone content
  return [...groupedSeries, ...standaloneContent];
}