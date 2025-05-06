"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import type { Character } from "@/lib/characters";
import { useGameState } from "@/lib/useGameState";

interface CharacterCardProps {
  character: Character;
  onCorrectGuess: () => void;
}

export const CharacterCard = ({ character, onCorrectGuess }: CharacterCardProps) => {
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const { updateScore, submitScore, score, isSubmitting, error } = useGameState();

  // Submit score when correct answer is given
  useEffect(() => {
    if (isCorrect) {
      // Submit the score to Supabase
      submitScore();
    }
  }, [isCorrect, submitScore]);

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

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-black/50 rounded-xl shadow-lg shadow-[#8B11D1]/20 max-w-md mx-auto border border-[#8B11D1]/20">
      <div className="relative w-80 h-96">
        <div className="w-full h-full relative">
          <Image
            src={character.image}
            alt="Guess the character"
            fill
            className={`object-contain rounded-lg ${!isCorrect ? "blur-md" : ""}`}
            priority
          />
        </div>
      </div>
      
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