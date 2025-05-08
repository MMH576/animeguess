"use client";

import { useState, useEffect } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useGameState } from "@/lib/useGameState";
import { Leaderboard } from "@/components/Leaderboard";
import AniListImage from "@/components/AniListImage";
import DifficultySelector from "@/components/DifficultySelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/use-toast";

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [cardKey, setCardKey] = useState(0);
  const { updateScore, submitScore, score, isSubmitting, error } = useGameState();
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);
  const [characterName, setCharacterName] = useState<string>("");
  const [isSkipping, setIsSkipping] = useState(false);
  const [isEasyMode, setIsEasyMode] = useState(false);
  const [currentAnime, setCurrentAnime] = useState<string>("");

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

  // Log image loading errors
  useEffect(() => {
    const handleImageError = (event: ErrorEvent) => {
      if (event.target instanceof HTMLImageElement) {
        console.error(`Image failed to load: ${event.target.src}`, event);
      }
    };

    // Listen for image loading errors
    window.addEventListener('error', handleImageError, true);
    
    return () => {
      window.removeEventListener('error', handleImageError, true);
    };
  }, []);

  const handleNewCharacter = () => {
    setCardKey(prev => prev + 1);
    setIsCorrect(false);
    setGuess("");
    setFeedback("");
    setIsSkipping(false);
    setCurrentAnime("");
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
    // Basic normalization for case-insensitive comparison
    const normalizedGuess = guess.trim().toLowerCase();
    const normalizedCharacter = characterName.trim().toLowerCase();

    if (normalizedGuess === normalizedCharacter) {
      setFeedback("✅ Correct!");
      setIsCorrect(true);
      updateScore(10);
      
      // Show toast notification
      toast({
        title: "Correct Answer!",
        description: `+10 points${currentAnime ? ` - ${currentAnime}` : ""}`,
        variant: "success",
      });
    } else {
      setFeedback("❌ Try again");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGuess();
    }
  };

  const handleSetCharacterName = (name: string, animeTitle?: string) => {
    setCharacterName(name);
    if (animeTitle) {
      setCurrentAnime(animeTitle);
    }
  };

  // Show loading state while not authenticated
  if (!isLoaded || !isSignedIn) {
    return (
      <main className="min-h-screen bg-[#0B0C10] py-12">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center mb-8 text-[#66FCF1]"
          >
            Guess the Anime Character!
          </motion.h1>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="animate-pulse bg-[#1F2833] rounded-xl shadow-lg w-64 h-64" />
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0C10] py-8">
      <div className="container mx-auto px-4">
        {/* Header with title and difficulty selector */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center mb-6 relative"
        >
          <motion.h1 
            className="text-center font-extrabold flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.img 
              src="/images/logo.png" 
              alt="Luffy Logo" 
              className="w-12 h-12 object-contain"
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <motion.span 
              className="bg-gradient-to-r from-[#66FCF1] to-[#45A29E] text-transparent bg-clip-text font-black uppercase tracking-widest text-shadow text-2xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ 
                type: "spring", 
                stiffness: 300,
                yoyo: Infinity,
                duration: 0.5
              }}
            >
              Anime Guess
            </motion.span>
          </motion.h1>
          
          {/* User button positioned absolutely */}
          <motion.div 
            className="absolute right-0 top-1/2 -translate-y-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Teal glow effect as a separate element behind the button */}
              <div className="absolute inset-0 rounded-full bg-[#66FCF1] blur-xl opacity-40 group-hover:opacity-70 transition-all duration-300 scale-[2]"></div>
              
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: 'w-full h-full rounded-full border-2 border-[#66FCF1] shadow-xl shadow-[#66FCF1]/40 overflow-hidden z-10',
                    userButtonBox: 'h-12 w-12 relative z-10',
                    userButtonTrigger: 'h-12 w-12 relative z-10',
                    userButtonAvatarImage: 'w-full h-full object-cover rounded-full',
                    userButtonPopoverCard: 'border border-[#66FCF1]/50 shadow-lg shadow-[#66FCF1]/30 rounded-xl bg-[#1F2833]',
                    userButtonPopoverActionButton: 'hover:bg-[#66FCF1]/10',
                    userButtonPopoverActionButtonText: 'text-[#C5C8C7] hover:text-[#66FCF1]',
                    userButtonPopoverFooter: 'border-t border-[#66FCF1]/20'
                  }
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
        
        {/* Main content layout with game and persistent leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-9 gap-8">
          {/* Game Panel - Center Column (now wider) */}
          <div className="lg:col-span-5 lg:col-start-1">
            <div className="flex flex-col items-center">
              {/* Character Image */}
              <motion.div 
                className="relative w-full aspect-square max-w-md rounded-md border border-[#66FCF1]/50 overflow-hidden mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <AnimatePresence>
                  <motion.div
                    key={cardKey}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                  >
                    <AniListImage 
                      onNewImage={handleSetCharacterName}
                      width={450}
                      height={450}
                      className="transition-all duration-300"
                      difficulty={isEasyMode ? "easy" : "normal"}
                    />
                  </motion.div>
                </AnimatePresence>
                
                {/* Overlay message when correct */}
                <AnimatePresence>
                  {isCorrect && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 bg-[#0B0C10]/80 flex items-center justify-center flex-col p-4 z-10 backdrop-blur-sm"
                    >
                      <motion.p 
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-[#C5C8C7] text-xl font-bold mb-2"
                      >
                        Character Revealed!
                      </motion.p>
                      <motion.p 
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-[#66FCF1] text-2xl font-bold"
                      >
                        {characterName}
                      </motion.p>
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Button
                          id="next-button"
                          onClick={handleNewCharacter}
                          className="mt-6 bg-[#66FCF1] hover:bg-[#66FCF1]/80 text-[#0B0C10]"
                          aria-label="Next Character"
                        >
                          Next Character →
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Overlay message when skipping */}
                <AnimatePresence>
                  {isSkipping && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 bg-[#0B0C10]/80 flex items-center justify-center flex-col p-4 z-10 backdrop-blur-sm"
                    >
                      <motion.p 
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-[#C5C8C7] text-xl font-bold mb-2"
                      >
                        Answer Revealed
                      </motion.p>
                      <motion.p 
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-[#66FCF1] text-2xl font-bold"
                      >
                        {characterName}
                      </motion.p>
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-[#C5C8C7]/70 mt-2"
                      >
                        Loading next character...
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              
              {/* Difficulty Selector moved here for better accessibility */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md mb-4"
              >
                <DifficultySelector 
                  isEasyMode={isEasyMode} 
                  onToggle={handleToggleDifficulty}
                  className="w-full justify-center"
                />
              </motion.div>
              
              {/* Guess Input (hidden when correct or skipping) */}
              <AnimatePresence>
                {!isCorrect && !isSkipping && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full max-w-md mb-3"
                  >
                    <div className="flex w-full relative overflow-hidden rounded-md border-2 border-[#66FCF1]">
                      <Input
                        type="text"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter character name..."
                        className="flex-1 bg-[#1F2833] border-0 text-[#C5C8C7] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder-[#C5C8C7]/40 h-12 px-4"
                        aria-label="Character name guess input"
                        autoFocus
                      />
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="min-w-[100px]">
                        <Button
                          onClick={handleGuess}
                          disabled={isSubmitting}
                          className="bg-[#66FCF1] hover:bg-[#66FCF1]/80 focus:ring-[#66FCF1] rounded-none h-12 w-full text-base font-semibold transition-colors duration-200 text-[#0B0C10]"
                        >
                          Submit
                        </Button>
                      </motion.div>
                    </div>
                    
                    <p className="text-[#C5C8C7]/70 text-sm text-center mt-2">
                      Type the character&apos;s name to guess!
                    </p>
                    
                    <AnimatePresence mode="wait">
                      {feedback && (
                        <motion.p 
                          key={feedback}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="font-medium text-[#66FCF1] text-lg text-center mt-2"
                        >
                          {feedback}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Score Info */}
              <AnimatePresence>
                {isCorrect && !isSubmitting && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full max-w-md py-2 px-4 bg-[#1F2833] rounded-lg mb-4"
                  >
                    <p className="text-center text-[#66FCF1] font-medium">
                      Current Score: {score}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Submission Status */}
              <AnimatePresence>
                {isSubmitting && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full max-w-md py-2 px-4 bg-[#1F2833] rounded-lg mb-4"
                  >
                    <p className="text-center text-[#66FCF1]/70">
                      Saving score...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center text-red-500 text-sm"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
              
              {/* Skip button */}
              <AnimatePresence>
                {!isCorrect && !isSkipping && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                      className="w-full max-w-md mx-auto"
                    >
                      <Button
                        onClick={handleSkip}
                        className="bg-transparent border border-[#66FCF1] text-[#66FCF1] hover:bg-[#66FCF1]/10 hover:text-[#C5C8C7] w-full transition-all duration-200"
                        variant="outline"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <polygon points="5 4 15 12 5 20 5 4"></polygon>
                          <line x1="19" y1="5" x2="19" y2="19"></line>
                        </svg>
                        Skip This Character
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Leaderboard Panel - Right Column */}
          <div className="lg:col-span-4 lg:col-start-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-full"
            >
              <Leaderboard />
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
