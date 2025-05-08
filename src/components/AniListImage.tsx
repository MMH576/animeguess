import { useState, useEffect } from "react";

interface AniListImageProps {
  onNewImage?: (characterName: string) => void;
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
      const response = await fetch(`/api/anime-image?mode=normal&t=${cacheBuster}&retry=${retryCount}`, {
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
      
      if (onNewImage && data.characterName) {
        onNewImage(data.characterName);
      }
      
      // Always fetch character fact in easy mode
      if (difficulty === "easy" && data.characterName) {
        await fetchCharacterFact(data.characterName);
      } else if (difficulty === "easy") {
        // Set a default fact even if no character name is available
        setCharacterFact("Look closely at the character's distinctive features!");
      }
      
    } catch (error) {
      console.error("Error fetching anime character:", error);
      setError(true);
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
  };

  const fetchCharacterFact = async (name: string) => {
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
      
      // Custom generic hints based on anime series patterns
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
    // Set a default fact for error cases in easy mode
    if (difficulty === "easy" && !characterFact) {
      setCharacterFact("Look for this character's distinctive features");
    }
  };

  const getHint = () => {
    if (difficulty === "easy") {
      if (isLoadingFact) return "Loading hint...";
      if (characterFact) return characterFact;
      
      // Default hint without revealing character name
      return "Look at the character's distinctive features";
    } else if (characterName) {
      // Normal mode only gets first letter hint if there's a character name
      const words = characterName.split(" ");
      return `Hint: First name starts with "${words[0][0]}"`;
    }
    
    // Default for normal mode with no character name
    return "";
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
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-800">
        <span className="text-white text-4xl font-bold">
          ?
        </span>
      </div>
    );
    
    // Create a color based on the first letter for consistency
    const getColorClass = () => {
      const initialLetter = (characterName[0] || 'A').toUpperCase();
      const colorMap: Record<string, string> = {
        'A': 'bg-red-600',
        'B': 'bg-blue-600',
        'C': 'bg-green-600',
        'D': 'bg-yellow-600',
        'E': 'bg-purple-600',
        'F': 'bg-pink-600',
        'G': 'bg-indigo-600',
        'H': 'bg-teal-600',
        'I': 'bg-cyan-600',
        'J': 'bg-orange-600',
        'K': 'bg-amber-600',
        'L': 'bg-lime-600',
        'M': 'bg-emerald-600',
        'N': 'bg-blue-800',
        'O': 'bg-violet-600',
        'P': 'bg-fuchsia-600',
        'Q': 'bg-rose-600',
        'R': 'bg-sky-600',
        'S': 'bg-red-700',
        'T': 'bg-blue-700',
        'U': 'bg-green-700',
        'V': 'bg-purple-700',
        'W': 'bg-pink-700',
        'X': 'bg-indigo-700',
        'Y': 'bg-yellow-700',
        'Z': 'bg-orange-700'
      };
      
      return colorMap[initialLetter] || 'bg-gray-600';
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
        <span className="text-white text-5xl font-bold">
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
          <div className="flex items-center justify-center w-full h-full bg-black/30">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-[#8B11D1] border-t-transparent rounded-full animate-spin mb-2"></div>
              <div className="text-[#8B11D1]">Loading character...</div>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center w-full h-full bg-black/50">
            <div className="text-center">
              <div className="text-red-500 mb-2">Failed to load image</div>
              <button 
                onClick={handleRetry}
                className="px-4 py-2 bg-[#8B11D1]/70 text-white rounded-lg hover:bg-[#8B11D1] transition-colors"
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
            <div className={`absolute inset-0 bg-black/50 flex items-center justify-center z-10 transition-opacity duration-300 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}>
              <div className="w-10 h-10 border-4 border-[#8B11D1] border-t-transparent rounded-full animate-spin"></div>
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
        <div className="w-full mt-3 mb-1 py-3 px-4 bg-red-600 rounded-md text-center">
          <p className="text-white font-bold text-base">
            {isLoadingFact ? "Loading hint..." : getHint()}
          </p>
        </div>
      )}
      
      {/* Only show normal mode hint if there's a character name */}
      {difficulty === "normal" && !loading && !error && !imgError && characterName && (
        <div className="mt-2 text-sm text-[#8B11D1]/70 text-center">
          {getHint()}
        </div>
      )}
    </div>
  );
};

export default AniListImage; 