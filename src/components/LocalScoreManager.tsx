"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

interface LocalScore {
  score: number;
  date: string;
  userId: string;
  username?: string;
}

interface LocalScoreState {
  scores: LocalScore[];
  highestScore: number;
}

export function LocalScoreManager() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [state, setState] = useState<LocalScoreState>({
    scores: [],
    highestScore: 0
  });
  const [error, setError] = useState<string | null>(null);

  // Load scores from localStorage on component mount
  useEffect(() => {
    try {
      const savedScores = localStorage.getItem('anime_guess_scores');
      if (savedScores) {
        const parsedScores = JSON.parse(savedScores) as LocalScore[];
        const highestScore = Math.max(...parsedScores.map(s => s.score), 0);
        setState({ scores: parsedScores, highestScore });
      }
    } catch (err) {
      console.error('Error loading local scores:', err);
      setError('Failed to load saved scores');
    }
  }, []);

  // Function to save a new score
  const saveScore = (score: number) => {
    if (!isSignedIn || !user) return;
    
    try {
      const newScore: LocalScore = {
        score,
        date: new Date().toISOString(),
        userId: user.id,
        username: user.username || user.firstName || undefined
      };
      
      const updatedScores = [...state.scores, newScore];
      
      // Sort by score (highest first)
      updatedScores.sort((a, b) => b.score - a.score);
      
      // Limit to top 50 scores
      const trimmedScores = updatedScores.slice(0, 50);
      
      // Save to localStorage
      localStorage.setItem('anime_guess_scores', JSON.stringify(trimmedScores));
      
      // Update state
      const highestScore = Math.max(...trimmedScores.map(s => s.score), 0);
      setState({ scores: trimmedScores, highestScore });
      
      return true;
    } catch (err) {
      console.error('Error saving local score:', err);
      setError('Failed to save score locally');
      return false;
    }
  };

  // Function to get user's highest score
  const getHighestScore = () => {
    if (!isSignedIn || !user) return 0;
    
    const userScores = state.scores.filter(s => s.userId === user.id);
    if (userScores.length === 0) return 0;
    
    return Math.max(...userScores.map(s => s.score));
  };

  // Check if a score is a personal best
  const isPersonalBest = (score: number) => {
    if (!isSignedIn || !user) return false;
    return score > getHighestScore();
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="mt-2 text-center">
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      
      {isSignedIn && (
        <p className="text-[#8B11D1]/80 text-sm">
          Your Best: {getHighestScore()}
        </p>
      )}
    </div>
  );
}

// Export hooks for use in other components
export function useLocalScores() {
  const { isSignedIn, user } = useUser();
  
  // Save score to localStorage
  const saveLocalScore = (score: number) => {
    if (!isSignedIn || !user) return false;
    
    try {
      // Get existing scores
      const savedScores = localStorage.getItem('anime_guess_scores');
      let scores: LocalScore[] = savedScores ? JSON.parse(savedScores) : [];
      
      // Add new score
      const newScore: LocalScore = {
        score,
        date: new Date().toISOString(),
        userId: user.id,
        username: user.username || user.firstName || undefined
      };
      
      scores.push(newScore);
      
      // Sort and limit
      scores.sort((a, b) => b.score - a.score);
      scores = scores.slice(0, 50);
      
      // Save to localStorage
      localStorage.setItem('anime_guess_scores', JSON.stringify(scores));
      
      return true;
    } catch (err) {
      console.error('Error saving local score:', err);
      return false;
    }
  };
  
  return { saveLocalScore };
} 