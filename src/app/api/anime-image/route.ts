import { NextResponse } from "next/server";
import { anilistCharacterPool } from "@/lib/characters";
import sharp from "sharp";
import fs from "fs";
import { 
  getSilhouettePath, 
  getSilhouetteUrl, 
  ensureSilhouetteDirectory 
} from "@/lib/silhouette-utils";

// Module-scoped cache to store character image URLs
const imageCache: Record<string, string> = {};
const silhouetteCache: Record<string, string> = {};

// Ensure silhouettes directory exists on startup
ensureSilhouetteDirectory();

// Fallback image if AniList query fails
const FALLBACK_IMAGE_URL = "/images/mystery.svg";

// AniList GraphQL endpoint
const ANILIST_API_URL = "https://graphql.anilist.co";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "normal";
  
  // Pick a random character name from our pool
  const randomCharacterName = pickRandom(anilistCharacterPool);
  
  if (mode === "normal") {
    // Normal mode - return regular character image
    return getRegularCharacterImage(randomCharacterName);
  } else if (mode === "silhouette") {
    // Silhouette mode - process the image into a black silhouette
    return getSilhouetteImage(randomCharacterName);
  } else {
    // Invalid mode
    return NextResponse.json({ 
      error: "Invalid mode. Use 'normal' or 'silhouette'." 
    }, { status: 400 });
  }
}

// Function to get regular character image
async function getRegularCharacterImage(characterName: string) {
  // Check if we already have this character's image cached
  if (imageCache[characterName]) {
    console.log(`Cache hit: ${characterName}`);
    return NextResponse.json({ 
      imageUrl: imageCache[characterName],
      characterName: characterName 
    });
  }
  
  console.log(`Cache miss: ${characterName}`);
  
  // Prepare GraphQL query to fetch character image
  const query = `
    query ($search: String) {
      Character(search: $search) {
        name {
          full
        }
        image {
          large
        }
      }
    }
  `;
  
  try {
    // Send request to AniList GraphQL API
    console.log(`Fetching character image for: ${characterName}`);
    const response = await fetch(ANILIST_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { search: characterName }
      }),
      cache: "no-store", // Ensure fresh data
    });
    
    if (!response.ok) {
      console.error(`AniList API error: ${response.status}`, await response.text());
      throw new Error(`AniList API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if we got a valid image URL back
    const imageUrl = data.data?.Character?.image?.large;
    
    if (imageUrl) {
      console.log(`Successfully fetched image for ${characterName}: ${imageUrl}`);
      // Store in cache for future requests
      imageCache[characterName] = imageUrl;
      
      return NextResponse.json({ 
        imageUrl,
        characterName: characterName
      });
    } else {
      console.error(`No image found for character: ${characterName}`, data);
      throw new Error("No character image found");
    }
  } catch (error) {
    console.error(`Error fetching from AniList for ${characterName}:`, error);
    
    // Try to use backup fallback methods
    // 1. Check if we have a silhouette already
    const silhouettePath = getSilhouettePath(characterName);
    if (fs.existsSync(silhouettePath)) {
      console.log(`Using existing silhouette for ${characterName}`);
      return NextResponse.json({ 
        imageUrl: getSilhouetteUrl(characterName),
        characterName: characterName
      });
    }
    
    // 2. Look for character specific fallbacks in public/silhouettes
    const safeFileName = characterName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const possibleSilhouettePath = `/silhouettes/${safeFileName}.png`;
    console.log(`Trying fallback silhouette: ${possibleSilhouettePath}`);
    
    // 3. Last resort - use the mystery image
    return NextResponse.json({ 
      imageUrl: FALLBACK_IMAGE_URL,
      characterName: characterName,
      error: "Failed to fetch image"
    });
  }
}

// Function to get or generate silhouette image
async function getSilhouetteImage(characterName: string) {
  // Get file paths using utility functions
  const silhouettePath = getSilhouettePath(characterName);
  const silhouetteUrl = getSilhouetteUrl(characterName);
  
  // Check if we already have this silhouette in cache
  if (silhouetteCache[characterName]) {
    console.log(`Silhouette cache hit: ${characterName}`);
    return NextResponse.json({ 
      imageUrl: silhouetteCache[characterName],
      characterName: characterName 
    });
  }
  
  // Check if the silhouette file already exists on disk
  if (fs.existsSync(silhouettePath)) {
    console.log(`Silhouette file exists: ${silhouettePath}`);
    silhouetteCache[characterName] = silhouetteUrl;
    return NextResponse.json({ 
      imageUrl: silhouetteUrl,
      characterName: characterName 
    });
  }
  
  console.log(`Generating silhouette for: ${characterName}`);
  
  // Get the original image URL
  let originalImageUrl;
  
  if (imageCache[characterName]) {
    originalImageUrl = imageCache[characterName];
  } else {
    // Fetch the image URL from AniList
    const query = `
      query ($search: String) {
        Character(search: $search) {
          image {
            large
          }
        }
      }
    `;
    
    try {
      const response = await fetch(ANILIST_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          query,
          variables: { search: characterName }
        }),
      });
      
      if (!response.ok) {
        throw new Error(`AniList API returned ${response.status}`);
      }
      
      const data = await response.json();
      originalImageUrl = data.data?.Character?.image?.large;
      
      if (!originalImageUrl) {
        throw new Error("No character image found");
      }
      
      // Store in the regular cache
      imageCache[characterName] = originalImageUrl;
    } catch (error) {
      console.error("Error fetching from AniList:", error);
      return NextResponse.json({ 
        imageUrl: FALLBACK_IMAGE_URL,
        characterName: characterName,
        error: "Failed to fetch image" 
      });
    }
  }
  
  // Download the original image
  try {
    const imageResponse = await fetch(originalImageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Improved silhouette processing to ensure better black silhouettes
    await sharp(Buffer.from(imageBuffer))
      .resize(500, 700, { fit: 'inside', withoutEnlargement: true })
      .normalize()
      .modulate({ brightness: 1.3 }) // Increased brightness for better definition
      .grayscale()
      .threshold(40) // Adjusted threshold for clearer outlines
      .negate() // Invert colors for black silhouette
      .toFormat('png', { quality: 95 })
      .toFile(silhouettePath);
    
    // Add to cache
    silhouetteCache[characterName] = silhouetteUrl;
    
    return NextResponse.json({ 
      imageUrl: silhouetteUrl,
      characterName: characterName 
    });
  } catch (error) {
    console.error("Error generating silhouette:", error);
    return NextResponse.json({ 
      imageUrl: FALLBACK_IMAGE_URL,
      characterName: characterName,
      error: "Failed to generate silhouette" 
    });
  }
}

// Helper function to pick a random item from array
function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}