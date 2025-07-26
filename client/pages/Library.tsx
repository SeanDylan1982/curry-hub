import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Folder,
  Heart,
  Clock,
  Music,
  Settings,
  FolderOpen,
  HardDrive,
  RefreshCw,
  Filter
} from "lucide-react";
import { useGlobalStore } from "../store/globalStore";

export default function Library() {
  // Zustand global store hooks
  const {
    isScanning,
    scanLibrary,
    folders,
    playlists,
    tracks,
    addFolder,
    scanError
  } = useGlobalStore((state) => ({
    isScanning: state.isScanning,
    scanLibrary: state.scanLibrary,
    folders: state.folders,
    playlists: state.playlists,
    tracks: state.tracks,
    addFolder: state.addFolder,
    scanError: state.scanError,
  }));

  // Simple derived stats (expand as needed for real data)
  const libraryStats = {
    totalTracks: tracks.length,
    totalAlbums: 0,
    totalArtists: 0,
    totalSize: "—",
    libraryPath: folders.length > 0 ? folders.join(", ") : "No folders added"
  };

  // For demonstration, the first 3 tracks are "recently added"
  const recentlyAdded = tracks.slice(0, 3);

  // TODO: playlists, folders structure should be real, this is a placeholder
  // playlists/folders use the store arrays directly

  const handleScanLibrary = () => {
    if (folders.length === 0) {
      alert("Please add a folder first!");
      return;
    }
    scanLibrary(folders);
  };

  const handleSelectFolder = () => {
    // Simulate folder picker
    const folder = prompt("Enter path to new music folder:");
    if (folder) addFolder(folder);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl lg:text-3xl font-bold">Your Library</h1>
        <div className="flex items-center space-x-1 lg:space-x-2">
          <Button variant="ghost" size="sm" onClick={handleScanLibrary} disabled={isScanning} className="w-8 h-8 lg:w-10 lg:h-10 p-0">
            <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="ghost" size="sm" className="w-8 h-8 lg:w-10 lg:h-10 p-0">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="w-8 h-8 lg:w-10 lg:h-10 p-0">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="hidden lg:flex w-10 h-10 p-0">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Library Settings Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-primary/20 rounded-lg flex items-center justify-center">
                <HardDrive className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base lg:text-lg">Music Library</h3>
                <p className="text-sm lg:text-base text-muted-foreground">
                  {libraryStats.totalTracks.toLocaleString()} tracks • {libraryStats.totalAlbums} albums • {libraryStats.totalArtists} artists
                </p>
                <p className="text-xs lg:text-sm text-muted-foreground mt-1 truncate">
                  📁 {libraryStats.libraryPath}
                </p>
                <p className="text-xs lg:text-sm text-muted-foreground">
                  💾 {libraryStats.totalSize}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button variant="outline" onClick={handleSelectFolder} size="sm">
                <FolderOpen className="h-4 w-4 mr-2" />
                Change Folder
              </Button>
              <Button onClick={handleScanLibrary} disabled={isScanning} size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
                {isScanning ? 'Scanning...' : 'Scan Library'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Buttons */}
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" className="rounded-full">
          Recently Added
        </Button>
        <Button variant="outline" size="sm" className="rounded-full">
          Recently Played
        </Button>
        <Button variant="outline" size="sm" className="rounded-full">
          Artists
        </Button>
        <Button variant="outline" size="sm" className="rounded-full">
          Albums
        </Button>
        <Button variant="outline" size="sm" className="rounded-full">
          Folders
        </Button>
      </div>

      {/* Recently Added */}
      <section>
        <h2 className="text-xl font-bold mb-4">Recently Added</h2>
        <div className="space-y-2">
          {recentlyAdded.length === 0 ? (
            <div className="text-muted-foreground italic px-2 py-4">No tracks recently added.</div>
          ) : (
            recentlyAdded.map((track) => (
              <Card key={track.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center p-4 space-x-4">
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                    {/* Artwork */}
                    {track.artworkUrl ? (
                      <img
                        src={track.artworkUrl}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Music className="w-full h-full text-muted" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{track.title}</h3>
                    <p className="text-sm text-muted-foreground">{track.artist}</p>
                  </div>
                  <div className="hidden md:flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{track.album}</span>
                    <span>{Math.round(track.duration/60)} min</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Music Folders */}
      <section>
        <h2 className="text-xl font-bold mb-4">Music Folders</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
          {folders.length === 0 ? (
            <div className="text-muted-foreground italic px-2 py-4">No music folders added yet.</div>
          ) : (
            folders.map((folder, index) => (
              <Card key={folder} className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center p-4 space-x-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Folder className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{folder}</h3>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Playlists */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Your Playlists</h2>
          <Button variant="ghost" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Playlist
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {playlists.length === 0 ? (
            <div className="text-muted-foreground italic px-2 py-4">No playlists yet.</div>
          ) : (
            playlists.map((playlist) => (
              <Card key={playlist.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-muted">
                      {playlist.artworkUrl ? (
                        <img
                          src={playlist.artworkUrl}
                          alt={playlist.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music className="w-full h-full text-muted" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{playlist.name}</h3>
                      <p className="text-sm text-muted-foreground">{playlist.trackIds.length} tracks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <Plus className="h-6 w-6" />
            <span>Create Playlist</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <FolderOpen className="h-6 w-6" />
            <span>Add Folder</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2" onClick={handleScanLibrary}>
            <RefreshCw className={`h-6 w-6 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Rescan Library'}</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => {
            // Simulate finding a new track
            import('@/lib/library-manager').then(({ libraryManager }) => {
              const newTrack = {
                id: `track_demo_${Date.now()}`,
                title: `Demo Track ${Math.floor(Math.random() * 100)}`,
                artist: 'Demo Artist',
                album: 'Demo Album',
                duration: 180,
                filePath: '/Music/Demo/track.mp3',
                fileSize: 4 * 1024 * 1024,
                format: 'MP3' as const,
                bitrate: 320,
                sampleRate: 44100,
                genre: 'Demo',
                year: 2024,
                playCount: 0,
                dateAdded: new Date(),
                isFavorite: false,
                tags: [],
                playlistIds: []
              };
              libraryManager.addTrack(newTrack);
            });
          }}>
            <Music className="h-6 w-6" />
            <span>Demo: Add Track</span>
          </Button>
        </div>
      </section>
    </div>
  );
}
