import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { libraryManager } from '@/lib/library-manager';

export function LibrarySettings() {
  const [isScanning, setIsScanning] = useState(false);
  const [settings, setSettings] = useState({
    libraryPath: '',
    autoScan: false,
    scanInterval: 60, // minutes
  });

  // Load current settings
  useEffect(() => {
    const loadSettings = () => {
      const savedPath = localStorage.getItem('musicbox_library_path') || '';
      const savedSettings = libraryManager.getSettings();
      
      setSettings({
        libraryPath: savedPath,
        autoScan: savedSettings.autoScan,
        scanInterval: savedSettings.scanInterval / (60 * 1000), // Convert from ms to minutes
      });
    };

    loadSettings();
  }, []);

  const handleFolderSelect = async () => {
    try {
      // In a real Electron app, you would use the dialog API
      // For web, we'll use a simple input with type="file" and webkitdirectory
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true;
      
      input.onchange = (e: any) => {
        const path = e.target.files[0]?.path || '';
        if (path) {
          setSettings(prev => ({
            ...prev,
            libraryPath: path,
          }));
        }
      };
      
      input.click();
    } catch (error) {
      console.error('Error selecting folder:', error);
      toast({
        title: 'Error',
        description: 'Failed to select folder. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    try {
      // Update library manager settings
      libraryManager.updateSettings({
        autoScan: settings.autoScan,
        scanInterval: settings.scanInterval * 60 * 1000, // Convert to ms
        libraryPath: settings.libraryPath,
      });

      // Save to local storage
      localStorage.setItem('musicbox_library_path', settings.libraryPath);
      
      // If auto-scan is enabled, start a scan
      if (settings.autoScan && settings.libraryPath) {
        await handleScan();
      }

      toast({
        title: 'Settings saved',
        description: 'Your library settings have been updated.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleScan = async () => {
    if (!settings.libraryPath) {
      toast({
        title: 'Error',
        description: 'Please select a library folder first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsScanning(true);
      await libraryManager.scanLibrary(settings.libraryPath);
    } catch (error) {
      console.error('Error scanning library:', error);
      toast({
        title: 'Error scanning library',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-4">Library Settings</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="libraryPath">Music Library Folder</Label>
            <div className="flex space-x-2 mt-1">
              <Input
                id="libraryPath"
                value={settings.libraryPath}
                readOnly
                placeholder="Select a folder containing your music"
                className="flex-1"
              />
              <Button type="button" onClick={handleFolderSelect}>
                Browse...
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Select the folder where your music files are stored.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5">
              <Label htmlFor="auto-scan">Auto-scan for new files</Label>
              <p className="text-sm text-muted-foreground">
                Automatically scan for new music files
              </p>
            </div>
            <Switch
              id="auto-scan"
              checked={settings.autoScan}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, autoScan: checked })
              }
            />
          </div>

          {settings.autoScan && (
            <div>
              <Label htmlFor="scan-interval">Scan Interval (minutes)</Label>
              <Input
                id="scan-interval"
                type="number"
                min="1"
                value={settings.scanInterval}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    scanInterval: Math.max(1, parseInt(e.target.value) || 60),
                  })
                }
                className="mt-1 w-24"
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleScan}
              disabled={isScanning || !settings.libraryPath}
            >
              {isScanning ? 'Scanning...' : 'Scan Now'}
            </Button>
            <Button onClick={handleSave} disabled={isScanning}>
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
