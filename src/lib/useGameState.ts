"use client";

import { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useLocalScores } from '@/components/LocalScoreManager';

export type GameDifficulty = 'easy' | 'normal' | 'hard';

interface GameState {
  score: number;
  difficulty: GameDifficulty;
  recentlySubmitted: boolean;
  isSubmitting: boolean;
  error: string | null;
}

export function useGameState(initialDifficulty: GameDifficulty = 'normal') {
  const { isSignedIn, user } = useUser();
  const { saveLocalScore } = useLocalScores();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    difficulty: initialDifficulty,
    recentlySubmitted: false,
    isSubmitting: false,
    error: null
  });
  
  // Update score
  const updateScore = useCallback((points: number) => {
    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
      recentlySubmitted: false
    }));
  }, []);
  
  // Change difficulty
  const setDifficulty = useCallback((difficulty: GameDifficulty) => {
    setGameState(prev => ({
      ...prev,
      difficulty
    }));
  }, []);
  
  // Submit score to API
  const submitScore = useCallback(async () => {
    // Validation checks
    if (!isSignedIn) {
      console.log('Score not submitted: User not signed in');
      return;
    }
    
    if (gameState.score === 0) {
      console.log('Score not submitted: Score is 0');
      return;
    }
    
    if (gameState.recentlySubmitted) {
      console.log('Score not submitted: Already submitted recently');
      return;
    }
    
    // Start submission process
    setGameState(prev => ({
      ...prev,
      isSubmitting: true,
      error: null
    }));
    
    // Always save to local storage as a backup
    saveLocalScore(gameState.score);
    
    try {
      // Prepare the score data
      const scoreData = {
        score: gameState.score,
        difficulty: gameState.difficulty
      };
      
      // Send to the API
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scoreData)
      });
      
      // Parse the response
      const responseText = await response.text();
      const responseData = responseText ? JSON.parse(responseText) : {};
      
      // Handle API errors
      if (!response.ok) {
        const errorMsg = responseData?.error || 'Failed to submit score';
        console.error('API Error:', errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('Score submitted successfully:', responseData);
      
      // Mark as submitted
      setGameState(prev => ({
        ...prev,
        recentlySubmitted: true,
        isSubmitting: false,
        error: null
      }));
    } catch (error) {
      console.error('Error submitting score:', error);
      
      // Show error but maintain local storage backup
      setGameState(prev => ({
        ...prev,
        isSubmitting: false,
        recentlySubmitted: true, // Still mark as submitted since we saved locally
        error: error instanceof Error 
          ? error.message 
          : 'Score saved locally only. Server connection failed.'
      }));
    }
  }, [isSignedIn, user, gameState.score, gameState.difficulty, gameState.recentlySubmitted, saveLocalScore]);
  
  // Reset game state
  const resetScore = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      score: 0,
      recentlySubmitted: false,
      error: null
    }));
  }, []);
  
  return {
    score: gameState.score,
    difficulty: gameState.difficulty,
    isSubmitting: gameState.isSubmitting,
    error: gameState.error,
    recentlySubmitted: gameState.recentlySubmitted,
    updateScore,
    setDifficulty,
    submitScore,
    resetScore
  };
} 