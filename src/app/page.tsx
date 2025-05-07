"use client";

import { useState, useEffect } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useGameState } from "@/lib/useGameState";
import { Leaderboard } from "@/components/Leaderboard";
import AniListImage from "@/components/AniListImage";
import DifficultySelector from "@/components/DifficultySelector";

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [cardKey, setCardKey] = useState(0);
  const { resetScore, updateScore, submitScore, score, isSubmitting, error } = useGameState();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);
  const [characterName, setCharacterName] = useState("");
  const [isSkipping, setIsSkipping] = useState(false);
  const [isEasyMode, setIsEasyMode] = useState(false);

  useEffect(() => {
    // Redirect to sign-in if user is not authenticated
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Submit score when correct answer is given, but only once
  useEffect(() => {
    if (isCorrect && !hasSubmittedScore) {
      setHasSubmittedScore(true);
      submitScore();
    }
  }, [isCorrect, submitScore, hasSubmittedScore]);

  const handleNewCharacter = () => {
    // Reset game state
    setGuess("");
    setFeedback("");
    setIsCorrect(false);
    setIsSkipping(false);
    setHasSubmittedScore(false);
    resetScore();
    // Increment key to force a fresh AniListImage instance
    setCardKey(prev => prev + 1);
  };

  const handleToggleDifficulty = () => {
    // Toggle easy mode
    setIsEasyMode(prev => !prev);
    // Get a new character when changing difficulty
    handleNewCharacter();
  };

  const handleSkip = () => {
    // Show correct answer briefly
    setIsSkipping(true);
    setFeedback(`The correct answer was: ${characterName}`);
    
    // Load next character after a delay
    setTimeout(() => {
      handleNewCharacter();
    }, 2000); // Show answer for 2 seconds
  };

  const handleGuess = () => {
    const normalizedGuess = guess.trim().toLowerCase();
    const fullName = characterName.toLowerCase();
    
    // Split the name into parts
    const nameParts = fullName.split(" ");
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
    
    // Special cases for characters who are known by different names
    // Include only one-word names as acceptable answers
    const popularNicknames: Record<string, string[]> = {
      "monkey d. luffy": ["luffy"],
      "roronoa zoro": ["zoro"],
      "vinsmoke sanji": ["sanji"],
      "nico robin": ["robin"],
      "usopp": ["usopp", "sogeking"],
      "tony tony chopper": ["chopper"],
      "trafalgar d. water law": ["law", "trafalgar"],
      "edward newgate": ["whitebeard"],
      "portgas d. ace": ["ace"],
      "marshall d. teach": ["blackbeard", "teach"],
      "gol d. roger": ["roger"],
      "son goku": ["goku", "kakarot"],
      "vegeta": ["vegeta"],
      "edward elric": ["ed", "edward", "fullmetal"],
      "alphonse elric": ["al", "alphonse"],
      "naruto uzumaki": ["naruto"],
      "sasuke uchiha": ["sasuke"],
      "kakashi hatake": ["kakashi"],
      "itachi uchiha": ["itachi"],
      "light yagami": ["light", "kira"],
      "l lawliet": ["l", "ryuzaki"],
      "spike spiegel": ["spike"],
      "eren yeager": ["eren"],
      "mikasa ackerman": ["mikasa"],
      "levi ackerman": ["levi"],
      "tanjiro kamado": ["tanjiro"],
      "nezuko kamado": ["nezuko"],
      "ash ketchum": ["ash"],
      "satoshi": ["ash"],
      // Add more character nicknames as needed
    };
    
    // For characters known by their last names
    const knownByLastName = [
      "ackerman", "uchiha", "hatake", "yeager", "uzumaki"
    ];
    
    // Start with any popular nicknames
    let acceptableNames: string[] = popularNicknames[fullName] || [];
    
    // Always accept any individual part of the name
    // This handles first names, last names, and middle names
    nameParts.forEach(part => {
      if (part.length > 1 && !part.endsWith(".")) {  // Skip initials like "d."
        acceptableNames.push(part);
      }
    });
    
    // Special handling for last names commonly used
    if (lastName && knownByLastName.includes(lastName)) {
      acceptableNames.push(lastName);
    }
    
    // Strip any non-single-word guesses
    acceptableNames = acceptableNames.filter(name => !name.includes(" "));
    
    // All modes award same points now
    const points = 10;
    
    // Check if the guess matches any acceptable name
    if (acceptableNames.includes(normalizedGuess)) {
      setFeedback("✅ You got it!");
      setIsCorrect(true);
      // Award points for correct guess
      updateScore(points);
      // Wait a bit before showing the "Next" button
      setTimeout(() => {
        const nextButton = document.getElementById("next-button");
        if (nextButton) nextButton.focus();
      }, 500);
    } else {
      setFeedback("❌ Try again");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGuess();
    }
  };

  const toggleLeaderboard = () => {
    setShowLeaderboard(prev => !prev);
  };

  // Show loading state while not authenticated
  if (!isLoaded || !isSignedIn) {
    return (
      <main className="min-h-screen bg-black py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8 text-[#8B11D1]">
            Guess the Anime Character!
          </h1>
          <div className="flex justify-center">
            <div className="animate-pulse bg-[#8B11D1]/10 rounded-xl shadow-lg w-64 h-64" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black py-12">
      <div className="container mx-auto px-4">
        {/* Header with title and user info */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-[#8B11D1]">
            Guess the Anime Character!
          </h1>
          
          <div className="flex items-center gap-4">
            <DifficultySelector 
              isEasyMode={isEasyMode} 
              onToggle={handleToggleDifficulty}
            />
            <UserButton 
              appearance={{
                elements: {
                  userButtonAvatarBox: 'border-2 border-[#8B11D1]'
                }
              }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Game Panel */}
          <div>
            <div className="flex flex-col items-center gap-6 p-6 bg-black/50 rounded-xl shadow-lg shadow-[#8B11D1]/20 max-w-md mx-auto border border-[#8B11D1]/20">
              {/* Character Image */}
              <div 
                className="relative w-full h-96 flex items-center justify-center overflow-hidden rounded-lg border-2 border-[#8B11D1]/30"
              >
                <AniListImage 
                  key={cardKey}
                  onNewImage={setCharacterName}
                  width={320}
                  height={384}
                  className={`transition-all duration-300`}
                  difficulty={isEasyMode ? "easy" : "normal"}
                />
                
                {/* Overlay message when correct */}
                {isCorrect && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center flex-col p-4 z-10 backdrop-blur-sm">
                    <p className="text-white text-xl font-bold mb-2">Character Revealed!</p>
                    <p className="text-[#8B11D1] text-2xl font-bold">{characterName}</p>
                    <button
                      id="next-button"
                      onClick={handleNewCharacter}
                      className="mt-6 px-6 py-3 bg-[#8B11D1] text-white rounded-lg hover:bg-[#8B11D1]/80 focus:outline-none focus:ring-2 focus:ring-[#8B11D1]"
                      aria-label="Next Character"
                    >
                      Next Character →
                    </button>
                  </div>
                )}
                
                {/* Overlay message when skipping */}
                {isSkipping && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center flex-col p-4 z-10 backdrop-blur-sm">
                    <p className="text-white text-xl font-bold mb-2">Answer Revealed</p>
                    <p className="text-[#8B11D1] text-2xl font-bold">{characterName}</p>
                    <p className="text-white/70 mt-2">Loading next character...</p>
                  </div>
                )}
              </div>
              
              {/* Guess Input (hidden when correct or skipping) */}
              {!isCorrect && !isSkipping && (
                <div className="w-full space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter character name..."
                      className="flex-1 px-4 py-3 bg-black/30 border border-[#8B11D1]/30 text-[#8B11D1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B11D1] placeholder-[#8B11D1]/50"
                      aria-label="Character name guess input"
                      autoFocus
                    />
                    <button
                      onClick={handleGuess}
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-[#8B11D1] text-white rounded-lg hover:bg-[#8B11D1]/80 focus:outline-none focus:ring-2 focus:ring-[#8B11D1] focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    {feedback && (
                      <p className="font-medium text-[#8B11D1] text-lg">
                        {feedback}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Score Info */}
              {isCorrect && !isSubmitting && (
                <div className="w-full py-2 px-4 bg-[#8B11D1]/10 rounded-lg">
                  <p className="text-center text-[#8B11D1] font-medium">
                    Current Score: {score}
                  </p>
                </div>
              )}
              
              {/* Submission Status */}
              {isSubmitting && (
                <div className="w-full py-2 px-4 bg-[#8B11D1]/10 rounded-lg">
                  <p className="text-center text-[#8B11D1]/70">
                    Saving score...
                  </p>
                </div>
              )}
              
              {error && (
                <p className="text-center text-red-500 text-sm">
                  {error}
                </p>
              )}
            </div>
            
            {/* Game Controls - Only show controls when not already correct and not skipping */}
            {!isCorrect && !isSkipping && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleSkip}
                  className="px-6 py-3 bg-[#8B11D1]/70 text-white rounded-lg hover:bg-[#8B11D1]/80 focus:outline-none focus:ring-2 focus:ring-[#8B11D1] focus:ring-offset-2 focus:ring-offset-black mr-4"
                >
                  Skip This Character
                </button>
                
                <button
                  onClick={toggleLeaderboard}
                  className="px-6 py-3 bg-transparent border border-[#8B11D1] text-[#8B11D1] rounded-lg hover:bg-[#8B11D1]/10 focus:outline-none focus:ring-2 focus:ring-[#8B11D1] focus:ring-offset-2 focus:ring-offset-black"
                >
                  {showLeaderboard ? 'Hide Leaderboard' : 'Show Leaderboard'}
                </button>
              </div>
            )}
          </div>
          
          {/* Leaderboard Panel */}
          {showLeaderboard && (
            <div className="lg:col-span-1">
              <Leaderboard />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
