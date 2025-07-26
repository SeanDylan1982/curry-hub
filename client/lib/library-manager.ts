import { MusicTrack, Album, Artist, Playlist, UserStats, ListeningSession } from '@shared/music';
import { toast } from '@/components/ui/use-toast';
import path from 'path';

// API base URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api';

// Local storage keys
const STORAGE_KEYS = {
  TRACKS: 'musicbox_tracks',
  ALBUMS: 'musicbox_albums',
  ARTISTS: 'musicbox_artists',
  PLAYLISTS: 'musicbox_playlists',
  USER_STATS: 'musicbox_user_stats',
  LISTENING_HISTORY: 'musicbox_listening_history',
  LAST_SCAN: 'musicbox_last_scan',
  SETTINGS: 'musicbox_settings',
  LIBRARY_PATH: 'musicbox_library_path'
};

// Settings interface
export interface AppSettings {
  // Audio settings
  maxBitrate: string;
  audioDevice: string;
  highQualityAudio: boolean;
  volumeNormalization: boolean;
  crossfadeEnabled: boolean;
  crossfadeDuration: number;

  // Library settings
  libraryPath: string;
  autoScan: boolean;
  scanInterval: number;
  autoDownloadArt: boolean;
  autoDownloadMetadata: boolean;
  cacheSize: number;

  // Privacy & Stats
  enableStats: boolean;
  showNotifications: boolean;

  // Appearance
  theme: string;
  language: string;

  // Equalizer
  equalizerEnabled: boolean;
  equalizerBands: number[];
  equalizerPreset: string;
}

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  maxBitrate: "320",
  audioDevice: "default",
  highQualityAudio: true,
  volumeNormalization: true,
  crossfadeEnabled: false,
  crossfadeDuration: 5,
  libraryPath: "",
  autoScan: true,
  scanInterval: 24,
  autoDownloadArt: true,
  autoDownloadMetadata: true,
  cacheSize: 500,
  enableStats: true,
  showNotifications: true,
  theme: "dark",
  language: "en",
  equalizerEnabled: false,
  equalizerBands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  equalizerPreset: "Flat"
};

// Auto-generated playlist IDs
export const AUTO_PLAYLISTS = {
  RECENTLY_PLAYED: 'auto_recently_played',
  ALL_SONGS: 'auto_all_songs',
  LIKED_SONGS: 'auto_liked_songs',
  MOST_PLAYED: 'auto_most_played',
  RECENTLY_ADDED: 'auto_recently_added'
};

class LibraryManager {
  private tracks: Map<string, MusicTrack> = new Map();
  private albums: Map<string, Album> = new Map();
  private artists: Map<string, Artist> = new Map();
  private playlists: Map<string, Playlist> = new Map();
  private userStats: UserStats;
  private listeningHistory: ListeningSession[] = [];
  private recentlyPlayedTrackIds: string[] = [];
  private settings: AppSettings;

  constructor() {
    this.loadFromStorage();
    this.initializeAutoPlaylists();
    this.setupAutoScan();
  }

  // Load data from localStorage
  private loadFromStorage() {
    try {
      // Load tracks
      const tracksData = localStorage.getItem(STORAGE_KEYS.TRACKS);
      if (tracksData) {
        const tracks = JSON.parse(tracksData);
        tracks.forEach((track: MusicTrack) => {
          this.tracks.set(track.id, track);
        });
      }

      // Load albums
      const albumsData = localStorage.getItem(STORAGE_KEYS.ALBUMS);
      if (albumsData) {
        const albums = JSON.parse(albumsData);
        albums.forEach((album: Album) => {
          this.albums.set(album.id, album);
        });
      }

      // Load artists
      const artistsData = localStorage.getItem(STORAGE_KEYS.ARTISTS);
      if (artistsData) {
        const artists = JSON.parse(artistsData);
        artists.forEach((artist: Artist) => {
          this.artists.set(artist.id, artist);
        });
      }

      // Load playlists
      const playlistsData = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      if (playlistsData) {
        const playlists = JSON.parse(playlistsData);
        playlists.forEach((playlist: Playlist) => {
          this.playlists.set(playlist.id, playlist);
        });
      }

      // Load user stats
      const userStatsData = localStorage.getItem(STORAGE_KEYS.USER_STATS);
      if (userStatsData) {
        this.userStats = JSON.parse(userStatsData);
      } else {
        this.resetUserStats();
      }

      // Load listening history
      const historyData = localStorage.getItem(STORAGE_KEYS.LISTENING_HISTORY);
      if (historyData) {
        this.listeningHistory = JSON.parse(historyData);
        // Extract recently played track IDs
        this.recentlyPlayedTrackIds = this.listeningHistory
          .flatMap(session => session.trackIds)
          .slice(-100); // Keep last 100
      }

      // Load settings
      const settingsData = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (settingsData) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(settingsData) };
      } else {
        this.settings = { ...DEFAULT_SETTINGS };
      }

    } catch (error) {
      console.error('Error loading library data:', error);
      this.resetUserStats();
      this.settings = { ...DEFAULT_SETTINGS };
    }
  }

  // Save data to localStorage
  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.TRACKS, JSON.stringify(Array.from(this.tracks.values())));
      localStorage.setItem(STORAGE_KEYS.ALBUMS, JSON.stringify(Array.from(this.albums.values())));
      localStorage.setItem(STORAGE_KEYS.ARTISTS, JSON.stringify(Array.from(this.artists.values())));
      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(Array.from(this.playlists.values())));
      localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(this.userStats));
      localStorage.setItem(STORAGE_KEYS.LISTENING_HISTORY, JSON.stringify(this.listeningHistory));
      this.saveSettings(this.settings);
    } catch (error) {
      console.error('Error saving library data:', error);
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  /**
   * Toggle favorite status of a track
   */
  public toggleFavorite(trackId: string): void {
    const track = this.tracks.get(trackId);
    if (track) {
      track.isFavorite = !track.isFavorite;
      this.saveToStorage();
    }
  }

  // Reset all stats counters
  resetUserStats() {
    this.userStats = {
      totalListeningTime: 0,
      totalTracks: this.tracks.size,
      totalArtists: this.artists.size,
      totalAlbums: this.albums.size,
      totalPlaylists: this.playlists.size,
      favoriteGenre: '',
      topArtist: '',
      topTrack: '',
      currentStreak: 0,
      longestStreak: 0,
      avgDailyListening: 0,
      genreDistribution: [],
      listeningHistory: []
    };

    // Reset all track play counts
    this.tracks.forEach(track => {
      track.playCount = 0;
      track.lastPlayed = undefined;
    });

    // Reset all album play counts
    this.albums.forEach(album => {
      album.playCount = 0;
      album.lastPlayed = undefined;
    });

    // Reset all artist play counts
    this.artists.forEach(artist => {
      artist.totalPlayCount = 0;
      artist.lastPlayed = undefined;
    });

    this.listeningHistory = [];
    this.recentlyPlayedTrackIds = [];
    this.saveToStorage();
  }

  // Initialize auto-generated playlists
  private initializeAutoPlaylists() {
    // Recently Played playlist
    if (!this.playlists.has(AUTO_PLAYLISTS.RECENTLY_PLAYED)) {
      this.playlists.set(AUTO_PLAYLISTS.RECENTLY_PLAYED, {
        id: AUTO_PLAYLISTS.RECENTLY_PLAYED,
        name: 'Recently Played',
        description: 'Your last 100 played tracks',
        trackIds: [],
        isSmartPlaylist: true,
        dateCreated: new Date(),
        dateModified: new Date(),
        playCount: 0,
        totalDuration: 0,
        isPublic: false
      });
    }

    // All Songs playlist
    if (!this.playlists.has(AUTO_PLAYLISTS.ALL_SONGS)) {
      this.playlists.set(AUTO_PLAYLISTS.ALL_SONGS, {
        id: AUTO_PLAYLISTS.ALL_SONGS,
        name: 'All Songs',
        description: 'Every song in your library',
        trackIds: Array.from(this.tracks.keys()),
        isSmartPlaylist: true,
        dateCreated: new Date(),
        dateModified: new Date(),
        playCount: 0,
        totalDuration: 0,
        isPublic: false
      });
    }

    // Liked Songs playlist
    if (!this.playlists.has(AUTO_PLAYLISTS.LIKED_SONGS)) {
      this.playlists.set(AUTO_PLAYLISTS.LIKED_SONGS, {
        id: AUTO_PLAYLISTS.LIKED_SONGS,
        name: 'Liked Songs',
        description: 'Songs you\'ve liked',
        trackIds: Array.from(this.tracks.values()).filter(track => track.isFavorite).map(track => track.id),
        isSmartPlaylist: true,
        dateCreated: new Date(),
        dateModified: new Date(),
        playCount: 0,
        totalDuration: 0,
        isPublic: false
      });
    }

    // Most Played playlist
    if (!this.playlists.has(AUTO_PLAYLISTS.MOST_PLAYED)) {
      this.playlists.set(AUTO_PLAYLISTS.MOST_PLAYED, {
        id: AUTO_PLAYLISTS.MOST_PLAYED,
        name: 'Most Played',
        description: 'Your most played tracks',
        trackIds: Array.from(this.tracks.values())
          .filter(track => track.playCount > 0)
          .sort((a, b) => b.playCount - a.playCount)
          .slice(0, 100)
          .map(track => track.id),
        isSmartPlaylist: true,
        dateCreated: new Date(),
        dateModified: new Date(),
        playCount: 0,
        totalDuration: 0,
        isPublic: false
      });
    }

    // Recently Added playlist
    if (!this.playlists.has(AUTO_PLAYLISTS.RECENTLY_ADDED)) {
      this.playlists.set(AUTO_PLAYLISTS.RECENTLY_ADDED, {
        id: AUTO_PLAYLISTS.RECENTLY_ADDED,
        name: 'Recently Added',
        description: 'Recently added to your library',
        trackIds: Array.from(this.tracks.values())
          .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
          .slice(0, 100)
          .map(track => track.id),
        isSmartPlaylist: true,
        dateCreated: new Date(),
        dateModified: new Date(),
        playCount: 0,
        totalDuration: 0,
        isPublic: false
      });
    }

    this.updateAutoPlaylists();
  }

  // Update auto-generated playlists
  private updateAutoPlaylists() {
    // Update Recently Played
    const recentlyPlayedPlaylist = this.playlists.get(AUTO_PLAYLISTS.RECENTLY_PLAYED);
    if (recentlyPlayedPlaylist) {
      recentlyPlayedPlaylist.trackIds = [...this.recentlyPlayedTrackIds];
      recentlyPlayedPlaylist.dateModified = new Date();
    }

    // Update All Songs
    const allSongsPlaylist = this.playlists.get(AUTO_PLAYLISTS.ALL_SONGS);
    if (allSongsPlaylist) {
      allSongsPlaylist.trackIds = Array.from(this.tracks.keys());
      allSongsPlaylist.dateModified = new Date();
    }

    // Update Liked Songs
    const likedSongsPlaylist = this.playlists.get(AUTO_PLAYLISTS.LIKED_SONGS);
    if (likedSongsPlaylist) {
      likedSongsPlaylist.trackIds = Array.from(this.tracks.values())
        .filter(track => track.isFavorite)
        .map(track => track.id);
      likedSongsPlaylist.dateModified = new Date();
    }

    // Update Most Played
    const mostPlayedPlaylist = this.playlists.get(AUTO_PLAYLISTS.MOST_PLAYED);
    if (mostPlayedPlaylist) {
      mostPlayedPlaylist.trackIds = Array.from(this.tracks.values())
        .filter(track => track.playCount > 0)
        .sort((a, b) => b.playCount - a.playCount)
        .slice(0, 100)
        .map(track => track.id);
      mostPlayedPlaylist.dateModified = new Date();
    }

    // Update Recently Added
    const recentlyAddedPlaylist = this.playlists.get(AUTO_PLAYLISTS.RECENTLY_ADDED);
    if (recentlyAddedPlaylist) {
      recentlyAddedPlaylist.trackIds = Array.from(this.tracks.values())
        .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
        .slice(0, 100)
        .map(track => track.id);
      recentlyAddedPlaylist.dateModified = new Date();
    }
  }

  // Add new track to library
  addTrack(track: MusicTrack) {
    this.tracks.set(track.id, track);
    this.updateAutoPlaylists();
    this.updateUserStats();
    this.saveToStorage();
  }

  // Add multiple tracks (for bulk import)
  addTracks(tracks: MusicTrack[]) {
    tracks.forEach(track => {
      this.tracks.set(track.id, track);
    });
    this.updateAutoPlaylists();
    this.updateUserStats();
    this.saveToStorage();
  }

  // Record track play
  playTrack(trackId: string) {
    const track = this.tracks.get(trackId);
    if (!track) return;

    // Update track stats
    track.playCount++;
    track.lastPlayed = new Date();

    // Update recently played
    const existingIndex = this.recentlyPlayedTrackIds.indexOf(trackId);
    if (existingIndex > -1) {
      this.recentlyPlayedTrackIds.splice(existingIndex, 1);
    }
    this.recentlyPlayedTrackIds.unshift(trackId);
    
    // Keep only last 100
    if (this.recentlyPlayedTrackIds.length > 100) {
      this.recentlyPlayedTrackIds = this.recentlyPlayedTrackIds.slice(0, 100);
    }

    // Update album stats
    const album = this.albums.get(track.album);
    if (album) {
      album.playCount++;
      album.lastPlayed = new Date();
    }

    // Update artist stats
    const artist = this.artists.get(track.artist);
    if (artist) {
      artist.totalPlayCount++;
      artist.lastPlayed = new Date();
    }
  }

  private setupAutoScan() {
    if (this.settings.autoScan && this.settings.libraryPath) {
      // Run initial scan
      this.scanLibrary(this.settings.libraryPath);
      
      // Set up periodic scans
      setInterval(() => {
        this.scanLibrary(this.settings.libraryPath);
      }, this.settings.scanInterval * 60 * 1000);
    }
  }

  /**
   * Scan a directory for music files using the backend API
   */
  public async scanLibrary(directory: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/library/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ directory }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to scan directory');
      }

      const data = await response.json();
      
      if (data.success && data.files) {
        // Convert file metadata to MusicTrack format
        const newTracks = data.files.map((file: any) => this.fileToTrack(file));
        
        // Add new tracks to library
        this.addTracks(newTracks);
        
        // Save the library path if this is a new scan
        if (directory !== this.settings.libraryPath) {
          this.updateSetting('libraryPath', directory);
          localStorage.setItem(STORAGE_KEYS.LIBRARY_PATH, directory);
        }
        
        // Save the last scan time
        localStorage.setItem(STORAGE_KEYS.LAST_SCAN, new Date().toISOString());
        
        // Show success message
        toast({
          title: 'Library updated',
          description: `Found ${data.count} music files in ${path.basename(directory)}`,
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error scanning library:', error);
      toast({
        title: 'Error scanning library',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  }
  
  /**
   * Convert file metadata to MusicTrack format
   */
  private fileToTrack(file: any): MusicTrack {
    // Extract basic info from path
    const pathInfo = path.parse(file.path);
    const pathParts = file.path.split(/[\\/]/);
    const artistFromPath = pathParts.length > 1 ? pathParts[pathParts.length - 2] : 'Unknown Artist';
    
    return {
      id: `file-${file.path.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`,
      title: pathInfo.name.replace(/[-_]/g, ' '),
      artist: artistFromPath,
      album: pathParts.length > 2 ? pathParts[pathParts.length - 2] : 'Unknown Album',
      duration: file.duration || 0,
      path: file.path,
      size: file.size || 0,
      bitrate: file.bitrate || 0,
      sampleRate: file.sampleRate || 44100,
      channels: file.channels || 2,
      format: file.type || pathInfo.ext.replace('.', '') || 'mp3',
      addedAt: new Date().toISOString(),
      lastPlayed: null,
      playCount: 0,
      favorite: false,
      genre: file.genre || 'Unknown',
      year: file.year || new Date().getFullYear(),
      // Additional metadata that might be useful
      metadata: {
        lastModified: file.lastModified || new Date().toISOString(),
        path: file.path,
      },
    };
  }

  /**
   * Simulate discovering new music files (for testing/demo purposes)
   */
  private simulateLibraryScan(): void {
    const lastScan = localStorage.getItem(STORAGE_KEYS.LAST_SCAN);
    const now = new Date();
    
    // Simulate finding new tracks occasionally (10% chance every scan)
    if (Math.random() < 0.1) {
      this.simulateNewTrack();
    }

    localStorage.setItem(STORAGE_KEYS.LAST_SCAN, now.toISOString());
  }

  /**
   * Get all tracks in the library
   */
  public getTracks(): MusicTrack[] {
    return Array.from(this.tracks.values());
  }

  /**
   * Get all albums in the library
   */
  public getAlbums(): Album[] {
    return Array.from(this.albums.values());
  }

  /**
   * Get all artists in the library
   */
  public getArtists(): Artist[] {
    return Array.from(this.artists.values());
  }

  /**
   * Get all playlists
   */
  public getPlaylists(): Playlist[] {
    return Array.from(this.playlists.values());
  }

  /**
   * Get a track by ID
   */
  public getTrack(id: string): MusicTrack | undefined {
    return this.tracks.get(id);
  }

  /**
   * Get a playlist by ID
   */
  public getPlaylist(id: string): Playlist | undefined {
    return this.playlists.get(id);
  }

  /**
   * Search tracks by query
   */
  public searchTracks(query: string): MusicTrack[] {
    const lowerQuery = query.toLowerCase();
    return this.getTracks().filter(track => 
      track.title.toLowerCase().includes(lowerQuery) ||
      track.artist.toLowerCase().includes(lowerQuery) ||
      track.album.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Toggle favorite status of a track
   */
  public toggleFavorite(trackId: string): void {
    const track = this.tracks.get(trackId);
    if (track) {
      track.favorite = !track.favorite;
      this.saveToStorage();
    }
  }

  /**
   * Get current settings
   */
  public getSettings(): AppSettings {
    return { ...this.settings };
  }

  /**
   * Update a specific setting
   */
  public updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    if (key in this.settings) {
      this.settings[key] = value;
      this.saveSettings(this.settings);
      
      // Special handling for certain settings
      if (key === 'libraryPath' || key === 'autoScan' || key === 'scanInterval') {
        this.setupAutoScan();
      }
    }
  }

  /**
   * Update multiple settings at once
   */
  public updateSettings(settings: Partial<AppSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.saveSettings(this.settings);
    this.setupAutoScan();
  }

  /**
   * Reset settings to defaults
   */
  public resetSettings(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings(this.settings);
    this.setupAutoScan();
  }

  /**
   * Export current settings as JSON string
   */
  public exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * Import settings from JSON string
   */
  public importSettings(settingsJson: string): boolean {
    try {
      const importedSettings = JSON.parse(settingsJson);
      this.updateSettings(importedSettings);
      return true;
    } catch (error) {
      console.error('Error importing settings:', error);
      return false;
    }
  }

  /**
   * Initialize with sample data if empty
   */
  public initializeSampleLibrary(): void {
    if (this.tracks.size === 0) {
      const sampleTracks: MusicTrack[] = [
        {
          id: 'track-1',
          title: 'Sample Track 1',
          artist: 'Sample Artist',
          album: 'Sample Album',
          duration: 180,
          path: '/path/to/sample1.mp3',
          size: 1024 * 1024 * 5, // 5MB
          format: 'mp3',
          bitrate: 320,
          sampleRate: 44100,
          genre: 'Sample',
          year: 2024,
          playCount: 0,
          dateAdded: new Date(),
          isFavorite: false,
          tags: [],
          playlistIds: []
        },
        // Add more sample tracks as needed
      ];

      sampleTracks.forEach(track => this.addTrack(track));
    }
  }

  // Simulate adding a new track to the library
  private simulateNewTrack() {
    const artists = ['The Beatles', 'Pink Floyd', 'Led Zeppelin', 'Queen', 'Bob Dylan', 'David Bowie'];
    const titles = ['New Song', 'Latest Track', 'Fresh Beat', 'Discovery', 'Hidden Gem'];
    
    const artist = artists[Math.floor(Math.random() * artists.length)];
    const title = titles[Math.floor(Math.random() * titles.length)];
    
    const newTrack: MusicTrack = {
      id: `track_${Date.now()}`,
      title: `${title} ${Math.floor(Math.random() * 100)}`,
      artist,
      album: `${artist} Collection`,
      duration: 180 + Math.floor(Math.random() * 120), // 3-5 minutes
      path: `/Music/${artist}/${title}.mp3`,
      size: 4 * 1024 * 1024, // 4MB
      format: 'MP3',
      bitrate: 320,
      sampleRate: 44100,
      genre: 'Rock',
      year: 2024,
      playCount: 0,
      dateAdded: new Date().toISOString(),
      isFavorite: false,
      tags: [],
      playlistIds: [],
      lastPlayed: null,
      metadata: {}
    };

    this.addTrack(newTrack);
    
    // Show notification (in a real app)
    console.log(`New track discovered: ${newTrack.title} by ${newTrack.artist}`);
  }

  // Update user statistics
  private updateUserStats() {
    this.userStats.totalTracks = this.tracks.size;
    this.userStats.totalAlbums = this.albums.size;
    this.userStats.totalArtists = this.artists.size;
    this.userStats.totalPlaylists = this.playlists.size;

    // Calculate genre distribution
    const genreCount = new Map<string, number>();
    this.tracks.forEach(track => {
      if (track.genre) {
        genreCount.set(track.genre, (genreCount.get(track.genre) || 0) + 1);
      }
    });

    this.userStats.genreDistribution = Array.from(genreCount.entries())
      .map(([genre, count]) => ({
        genre,
        percentage: Math.round((count / this.tracks.size) * 100)
      }))
      .sort((a, b) => b.percentage - a.percentage);

    // Find favorite genre
    if (this.userStats.genreDistribution.length > 0) {
      this.userStats.favoriteGenre = this.userStats.genreDistribution[0].genre;
    }

    // Find top track and artist
    const tracksArray = Array.from(this.tracks.values());
    const topTrack = tracksArray.reduce((prev, current) => 
      (current.playCount > prev.playCount) ? current : prev, tracksArray[0]);
    
    if (topTrack) {
      this.userStats.topTrack = topTrack.title;
      this.userStats.topArtist = topTrack.artist;
    }
  }

  // Public getters
  getTracks() { return Array.from(this.tracks.values()); }
  getAlbums() { return Array.from(this.albums.values()); }
  getArtists() { return Array.from(this.artists.values()); }
  getPlaylists() { return Array.from(this.playlists.values()); }
  getUserStats() { return this.userStats; }
  getRecentlyPlayed() { return this.recentlyPlayedTrackIds.map(id => this.tracks.get(id)).filter(Boolean) as MusicTrack[]; }

  // Get specific playlist
  getPlaylist(id: string) { return this.playlists.get(id); }
  
  // Get track by ID
  getTrack(id: string) { return this.tracks.get(id); }

  // Search tracks
  searchTracks(query: string) {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.tracks.values()).filter(track =>
      track.title.toLowerCase().includes(lowercaseQuery) ||
      track.artist.toLowerCase().includes(lowercaseQuery) ||
      track.album.toLowerCase().includes(lowercaseQuery) ||
      (track.genre && track.genre.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Toggle track favorite status
  toggleFavorite(trackId: string) {
    const track = this.tracks.get(trackId);
    if (track) {
      track.isFavorite = !track.isFavorite;
      this.updateAutoPlaylists();
      this.saveToStorage();
    }
  }

  // Settings management
  getSettings(): AppSettings {
    return { ...this.settings };
  }

  updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    this.settings = { ...this.settings, [key]: value };
    this.saveToStorage();

    // Apply settings that affect functionality
    if (key === 'autoScan') {
      this.setupAutoScan();
    }
  }

  updateSettings(newSettings: Partial<AppSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveToStorage();
    this.setupAutoScan(); // Reapply auto-scan setting
  }

  resetSettings() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveToStorage();
    this.setupAutoScan();
  }

  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  importSettings(settingsJson: string): boolean {
    try {
      const importedSettings = JSON.parse(settingsJson);
      // Validate that imported settings match our interface
      const validatedSettings = { ...DEFAULT_SETTINGS, ...importedSettings };
      this.settings = validatedSettings;
      this.saveToStorage();
      this.setupAutoScan();
      return true;
    } catch (error) {
      console.error('Error importing settings:', error);
      return false;
    }
  }
}

// Create singleton instance
export const libraryManager = new LibraryManager();

// Initialize with sample data if empty
export const initializeSampleLibrary = () => {
  if (libraryManager.getTracks().length === 0) {
    const sampleTracks: MusicTrack[] = [
      {
        id: 'track_1',
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        album: 'A Night at the Opera',
        duration: 355,
        filePath: '/Music/Queen/A Night at the Opera/01 - Bohemian Rhapsody.mp3',
        fileSize: 8.4 * 1024 * 1024,
        format: 'MP3',
        bitrate: 320,
        sampleRate: 44100,
        genre: 'Rock',
        year: 1975,
        playCount: 0,
        dateAdded: new Date('2024-01-15'),
        isFavorite: false,
        tags: [],
        playlistIds: []
      },
      {
        id: 'track_2',
        title: 'Hotel California',
        artist: 'Eagles',
        album: 'Hotel California',
        duration: 391,
        filePath: '/Music/Eagles/Hotel California/02 - Hotel California.flac',
        fileSize: 9.2 * 1024 * 1024,
        format: 'FLAC',
        bitrate: 1411,
        sampleRate: 44100,
        genre: 'Rock',
        year: 1976,
        playCount: 0,
        dateAdded: new Date('2024-01-14'),
        isFavorite: false,
        tags: [],
        playlistIds: []
      },
      {
        id: 'track_3',
        title: 'Stairway to Heaven',
        artist: 'Led Zeppelin',
        album: 'Led Zeppelin IV',
        duration: 482,
        filePath: '/Music/Led Zeppelin/Led Zeppelin IV/04 - Stairway to Heaven.mp3',
        fileSize: 11.5 * 1024 * 1024,
        format: 'MP3',
        bitrate: 320,
        sampleRate: 44100,
        genre: 'Rock',
        year: 1971,
        playCount: 0,
        dateAdded: new Date('2024-01-13'),
        isFavorite: false,
        tags: [],
        playlistIds: []
      }
    ];

    libraryManager.addTracks(sampleTracks);
  }
};
