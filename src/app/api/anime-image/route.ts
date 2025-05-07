import { NextResponse } from "next/server";
import { anilistCharacterPool } from "@/lib/characters";

// Module-scoped cache to store character image URLs
const imageCache: Record<string, string> = {};

// Fallback image if AniList query fails
const FALLBACK_IMAGE_URL = "/images/mystery.svg";

// AniList GraphQL endpoint
const ANILIST_API_URL = "https://graphql.anilist.co";

export async function GET() {
  // Pick a random character name from our pool
  const randomCharacterName = pickRandom(anilistCharacterPool);
  
  // Check if we already have this character's image cached
  if (imageCache[randomCharacterName]) {
    console.log(`Cache hit: ${randomCharacterName}`);
    return NextResponse.json({ 
      imageUrl: imageCache[randomCharacterName],
      characterName: randomCharacterName 
    });
  }
  
  console.log(`Cache miss: ${randomCharacterName}`);
  
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
    const response = await fetch(ANILIST_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { search: randomCharacterName }
      }),
    });
    
    if (!response.ok) {
      throw new Error(`AniList API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if we got a valid image URL back
    const imageUrl = data.data?.Character?.image?.large;
    
    if (imageUrl) {
      // Store in cache for future requests
      imageCache[randomCharacterName] = imageUrl;
      
      return NextResponse.json({ 
        imageUrl,
        characterName: randomCharacterName
      });
    } else {
      throw new Error("No character image found");
    }
  } catch (error) {
    console.error("Error fetching from AniList:", error);
    
    // Return fallback image on any error
    return NextResponse.json({ 
      imageUrl: FALLBACK_IMAGE_URL,
      characterName: randomCharacterName,
      error: "Failed to fetch image"
    });
  }
}

// Helper function to pick a random item from array
function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
} 