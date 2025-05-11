"use client";

import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { type Score } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

// Extend the Score type to include username
type ExtendedScore = Score & {
  username: string;
};

export function Leaderboard() {
  const { user } = useUser();
  const [scores, setScores] = useState<ExtendedScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Track component mounted state
  const isMountedRef = useRef(true);
  
  // Function to fetch leaderboard data
  const fetchLeaderboard = async (showLoadingState = false) => {
    if (!isMountedRef.current) return;
    
    if (showLoadingState) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('limit', '20');
      
      // Fetch the leaderboard data
      const response = await fetch(`/api/scores?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }
      
      const data = await response.json();
      
      if (isMountedRef.current) {
        setScores(data.leaderboard || []);
        setLastUpdated(new Date());
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      if (isMountedRef.current) {
        setError('Failed to load leaderboard. Please try again later.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  };
  
  // Setup real-time subscription
  useEffect(() => {
    isMountedRef.current = true;
    
    // Fetch leaderboard data on mount
    fetchLeaderboard(true);
    
    // Clean up on unmount
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Get time since last update for display
  const getLastUpdatedText = () => {
    if (!lastUpdated) return '';
    
    const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
    
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full rounded-xl border border-[#66FCF1]/20 bg-gradient-to-b from-[#1F2833] to-[#1A2028] shadow-lg p-5"
    >
      <div className="flex items-center justify-between mb-6">
        <motion.div className="flex flex-col">
          <motion.h2 
            className="text-2xl font-bold text-white flex items-center"
            initial={{ y: -5 }}
            animate={{ y: 0 }}
          >
            Leaderboard 
          </motion.h2>
          {lastUpdated && (
            <span className="text-xs text-[#C5C8C7]/70 mt-1">
              Updated {getLastUpdatedText()}
            </span>
          )}
        </motion.div>
        
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "#66FCF1" }}
          whileTap={{ scale: 0.95 }}
          className="text-sm bg-[#45A29E] text-[#0B0C10] font-medium px-4 py-2 rounded-md transition-colors duration-200 shadow-sm"
          onClick={() => fetchLeaderboard(false)}
          disabled={isRefreshing}
          aria-label="Refresh leaderboard"
        >
          {isRefreshing ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#0B0C10]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Refreshing
            </span>
          ) : 'Refresh Scores'}
        </motion.button>
      </div>
      
      {/* Time period header */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-center text-lg font-medium text-[#66FCF1] pb-2 border-b border-[#66FCF1]/20">
          All Time
        </h3>
      </motion.div>
      
      {/* Table headers */}
      <div className="grid grid-cols-3 text-xs font-semibold tracking-wider text-[#66FCF1] uppercase mb-3 px-3">
        <div className="text-left">Rank</div>
        <div className="text-left">Player</div>
        <div className="text-right">Score</div>
      </div>
      
      {/* Leaderboard content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-12"
          >
            <motion.div 
              className="h-10 w-10 border-3 border-[#66FCF1] rounded-full border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
          </motion.div>
        ) : error ? (
          <motion.div 
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-red-500/10 text-red-400 text-center py-6 px-4 rounded-lg"
          >
            {error}
          </motion.div>
        ) : scores.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[#C5C8C7]/70 text-center py-12 px-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-[#66FCF1]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No scores yet. Be the first to play!</p>
          </motion.div>
        ) : (
          <motion.div 
            key="scores"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {scores.slice(0, 5).map((score, index) => {
              const isCurrentUser = user?.id === score.user_id;
              
              return (
                <motion.div 
                  key={`${score.id}-${score.score}`} 
                  className={`grid grid-cols-3 items-center py-3 px-3 rounded-lg ${
                    isCurrentUser ? 'bg-[#66FCF1]/15 ring-1 ring-[#66FCF1]/30' : 'hover:bg-[#66FCF1]/5'
                  } transition-colors duration-200`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -1 }}
                >
                  <div className="text-sm">
                    {index === 0 ? (
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-black font-bold shadow-md">
                        {index + 1}
                      </span>
                    ) : index === 1 ? (
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 text-black font-bold shadow-md">
                        {index + 1}
                      </span>
                    ) : index === 2 ? (
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-amber-700 to-amber-800 text-white font-bold shadow-md">
                        {index + 1}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center w-7 h-7 text-[#C5C8C7] font-medium">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div className="text-sm">
                    {isCurrentUser ? (
                      <span className="flex items-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#66FCF1] mr-2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span className="font-medium">{score.username || 'You'}</span>
                      </span>
                    ) : (
                      <span className="text-[#C5C8C7]">
                        {score.username || `Player ${score.user_id.slice(-4)}`}
                      </span>
                    )}
                  </div>
                  <div className="text-right text-[#66FCF1] font-bold text-lg">
                    {score.score}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="mt-6 text-center text-xs text-[#C5C8C7]/60 bg-[#0B0C10]/30 py-2 px-3 rounded-md">
        Scores update after refresh or when you revisit the page
      </div>
    </motion.div>
  );
} 