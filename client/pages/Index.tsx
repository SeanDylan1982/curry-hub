import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, MoreHorizontal } from "lucide-react";
import { libraryManager, initializeSampleLibrary, AUTO_PLAYLISTS } from "@/lib/library-manager";
import { MusicTrack, Playlist } from "@shared/music";

export default function Index() {
  const [recentlyPlayed, setRecentlyPlayed] = useState<Playlist[]>([]);
  const [smartPlaylists, setSmartPlaylists] = useState<Playlist[]>([]);
  const [topTracks, setTopTracks] = useState<MusicTrack[]>([]);
  const [topArtists, setTopArtists] = useState<{ id: string; name: string; trackCount: number; image: string }[]>([]);
  const [newlyAdded, setNewlyAdded] = useState<MusicTrack[]>([]);

  useEffect(() => {
    // Initialize sample library if empty
    initializeSampleLibrary();
    
    // Load data from library manager
    loadLibraryData();

    // Set up listener for library updates
    const interval = setInterval(() => {
      loadLibraryData();
    }, 5000); // Refresh every 5 seconds to catch new additions

    return () => clearInterval(interval);
  }, []);

  const loadLibraryData = () => {
    const allPlaylists = libraryManager.getPlaylists();
    const allTracks = libraryManager.getTracks();
    
    // Get recently played quick access items
    const recentlyPlayedPlaylist = libraryManager.getPlaylist(AUTO_PLAYLISTS.RECENTLY_PLAYED);
    const allSongsPlaylist = libraryManager.getPlaylist(AUTO_PLAYLISTS.ALL_SONGS);
    const likedSongsPlaylist = libraryManager.getPlaylist(AUTO_PLAYLISTS.LIKED_SONGS);
    
    const quickAccessPlaylists = [
      recentlyPlayedPlaylist,
      allSongsPlaylist,
      likedSongsPlaylist
    ].filter(Boolean) as Playlist[];
    
    // Add regular playlists to quick access
    const regularPlaylists = allPlaylists
      .filter(p => !p.isSmartPlaylist)
      .slice(0, 3);
    
    setRecentlyPlayed([...quickAccessPlaylists, ...regularPlaylists].slice(0, 6));

    // Get smart playlists for main section
    const autoPlaylists = [
      libraryManager.getPlaylist(AUTO_PLAYLISTS.RECENTLY_PLAYED),
      libraryManager.getPlaylist(AUTO_PLAYLISTS.MOST_PLAYED),
      libraryManager.getPlaylist(AUTO_PLAYLISTS.RECENTLY_ADDED),
      libraryManager.getPlaylist(AUTO_PLAYLISTS.ALL_SONGS),
      libraryManager.getPlaylist(AUTO_PLAYLISTS.LIKED_SONGS)
    ].filter(Boolean) as Playlist[];

    setSmartPlaylists(autoPlaylists);

    // Get top tracks (most played)
    const sortedTracks = allTracks
      .filter(track => track.playCount > 0)
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, 5);
    
    // If no played tracks, show recently added
    if (sortedTracks.length === 0) {
      const recentTracks = allTracks
        .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
        .slice(0, 5);
      setTopTracks(recentTracks);
    } else {
      setTopTracks(sortedTracks);
    }

    // Get top artists
    const artistMap = new Map<string, { trackCount: number; totalPlays: number }>();
    allTracks.forEach(track => {
      const existing = artistMap.get(track.artist) || { trackCount: 0, totalPlays: 0 };
      existing.trackCount++;
      existing.totalPlays += track.playCount;
      artistMap.set(track.artist, existing);
    });

    const topArtistsData = Array.from(artistMap.entries())
      .map(([name, data], index) => ({
        id: `artist_${index}`,
        name,
        trackCount: data.trackCount,
        image: `https://picsum.photos/200/200?random=${index + 12}`
      }))
      .sort((a, b) => b.trackCount - a.trackCount)
      .slice(0, 5);

    setTopArtists(topArtistsData);

    // Get newly added tracks
    const recentlyAddedTracks = allTracks
      .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
      .slice(0, 6);
    
    setNewlyAdded(recentlyAddedTracks);
  };

  const handlePlayTrack = (trackId: string) => {
    libraryManager.playTrack(trackId);
    loadLibraryData(); // Refresh to update play counts
  };

  const handlePlayPlaylist = (playlistId: string) => {
    const playlist = libraryManager.getPlaylist(playlistId);
    if (playlist && playlist.trackIds.length > 0) {
      // Play first track in playlist
      libraryManager.playTrack(playlist.trackIds[0]);
      loadLibraryData();
    }
  };

  const currentTime = new Date().getHours();
  const greeting = currentTime < 12 ? "Good morning" : currentTime < 18 ? "Good afternoon" : "Good evening";

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPlaylistImage = (playlist: Playlist) => {
    if (playlist.trackIds.length > 0) {
      const firstTrack = libraryManager.getTrack(playlist.trackIds[0]);
      if (firstTrack?.albumArtUrl) {
        return firstTrack.albumArtUrl;
      }
    }
    // Generate a consistent image based on playlist name
    const hash = playlist.name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return `https://picsum.photos/300/300?random=${Math.abs(hash % 100)}`;
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl lg:text-3xl font-bold">{greeting}</h1>
      </div>

      {/* Recently Played Quick Access */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {recentlyPlayed.map((playlist) => (
          <Card 
            key={playlist.id} 
            className="group bg-card/50 hover:bg-card/80 transition-all duration-200 cursor-pointer"
            onClick={() => handlePlayPlaylist(playlist.id)}
          >
            <CardContent className="flex items-center p-3 lg:p-4 space-x-3 lg:space-x-4">
              <div className="relative">
                <img 
                  src={getPlaylistImage(playlist)}
                  alt={playlist.name}
                  className="w-12 h-12 lg:w-16 lg:h-16 rounded-md object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{playlist.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {playlist.trackIds.length} tracks
                </p>
              </div>
              <Button 
                size="sm" 
                className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity rounded-full w-10 h-10 lg:w-12 lg:h-12 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayPlaylist(playlist.id);
                }}
              >
                <Play className="h-3 w-3 lg:h-4 lg:w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Smart Playlists */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl lg:text-2xl font-bold">Made for you</h2>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            Show all
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
          {smartPlaylists.map((playlist) => (
            <div key={playlist.id} className="group cursor-pointer" onClick={() => handlePlayPlaylist(playlist.id)}>
              <div className="relative mb-3">
                <img 
                  src={getPlaylistImage(playlist)}
                  alt={playlist.name}
                  className="w-full aspect-square rounded-md object-cover shadow-lg"
                />
                <Button 
                  size="sm"
                  className="absolute bottom-2 right-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200 transform translate-y-0 lg:translate-y-2 lg:group-hover:translate-y-0 rounded-full w-10 h-10 lg:w-12 lg:h-12 p-0 shadow-2xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPlaylist(playlist.id);
                  }}
                >
                  <Play className="h-3 w-3 lg:h-4 lg:w-4" />
                </Button>
              </div>
              <h3 className="font-semibold text-sm mb-1 line-clamp-1">{playlist.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">{playlist.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Artists */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl lg:text-2xl font-bold">Your top artists</h2>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            Show all
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
          {topArtists.map((artist) => (
            <div key={artist.id} className="group cursor-pointer text-center">
              <div className="relative mb-3">
                <img 
                  src={artist.image} 
                  alt={artist.name}
                  className="w-full aspect-square rounded-full object-cover shadow-lg"
                />
                <Button 
                  size="sm"
                  className="absolute bottom-2 right-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200 transform translate-y-0 lg:translate-y-2 lg:group-hover:translate-y-0 rounded-full w-10 h-10 lg:w-12 lg:h-12 p-0 shadow-2xl"
                >
                  <Play className="h-3 w-3 lg:h-4 lg:w-4" />
                </Button>
              </div>
              <h3 className="font-semibold text-sm">{artist.name}</h3>
              <p className="text-xs text-muted-foreground">{artist.trackCount} tracks</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recently Added */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl lg:text-2xl font-bold">Recently added</h2>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            Show all
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
          {newlyAdded.map((track) => (
            <div key={track.id} className="group cursor-pointer" onClick={() => handlePlayTrack(track.id)}>
              <div className="relative mb-3">
                <img 
                  src={track.albumArtUrl || `https://picsum.photos/300/300?random=${track.id}`}
                  alt={track.title}
                  className="w-full aspect-square rounded-md object-cover shadow-lg"
                />
                <Button 
                  size="sm"
                  className="absolute bottom-2 right-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200 transform translate-y-0 lg:translate-y-2 lg:group-hover:translate-y-0 rounded-full w-10 h-10 lg:w-12 lg:h-12 p-0 shadow-2xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayTrack(track.id);
                  }}
                >
                  <Play className="h-3 w-3 lg:h-4 lg:w-4" />
                </Button>
              </div>
              <h3 className="font-semibold text-sm mb-1 line-clamp-1">{track.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">{track.artist} • {track.album}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Your Top Tracks */}
      {topTracks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl lg:text-2xl font-bold">
              {topTracks.some(t => t.playCount > 0) ? "Your top tracks" : "Latest additions"}
            </h2>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Show all
            </Button>
          </div>
          <div className="space-y-2">
            {topTracks.map((track, index) => (
              <Card key={track.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handlePlayTrack(track.id)}>
                <CardContent className="flex items-center p-3 lg:p-4 space-x-3 lg:space-x-4">
                  <span className="text-lg font-bold text-muted-foreground w-6">{index + 1}</span>
                  <img 
                    src={track.albumArtUrl || `https://picsum.photos/60/60?random=${track.id}`}
                    alt={track.title}
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-md object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm lg:text-base truncate">{track.title}</h3>
                    <p className="text-xs lg:text-sm text-muted-foreground">{track.artist}</p>
                  </div>
                  <div className="hidden md:block text-sm text-muted-foreground">
                    {track.album}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {track.playCount > 0 ? `${track.playCount} plays` : 'New'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDuration(track.duration)}
                  </div>
                  <Button variant="ghost" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    handlePlayTrack(track.id);
                  }}>
                    <Play className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Bottom spacing for player */}
      <div className="h-8"></div>
    </div>
  );
}
