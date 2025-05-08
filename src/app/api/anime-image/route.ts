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
  
  // Get regular character image
  return getRegularCharacterImage(randomCharacterName);
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
    
    // Last resort - use the mystery image
    return NextResponse.json({ 
      imageUrl: FALLBACK_IMAGE_URL,
      characterName: characterName,
      error: "Failed to fetch image"
    });
  }
}

// Helper to pick a random item from an array
function pickRandom<T>(array: T[]): T {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}