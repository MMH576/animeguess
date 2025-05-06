"use client";

import { useState, useEffect } from "react";
import { characters } from "@/lib/characters";
import { CharacterCard } from "@/components/CharacterCard";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  // Add a key to force CharacterCard re-render
  const [cardKey, setCardKey] = useState(0);

  useEffect(() => {
    // Redirect to sign-in if user is not authenticated
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

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

  // Show loading state while currentIndex is null or not authenticated
  if (currentIndex === null || !isLoaded || !isSignedIn) {
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#8B11D1]">
            Guess the Anime Character!
          </h1>
          
          {isLoaded && (
            <div className="flex items-center gap-4">
              {isSignedIn ? (
                <>
                  <p className="text-[#8B11D1]">
                    Hi, {user.firstName || user.username || 'Player'}!
                  </p>
                  <UserButton 
                    appearance={{
                      elements: {
                        userButtonAvatarBox: 'border-2 border-[#8B11D1]'
                      }
                    }}
                  />
                </>
              ) : (
                <SignInButton mode="modal">
                  <button className="px-4 py-2 bg-[#8B11D1] text-white rounded-lg hover:bg-[#8B11D1]/80 focus:outline-none focus:ring-2 focus:ring-[#8B11D1] focus:ring-offset-2 focus:ring-offset-black">
                    Sign In
                  </button>
                </SignInButton>
              )}
            </div>
          )}
        </div>
        
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
