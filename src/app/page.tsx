"use client";

import { useState, useEffect } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useGameState } from "@/lib/useGameState";
import { Leaderboard } from "@/components/Leaderboard";
import AniListImage from "@/components/AniListImage";
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
  const [currentAnime, setCurrentAnime] = useState<string>("");
  const [showHint, setShowHint] = useState(false);
  const [hint, setHint] = useState("");

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
    setShowHint(false);
    setHint("");
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
    const characterNameParts = normalizedCharacter.split(' ');

    // Check if the guess matches the full name or any part of the name
    if (normalizedGuess === normalizedCharacter || 
        characterNameParts.some(part => part === normalizedGuess)) {
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
    
    // Wait for state updates before generating hint
    setTimeout(() => {
      generateHint(name, animeTitle || "");
    }, 0);
  };

  const generateHint = (name: string, anime: string) => {
    // Reset hint state
    setShowHint(false);
    setHint("");
    
    if (!name) return;
    
    // Get the first name (first part of the full name)
    const nameParts = name.split(' ');
    const firstName = nameParts[0]; // First name is the first part
    
    // Create a hint with first letter and anime
    const animeInfo = anime !== "Unknown Anime" && anime !== "" ? anime : "an unknown anime";
    setHint(`First letter: "${firstName[0].toUpperCase()}" • From: ${animeInfo}`);
  };
  
  const handleShowHint = () => {
    setShowHint(true);
    
    // Track hint usage (optional)
    // You could penalize score here if desired
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
    <main className="min-h-screen bg-gradient-to-br from-[#0B0C10] via-[#121820] to-[#1A1E26] py-8">
      <div className="container mx-auto px-4">
        {/* Header with title and difficulty selector */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center mb-8 relative"
        >
          <motion.h1 
            className="text-center font-extrabold flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.img 
              src="/images/logo.png" 
              alt="Luffy Logo" 
              className="w-14 h-14 object-contain drop-shadow-[0_0_15px_rgba(102,252,241,0.5)]"
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <motion.span 
              className="bg-gradient-to-r from-[#66FCF1] to-[#45A29E] text-transparent bg-clip-text font-black uppercase tracking-widest text-shadow text-3xl"
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
                className="relative w-full aspect-square max-w-md rounded-xl border border-[#66FCF1]/30 overflow-hidden mb-6 shadow-[0_0_20px_rgba(102,252,241,0.15)]"
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
                      isRevealed={isCorrect || isSkipping}
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
                      className="absolute inset-0 bg-gradient-to-b from-[#0B0C10]/90 to-[#0B0C10]/95 flex items-center justify-center flex-col p-4 z-10 backdrop-blur-md"
                    >
                      <motion.div 
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-[#66FCF1]/20 rounded-full p-2 mb-4"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#66FCF1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                      <motion.p 
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-white text-xl font-medium mb-2"
                      >
                        Character Revealed!
                      </motion.p>
                      <motion.p 
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-[#66FCF1] text-3xl font-bold"
                      >
                        {characterName}
                      </motion.p>
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Button
                          id="next-button"
                          onClick={handleNewCharacter}
                          className="mt-8 bg-gradient-to-r from-[#66FCF1] to-[#45A29E] hover:from-[#45A29E] hover:to-[#66FCF1] text-[#0B0C10] px-6 py-2 rounded-lg font-medium shadow-md transition-all duration-300"
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
                      className="absolute inset-0 bg-gradient-to-b from-[#0B0C10]/90 to-[#0B0C10]/95 flex items-center justify-center flex-col p-4 z-10 backdrop-blur-md"
                    >
                      <motion.div 
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-[#66FCF1]/20 rounded-full p-2 mb-4"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#66FCF1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </motion.div>
                      <motion.p 
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-white text-xl font-medium mb-2"
                      >
                        Answer Revealed
                      </motion.p>
                      <motion.p 
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-[#66FCF1] text-3xl font-bold"
                      >
                        {characterName}
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-4 flex items-center"
                      >
                        <div className="w-4 h-4 rounded-full bg-[#66FCF1] animate-pulse mr-2"></div>
                        <p className="text-white">
                          Loading next character...
                        </p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              
              {/* Guess Input (hidden when correct or skipping) */}
              <AnimatePresence>
                {!isCorrect && !isSkipping && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full max-w-md mb-4"
                  >
                    <div className="flex w-full relative overflow-hidden rounded-xl border-2 border-[#66FCF1]/50 shadow-[0_0_15px_rgba(102,252,241,0.1)] focus-within:shadow-[0_0_20px_rgba(102,252,241,0.25)] transition-shadow duration-300">
                      <Input
                        type="text"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter character name..."
                        className="flex-1 bg-[#1F2833] border-0 text-white focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder-[#C5C8C7]/40 h-14 px-5 text-lg"
                        aria-label="Character name guess input"
                        autoFocus
                      />
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="min-w-[120px]">
                        <Button
                          onClick={handleGuess}
                          disabled={isSubmitting}
                          className="bg-gradient-to-r from-[#66FCF1] to-[#45A29E] hover:from-[#45A29E] hover:to-[#66FCF1] rounded-none h-14 w-full text-base font-semibold transition-all duration-300 text-[#0B0C10]"
                        >
                          Submit
                        </Button>
                      </motion.div>
                    </div>
                    
                    {/* Hint Button */}
                    <motion.div 
                      className="mt-3 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Button
                        onClick={handleShowHint}
                        variant="ghost"
                        className="text-[#66FCF1] hover:text-[#66FCF1] hover:bg-[#66FCF1]/10 text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                        disabled={showHint}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        Need a hint?
                      </Button>
                    </motion.div>
                    
                    {/* Hint Display */}
                    <AnimatePresence>
                      {showHint && hint && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="mt-3 p-3 bg-[#66FCF1]/15 border border-[#66FCF1]/30 rounded-lg text-center shadow-inner"
                        >
                          <p className="text-[#66FCF1] text-sm font-medium">{hint}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <p className="text-[#C5C8C7]/70 text-sm text-center mt-3 font-medium">
                      Type the character&apos;s name to guess!
                    </p>
                    
                    <AnimatePresence mode="wait">
                      {feedback && (
                        <motion.div 
                          key={feedback}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className={`mt-4 p-3 rounded-lg text-center ${feedback.includes("✅") ? "bg-[#66FCF1]/15 border border-[#66FCF1]/30" : "bg-red-500/10 border border-red-500/20"}`}
                        >
                          <p className={`font-medium text-lg ${feedback.includes("✅") ? "text-[#66FCF1]" : "text-red-400"}`}>
                            {feedback}
                          </p>
                        </motion.div>
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
                    className="w-full max-w-md py-3 px-5 bg-gradient-to-r from-[#1F2833] to-[#1A2028] rounded-xl border border-[#66FCF1]/20 shadow-md mb-4"
                  >
                    <div className="flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#66FCF1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <p className="text-center text-[#66FCF1] font-bold text-lg">
                        Current Score: {score}
                      </p>
                    </div>
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
                    className="w-full max-w-md py-3 px-5 bg-gradient-to-r from-[#1F2833] to-[#1A2028] rounded-xl border border-[#66FCF1]/20 shadow-md mb-4"
                  >
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-[#66FCF1] border-t-transparent rounded-full animate-spin mr-3"></div>
                      <p className="text-center text-[#66FCF1]">
                        Saving score...
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg"
                  >
                    {error}
                  </motion.div>
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
                      whileHover={{ scale: 1.03, backgroundColor: "rgba(102, 252, 241, 0.15)" }} 
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button 
                        onClick={handleSkip}
                        variant="outline"
                        className="bg-transparent border border-[#66FCF1]/40 hover:border-[#66FCF1] text-[#66FCF1] hover:text-white px-6 flex items-center gap-2 rounded-lg shadow-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
