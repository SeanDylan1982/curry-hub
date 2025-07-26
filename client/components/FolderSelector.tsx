import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  FolderOpen, 
  HardDrive, 
  Folder, 
  Music, 
  AlertCircle,
  Check
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FolderSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPath: string;
  onPathSelect: (path: string) => void;
}

export function FolderSelector({ open, onOpenChange, currentPath, onPathSelect }: FolderSelectorProps) {
  const [selectedPath, setSelectedPath] = useState(currentPath);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionMessage, setSelectionMessage] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedPath(currentPath);
      setSelectionMessage("");
    }
  }, [open, currentPath]);

  // Detect platform and suggest appropriate paths
  const isMac = navigator.platform.toLowerCase().includes('mac');
  const isWindows = navigator.platform.toLowerCase().includes('win');

  const commonPaths = isMac ? [
    { name: "Music", path: "/Users/[username]/Music", icon: Music },
    { name: "Downloads", path: "/Users/[username]/Downloads", icon: FolderOpen },
    { name: "Documents", path: "/Users/[username]/Documents", icon: Folder },
    { name: "Desktop", path: "/Users/[username]/Desktop", icon: Folder },
  ] : isWindows ? [
    { name: "Music", path: "C:\\Users\\[username]\\Music", icon: Music },
    { name: "Downloads", path: "C:\\Users\\[username]\\Downloads", icon: FolderOpen },
    { name: "Documents", path: "C:\\Users\\[username]\\Documents", icon: Folder },
    { name: "Desktop", path: "C:\\Users\\[username]\\Desktop", icon: Folder },
  ] : [
    { name: "Music", path: "/home/music", icon: Music },
    { name: "Downloads", path: "/home/downloads", icon: FolderOpen },
    { name: "Documents", path: "/home/documents", icon: Folder },
    { name: "Home", path: "/home/[username]", icon: Folder },
  ];

  const handleNativeFolderSelect = async () => {
    setIsSelecting(true);
    try {
      // Check if we're in an iframe or cross-origin context
      const isInIframe = window !== window.top;
      const canUseFileSystemAPI = 'showDirectoryPicker' in window && !isInIframe;

      if (canUseFileSystemAPI) {
        try {
          const directoryHandle = await (window as any).showDirectoryPicker({
            mode: 'read',
            startIn: 'music'
          });

          const folderPath = directoryHandle.name || 'Selected Folder';
          setSelectedPath(folderPath);
          setSelectionMessage(`Selected: ${folderPath}`);
        } catch (fsError) {
          // If File System Access fails due to iframe restrictions, fall back
          if (fsError.name === 'SecurityError') {
            throw new Error('IFRAME_RESTRICTION');
          }
          throw fsError;
        }

      } else if ('webkitdirectory' in document.createElement('input')) {
        const input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        input.multiple = true;
        
        input.onchange = (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files && files.length > 0) {
            const firstFile = files[0];
            const pathParts = firstFile.webkitRelativePath.split('/');
            const folderName = pathParts[0];
            setSelectedPath(folderName);
            setSelectionMessage(`Selected folder with ${files.length} files`);
          }
        };
        
        input.click();
      }
    } catch (error) {
      // Handle different types of errors
      if (error.name === 'AbortError') {
        // User cancelled - do nothing
      } else if (error.message === 'IFRAME_RESTRICTION' || error.name === 'SecurityError') {
        setSelectionMessage('Native folder picker not available in this environment. Please use the file input or enter path manually.');
      } else {
        console.error('Error selecting folder:', error);
        setSelectionMessage('Failed to select folder. Please try the file input or enter path manually.');
      }
    } finally {
      setIsSelecting(false);
    }
  };

  const handleConfirm = () => {
    onPathSelect(selectedPath);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedPath(currentPath);
    setSelectionMessage("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FolderOpen className="h-5 w-5" />
            <span>Select Music Library Folder</span>
          </DialogTitle>
          <DialogDescription>
            Choose the folder where your music files are stored. This will be used as your main music library.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Manual Path Input */}
          <div className="space-y-2">
            <Label htmlFor="folder-path">Folder Path</Label>
            <div className="flex space-x-2">
              <Input
                id="folder-path"
                value={selectedPath}
                onChange={(e) => setSelectedPath(e.target.value)}
                placeholder="Enter path to your music folder..."
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={handleNativeFolderSelect}
                disabled={isSelecting}
                className="shrink-0"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                {isSelecting ? 'Selecting...' : 'Browse'}
              </Button>
            </div>
            {selectionMessage && (
              <p className="text-sm text-green-600 flex items-center space-x-1">
                <Check className="h-3 w-3" />
                <span>{selectionMessage}</span>
              </p>
            )}
          </div>

          {/* Common Paths */}
          <div className="space-y-2">
            <Label>Common Locations</Label>
            <p className="text-xs text-muted-foreground">
              Click a common location below (will prompt for your username if needed)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {commonPaths.map((path) => (
                <Button
                  key={path.path}
                  variant="outline"
                  onClick={() => {
                    // Replace placeholder with actual username if possible
                    let finalPath = path.path;
                    if (finalPath.includes('[username]')) {
                      const username = prompt('Enter your username:', 'username');
                      if (username) {
                        finalPath = finalPath.replace('[username]', username);
                      }
                    }
                    setSelectedPath(finalPath);
                  }}
                  className="h-12 flex-col space-y-1 text-xs"
                >
                  <path.icon className="h-4 w-4" />
                  <span>{path.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Browser Support Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {(() => {
                const isInIframe = window !== window.top;
                const hasFileSystemAPI = 'showDirectoryPicker' in window;
                const hasWebkitDirectory = 'webkitdirectory' in document.createElement('input');

                if (hasFileSystemAPI && !isInIframe) {
                  return <span className="text-green-600">✓ Your browser supports native folder selection</span>;
                } else if (hasFileSystemAPI && isInIframe) {
                  return <span className="text-yellow-600">⚠ Native folder picker restricted in iframe - file input available</span>;
                } else if (hasWebkitDirectory) {
                  return <span className="text-yellow-600">⚠ Limited folder selection support - you can browse and select files</span>;
                } else {
                  return <span className="text-orange-600">⚠ Manual path entry required - your browser doesn't support folder selection</span>;
                }
              })()}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedPath.trim()}>
            <Check className="h-4 w-4 mr-2" />
            Select Folder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
