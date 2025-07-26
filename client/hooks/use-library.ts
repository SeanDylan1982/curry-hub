import { useEffect, useState } from 'react';
import { libraryManager, initializeSampleLibrary } from '@/lib/library-manager';
import { MusicTrack, Playlist, UserStats } from '@shared/music';

export const useLibrary = () => {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = () => {
    setTracks(libraryManager.getTracks());
    setPlaylists(libraryManager.getPlaylists());
    setUserStats(libraryManager.getUserStats());
    setIsLoading(false);
  };

  useEffect(() => {
    initializeSampleLibrary();
    refreshData();

    // Set up periodic refresh to catch new additions
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  const playTrack = (trackId: string) => {
    libraryManager.playTrack(trackId);
    refreshData();
  };

  const toggleFavorite = (trackId: string) => {
    libraryManager.toggleFavorite(trackId);
    refreshData();
  };

  const searchTracks = (query: string) => {
    return libraryManager.searchTracks(query);
  };

  const getPlaylist = (id: string) => {
    return libraryManager.getPlaylist(id);
  };

  const getTrack = (id: string) => {
    return libraryManager.getTrack(id);
  };

  const resetStats = () => {
    libraryManager.resetUserStats();
    refreshData();
  };

  return {
    tracks,
    playlists,
    userStats,
    isLoading,
    libraryManager,
    playTrack,
    toggleFavorite,
    searchTracks,
    getPlaylist,
    getTrack,
    resetStats,
    refreshData
  };
};
