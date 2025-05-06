"use client";

import { useState, useEffect } from "react";
import { characters } from "@/lib/characters";
import { CharacterCard } from "@/components/CharacterCard";

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  // Add a key to force CharacterCard re-render
  const [cardKey, setCardKey] = useState(0);

  useEffect(() => {
    // Set initial random character after component mounts
    setCurrentIndex(Math.floor(Math.random() * characters.length));
  }, []);

  const handleNextCharacter = () => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * characters.length);
    } while (nextIndex === currentIndex && characters.length > 1);
    
    setCurrentIndex(nextIndex);
    // Increment key to force a fresh CharacterCard instance
    setCardKey(prev => prev + 1);
  };

  // Show loading state while currentIndex is null
  if (currentIndex === null) {
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
        <h1 className="text-3xl font-bold text-center mb-8 text-[#8B11D1]">
          Guess the Anime Character!
        </h1>
        
        <CharacterCard
          key={cardKey}
          character={characters[currentIndex]}
          onCorrectGuess={() => {
            // Wait a bit before showing the "Next" button
            setTimeout(() => {
              const nextButton = document.getElementById("next-button");
              if (nextButton) nextButton.focus();
            }, 500);
          }}
        />
        
        <div className="mt-6 text-center">
          <button
            id="next-button"
            onClick={handleNextCharacter}
            className="px-6 py-3 bg-[#8B11D1] text-white rounded-lg hover:bg-[#8B11D1]/80 focus:outline-none focus:ring-2 focus:ring-[#8B11D1] focus:ring-offset-2 focus:ring-offset-black"
          >
            Next Character →
          </button>
        </div>
      </div>
    </main>
  );
}
