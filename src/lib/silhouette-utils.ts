import fs from 'fs';
import path from 'path';

// Directory to store silhouettes
export const SILHOUETTES_DIR = path.join(process.cwd(), "public", "silhouettes");

/**
 * Ensures the silhouettes directory exists, creating it if necessary
 */
export function ensureSilhouetteDirectory() {
  try {
    // Check if directory exists
    if (!fs.existsSync(SILHOUETTES_DIR)) {
      console.log(`Creating silhouettes directory at: ${SILHOUETTES_DIR}`);
      fs.mkdirSync(SILHOUETTES_DIR, { recursive: true });
    }
    return true;
  } catch (error) {
    console.error("Failed to create silhouettes directory:", error);
    return false;
  }
}

/**
 * Creates a safe file name from a character name
 */
export function getSafeFileName(characterName: string): string {
  return characterName
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase();
}

/**
 * Gets the full path for a silhouette image file
 */
export function getSilhouettePath(characterName: string): string {
  const safeFileName = getSafeFileName(characterName);
  return path.join(SILHOUETTES_DIR, `${safeFileName}.png`);
}

/**
 * Gets the URL for a silhouette image
 */
export function getSilhouetteUrl(characterName: string): string {
  const safeFileName = getSafeFileName(characterName);
  return `/silhouettes/${safeFileName}.png`;
}

// Ensure the directory exists on module load
ensureSilhouetteDirectory(); 