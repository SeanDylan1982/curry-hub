import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { libraryManager } from "@/lib/library-manager";
import { Music, Plus } from "lucide-react";

export const NotificationSystem = () => {
  const [lastTrackCount, setLastTrackCount] = useState(0);

  useEffect(() => {
    // Initialize with current track count
    const initialCount = libraryManager.getTracks().length;
    setLastTrackCount(initialCount);

    // Set up interval to check for new tracks
    const interval = setInterval(() => {
      const currentCount = libraryManager.getTracks().length;
      
      if (currentCount > lastTrackCount) {
        const newTracks = currentCount - lastTrackCount;
        const latestTracks = libraryManager.getTracks()
          .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
          .slice(0, newTracks);

        // Show notification for new tracks
        latestTracks.forEach((track, index) => {
          setTimeout(() => {
            toast({
              title: "New track discovered!",
              description: `${track.title} by ${track.artist}`,
              action: (
                <div className="flex items-center space-x-2">
                  <Music className="h-4 w-4" />
                  <span className="text-sm">Auto-indexed</span>
                </div>
              ),
            });
          }, index * 1000); // Stagger notifications
        });

        setLastTrackCount(currentCount);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [lastTrackCount]);

  return null; // This component doesn't render anything
};

// Function to manually trigger the auto-discovery simulation
export const triggerAutoDiscovery = () => {
  // This will be called by the library manager when new tracks are found
  console.log("Auto-discovery triggered");
};
