"use client";

import { useState, useEffect } from "react";

interface MysteryImageProps {
  imageUrl: string;
  characterName: string;
  isEasyMode?: boolean;
  className?: string;
}

// This component handles displaying mystery images with hints in easy mode
export const MysteryImage = ({
  imageUrl,
  characterName,
  isEasyMode = false,
  className = ""
}: MysteryImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [hint, setHint] = useState("");

  useEffect(() => {
    // Generate a hint based on the first letter in easy mode
    if (isEasyMode && characterName) {
      const firstLetter = characterName.trim()[0]?.toUpperCase() || "?";
      setHint(`First name starts with "${firstLetter}"`);
    }
  }, [characterName, isEasyMode]);

  const handleImageLoad = () => setLoaded(true);
  const handleImageError = () => setError(true);

  return (
    <div className="relative flex flex-col">
      <div className={`relative overflow-hidden rounded-lg ${className}`}>
        {error ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg">
            <span className="text-white text-2xl font-bold">?</span>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt="Mystery character"
            className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${!isEasyMode ? 'blur-md grayscale' : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
      </div>
      
      {/* Always display hint in easy mode - directly visible without buttons */}
      {isEasyMode && hint && (
        <div className="mt-2 w-full py-2 px-3 bg-red-600 rounded text-center">
          <p className="text-white font-bold">{hint}</p>
        </div>
      )}
    </div>
  );
};

export default MysteryImage; 