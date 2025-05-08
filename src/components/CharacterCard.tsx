"use client";

import { useState, useEffect } from "react";
import type { Character } from "@/lib/characters";
import { useGameState } from "@/lib/useGameState";

interface CharacterCardProps {
  character: Character;
  onCorrectGuess: () => void;
  isEasyMode?: boolean;
}

export const CharacterCard = ({ 
  character, 
  onCorrectGuess,
  isEasyMode = false
}: CharacterCardProps) => {
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [characterFact, setCharacterFact] = useState("");
  const [isLoadingFact, setIsLoadingFact] = useState(false);
  const { updateScore, submitScore, score, isSubmitting, error } = useGameState();

  useEffect(() => {
    // Log image URL for debugging
    console.log(`CharacterCard loading image: ${character.image}`);
    
    // Fetch character fact if in easy mode
    if (isEasyMode && !characterFact) {
      fetchCharacterFact();
    }
  }, [character.image, isEasyMode, character.name]);

  const fetchCharacterFact = async () => {
    setIsLoadingFact(true);
    try {
      // Try to get interesting fact about character
      const response = await fetch(`/api/character-fact?name=${encodeURIComponent(character.name)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.fact) {
          setCharacterFact(data.fact);
        } else {
          // Fallback to generic fact based on character traits
          setDefaultFact();
        }
      } else {
        setDefaultFact();
      }
    } catch (error) {
      console.error("Failed to fetch character fact:", error);
      setDefaultFact();
    } finally {
      setIsLoadingFact(false);
    }
  };

  // Create a default fact based on character properties
  const setDefaultFact = () => {
    const defaultFacts = [
      `This character has a distinctive appearance`,
      `Look for unique features of this character`,
      `This character is from ${character.anime}`,
      `This character has a memorable personality`,
      `Look at the character's outfit and color scheme`,
    ];
    setCharacterFact(defaultFacts[Math.floor(Math.random() * defaultFacts.length)]);
  };

  // Submit score when correct answer is given, but only once
  useEffect(() => {
    if (isCorrect && !hasSubmittedScore) {
      setHasSubmittedScore(true);
      submitScore();
    }
  }, [isCorrect, submitScore, hasSubmittedScore]);

  const handleGuess = () => {
    const normalizedGuess = guess.trim().toLowerCase();
    const normalizedAnswer = character.name.toLowerCase();

    if (normalizedGuess === normalizedAnswer) {
      setFeedback("✅ You got it!");
      setIsCorrect(true);
      // Award points for correct guess
      updateScore(10);
      onCorrectGuess();
    } else {
      setFeedback("❌ Try again");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGuess();
    }
  };

  const handleImageLoad = () => {
    console.log(`Image loaded successfully: ${character.image}`);
    setImageLoaded(true);
  };

  const handleImageError = () => {
    console.error(`Failed to load image: ${character.image}`);
    setImgError(true);
  };

  // Generate fallback image from character name for when images fail to load
  const getFallbackContent = () => {
    // Create a color based on anime name and character first letter for consistency
    const getColorClass = () => {
      const initialLetter = (character.name[0] || 'A').toUpperCase();
      
      const animeToColor: Record<string, string> = {
        "Naruto": "bg-gradient-to-br from-orange-500 to-red-600",
        "One Piece": "bg-gradient-to-br from-blue-500 to-blue-700", 
        "Dragon Ball Z": "bg-gradient-to-br from-yellow-500 to-orange-600",
        "Attack on Titan": "bg-gradient-to-br from-red-700 to-red-900",
        "Demon Slayer": "bg-gradient-to-br from-green-500 to-blue-600",
        "My Hero Academia": "bg-gradient-to-br from-yellow-400 to-red-500",
        "Death Note": "bg-gradient-to-br from-gray-700 to-gray-900",
        "Fullmetal Alchemist": "bg-gradient-to-br from-yellow-600 to-red-700",
        "Hunter x Hunter": "bg-gradient-to-br from-green-500 to-green-700"
      };
      
      // Letter-based fallback if anime isn't in the predefined list
      const letterToColor: Record<string, string> = {
        'A': 'bg-gradient-to-br from-red-500 to-red-700',
        'B': 'bg-gradient-to-br from-blue-500 to-blue-700',
        'C': 'bg-gradient-to-br from-green-500 to-green-700',
        'D': 'bg-gradient-to-br from-yellow-500 to-yellow-700',
        'E': 'bg-gradient-to-br from-purple-500 to-purple-700',
        'F': 'bg-gradient-to-br from-pink-500 to-pink-700',
        'G': 'bg-gradient-to-br from-indigo-500 to-indigo-700',
        'H': 'bg-gradient-to-br from-teal-500 to-teal-700',
        'I': 'bg-gradient-to-br from-cyan-500 to-cyan-700',
        'J': 'bg-gradient-to-br from-orange-500 to-orange-700',
        'K': 'bg-gradient-to-br from-amber-500 to-amber-700',
        'L': 'bg-gradient-to-br from-lime-500 to-lime-700',
        'M': 'bg-gradient-to-br from-emerald-500 to-emerald-700',
        'N': 'bg-gradient-to-br from-blue-600 to-blue-800',
        'O': 'bg-gradient-to-br from-violet-500 to-violet-700',
        'P': 'bg-gradient-to-br from-fuchsia-500 to-fuchsia-700',
        'Q': 'bg-gradient-to-br from-rose-500 to-rose-700',
        'R': 'bg-gradient-to-br from-sky-500 to-sky-700',
        'S': 'bg-gradient-to-br from-red-600 to-red-800',
        'T': 'bg-gradient-to-br from-blue-600 to-blue-800',
        'U': 'bg-gradient-to-br from-green-600 to-green-800',
        'V': 'bg-gradient-to-br from-purple-600 to-purple-800',
        'W': 'bg-gradient-to-br from-pink-600 to-pink-800',
        'X': 'bg-gradient-to-br from-indigo-600 to-indigo-800',
        'Y': 'bg-gradient-to-br from-yellow-600 to-yellow-800',
        'Z': 'bg-gradient-to-br from-orange-600 to-orange-800'
      };
      
      return animeToColor[character.anime] || letterToColor[initialLetter] || "bg-gradient-to-br from-purple-500 to-purple-700";
    };

    // Get initials (up to 2 characters)
    const getInitials = () => {
      return character.name
        .split(' ')
        .map(part => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    };

    return (
      <div className={`absolute inset-0 flex items-center justify-center ${getColorClass()} rounded-lg`}>
        <span className="text-white text-6xl font-bold">
          {getInitials()}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-black/50 rounded-xl shadow-lg shadow-[#8B11D1]/20 max-w-md mx-auto border border-[#8B11D1]/20">
      <div className="relative w-80 h-96">
        <div className="w-full h-full relative">
          {imgError ? (
            // Fallback content when image fails to load
            getFallbackContent()
          ) : (
            <>
              {/* Loading indicator */}
              <div className={`absolute inset-0 bg-black/50 flex items-center justify-center z-10 transition-opacity duration-300 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}>
                <div className="w-10 h-10 border-4 border-[#8B11D1] border-t-transparent rounded-full animate-spin"></div>
              </div>
              
              {/* Primary image with error handling */}
              <img
                src={character.image}
                alt="Guess the character"
                className={`w-full h-full object-contain rounded-lg transition-opacity duration-300 ${!isCorrect ? "blur-md" : ""} ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </>
          )}
        </div>
      </div>
      
      {/* Display character hint in easy mode - with high visibility and no button required */}
      {isEasyMode && !isCorrect && (
        <div className="w-full px-4 py-3 bg-red-600 rounded-md">
          <p className="text-white font-bold text-center">
            {isLoadingFact ? "Loading hint..." : characterFact || "Look for unique features of this character"}
          </p>
        </div>
      )}
      
      <div className="w-full space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter character name..."
            className="flex-1 px-4 py-2 bg-black/30 border border-[#8B11D1]/30 text-[#8B11D1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B11D1] placeholder-[#8B11D1]/50"
            disabled={isCorrect}
            aria-label="Character name guess input"
          />
          <button
            onClick={handleGuess}
            disabled={isCorrect || isSubmitting}
            className="px-4 py-2 bg-[#8B11D1] text-white rounded-lg hover:bg-[#8B11D1]/80 focus:outline-none focus:ring-2 focus:ring-[#8B11D1] focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>
        
        {feedback && (
          <p className="text-center font-medium text-[#8B11D1]">
            {feedback}
          </p>
        )}
        
        {isCorrect && (
          <div className="space-y-2">
            <p className="text-center text-[#8B11D1]/80">
              From: {character.anime}
            </p>
            <p className="text-center text-[#8B11D1] font-medium">
              Current Score: {score}
            </p>
            {isSubmitting && (
              <p className="text-center text-[#8B11D1]/70 text-sm">
                Saving score...
              </p>
            )}
            {error && (
              <p className="text-center text-red-500 text-sm">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 