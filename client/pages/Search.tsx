import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, Play, Folder, Heart, MoreHorizontal, Clock, Music, Star, TrendingUp } from "lucide-react";
import { useLibrary } from "@/hooks/use-library";
import { MusicTrack } from "@shared/music";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MusicTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { searchTracks, playTrack, toggleFavorite, userStats } = useLibrary();

  const recentSearches = [
    "rock",
    "jazz",
    "classical",
    "pop"
  ];

  const browseCategories = [
    { id: 1, name: "Recently Added", color: "bg-blue-500", icon: Clock },
    { id: 2, name: "Most Played", color: "bg-green-500", icon: Play },
    { id: 3, name: "Albums", color: "bg-purple-500", icon: Music },
    { id: 4, name: "Artists", color: "bg-pink-500", icon: Music },
    { id: 5, name: "Genres", color: "bg-orange-500", icon: Folder },
    { id: 6, name: "Playlists", color: "bg-indigo-500", icon: Heart },
  ];

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSearchQuery(query);
    
    // Search through local music files
    setTimeout(() => {
      const results = searchTracks(query);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatLastPlayed = (date?: Date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days} days ago`;
    if (hours > 0) return `${hours} hours ago`;
    if (minutes > 0) return `${minutes} minutes ago`;
    return 'Just now';
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 lg:space-y-8">
      {/* Search Header */}
      <div className="max-w-2xl">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search your music library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
            className="pl-12 h-12 text-lg bg-muted/50 border-none"
          />
        </div>
        
        {/* Search Button */}
        {searchQuery && (
          <Button 
            onClick={() => handleSearch(searchQuery)}
            disabled={isSearching}
            className="mt-4"
          >
            {isSearching ? "Searching..." : "Search Library"}
          </Button>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Search Results for "{searchQuery}"</h2>
          <div className="space-y-2">
            {searchResults.map((track) => (
              <Card key={track.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="flex items-center p-3 lg:p-4 space-x-3 lg:space-x-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-muted rounded-md flex items-center justify-center">
                    <Music className="h-5 w-5 lg:h-6 lg:w-6 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm lg:text-base truncate">{track.title}</h3>
                    <p className="text-xs lg:text-sm text-muted-foreground">{track.artist}</p>
                    <div className="lg:hidden flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 text-xs">
                        {track.format}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{track.playCount} plays</span>
                    </div>
                  </div>
                  
                  <div className="hidden md:block text-sm text-muted-foreground">
                    {track.album}
                  </div>
                  
                  <div className="hidden lg:flex items-center space-x-4 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                      {track.format}
                    </Badge>
                    <span>{track.bitrate}kbps</span>
                    <span>{formatFileSize(track.fileSize)}</span>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {track.playCount} plays
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDuration(track.duration)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 lg:space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`w-8 h-8 lg:w-10 lg:h-10 p-0 ${track.isFavorite ? 'text-red-500' : ''}`}
                      onClick={() => toggleFavorite(track.id)}
                    >
                      <Heart className={`h-3 w-3 lg:h-4 lg:w-4 ${track.isFavorite ? 'fill-current' : ''}`} />
                    </Button>
                    <Button 
                      size="sm" 
                      className="rounded-full w-8 h-8 lg:w-10 lg:h-10 p-0"
                      onClick={() => playTrack(track.id)}
                    >
                      <Play className="h-3 w-3 lg:h-4 lg:w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="hidden lg:flex w-10 h-10 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* No Results Message */}
      {searchResults.length === 0 && searchQuery && !isSearching && (
        <div className="text-center py-12">
          <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No tracks found</h3>
          <p className="text-muted-foreground mb-4">
            No music files match your search for "{searchQuery}"
          </p>
          <Button variant="outline" onClick={() => {
            setSearchQuery("");
            setSearchResults([]);
          }}>
            Clear Search
          </Button>
        </div>
      )}

      {/* Recent Searches */}
      {searchResults.length === 0 && !searchQuery && (
        <>
          <section>
            <h2 className="text-xl font-bold mb-4">Recent searches</h2>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleSearch(search)}
                  className="rounded-full"
                >
                  {search}
                </Button>
              ))}
            </div>
          </section>

          {/* Browse Categories */}
          <section>
            <h2 className="text-xl font-bold mb-6">Browse your library</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
              {browseCategories.map((category) => (
                <Card 
                  key={category.id}
                  className={`${category.color} relative overflow-hidden cursor-pointer hover:scale-105 transition-transform h-32`}
                >
                  <CardContent className="p-4 h-full flex flex-col justify-between">
                    <h3 className="text-white font-bold text-lg">{category.name}</h3>
                    <category.icon className="h-12 w-12 text-white/80 ml-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Library Status */}
          <section>
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Folder className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Your Music Library</h3>
                    <p className="text-muted-foreground">
                      {userStats?.totalTracks || 0} tracks • {userStats?.totalAlbums || 0} albums • {userStats?.totalArtists || 0} artists
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Library is automatically scanning for new music
                    </p>
                    <Button variant="outline" className="mt-3">
                      Rescan Library
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
