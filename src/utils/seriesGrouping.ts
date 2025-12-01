// Utility to group series episodes into single cards

export interface Movie {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  genre: string;
  year: string;
  type: string;
  duration?: string; // <-- ADDED: Missing duration field (prevents circular ref bugs)
  fileSize?: string;
  category?: 'movie' | 'series' | 'music';
  contentType?: 'music-video' | 'music-audio'; // <-- ADDED: For music section
  artist?: string; // <-- ADDED: For music section
  ageRating?: 'G' | 'PG' | 'PG-13' | 'R' | '18+' | 'Kids';
  section?: string;
  uploadedAt?: string;
  episodes?: Episode[];
  rating?: string;
  // For series organization
  seriesTitle?: string;
  seasonNumber?: number;
  episodeNumber?: number;
}

export interface Episode {
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

export interface GroupedSeries extends Movie {
  episodes: Episode[];
  type: 'series';
}

/**
 * Extract series title from a full episode title
 * E.g., "Breaking Bad S01E01 - Pilot" -> "Breaking Bad"
 */
export function extractSeriesTitle(title: string): string {
  // Remove common patterns like S01E01, Season 1 Episode 1, etc.
  let cleaned = title
    // FIRST: Remove S01.E01 format from START (important for "S01.E04.HOSTAGE_VJ JR")
    .replace(/^S\d+\.E\d+\./gi, '')
    .replace(/\s*S\d+E\d+\s*/gi, '') // Remove S01E01
    .replace(/\s*Season\s+\d+\s+Episode\s+\d+\s*/gi, '') // Remove Season 1 Episode 1
    .replace(/\s*Season\s+\d+\s*/gi, '') // Remove Season 1
    .replace(/\s*Ep\.?\s*\d+\s*/gi, '') // Remove Ep 1 or Ep. 1
    .replace(/\s*Episode\s+\d+\s*/gi, '') // Remove Episode 1
    .replace(/\s*-\s*Episode\s+\d+\s*/gi, '') // Remove - Episode 1
    .replace(/\s+Episode$/gi, '') // Remove trailing "Episode"
    // NORMALIZE: Replace underscores with spaces
    .replace(/_/g, ' ')
    .replace(/\s*-\s*.*$/, '') // Remove everything after dash
    .replace(/\s*:\s*.*$/, '') // Remove everything after colon
    // CLEAN: Remove trailing periods and extra spaces
    .replace(/\.+$/g, '') // Remove trailing periods
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
  
  return cleaned || title;
}

/**
 * Extract season and episode numbers from title
 */
export function extractEpisodeInfo(title: string): { season: number; episode: number } | null {
  // Try S01E01 format
  const match1 = title.match(/S(\d+)E(\d+)/i);
  if (match1) {
    return {
      season: parseInt(match1[1], 10),
      episode: parseInt(match1[2], 10)
    };
  }

  // Try Season 1 Episode 1 format
  const match2 = title.match(/Season\s+(\d+)\s+Episode\s+(\d+)/i);
  if (match2) {
    return {
      season: parseInt(match2[1], 10),
      episode: parseInt(match2[2], 10)
    };
  }

  // Try Ep 1 format
  const match3 = title.match(/Ep\s*(\d+)/i);
  if (match3) {
    return {
      season: 1,
      episode: parseInt(match3[1], 10)
    };
  }

  return null;
}

/**
 * Groups series episodes into single series cards
 * - Automatically detects series by extracting series title from episode titles
 * - Groups all episodes with the same series title into one card
 * - Regular movies are returned as-is
 * - Series with episodes already defined are returned as-is
 */
export function groupSeriesEpisodes(movies: Movie[]): Movie[] {
  const seriesMap = new Map<string, Movie[]>();
  const processedIds = new Set<string>();
  const result: Movie[] = [];

  console.log('🎯 GROUPING START - Total movies:', movies.length);
  
  // DEBUG: Find all Hostage-related items
  const hostageItems = movies.filter(m => m.title.toLowerCase().includes('hostage'));
  if (hostageItems.length > 0) {
    console.log('🚨 HOSTAGE DEBUG - Found items:', hostageItems.length);
    hostageItems.forEach(item => {
      console.log('🔍 HOSTAGE ITEM:', {
        title: item.title,
        type: item.type,
        seriesTitle: item.seriesTitle,
        id: item.id
      });
    });
  }
  
  // First pass: group all series
  movies.forEach(movie => {
    // Skip if already processed
    if (processedIds.has(movie.id)) return;

    // Determine if this is a series - CHECK MULTIPLE CONDITIONS
    const hasEpisodePattern = /Episode\s+\d+|EP\s*\d+|Ep\s*\d+|S\d+E\d+|S\d+\.E\d+/i.test(movie.title);
    const isSeries = movie.type === 'series' || !!movie.seriesTitle || hasEpisodePattern;
    
    if (isSeries) {
      // Get the series title - USE seriesTitle if available, otherwise extract from title
      let seriesTitle = movie.seriesTitle || extractSeriesTitle(movie.title);
      
      // DEBUG: Log extraction
      console.log(`🔍 Processing: "${movie.title}" -> Series: "${seriesTitle}"`);
      
      // NORMALIZE: lowercase and trim to ensure exact matching
      seriesTitle = seriesTitle.toLowerCase().trim();
      
      // DEBUG: Log normalized key
      console.log(`   🔑 Normalized key: "${seriesTitle}"`);
      
      // Add to series map
      if (!seriesMap.has(seriesTitle)) {
        seriesMap.set(seriesTitle, []);
        console.log(`   ✨ Created new series group: "${seriesTitle}"`);
      } else {
        console.log(`   ➕ Added to existing group: "${seriesTitle}"`);
      }
      seriesMap.get(seriesTitle)!.push(movie);
    } else {
      // Regular movie - add directly to result
      result.push(movie);
      processedIds.add(movie.id);
    }
  });

  // Second pass: create grouped series cards
  seriesMap.forEach((episodeMovies, seriesKey) => {
    // Mark all as processed
    episodeMovies.forEach(m => processedIds.add(m.id));

    // If only one episode and it already has episodes array, use it as-is
    if (episodeMovies.length === 1 && episodeMovies[0].episodes && episodeMovies[0].episodes.length > 0) {
      result.push(episodeMovies[0]);
      return;
    }

    // DEBUG: Log thumbnail info for Dope and Hostage
    if (seriesKey.includes('dope') || seriesKey.includes('hostage')) {
      console.log(`🖼️ THUMBNAIL DEBUG for "${seriesKey}":`, {
        totalEpisodes: episodeMovies.length,
        thumbnails: episodeMovies.map(m => ({
          title: m.title,
          thumbnailUrl: m.thumbnailUrl,
          hasValidThumbnail: !!(m.thumbnailUrl && m.thumbnailUrl.trim() !== '')
        }))
      });
    }

    // Build episodes array from all grouped movies
    const episodes: Episode[] = episodeMovies.map(movie => {
      const episodeInfo = extractEpisodeInfo(movie.title);
      
      return {
        id: movie.id,
        episodeNumber: movie.episodeNumber || episodeInfo?.episode || 1,
        seasonNumber: movie.seasonNumber || episodeInfo?.season || 1,
        title: movie.title,
        description: movie.description,
        videoUrl: movie.videoUrl,
        thumbnailUrl: movie.thumbnailUrl,
        duration: movie.fileSize,
        releaseDate: movie.year
      };
    });

    // Sort episodes by season and episode number
    episodes.sort((a, b) => {
      if (a.seasonNumber !== b.seasonNumber) {
        return a.seasonNumber - b.seasonNumber;
      }
      return a.episodeNumber - b.episodeNumber;
    });

    // Find the BEST episode to use as the base for the series card
    // Priority: 1) Episode 1 with valid thumbnail, 2) Any episode with valid thumbnail, 3) First episode
    const episode1 = episodeMovies.find(m => {
      const info = extractEpisodeInfo(m.title);
      return info?.episode === 1 && m.thumbnailUrl && m.thumbnailUrl.trim() !== '';
    });
    
    const episodeWithThumbnail = episodeMovies.find(m => m.thumbnailUrl && m.thumbnailUrl.trim() !== '');
    
    const baseMovie = episode1 || episodeWithThumbnail || episodeMovies[0];
    
    // DEBUG: Log selected thumbnail
    if (seriesKey.includes('dope') || seriesKey.includes('hostage')) {
      console.log(`🎨 SELECTED BASE MOVIE for "${seriesKey}":`, {
        selectedTitle: baseMovie.title,
        selectedThumbnail: baseMovie.thumbnailUrl,
        isEpisode1: !!episode1,
        hasValidThumbnail: !!(baseMovie.thumbnailUrl && baseMovie.thumbnailUrl.trim() !== '')
      });
    }
    
    // Get the PROPER CASE series title from the first episode's seriesTitle
    const displayTitle = baseMovie.seriesTitle || extractSeriesTitle(baseMovie.title);

    // Create a single series card with all episodes
    // CRITICAL: Build a CLEAN object without spreading baseMovie to avoid circular references!
    // DO NOT use {...baseMovie} as it can copy HTMLVideoElement refs and cause JSON.stringify errors
    const groupedSeries: Movie = {
      id: `series-${seriesKey.replace(/\s+/g, '-')}`,
      title: displayTitle,  // Use PROPER CASE title for display
      description: baseMovie.description || `${episodes.length} episode${episodes.length > 1 ? 's' : ''} available`,
      videoUrl: baseMovie.videoUrl || '',
      thumbnailUrl: baseMovie.thumbnailUrl || '',  // EXPLICITLY set thumbnail from base movie
      genre: baseMovie.genre || '',
      year: baseMovie.year || '',
      type: 'series',
      // Only copy safe, primitive fields from baseMovie
      duration: baseMovie.duration,
      fileSize: baseMovie.fileSize,
      category: baseMovie.category || 'series',
      contentType: baseMovie.contentType,
      artist: baseMovie.artist,
      ageRating: baseMovie.ageRating,
      section: baseMovie.section,
      uploadedAt: baseMovie.uploadedAt,
      rating: baseMovie.rating,
      seriesTitle: displayTitle,
      // Add the cleaned episodes array
      episodes: episodes
    };
    
    // DEBUG: Log final grouped series
    if (seriesKey.includes('dope') || seriesKey.includes('hostage')) {
      console.log(`✅ FINAL GROUPED SERIES for "${seriesKey}":`, {
        id: groupedSeries.id,
        title: groupedSeries.title,
        thumbnailUrl: groupedSeries.thumbnailUrl,
        episodeCount: groupedSeries.episodes?.length
      });
    }

    result.push(groupedSeries);
  });
  
  console.log('✅ GROUPING COMPLETE:');
  console.log(`  📥 Input: ${movies.length} items`);
  console.log(`  📤 Output: ${result.length} items`);
  console.log(`  📁 Series created: ${seriesMap.size}`);
  console.log(`  🎬 Regular movies: ${result.filter(m => m.type !== 'series').length}`);
  console.log('  📺 Series with episodes:', result.filter(m => m.type === 'series' && m.episodes).map(s => ({
    title: s.title,
    episodes: s.episodes?.length
  })));

  return result;
}