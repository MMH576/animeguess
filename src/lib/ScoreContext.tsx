"use client";

import { createContext, useContext, useCallback, ReactNode, useReducer, useEffect, useState } from 'react';

interface ScoreContextType {
  currentScore: number;
  refreshLeaderboard: number;
  updateCurrentScore: (score: number) => void;
  triggerLeaderboardRefresh: () => void;
}

// Action types
type ScoreAction = 
  | { type: 'SET_SCORE'; payload: number }
  | { type: 'REFRESH_LEADERBOARD' };

// Reducer
function scoreReducer(state: { currentScore: number; refreshLeaderboard: number }, action: ScoreAction) {
  switch (action.type) {
    case 'SET_SCORE':
      return { ...state, currentScore: action.payload };
    case 'REFRESH_LEADERBOARD':
      return { ...state, refreshLeaderboard: state.refreshLeaderboard + 1 };
    default:
      return state;
  }
}

const ScoreContext = createContext<ScoreContextType>({
  currentScore: 0,
  refreshLeaderboard: 0,
  updateCurrentScore: () => {},
  triggerLeaderboardRefresh: () => {},
});

export const useScoreContext = () => useContext(ScoreContext);

interface ScoreProviderProps {
  children: ReactNode;
}

export function ScoreProvider({ children }: ScoreProviderProps) {
  // Use reducer instead of direct setState to avoid render-phase updates
  const [state, dispatch] = useReducer(scoreReducer, {
    currentScore: 0,
    refreshLeaderboard: 0
  });
  
  // Track when the score was last updated to debounce leaderboard refreshes
  const [lastScoreUpdate, setLastScoreUpdate] = useState<number | null>(null);
  
  const updateCurrentScore = useCallback((score: number) => {
    console.log('Updating current score to:', score);
    // Using dispatch instead of direct setState avoids render-phase updates
    dispatch({ type: 'SET_SCORE', payload: score });
    // Record the time of the score update
    setLastScoreUpdate(Date.now());
  }, []);
  
  const triggerLeaderboardRefresh = useCallback(() => {
    console.log('Explicitly triggering leaderboard refresh');
    dispatch({ type: 'REFRESH_LEADERBOARD' });
  }, []);
  
  // Auto-refresh leaderboard after score update with debounce
  useEffect(() => {
    if (lastScoreUpdate === null) return;
    
    // Wait for 1 second after the score is updated before refreshing the leaderboard
    // This gives time for the backend to process the score update
    const timer = setTimeout(() => {
      console.log('Auto-refreshing leaderboard after score update');
      dispatch({ type: 'REFRESH_LEADERBOARD' });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [lastScoreUpdate]);
  
  // Log state changes for debugging
  useEffect(() => {
    console.log('Score context updated:', state);
  }, [state]);
  
  return (
    <ScoreContext.Provider 
      value={{ 
        currentScore: state.currentScore, 
        refreshLeaderboard: state.refreshLeaderboard, 
        updateCurrentScore, 
        triggerLeaderboardRefresh 
      }}
    >
      {children}
    </ScoreContext.Provider>
  );
} 