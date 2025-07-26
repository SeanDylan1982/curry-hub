// PearAI: World-class scalable Zustand store for Curry Hub
import { create } from 'zustand'

/** Types **/
export interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  filePath: string
  artworkUrl?: string
}

export interface Playlist {
  id: string
  name: string
  trackIds: string[]
  artworkUrl?: string
}

export interface MediaLibraryState {
  tracks: Track[]
  playlists: Playlist[]
  folders: string[]
  isScanning: boolean
  scanError: string | null
  scanLibrary: (folderPaths: string[]) => Promise<void>
  addFolder: (folder: string) => void
  removeFolder: (folder: string) => void
}

export interface PlaybackState {
  currentTrackId: string | null
  isPlaying: boolean
  volume: number
  queue: string[] // track IDs
  play: (trackId: string) => void
  pause: () => void
  next: () => void
  prev: () => void
  setQueue: (trackIds: string[]) => void
  setVolume: (volume: number) => void
}

export interface SearchState {
  searchQuery: string
  searchResults: Track[]
  recentSearches: string[]
  setSearchQuery: (q: string) => void
  search: (q: string) => Promise<void>
  clearSearch: () => void
  addRecent: (q: string) => void
}

export interface UserSettingsState {
  maxBitrate: number
  audioDevice: string
  equalizer: number[]
  theme: string
  language: string
  advanced: Record<string, unknown>
  updateSetting: <K extends keyof UserSettingsState>(key: K, value: UserSettingsState[K]) => void
  resetSettings: () => void
  importSettings: (text: string) => void
  exportSettings: () => string
}

export interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}
export interface NotificationState {
  notifications: Notification[]
  notify: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void
  dismiss: (id: string) => void
}

// COMBINED STATE
export type GlobalStore = MediaLibraryState & PlaybackState & SearchState & UserSettingsState & NotificationState

/** Zustand implementation **/
export const useGlobalStore = create<GlobalStore>((set, get) => ({
  // Media library state
  tracks: [],
  playlists: [],
  folders: [],
  isScanning: false,
  scanError: null,
  scanLibrary: async (folders) => {
    set({ isScanning: true, scanError: null });
    
    try {
      // Call our backend API to scan each folder
      const results = await Promise.all(
        folders.map(async (folder) => {
          const response = await fetch('/api/library/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ directory: folder })
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to scan directory');
          }
          
          return response.json();
        })
      );
      
      // Process the results and update the store
      const newTracks: Track[] = [];
      
      results.forEach(result => {
        if (result.success && result.files) {
          result.files.forEach((file: any) => {
            const pathInfo = new URL(file.path).pathname.split('/');
            const fileName = pathInfo.pop() || '';
            const artistFromPath = pathInfo.pop() || 'Unknown Artist';
            const albumFromPath = pathInfo.pop() || 'Unknown Album';
            
            newTracks.push({
              id: `file-${file.path.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`,
              title: fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
              artist: artistFromPath,
              album: albumFromPath,
              duration: file.duration || 0,
              filePath: file.path,
              artworkUrl: undefined // Will be handled separately
            });
          });
        }
      });
      
      // Update the store with new tracks
      set(state => ({
        tracks: [...state.tracks, ...newTracks],
        isScanning: false
      }));
      
    } catch (err: any) {
      console.error('Error scanning library:', err);
      set({ 
        scanError: err.message || 'Failed to scan library',
        isScanning: false 
      });
    }
  },
  addFolder: (folder) => set((s) => ({ folders: [...s.folders, folder] })),
  removeFolder: (folder) => set((s) => ({ folders: s.folders.filter(f => f !== folder) })),

  // Playback state
  currentTrackId: null,
  isPlaying: false,
  volume: 1,
  queue: [],
  play: (trackId) => set({ currentTrackId: trackId, isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  next: () => {
    const { queue, currentTrackId } = get();
    if (!currentTrackId) return;
    const idx = queue.indexOf(currentTrackId);
    if (idx >= 0 && idx + 1 < queue.length) set({ currentTrackId: queue[idx + 1], isPlaying: true });
  },
  prev: () => {
    const { queue, currentTrackId } = get();
    if (!currentTrackId) return;
    const idx = queue.indexOf(currentTrackId);
    if (idx > 0) set({ currentTrackId: queue[idx - 1], isPlaying: true });
  },
  setQueue: (trackIds) => set({ queue: trackIds }),
  setVolume: (volume) => set({ volume }),

  // Search state
  searchQuery: '',
  searchResults: [],
  recentSearches: [],
  setSearchQuery: (q) => set({ searchQuery: q }),
  search: async (q) => {
    // TODO: actual search
    set({ searchQuery: q });
    setTimeout(() => set({ searchResults: [] }), 500);
  },
  clearSearch: () => set({ searchQuery: '', searchResults: [] }),
  addRecent: (q) => set((s) => ({ recentSearches: [q, ...s.recentSearches.filter(v => v !== q)].slice(0, 10) })),

  // User settings state
  maxBitrate: 320,
  audioDevice: 'default',
  equalizer: Array(10).fill(0),
  theme: 'system',
  language: 'en',
  advanced: {},
  updateSetting: (key, value) => set((s) => ({ ...s, [key]: value })),
  resetSettings: () => set({
    maxBitrate: 320, audioDevice: 'default', equalizer: Array(10).fill(0), theme: 'system', language: 'en', advanced: {}
  }),
  importSettings: (text: string) => {
    try {
      const config = JSON.parse(text);
      set({ ...config });
    } catch (e) { /* ignore */ }
  },
  exportSettings: () => JSON.stringify({
    maxBitrate: get().maxBitrate,
    audioDevice: get().audioDevice,
    equalizer: get().equalizer,
    theme: get().theme,
    language: get().language,
    advanced: get().advanced
  }),

  // Notification state
  notifications: [],
  notify: (message, type = 'info', duration = 3000) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ notifications: [...s.notifications, { id, message, type, duration }] }));
    setTimeout(() => get().dismiss(id), duration);
  },
  dismiss: (id) => set((s) => ({ notifications: s.notifications.filter(n => n.id !== id) })),
}));