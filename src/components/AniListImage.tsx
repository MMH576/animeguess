import { useState, useEffect } from "react";
import Image from "next/image";

interface AniListImageProps {
  onNewImage?: (characterName: string) => void;
  width?: number;
  height?: number;
  className?: string;
}

const AniListImage = ({
  onNewImage,
  width = 300, 
  height = 400,
  className = ""
}: AniListImageProps) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [characterName, setCharacterName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const fetchAnimeCharacter = async () => {
    setLoading(true);
    setError(false);
    
    try {
      const response = await fetch("/api/anime-image");
      
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

  // Fetch character image when component mounts
  useEffect(() => {
    fetchAnimeCharacter();
  }, []);

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`} style={{ width, height }}>
      {loading ? (
        <div className="flex items-center justify-center w-full h-full bg-black/30">
          <div className="animate-pulse text-[#8B11D1]">Loading...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center w-full h-full bg-black/50">
          <div className="text-red-500">Failed to load image</div>
        </div>
      ) : (
        <Image
          src={imageUrl}
          alt={`Anime character ${characterName}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          priority
        />
      )}
    </div>
  );
};

export default AniListImage; 