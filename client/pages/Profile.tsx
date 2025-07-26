import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLibrary } from "@/hooks/use-library";
import { AUTO_PLAYLISTS } from "@/lib/library-manager";
import { MusicTrack } from "@shared/music";
import {
  User,
  Music,
  Calendar,
  Clock,
  TrendingUp,
  Heart,
  Play,
  Headphones,
  Award,
  BarChart3,
  Settings,
  Edit,
  Share,
  Download,
  Globe,
  Plus,
  RotateCcw
} from "lucide-react";

export default function Profile() {
  const [timeRange, setTimeRange] = useState("allTime");
  const { userStats, tracks, resetStats, playTrack, getPlaylist } = useLibrary();
  const [topTracks, setTopTracks] = useState<MusicTrack[]>([]);
  const [topArtists, setTopArtists] = useState<any[]>([]);

  useEffect(() => {
    if (tracks.length > 0) {
      // Calculate top tracks
      const sortedTracks = tracks
        .filter(track => track.playCount > 0)
        .sort((a, b) => b.playCount - a.playCount)
        .slice(0, 5);
      setTopTracks(sortedTracks);

      // Calculate top artists
      const artistMap = new Map<string, { playCount: number; totalTime: number }>();
      tracks.forEach(track => {
        const existing = artistMap.get(track.artist) || { playCount: 0, totalTime: 0 };
        existing.playCount += track.playCount;
        existing.totalTime += track.duration * track.playCount;
        artistMap.set(track.artist, existing);
      });

      const topArtistsData = Array.from(artistMap.entries())
        .map(([name, data], index) => ({
          name,
          playCount: data.playCount,
          totalTime: formatDuration(data.totalTime),
          image: `https://picsum.photos/100/100?random=artist${index + 1}`
        }))
        .filter(artist => artist.playCount > 0)
        .sort((a, b) => b.playCount - a.playCount)
        .slice(0, 5);

      setTopArtists(topArtistsData);
    }
  }, [tracks]);

  const profileData = {
    name: "Music Lover",
    username: "@musiclover",
    joinDate: "January 2024",
    avatar: "https://picsum.photos/200/200?random=profile"
  };

  const recentActivity = [
    { action: "played", item: "Recently Added Tracks", type: "playlist", time: "Just now" },
    { action: "created", item: "Auto-Generated Playlists", type: "system", time: "Today" },
    { action: "stats", item: "Statistics Reset", type: "system", time: "Today" }
  ];

  const achievements = [
    { name: "Fresh Start", description: "Started tracking your music journey", icon: "🎵", unlocked: true },
    { name: "Library Builder", description: `Have ${userStats?.totalTracks || 0} tracks in your library`, icon: "📚", unlocked: (userStats?.totalTracks || 0) > 0 },
    { name: "Music Explorer", description: "Listened to 10+ different tracks", icon: "🌟", unlocked: tracks.some(t => t.playCount > 0) && tracks.filter(t => t.playCount > 0).length >= 10 },
    { name: "Genre Master", description: "Explored multiple genres", icon: "🎶", unlocked: (userStats?.genreDistribution?.length || 0) > 3 },
    { name: "Playlist Creator", description: "Have multiple playlists", icon: "📋", unlocked: (userStats?.totalPlaylists || 0) > 3 },
    { name: "Music Lover", description: "Listen to 100+ tracks", icon: "❤️", unlocked: tracks.some(t => t.playCount > 0) && tracks.reduce((sum, t) => sum + t.playCount, 0) >= 100 }
  ];

  const genreDistribution = userStats?.genreDistribution || [];

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatLastPlayed = (date?: Date | string) => {
    if (!date) return 'Never';

    // Ensure date is a proper Date object
    const dateObj = date instanceof Date ? date : new Date(date);

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) return 'Never';

    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} days ago`;
    if (hours > 0) return `${hours} hours ago`;
    return 'Recently';
  };

  const getCurrentStats = () => {
    if (!userStats) return { totalMinutes: 0, tracksPlayed: 0, newArtists: 0, topGenre: '', avgSessionLength: '0m' };

    const totalPlayCount = tracks.reduce((sum, track) => sum + track.playCount, 0);
    const totalListeningTime = tracks.reduce((sum, track) => sum + (track.duration * track.playCount), 0);
    const uniqueArtists = new Set(tracks.map(t => t.artist)).size;

    return {
      totalMinutes: Math.floor(totalListeningTime / 60),
      tracksPlayed: totalPlayCount,
      newArtists: uniqueArtists,
      topGenre: userStats.favoriteGenre || 'Unknown',
      avgSessionLength: formatDuration(totalListeningTime / Math.max(totalPlayCount, 1))
    };
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 lg:space-y-8 max-w-6xl">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <CardContent className="p-4 lg:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            <Avatar className="w-20 h-20 lg:w-24 lg:h-24">
              <AvatarImage src={profileData.avatar} alt={profileData.name} />
              <AvatarFallback className="text-xl lg:text-2xl">ML</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                <h1 className="text-2xl lg:text-3xl font-bold">{profileData.name}</h1>
                <Badge variant="secondary">{profileData.username}</Badge>
              </div>
              <p className="text-muted-foreground text-sm lg:text-base">Member since {profileData.joinDate}</p>
              <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-2 lg:gap-4 mt-4">
                <div className="flex items-center space-x-1 lg:space-x-2 text-xs lg:text-sm">
                  <Clock className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span>{formatDuration(tracks.reduce((sum, t) => sum + (t.duration * t.playCount), 0))} total</span>
                </div>
                <div className="flex items-center space-x-1 lg:space-x-2 text-xs lg:text-sm">
                  <Music className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span>{userStats?.totalTracks || 0} tracks</span>
                </div>
                <div className="flex items-center space-x-1 lg:space-x-2 text-xs lg:text-sm">
                  <User className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span>{userStats?.totalArtists || 0} artists</span>
                </div>
                <div className="flex items-center space-x-1 lg:space-x-2 text-xs lg:text-sm">
                  <Heart className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span>{userStats?.totalPlaylists || 0} playlists</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row w-full lg:w-auto space-y-2 sm:space-y-0 sm:space-x-2">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={resetStats}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Stats
              </Button>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Range Selector */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={timeRange === "month" ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeRange("month")}
          className="flex-1 sm:flex-none"
        >
          This Month
        </Button>
        <Button
          variant={timeRange === "year" ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeRange("year")}
          className="flex-1 sm:flex-none"
        >
          This Year
        </Button>
        <Button
          variant={timeRange === "allTime" ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeRange("allTime")}
          className="flex-1 sm:flex-none"
        >
          All Time
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
          <TabsTrigger value="overview" className="text-xs lg:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="artists" className="text-xs lg:text-sm">Artists</TabsTrigger>
          <TabsTrigger value="tracks" className="text-xs lg:text-sm">Tracks</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs lg:text-sm">Activity</TabsTrigger>
          <TabsTrigger value="achievements" className="text-xs lg:text-sm col-span-2 lg:col-span-1">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Headphones className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{Math.floor(getCurrentStats().totalMinutes / 60)}h</div>
                <div className="text-sm text-muted-foreground">Listening Time</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Play className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{getCurrentStats().tracksPlayed}</div>
                <div className="text-sm text-muted-foreground">Tracks Played</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <User className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{getCurrentStats().newArtists}</div>
                <div className="text-sm text-muted-foreground">Artists</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Music className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{userStats?.totalTracks || 0}</div>
                <div className="text-sm text-muted-foreground">Total Tracks</div>
              </CardContent>
            </Card>
          </div>

          {/* Genre Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Genre Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {genreDistribution.length > 0 ? (
                <div className="space-y-4">
                  {genreDistribution.slice(0, 5).map((genre) => (
                    <div key={genre.genre} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{genre.genre}</span>
                        <span>{genre.percentage}%</span>
                      </div>
                      <Progress value={genre.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p>No genre data yet</p>
                  <p className="text-sm">Start listening to see your music preferences</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artists" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Top Artists</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topArtists.map((artist, index) => (
                  <div key={artist.name} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50">
                    <span className="text-2xl font-bold text-muted-foreground w-8">{index + 1}</span>
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={artist.image} alt={artist.name} />
                      <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{artist.name}</h3>
                      <p className="text-sm text-muted-foreground">{artist.totalTime} • {artist.playCount} plays</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Top Tracks</CardTitle>
            </CardHeader>
            <CardContent>
              {topTracks.length > 0 ? (
                <div className="space-y-4">
                  {topTracks.map((track, index) => (
                    <div key={track.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => playTrack(track.id)}>
                      <span className="text-2xl font-bold text-muted-foreground w-8">{index + 1}</span>
                      <img src={track.albumArtUrl || `https://picsum.photos/60/60?random=${track.id}`} alt={track.title} className="w-12 h-12 rounded-md" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{track.title}</h3>
                        <p className="text-sm text-muted-foreground">{track.artist}</p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>{track.playCount} plays</div>
                        <div>{formatLastPlayed(track.lastPlayed)}</div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        playTrack(track.id);
                      }}>
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Music className="h-12 w-12 mx-auto mb-2" />
                  <p>No tracks played yet</p>
                  <p className="text-sm">Start listening to see your top tracks</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      {activity.action === 'played' && <Play className="h-4 w-4 text-primary" />}
                      {activity.action === 'added' && <Plus className="h-4 w-4 text-primary" />}
                      {activity.action === 'liked' && <Heart className="h-4 w-4 text-primary" />}
                      {activity.action === 'discovered' && <Globe className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <p>
                        <span className="capitalize">{activity.action}</span>{' '}
                        <span className="font-semibold">{activity.item}</span>{' '}
                        <Badge variant="secondary" className="ml-2">{activity.type}</Badge>
                      </p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.name} 
                    className={`p-4 rounded-lg border ${achievement.unlocked ? 'bg-primary/5 border-primary/20' : 'bg-muted/20 border-muted opacity-60'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {achievement.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                      {achievement.unlocked && (
                        <Badge variant="default" className="bg-primary">
                          Unlocked
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
