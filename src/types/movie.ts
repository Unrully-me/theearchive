export interface Episode {
  id: string;
  episodeNumber?: number;
  seasonNumber?: number;
  title: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: string;
  releaseDate?: string;
}

export interface Movie {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  genre?: string;
  year?: string;
  type?: string;
  fileSize?: string;
  category?: 'movie' | 'series' | 'music' | string;
  contentType?: 'music-video' | 'music-audio' | string;
  artist?: string;
  ageRating?: 'G' | 'PG' | 'PG-13' | 'R' | '18+' | 'Kids' | string;
  section?: string;
  uploadedAt?: string;
  episodes?: Episode[];
  rating?: string;
  seriesTitle?: string;
}

export interface DownloadedMovie extends Movie {
  downloadedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  accessToken?: string;
  personalPin?: string;
}

export default Movie;
