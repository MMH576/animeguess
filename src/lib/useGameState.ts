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
    // Don't submit if not signed in or score is 0
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
    
    console.log(`Submitting score: ${gameState.score}, difficulty: ${gameState.difficulty}, user: ${user?.id}`);
    
    setGameState(prev => ({
      ...prev,
      isSubmitting: true,
      error: null
    }));
    
    try {
      const scoreData = {
        score: gameState.score,
        difficulty: gameState.difficulty
      };
      
      console.log('Sending to API:', scoreData);
      
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scoreData)
      });
      
      // Check for empty response before parsing JSON
      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (jsonError) {
        console.error('Failed to parse API response:', jsonError, responseText);
        throw new Error('Invalid response from server');
      }
      
      if (!response.ok) {
        const errorMsg = responseData?.error || 'Failed to submit score';
        console.error('API Error:', errorMsg, responseData);
        throw new Error(errorMsg);
      }
      
      console.log('Score submitted successfully:', responseData);
      
      // Also record a play if this is first score submission
      if (!gameState.recentlySubmitted) {
        try {
          const playResponse = await fetch('/api/plays', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              difficulty: gameState.difficulty
            })
          });
          
          if (!playResponse.ok) {
            console.warn('Failed to record play, but score was saved');
          }
        } catch (playError) {
          console.warn('Error recording play, but score was saved:', playError);
        }
      }
      
      setGameState(prev => ({
        ...prev,
        recentlySubmitted: true,
        isSubmitting: false
      }));
    } catch (error) {
      console.error('Error submitting score:', error);
      
      // Fallback to local storage when API fails
      if (isSignedIn && gameState.score > 0) {
        const localSaved = saveLocalScore(gameState.score);
        if (localSaved) {
          console.log('Score saved locally as fallback');
          setGameState(prev => ({
            ...prev,
            isSubmitting: false,
            recentlySubmitted: true,
            error: 'Score saved locally. Server connection failed.'
          }));
          return;
        }
      }
      
      setGameState(prev => ({
        ...prev,
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'Failed to submit score. Please try again.'
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