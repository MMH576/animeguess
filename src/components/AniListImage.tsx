import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

interface AniListImageProps {
  onNewImage?: (characterName: string, animeTitle?: string) => void;
  width?: number;
  height?: number;
  className?: string;
  difficulty?: "easy" | "normal";
}

const AniListImage = ({
  onNewImage,
  width = 300, 
  height = 400,
  className = "",
  difficulty = "normal"
}: AniListImageProps) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [characterName, setCharacterName] = useState<string>("");
  const [animeTitle, setAnimeTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);
  const [characterFact, setCharacterFact] = useState<string>("");
  const [isLoadingFact, setIsLoadingFact] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);

  const fetchAnimeCharacter = async () => {
    setLoading(true);
    setError(false);
    setImageLoaded(false);
    setImgError(false);
    setCharacterFact("");
    
    try {
      // Add a cache-busting parameter
      const cacheBuster = Date.now();
      const response = await fetch(`/api/anime-image?t=${cacheBuster}&retry=${retryCount}`, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        console.error(`API error: ${response.status}`, await response.text());
        throw new Error("Failed to fetch anime character");
      }
      
      const data = await response.json();
      console.log("API response:", data);
      
      setImageUrl(data.imageUrl || "/images/mystery.svg");
      setCharacterName(data.characterName || "");
      setAnimeTitle(data.animeTitle || "");
      
      if (onNewImage) {
        onNewImage(data.characterName, data.animeTitle);
      }
      
      // Always fetch character fact in easy mode
      if (difficulty === "easy" && data.characterName) {
        await fetchCharacterFact(data.characterName, data.animeTitle);
      } else if (difficulty === "easy") {
        // Set a default fact even if no character name is available
        setCharacterFact("Look closely at the character's distinctive features!");
      }
      
    } catch (error) {
      console.error("Error fetching anime character:", error);
      setError(true);
      
      toast({
        title: "Error Loading Character",
        description: "We couldn't fetch a character. Try again later.",
        variant: "destructive",
      });
      
      if (difficulty === "easy") {
        setCharacterFact("Try looking for this character's unique appearance");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimeCharacter();
  }, [difficulty, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    toast({
      title: "Refreshing",
      description: "Finding a new character for you...",
      variant: "default",
    });
  };

  const fetchCharacterFact = async (name: string, anime?: string) => {
    setIsLoadingFact(true);
    try {
      // Attempt to get an interesting fact about the character
      const factResponse = await fetch(`/api/character-fact?name=${encodeURIComponent(name)}`);
      
      if (factResponse.ok) {
        const factData = await factResponse.json();
        if (factData.fact) {
          setCharacterFact(factData.fact);
          return;
        }
      }
      
      // If we have anime title, use it directly instead of trying to detect from name
      if (anime && anime !== "Unknown Anime") {
        setCharacterFact(`This character appears in ${anime}`);
        return;
      }
      
      // Custom generic hints based on anime series patterns as fallback
      createGenericHint(name);
    } catch (error) {
      console.error("Error fetching character fact:", error);
      // Create a custom hint as fallback
      createGenericHint(name);
    } finally {
      setIsLoadingFact(false);
    }
  };

  // Generate custom hints without revealing the character name
  const createGenericHint = (name: string) => {
    const nameLower = name.toLowerCase();
    
    // Detect anime series from name or check for common patterns
    if (nameLower.includes("naruto") || nameLower.includes("uchiha") || nameLower.includes("uzumaki")) {
      setCharacterFact("This character is from the Naruto series");
    } else if (nameLower.includes("piece") || nameLower.includes("luffy") || nameLower.includes("roronoa")) {
      setCharacterFact("This character is from the One Piece series");
    } else if (nameLower.includes("dragon") || nameLower.includes("ball") || nameLower.includes("saiyan")) {
      setCharacterFact("This character is from the Dragon Ball series");
    } else if (nameLower.includes("attack") || nameLower.includes("titan") || nameLower.includes("yeager")) {
      setCharacterFact("This character fights against Titans");
    } else if (nameLower.includes("fullmetal") || nameLower.includes("elric") || nameLower.includes("alchemist")) {
      setCharacterFact("This character is skilled in alchemy");
    } else if (nameLower.includes("pokemon") || nameLower.includes("pikachu") || nameLower.includes("ash")) {
      setCharacterFact("This character is related to Pokémon");
    } else if (nameLower.includes("slayer") || nameLower.includes("kimetsu") || nameLower.includes("kamado")) {
      setCharacterFact("This character hunts demons with a special sword");
    } else {
      // Generic hints based on character appearance or role
      const hints = [
        "This character has a distinctive outfit",
        "Look at their facial features closely",
        "This character has a unique hairstyle",
        "This character has a memorable personality",
        "Notice any special weapons or accessories",
        "This character plays an important role in the story"
      ];
      setCharacterFact(hints[Math.floor(Math.random() * hints.length)]);
    }
  };

  const handleImageLoad = () => {
    console.log(`Image loaded successfully: ${imageUrl}`);
    setImageLoaded(true);
  };

  const handleImageError = () => {
    console.error(`Image failed to load: ${imageUrl}`);
    setImgError(true);
    
    toast({
      title: "Image Error",
      description: "Could not load character image. Showing fallback.",
      variant: "destructive",
    });
    
    // Set a default fact for error cases in easy mode
    if (difficulty === "easy" && !characterFact) {
      setCharacterFact("Look for this character's distinctive features");
    }
  };

  const getHint = () => {
    if (characterName && animeTitle && animeTitle !== "Unknown Anime") {
      return `This character appears in ${animeTitle}`;
    }
    return characterFact || "Loading hint...";
  };

  // Calculate image effects based on difficulty
  const getImageEffects = () => {
    if (difficulty === "easy") return "blur-none";
    
    // Normal mode - reduced blur with grayscale
    return "blur-[6px] grayscale-[100%] contrast-125 brightness-110"; 
  };

  // Generate fallback content from character name
  const getFallbackContent = () => {
    if (!characterName) return (
      <div className="w-full h-full flex items-center justify-center bg-transparent">
        {/* No placeholder content - completely empty */}
      </div>
    );
    
    // Create a color based on the first letter for consistency
    const getColorClass = () => {
      const initialLetter = (characterName[0] || 'A').toUpperCase();
      const colorMap: Record<string, string> = {
        'A': 'bg-[#66FCF1]',
        'B': 'bg-[#45A29E]',
        'C': 'bg-[#66FCF1]',
        'D': 'bg-[#45A29E]',
        'E': 'bg-[#66FCF1]',
        'F': 'bg-[#45A29E]',
        'G': 'bg-[#66FCF1]',
        'H': 'bg-[#45A29E]',
        'I': 'bg-[#66FCF1]',
        'J': 'bg-[#45A29E]',
        'K': 'bg-[#66FCF1]',
        'L': 'bg-[#45A29E]',
        'M': 'bg-[#66FCF1]',
        'N': 'bg-[#45A29E]',
        'O': 'bg-[#66FCF1]',
        'P': 'bg-[#45A29E]',
        'Q': 'bg-[#66FCF1]',
        'R': 'bg-[#45A29E]',
        'S': 'bg-[#66FCF1]',
        'T': 'bg-[#45A29E]',
        'U': 'bg-[#66FCF1]',
        'V': 'bg-[#45A29E]',
        'W': 'bg-[#66FCF1]',
        'X': 'bg-[#45A29E]',
        'Y': 'bg-[#66FCF1]',
        'Z': 'bg-[#45A29E]'
      };
      
      return colorMap[initialLetter] || 'bg-[#66FCF1]';
    };
    
    // Get initials (up to 2 characters)
    const getInitials = () => {
      return characterName
        .split(' ')
        .map(part => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    };
    
    return (
      <div className={`w-full h-full flex items-center justify-center ${getColorClass()}`}>
        <span className="text-[#0B0C10] text-5xl font-bold">
          {getInitials()}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Image container */}
      <div className={`relative rounded-lg overflow-hidden ${className}`} style={{ width, height }}>
        {loading ? (
          <div className="flex items-center justify-center w-full h-full bg-[#1F2833]">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-[#66FCF1] border-t-transparent rounded-full animate-spin mb-2"></div>
              <div className="text-[#66FCF1]">Loading character...</div>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center w-full h-full bg-[#1F2833]">
            <div className="text-center">
              <div className="text-red-500 mb-2">Failed to load image</div>
              <button 
                onClick={handleRetry}
                className="px-4 py-2 bg-[#66FCF1] text-[#0B0C10] rounded-lg hover:bg-[#66FCF1]/80 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : imgError ? (
          // Fallback content when image fails to load
          getFallbackContent()
        ) : (
          <>
            <div className={`absolute inset-0 bg-[#1F2833] flex items-center justify-center z-10 transition-opacity duration-300 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}>
              <div className="w-10 h-10 border-4 border-[#66FCF1] border-t-transparent rounded-full animate-spin"></div>
            </div>
            {/* Using standard img tag instead of Next/Image for better external image compatibility */}
            <img
              src={imageUrl}
              alt={`Anime character ${characterName}`}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${getImageEffects()}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </>
        )}
      </div>
      
      {/* DIRECT HINT DISPLAY - always visible in easy mode without needing clicks */}
      {difficulty === "easy" && (
        <div className="w-full mt-3 mb-1 py-3 px-4 bg-[#66FCF1] rounded-md text-center">
          <p className="text-[#0B0C10] font-bold text-base">
            {isLoadingFact ? "Loading hint..." : getHint()}
          </p>
        </div>
      )}
      
      {/* Only show normal mode hint if there's a character name */}
      {difficulty === "normal" && !loading && !error && !imgError && characterName && (
        <div className="mt-2 text-sm text-[#66FCF1] text-center">
          {getHint()}
        </div>
      )}
    </div>
  );
};

export default AniListImage; 