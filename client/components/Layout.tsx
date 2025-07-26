import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { 
  Home, 
  Search, 
  Library, 
  Plus, 
  Heart,
  Volume2,
  Shuffle,
  SkipBack,
  Play,
  SkipForward,
  Repeat,
  Mic2,
  ListMusic,
  Laptop2,
  Menu,
  Settings,
  User,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: Library, label: "Your Library", path: "/library" },
  ];

  const bottomNavItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: Library, label: "Library", path: "/library" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const playlistItems = [
    "Recently Played",
    "Liked Songs", 
    "Downloaded Music",
    "My Playlist #1",
    "Chill Vibes",
    "Workout Mix"
  ];

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">MusicBox</h1>
            <p className="text-xs text-muted-foreground mt-1">Local Music Player</p>
          </div>
          {mobile && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="px-3 space-y-1">
        {sidebarItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => mobile && setSidebarOpen(false)}
            className={cn(
              "flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium transition-colors",
              location.pathname === item.path
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Create Playlist */}
      <div className="px-3 mt-6">
        <Button 
          variant="ghost" 
          className="w-full justify-start space-x-3 py-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Plus className="h-5 w-5" />
          <span>Create Playlist</span>
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start space-x-3 py-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Heart className="h-5 w-5" />
          <span>Liked Songs</span>
        </Button>
      </div>

      {/* Playlists */}
      <div className="flex-1 px-3 mt-4 overflow-hidden">
        <div className="space-y-1">
          {playlistItems.map((playlist, index) => (
            <button
              key={index}
              className="w-full text-left px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
            >
              {playlist}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Settings Link */}
      {mobile && (
        <div className="px-3 pb-6 mt-auto">
          <Link
            to="/settings"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen bg-background text-foreground">
      <div className="flex h-full">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex w-64 bg-sidebar flex-col">
          <SidebarContent />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
            <VisuallyHidden>
              <SheetTitle>Navigation Menu</SheetTitle>
            </VisuallyHidden>
            <SidebarContent mobile />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top bar */}
          <header className="h-16 bg-background/95 backdrop-blur-sm border-b border-border px-4 lg:px-6 flex items-center justify-between">
            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="rounded-full">
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full">
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-4 lg:mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search your music library..."
                  className="pl-10 bg-muted/50 border-none"
                />
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="hidden lg:block">
                Install App
              </Button>
              <Button variant="ghost" size="sm" asChild className="hidden lg:block">
                <Link to="/settings">Settings</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center p-0">
                  <span className="text-sm font-medium text-primary-foreground">U</span>
                </Link>
              </Button>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-auto pb-20 lg:pb-20">
            {children}
          </main>

          {/* Desktop Player */}
          <div className="hidden lg:flex h-20 bg-sidebar border-t border-sidebar-border items-center justify-between px-4">
            {/* Currently Playing */}
            <div className="flex items-center space-x-4 w-1/4">
              <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                <ListMusic className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-sidebar-foreground">Select a track</p>
                <p className="text-xs text-muted-foreground">to start playing</p>
              </div>
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            {/* Player Controls */}
            <div className="flex flex-col items-center space-y-2 w-1/2">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm">
                  <Shuffle className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <SkipBack className="h-5 w-5" />
                </Button>
                <Button size="sm" className="rounded-full w-8 h-8 p-0">
                  <Play className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <SkipForward className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Repeat className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2 w-full max-w-md">
                <span className="text-xs text-muted-foreground">0:00</span>
                <div className="flex-1 h-1 bg-muted rounded-full">
                  <div className="h-full bg-primary rounded-full w-0"></div>
                </div>
                <span className="text-xs text-muted-foreground">0:00</span>
              </div>
            </div>

            {/* Volume and Options */}
            <div className="flex items-center space-x-2 w-1/4 justify-end">
              <Button variant="ghost" size="sm">
                <Mic2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <ListMusic className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Laptop2 className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Volume2 className="h-4 w-4" />
                <div className="w-20 h-1 bg-muted rounded-full">
                  <div className="h-full bg-primary rounded-full w-2/3"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Player */}
          <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-sidebar border-t border-sidebar-border">
            {/* Mini Player */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                  <ListMusic className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">Select a track</p>
                  <p className="text-xs text-muted-foreground truncate">to start playing</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="sm" className="rounded-full w-10 h-10 p-0">
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="px-4 pb-2">
              <div className="h-1 bg-muted rounded-full">
                <div className="h-full bg-primary rounded-full w-0"></div>
              </div>
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border">
            <div className="flex items-center justify-around py-2">
              {bottomNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center py-2 px-4 rounded-lg transition-colors",
                    location.pathname === item.path
                      ? "text-sidebar-primary"
                      : "text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 mb-1" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
