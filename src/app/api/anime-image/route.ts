import { NextResponse } from "next/server";

// Fallback image if AniList query fails
const FALLBACK_IMAGE_URL = "/images/mystery.svg";

// AniList GraphQL endpoint
const ANILIST_API_URL = "https://graphql.anilist.co";

// Define interfaces for AniList character data
interface AnimeTitle {
  romaji?: string;
  english?: string;
}

interface AnimeMedia {
  nodes: {
    title: AnimeTitle;
    popularity?: number;
  }[];
}

interface AniListCharacter {
  id: number;
  name: {
    full: string;
  };
  image: {
    large: string;
  };
  favourites: number;
  media?: AnimeMedia;
}

// Module-scoped cache for character data to avoid excessive API calls
let cachedCharacters: AniListCharacter[] = [];
let cacheTimestamp: number = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour
const MAX_CHARACTERS = 200; // Limit to top 200 characters

// Function to fetch popular characters from AniList with pagination
async function fetchPopularCharacters(): Promise<AniListCharacter[]> {
  // If cache is still valid, use it
  const now = Date.now();
  if (cachedCharacters.length > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log(`Using cached characters list (${cachedCharacters.length} characters)`);
    return cachedCharacters;
  }

  console.log('Fetching top popular characters from AniList...');
  
  // Reset cache
  cachedCharacters = [];
  let allCharacters: AniListCharacter[] = [];
  let currentPage = 1;
  let hasNextPage = true;
  
  // Paginate through results until we have enough characters or run out
  while (hasNextPage && allCharacters.length < MAX_CHARACTERS) {
    const query = `
      query ($page: Int) {
        Page(page: $page, perPage: 50) {
          pageInfo {
            hasNextPage
            total
          }
          characters(sort: FAVOURITES_DESC) {
            id
            name {
              full
            }
            favourites
            image {
              large
            }
            media(sort: POPULARITY_DESC, perPage: 1) {
              nodes {
                title {
                  romaji
                  english
                }
                popularity
              }
            }
          }
        }
      }
    `;

    try {
      console.log(`Fetching page ${currentPage}...`);
      const response = await fetch(ANILIST_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ 
          query, 
          variables: { page: currentPage } 
        }),
        cache: "no-store",
      });

      if (!response.ok) {
        console.error(`AniList API error: ${response.status}`, await response.text());
        throw new Error(`AniList API returned ${response.status}`);
      }

      const data = await response.json();
      
      // Filter out characters without images and from unpopular anime
      const validCharacters = data.data.Page.characters.filter((char: AniListCharacter) => 
        char.image && 
        char.image.large && 
        !char.image.large.includes('default.jpg') &&
        char.media?.nodes?.[0]?.title // Ensure character has associated anime
      );
      
      allCharacters = allCharacters.concat(validCharacters);
      
      // Only continue pagination if we need more characters
      if (allCharacters.length < MAX_CHARACTERS) {
        hasNextPage = data.data.Page.pageInfo.hasNextPage;
        currentPage++;
      } else {
        hasNextPage = false;
      }
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Error fetching characters:", error);
      break;
    }
  }

  // Limit to the MAX_CHARACTERS most popular characters
  allCharacters = allCharacters.slice(0, MAX_CHARACTERS);
  
  console.log(`Using top ${allCharacters.length} popular characters from AniList`);
  
  // Update cache
  cachedCharacters = allCharacters;
  cacheTimestamp = now;
  
  return allCharacters;
}

export async function GET() {
  try {
    const characters = await fetchPopularCharacters();
    
    if (characters.length === 0) {
      console.error("Failed to fetch characters or none were returned");
      return NextResponse.json({
        imageUrl: FALLBACK_IMAGE_URL,
        characterName: "Unknown Character",
        error: "Failed to fetch characters"
      });
    }

    // Select a random character from the fetched list
    const randomCharacter = pickRandom(characters);
    
    // Extract character information
    const characterName = randomCharacter.name.full;
    const imageUrl = randomCharacter.image.large;
    const animeTitle = randomCharacter.media?.nodes?.[0]?.title?.english || 
                      randomCharacter.media?.nodes?.[0]?.title?.romaji || 
                      "Unknown Anime";
    
    console.log(`Selected random character: ${characterName} from ${animeTitle}`);
    
    return NextResponse.json({ 
      imageUrl,
      characterName,
      animeTitle
    });
  } catch (error) {
    console.error("Error in GET handler:", error);
    return NextResponse.json({ 
      imageUrl: FALLBACK_IMAGE_URL,
      characterName: "Unknown",
      error: "Failed to process request"
    });
  }
}

// Helper to pick a random item from an array
function pickRandom<T>(array: T[]): T {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}