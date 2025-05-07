import { useState, useEffect } from "react";
import Image from "next/image";

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

  const fetchAnimeCharacter = async () => {
    setLoading(true);
    setError(false);
    setImageLoaded(false);
    
    // Always use normal mode since hard/silhouette is removed
    try {
      const response = await fetch(`/api/anime-image?mode=normal&t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch anime character");
      }
      
      const data = await response.json();
      
      setImageUrl(data.imageUrl);
      setCharacterName(data.characterName || "");
      
      if (onNewImage && data.characterName) {
        onNewImage(data.characterName);
      }
      
    } catch (error) {
      console.error("Error fetching anime character:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimeCharacter();
  }, [difficulty]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const getHint = () => {
    if (!characterName) return "";
    const words = characterName.split(" ");
    return `Hint: First name starts with "${words[0][0]}"`;
  };

  // Calculate image effects based on difficulty
  const getImageEffects = () => {
    if (difficulty === "easy") return "blur-none";
    
    // Normal mode - reduced blur with grayscale
    return "blur-[6px] grayscale-[100%] contrast-125 brightness-110"; 
  };

  return (
    <div className="flex flex-col items-center gap-2">
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
                onClick={fetchAnimeCharacter}
                className="px-4 py-2 bg-[#8B11D1]/70 text-white rounded-lg hover:bg-[#8B11D1] transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={`absolute inset-0 bg-black/50 flex items-center justify-center z-10 transition-opacity duration-300 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}>
              <div className="w-10 h-10 border-4 border-[#8B11D1] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <Image
              src={imageUrl}
              alt={`Anime character ${characterName}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${getImageEffects()}`}
              priority
              onLoad={handleImageLoad}
            />
          </>
        )}
      </div>
      {difficulty === "normal" && !loading && !error && (
        <div className="text-sm text-[#8B11D1]/70">
          {getHint()}
        </div>
      )}
    </div>
  );
};

export default AniListImage; 