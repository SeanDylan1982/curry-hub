export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  filePath: string;
  fileSize: number; // in bytes
  format: 'MP3' | 'FLAC' | 'WAV' | 'AAC' | 'OGG';
  bitrate: number;
  sampleRate: number;
  
  // Metadata
  genre?: string;
  year?: number;
  trackNumber?: number;
  albumArtist?: string;
  composer?: string;
  lyrics?: string;
  
  // Statistics
  playCount: number;
  lastPlayed?: Date;
  dateAdded: Date;
  rating?: number; // 1-5 stars
  
  // Album Art
  albumArtPath?: string;
  albumArtUrl?: string;
  
  // Audio Analysis
  loudness?: number; // in dB
  tempo?: number; // BPM
  key?: string;
  mood?: 'energetic' | 'calm' | 'happy' | 'sad' | 'aggressive' | 'relaxed';
  
  // User Data
  isFavorite: boolean;
  tags: string[];
  playlistIds: string[];
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  year?: number;
  genre?: string;
  trackCount: number;
  totalDuration: number;
  albumArtPath?: string;
  albumArtUrl?: string;
  dateAdded: Date;
  playCount: number;
  lastPlayed?: Date;
  tracks: string[]; // track IDs
}

export interface Artist {
  id: string;
  name: string;
  genre?: string;
  biography?: string;
  imageUrl?: string;
  trackCount: number;
  albumCount: number;
  totalPlayCount: number;
  lastPlayed?: Date;
  dateDiscovered: Date;
  albums: string[]; // album IDs
  tracks: string[]; // track IDs
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverImagePath?: string;
  trackIds: string[];
  isSmartPlaylist: boolean;
  smartPlaylistRules?: SmartPlaylistRule[];
  dateCreated: Date;
  dateModified: Date;
  playCount: number;
  totalDuration: number;
  isPublic: boolean;
}

export interface SmartPlaylistRule {
  field: 'genre' | 'artist' | 'album' | 'year' | 'rating' | 'playCount' | 'lastPlayed' | 'dateAdded';
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'notEquals';
  value: string | number | Date;
}

export interface ListeningSession {
  id: string;
  startTime: Date;
  endTime: Date;
  trackIds: string[];
  totalDuration: number;
  deviceType: 'desktop' | 'mobile' | 'web';
}

export interface UserStats {
  totalListeningTime: number; // in seconds
  totalTracks: number;
  totalArtists: number;
  totalAlbums: number;
  totalPlaylists: number;
  favoriteGenre: string;
  topArtist: string;
  topTrack: string;
  currentStreak: number; // days
  longestStreak: number; // days
  avgDailyListening: number; // in seconds
  genreDistribution: { genre: string; percentage: number }[];
  listeningHistory: ListeningSession[];
}

export interface LibrarySettings {
  libraryPath: string;
  autoScan: boolean;
  scanInterval: number; // hours
  autoDownloadArt: boolean;
  autoDownloadMetadata: boolean;
  supportedFormats: string[];
  maxCacheSize: number; // MB
}

export interface AudioSettings {
  outputDevice: string;
  maxBitrate: number;
  volumeNormalization: boolean;
  crossfadeEnabled: boolean;
  crossfadeDuration: number; // seconds
  equalizerBands: number[]; // 10-band EQ
  equalizerPreset: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  showNotifications: boolean;
  enableStats: boolean;
  library: LibrarySettings;
  audio: AudioSettings;
}
