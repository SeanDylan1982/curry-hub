import { libraryManager, AppSettings } from './library-manager';

class AudioManager {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private equalizerNodes: BiquadFilterNode[] = [];
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private settings: AppSettings;

  constructor() {
    this.settings = libraryManager.getSettings();
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.setupAudioNodes();
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  private setupAudioNodes() {
    if (!this.audioContext) return;

    // Create gain node for volume control
    this.gainNode = this.audioContext.createGain();
    
    // Create analyser node for visualizations
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 256;

    // Create equalizer nodes (10-band)
    this.equalizerNodes = [];
    const frequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
    
    for (let i = 0; i < frequencies.length; i++) {
      const filter = this.audioContext.createBiquadFilter();
      
      if (i === 0) {
        filter.type = 'lowshelf';
      } else if (i === frequencies.length - 1) {
        filter.type = 'highshelf';
      } else {
        filter.type = 'peaking';
        filter.Q.value = 1;
      }
      
      filter.frequency.value = frequencies[i];
      filter.gain.value = this.settings.equalizerBands[i];
      
      this.equalizerNodes.push(filter);
    }

    this.connectNodes();
    this.applySettings();
  }

  private connectNodes() {
    if (!this.audioContext || !this.gainNode || !this.analyserNode) return;

    // Connect equalizer nodes in series
    let previousNode: AudioNode = this.gainNode;
    
    for (const filterNode of this.equalizerNodes) {
      previousNode.connect(filterNode);
      previousNode = filterNode;
    }

    // Connect to analyser and destination
    previousNode.connect(this.analyserNode);
    this.analyserNode.connect(this.audioContext.destination);
  }

  connectAudioElement(audioElement: HTMLAudioElement) {
    if (!this.audioContext || !this.gainNode) return;

    this.audioElement = audioElement;

    // Resume audio context if suspended (required by browser autoplay policies)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    // Create source node if not exists
    if (!this.sourceNode) {
      this.sourceNode = this.audioContext.createMediaElementSource(audioElement);
      this.sourceNode.connect(this.gainNode);
    }
  }

  updateEqualizer(bands: number[]) {
    if (this.equalizerNodes.length !== bands.length) return;

    for (let i = 0; i < bands.length; i++) {
      this.equalizerNodes[i].gain.value = bands[i];
    }
  }

  setVolume(volume: number) {
    if (this.gainNode) {
      // Convert linear volume (0-1) to logarithmic scale
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  enableVolumeNormalization(enabled: boolean) {
    if (!this.audioElement) return;

    if (enabled) {
      // Simple volume normalization - adjust based on audio peaks
      this.audioElement.addEventListener('loadedmetadata', this.normalizeVolume.bind(this));
    } else {
      this.audioElement.removeEventListener('loadedmetadata', this.normalizeVolume.bind(this));
    }
  }

  private normalizeVolume() {
    if (!this.audioElement || !this.analyserNode) return;

    // Basic volume normalization - this is a simplified implementation
    // In a real app, you'd analyze the audio more thoroughly
    const bufferLength = this.analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const checkVolume = () => {
      this.analyserNode!.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      
      if (average < 50) {
        // Audio is quiet, boost it slightly
        this.setVolume(Math.min(1, this.audioElement!.volume * 1.1));
      } else if (average > 150) {
        // Audio is loud, reduce it slightly
        this.setVolume(Math.max(0.1, this.audioElement!.volume * 0.9));
      }
    };

    // Check volume periodically during playback
    const interval = setInterval(() => {
      if (this.audioElement!.paused) {
        clearInterval(interval);
      } else {
        checkVolume();
      }
    }, 1000);
  }

  enableCrossfade(enabled: boolean, duration: number = 5) {
    // This would be implemented with multiple audio elements
    // For now, we'll just store the setting
    console.log(`Crossfade ${enabled ? 'enabled' : 'disabled'} with duration ${duration}s`);
  }

  setAudioQuality(maxBitrate: string) {
    // This would affect how audio files are loaded/decoded
    // For now, we'll just store the setting
    console.log(`Audio quality set to ${maxBitrate}`);
  }

  getAnalyserData(): Uint8Array | null {
    if (!this.analyserNode) return null;
    
    const bufferLength = this.analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyserNode.getByteFrequencyData(dataArray);
    return dataArray;
  }

  private applySettings() {
    this.updateEqualizer(this.settings.equalizerBands);
    this.enableVolumeNormalization(this.settings.volumeNormalization);
    this.enableCrossfade(this.settings.crossfadeEnabled, this.settings.crossfadeDuration);
    this.setAudioQuality(this.settings.maxBitrate);
  }

  updateSettings() {
    this.settings = libraryManager.getSettings();
    this.applySettings();
  }

  destroy() {
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Create singleton instance
export const audioManager = new AudioManager();

// Update audio manager when settings change
let lastSettingsCheck = Date.now();
setInterval(() => {
  const now = Date.now();
  if (now - lastSettingsCheck > 1000) { // Check every second
    audioManager.updateSettings();
    lastSettingsCheck = now;
  }
}, 1000);
