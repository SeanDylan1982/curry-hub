import { Router } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { access, constants, writeFile } from 'fs/promises';
import { fileTypeFromFile } from 'file-type';
import { promisify } from 'util';
import { exec } from 'child_process';
import * as mm from 'music-metadata';
import { IAudioMetadata, IOptions } from 'music-metadata';

const execAsync = promisify(exec);

// Directory to store extracted album art
const ALBUM_ART_DIR = path.join(process.cwd(), 'album-art');

// Ensure album art directory exists
(async () => {
  try {
    await fs.mkdir(ALBUM_ART_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating album art directory:', error);
  }
})();

const router = Router();

// Supported audio file extensions
const AUDIO_EXTENSIONS = ['.mp3', '.m4a', '.flac', '.wav', '.ogg', '.aac'];

// Interface for file metadata
interface FileMetadata {
  // Basic file info
  path: string;
  name: string;
  size: number;
  lastModified: Date;
  type: string;
  
  // Audio metadata
  duration?: number; // in seconds
  bitrate?: number; // in kbps
  sampleRate?: number; // in Hz
  channels?: number;
  
  // Extended metadata from music-metadata
  title?: string;
  artist?: string;
  album?: string;
  year?: number;
  track?: { no: number; of: number };
  disk?: { no: number; of: number };
  genre?: string[];
  picture?: {
    format: string;
    data: Buffer;
  };
  albumArtPath?: string; // Path to saved album art
  
  // Additional metadata
  comment?: string[];
  composer?: string[];
  lyrics?: Array<{ text: string; description?: string }>;
  
  // Original metadata for reference
  rawMetadata?: any;
}

/**
 * Check if a file is an audio file based on extension and content
 */
async function isAudioFile(filePath: string): Promise<boolean> {
  try {
    // First check extension
    const ext = path.extname(filePath).toLowerCase();
    if (!AUDIO_EXTENSIONS.includes(ext)) {
      return false;
    }

    // Then verify file type
    const type = await fileTypeFromFile(filePath);
    return type?.mime.startsWith('audio/') || false;
  } catch (error) {
    console.error(`Error checking if file is audio: ${filePath}`, error);
    return false;
  }
}

/**
 * Save album art to disk and return the path
 */
async function saveAlbumArt(filePath: string, picture: any): Promise<string> {
  try {
    const fileName = `art-${Date.now()}-${Math.floor(Math.random() * 1000)}.${picture.format.split('/')[1] || 'jpg'}`;
    const artPath = path.join(ALBUM_ART_DIR, fileName);
    await writeFile(artPath, picture.data);
    return artPath;
  } catch (error) {
    console.error('Error saving album art:', error);
    throw error;
  }
}

/**
 * Get enhanced audio file metadata using music-metadata
 */
async function getEnhancedMetadata(filePath: string): Promise<Partial<FileMetadata>> {
  try {
    const options: IOptions = {
      duration: true,
      skipCovers: false,
      includeChapters: true,
      skipPostHeaders: false,
    };

    const metadata = await mm.parseFile(filePath, options);
    const result: Partial<FileMetadata> = {
      title: metadata.common.title,
      artist: metadata.common.artist,
      album: metadata.common.album,
      year: metadata.common.year,
      track: metadata.common.track,
      disk: metadata.common.disk,
      genre: metadata.common.genre,
      comment: metadata.common.comment,
      composer: metadata.common.composer,
      duration: metadata.format.duration,
      bitrate: metadata.format.bitrate ? Math.round(metadata.format.bitrate / 1000) : undefined,
      sampleRate: metadata.format.sampleRate,
      channels: metadata.format.numberOfChannels,
      rawMetadata: metadata,
    };

    // Handle album art
    if (metadata.common.picture && metadata.common.picture.length > 0) {
      try {
        const artPath = await saveAlbumArt(filePath, metadata.common.picture[0]);
        result.albumArtPath = artPath;
      } catch (error) {
        console.error('Error processing album art:', error);
      }
    }

    // Handle lyrics
    if (metadata.common.lyrics && metadata.common.lyrics.length > 0) {
      result.lyrics = metadata.common.lyrics.map(lyric => ({
        text: lyric,
        description: 'Embedded lyrics'
      }));
    }

    return result;
  } catch (error) {
    console.error(`Error getting enhanced metadata for ${filePath}:`, error);
    // Fall back to basic metadata if enhanced parsing fails
    return getBasicMetadata(filePath);
  }
}

/**
 * Get basic audio file metadata using ffprobe as fallback
 */
async function getBasicMetadata(filePath: string): Promise<Partial<FileMetadata>> {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -show_entries format=duration,bit_rate -show_entries stream=sample_rate,channels -of json "${filePath}"`
    );
    
    const data = JSON.parse(stdout);
    const format = data.format || {};
    const stream = Array.isArray(data.streams) ? data.streams[0] : {};
    
    // Extract basic info from filename as fallback
    const fileName = path.basename(filePath, path.extname(filePath));
    
    return {
      title: fileName,
      artist: 'Unknown Artist',
      album: 'Unknown Album',
      duration: format.duration ? parseFloat(format.duration) : undefined,
      bitrate: format.bit_rate ? Math.round(parseInt(format.bit_rate) / 1000) : undefined,
      sampleRate: stream.sample_rate ? parseInt(stream.sample_rate) : undefined,
      channels: stream.channels ? parseInt(stream.channels) : undefined
    };
  } catch (error) {
    console.error(`Error getting basic metadata: ${filePath}`, error);
    return {
      title: path.basename(filePath, path.extname(filePath)),
      artist: 'Unknown Artist',
      album: 'Unknown Album'
    };
  }
}

/**
 * Recursively scan a directory for audio files
 */
async function scanDirectory(directory: string): Promise<FileMetadata[]> {
  const results: FileMetadata[] = [];
  
  try {
    const files = await fs.readdir(directory, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(directory, file.name);
      
      try {
        if (file.isDirectory()) {
          // Recursively scan subdirectories
          const subResults = await scanDirectory(fullPath);
          results.push(...subResults);
        } else if (file.isFile() && await isAudioFile(fullPath)) {
          // Get file stats
          const stats = await fs.stat(fullPath);
          
          // Get basic file info
          const fileInfo: FileMetadata = {
            path: fullPath,
            name: file.name,
            size: stats.size,
            lastModified: stats.mtime,
            type: path.extname(file.name).toLowerCase().substring(1)
          };
          
          // Get enhanced metadata including album art
          const audioMetadata = await getEnhancedMetadata(fullPath);
          
          // Fallback to filename for title if not present in metadata
          if (!audioMetadata.title) {
            audioMetadata.title = path.basename(fullPath, path.extname(fullPath));
          }
          
          results.push({ ...fileInfo, ...audioMetadata });
        }
      } catch (error) {
        console.error(`Error processing file: ${fullPath}`, error);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory: ${directory}`, error);
  }
  
  return results;
}

// Scan directory endpoint
router.post('/scan', async (req, res) => {
  console.log('\n--- NEW SCAN REQUEST ---');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  
  try {
    // Validate request body
    if (!req.body || typeof req.body !== 'object') {
      const error = new Error('Request body must be a JSON object');
      (error as any).status = 400;
      throw error;
    }
    
    const { directory } = req.body;
    
    if (!directory || typeof directory !== 'string') {
      const error = new Error('Directory path is required and must be a string');
      (error as any).status = 400;
      throw error;
    }
    
    // Normalize the directory path
    const normalizedDir = path.normalize(directory);
    console.log(`Normalized directory path: ${normalizedDir}`);
    
    // Verify directory exists and is accessible
    try {
      console.log(`Checking directory access: ${normalizedDir}`);
      const stats = await fs.stat(normalizedDir);
      
      if (!stats.isDirectory()) {
        console.error(`Path exists but is not a directory: ${normalizedDir}`);
        return res.status(400).json({ 
          success: false,
          error: 'The specified path is not a directory',
          path: normalizedDir
        });
      }
      
      // Test read access by trying to read the directory
      await fs.access(normalizedDir, constants.R_OK);
      console.log(`Directory is accessible: ${normalizedDir}`);
      
    } catch (error) {
      console.error(`Directory access error (${normalizedDir}):`, error);
      return res.status(400).json({ 
        success: false,
        error: 'Directory does not exist or is not accessible',
        path: normalizedDir,
        details: error.message,
        code: error.code
      });
    }
    
    try {
      console.log(`Starting scan of directory: ${normalizedDir}`);
      const startTime = Date.now();
      
      // Log current working directory and path resolution
      console.log(`Current working directory: ${process.cwd()}`);
      console.log(`Resolved path: ${path.resolve(normalizedDir)}`);
      
      // Try to list directory contents as a test
      try {
        const testFiles = await fs.readdir(normalizedDir);
        console.log(`Found ${testFiles.length} items in directory. First few items:`, testFiles.slice(0, 5));
      } catch (testError) {
        console.error('Error listing directory contents:', testError);
        throw new Error(`Cannot read directory contents: ${testError.message}`);
      }
      
      const files = await scanDirectory(normalizedDir);
      const scanTime = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log(`Scan completed in ${scanTime}s. Found ${files.length} audio files in ${normalizedDir}`);
      
      // Process files to include only necessary data
      const processedFiles = files.map(f => ({
        path: f.path,
        name: f.name,
        size: f.size,
        type: f.type,
        duration: f.duration,
        bitrate: f.bitrate,
        title: f.title || path.basename(f.path, path.extname(f.path)),
        artist: f.artist || 'Unknown Artist',
        album: f.album || 'Unknown Album',
        year: f.year,
        genre: f.genre,
        sampleRate: f.sampleRate,
        channels: f.channels,
        albumArtPath: f.albumArtPath ? 
          `/album-art/${path.basename(f.albumArtPath)}` : undefined
      }));
      
      return res.json({ 
        success: true, 
        count: processedFiles.length,
        scanTime: `${scanTime}s`,
        files: processedFiles
      });
      
    } catch (error) {
      console.error('Error during directory scan:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Error scanning directory',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
      
  } catch (error) {
    console.error('Unexpected error in /scan endpoint:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;
