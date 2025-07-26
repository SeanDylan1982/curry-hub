import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Volume2, 
  FolderOpen, 
  Download, 
  Palette, 
  Monitor, 
  Smartphone,
  Settings as SettingsIcon,
  Music,
  Wifi,
  HardDrive,
  Bell,
  Shield,
  Eye,
  Sliders
} from "lucide-react";
import { libraryManager, AppSettings } from "@/lib/library-manager";
import { audioManager } from "@/lib/audio-manager";
import { FolderSelector } from "@/components/FolderSelector";

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [equalizerBands, setEqualizerBands] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [folderSelectorOpen, setFolderSelectorOpen] = useState(false);

  useEffect(() => {
    const currentSettings = libraryManager.getSettings();
    setSettings(currentSettings);
    setEqualizerBands(currentSettings.equalizerBands);
  }, []);

  if (!settings) {
    return <div className="p-4 lg:p-6">Loading settings...</div>;
  }

  const equalizerPresets = {
    "Flat": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "Rock": [3, 2, -1, -2, 1, 2, 3, 4, 4, 4],
    "Pop": [1, 2, 3, 3, 1, -1, -1, 1, 2, 3],
    "Jazz": [2, 1, 0, 1, 2, 2, 1, 1, 2, 3],
    "Classical": [3, 2, 1, 1, -1, -1, 0, 1, 2, 3],
    "Bass Boost": [4, 3, 2, 1, 0, 0, 0, 0, 0, 0],
    "Treble Boost": [0, 0, 0, 0, 0, 1, 2, 3, 4, 4]
  };

  const frequencies = ["32Hz", "64Hz", "125Hz", "250Hz", "500Hz", "1kHz", "2kHz", "4kHz", "8kHz", "16kHz"];

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    libraryManager.updateSetting(key, value);

    // Trigger audio manager updates for audio-related settings
    const audioSettings = ['volumeNormalization', 'crossfadeEnabled', 'crossfadeDuration', 'maxBitrate', 'equalizerBands'];
    if (audioSettings.includes(key)) {
      setTimeout(() => audioManager.updateSettings(), 100);
    }
  };

  const applyEqualizerPreset = (preset: string) => {
    const newBands = equalizerPresets[preset as keyof typeof equalizerPresets];
    setEqualizerBands(newBands);
    updateSetting('equalizerBands', newBands);
    updateSetting('equalizerPreset', preset);
    audioManager.updateEqualizer(newBands);
  };

  const updateEqualizerBand = (index: number, value: number[]) => {
    const newBands = [...equalizerBands];
    newBands[index] = value[0];
    setEqualizerBands(newBands);
    updateSetting('equalizerBands', newBands);
    updateSetting('equalizerPreset', 'Custom');
    audioManager.updateEqualizer(newBands);
  };

  const handleSaveSettings = () => {
    // Settings are automatically saved on change, so just show confirmation
    alert('Settings saved successfully!');
  };

  const handleResetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      libraryManager.resetSettings();
      const resetSettings = libraryManager.getSettings();
      setSettings(resetSettings);
      setEqualizerBands(resetSettings.equalizerBands);
      alert('Settings reset to defaults!');
    }
  };

  const handleExportSettings = () => {
    const settingsJson = libraryManager.exportSettings();
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'musicbox-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (libraryManager.importSettings(content)) {
            const importedSettings = libraryManager.getSettings();
            setSettings(importedSettings);
            setEqualizerBands(importedSettings.equalizerBands);
            alert('Settings imported successfully!');
          } else {
            alert('Failed to import settings. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleBrowseLibraryPath = () => {
    setFolderSelectorOpen(true);
  };

  const handleFolderSelect = (path: string) => {
    updateSetting('libraryPath', path);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 lg:space-y-8 max-w-4xl">
      <div className="flex items-center space-x-3">
        <SettingsIcon className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
        <h1 className="text-2xl lg:text-3xl font-bold">Settings</h1>
      </div>

      {/* Audio Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5" />
            <span>Audio</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Audio Quality */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Audio Quality</Label>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bitrate">Maximum Bitrate</Label>
                <Select value={settings.maxBitrate} onValueChange={(value) => updateSetting('maxBitrate', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="128">128 kbps</SelectItem>
                    <SelectItem value="192">192 kbps</SelectItem>
                    <SelectItem value="256">256 kbps</SelectItem>
                    <SelectItem value="320">320 kbps</SelectItem>
                    <SelectItem value="lossless">Lossless</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="device">Audio Output Device</Label>
                <Select value={settings.audioDevice} onValueChange={(value) => updateSetting('audioDevice', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">System Default</SelectItem>
                    <SelectItem value="speakers">Speakers</SelectItem>
                    <SelectItem value="headphones">Headphones</SelectItem>
                    <SelectItem value="bluetooth">Bluetooth Device</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Audio Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="high-quality">High Quality Audio</Label>
                <p className="text-sm text-muted-foreground">Use high quality audio processing</p>
              </div>
              <Switch 
                id="high-quality"
                checked={settings.highQualityAudio}
                onCheckedChange={(value) => updateSetting('highQualityAudio', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="volume-norm">Volume Normalization</Label>
                <p className="text-sm text-muted-foreground">Automatically adjust volume levels</p>
              </div>
              <Switch 
                id="volume-norm"
                checked={settings.volumeNormalization}
                onCheckedChange={(value) => updateSetting('volumeNormalization', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="crossfade">Crossfade</Label>
                <p className="text-sm text-muted-foreground">Smooth transitions between tracks</p>
              </div>
              <Switch 
                id="crossfade"
                checked={settings.crossfadeEnabled}
                onCheckedChange={(value) => updateSetting('crossfadeEnabled', value)}
              />
            </div>
            {settings.crossfadeEnabled && (
              <div className="space-y-2 ml-6">
                <Label>Crossfade Duration: {settings.crossfadeDuration}s</Label>
                <Slider
                  value={[settings.crossfadeDuration]}
                  onValueChange={(value) => updateSetting('crossfadeDuration', value[0])}
                  max={12}
                  min={1}
                  step={1}
                  className="w-full max-w-md"
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Equalizer */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold flex items-center space-x-2">
                <Sliders className="h-4 w-4" />
                <span>Equalizer</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(equalizerPresets).map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    onClick={() => applyEqualizerPreset(preset)}
                    className="text-xs lg:text-sm"
                  >
                    {preset}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-5 lg:grid-cols-10 gap-2 lg:gap-3">
              {frequencies.map((freq, index) => (
                <div key={freq} className="space-y-2">
                  <div className="text-center">
                    <span className="text-xs font-medium">{equalizerBands[index] > 0 ? '+' : ''}{equalizerBands[index]}</span>
                  </div>
                  <Slider
                    value={[equalizerBands[index]]}
                    onValueChange={(value) => updateEqualizerBand(index, value)}
                    orientation="vertical"
                    max={6}
                    min={-6}
                    step={0.5}
                    className="h-24 lg:h-32"
                  />
                  <div className="text-center">
                    <span className="text-xs text-muted-foreground">{freq}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Library Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Music className="h-5 w-5" />
            <span>Library</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="library-path">Music Library Path</Label>
              <div className="flex space-x-2">
                <Input
                  id="library-path"
                  value={settings.libraryPath}
                  onChange={(e) => updateSetting('libraryPath', e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" onClick={handleBrowseLibraryPath}>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Browse
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-scan">Auto-scan Library</Label>
                <p className="text-sm text-muted-foreground">Automatically scan for new music files</p>
              </div>
              <Switch 
                id="auto-scan"
                checked={settings.autoScan}
                onCheckedChange={(value) => updateSetting('autoScan', value)}
              />
            </div>

            {settings.autoScan && (
              <div className="space-y-2 ml-6">
                <Label>Scan Interval: Every {settings.scanInterval} hours</Label>
                <Slider
                  value={[settings.scanInterval]}
                  onValueChange={(value) => updateSetting('scanInterval', value[0])}
                  max={168}
                  min={1}
                  step={1}
                  className="w-full max-w-md"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-art">Auto-download Album Art</Label>
                <p className="text-sm text-muted-foreground">Automatically fetch missing album artwork</p>
              </div>
              <Switch 
                id="auto-art"
                checked={settings.autoDownloadArt}
                onCheckedChange={(value) => updateSetting('autoDownloadArt', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-metadata">Auto-download Metadata</Label>
                <p className="text-sm text-muted-foreground">Automatically fetch missing song information</p>
              </div>
              <Switch 
                id="auto-metadata"
                checked={settings.autoDownloadMetadata}
                onCheckedChange={(value) => updateSetting('autoDownloadMetadata', value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Cache Size: {settings.cacheSize} MB</Label>
              <Slider
                value={[settings.cacheSize]}
                onValueChange={(value) => updateSetting('cacheSize', value[0])}
                max={2000}
                min={100}
                step={50}
                className="w-full max-w-md"
              />
              <p className="text-sm text-muted-foreground">Album art and metadata cache size</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Privacy & Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-stats">Enable Statistics</Label>
              <p className="text-sm text-muted-foreground">Track listening habits and play counts</p>
            </div>
            <Switch 
              id="enable-stats"
              checked={settings.enableStats}
              onCheckedChange={(value) => updateSetting('enableStats', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Show Notifications</Label>
              <p className="text-sm text-muted-foreground">Display system notifications for tracks</p>
            </div>
            <Switch 
              id="notifications"
              checked={settings.showNotifications}
              onCheckedChange={(value) => updateSetting('showNotifications', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Appearance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select value={settings.theme} onValueChange={(value) => updateSetting('theme', value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="auto">Auto (System)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="it">Italiano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
        <Button className="w-full sm:w-auto" onClick={handleSaveSettings}>Save Settings</Button>
        <Button variant="outline" className="w-full sm:w-auto" onClick={handleResetToDefaults}>Reset to Defaults</Button>
        <Button variant="outline" className="w-full sm:w-auto" onClick={handleExportSettings}>Export Settings</Button>
        <Button variant="outline" className="w-full sm:w-auto" onClick={handleImportSettings}>Import Settings</Button>
      </div>

      {/* Folder Selector Dialog */}
      <FolderSelector
        open={folderSelectorOpen}
        onOpenChange={setFolderSelectorOpen}
        currentPath={settings.libraryPath}
        onPathSelect={handleFolderSelect}
      />
    </div>
  );
}
