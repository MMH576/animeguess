"use client";

import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import supabase, { type Score } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { RealtimeChannel } from '@supabase/supabase-js';

// Extend the Score type to include username
type ExtendedScore = Score & {
  username: string;
};

export function Leaderboard() {
  const { user } = useUser();
  const [scores, setScores] = useState<ExtendedScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Reference to channel for cleanup
  const channelRef = useRef<RealtimeChannel | null>(null);
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
    
    // Subscribe to real-time changes in the scores table
    const channel = supabase.channel('scores-channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'scores' 
      }, () => {
        if (isMountedRef.current) fetchLeaderboard(false);
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'scores' 
      }, () => {
        if (isMountedRef.current) fetchLeaderboard(false);
      })
      .subscribe((status) => {
        if (isMountedRef.current) {
          setRealtimeStatus(status === 'SUBSCRIBED' ? 'connected' : 'error');
        }
      });
    
    // Store channel reference for cleanup
    channelRef.current = channel;
    
    // Fetch leaderboard data on mount
    fetchLeaderboard(true);
    
    // Clean up on unmount
    return () => {
      isMountedRef.current = false;
      
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
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
      className="w-full rounded-md border border-[#66FCF1]/30 bg-[#1F2833] shadow-md p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <motion.div className="flex flex-col">
          <motion.h2 
            className="text-xl font-bold text-[#C5C8C7] flex items-center"
            initial={{ y: -5 }}
            animate={{ y: 0 }}
          >
            Leaderboard 
            {realtimeStatus === 'error' && (
              <span className="text-xs text-red-400 ml-2 flex items-center">
                <span className="inline-block h-2 w-2 rounded-full bg-red-400 mr-1"></span>
                Offline
              </span>
            )}
          </motion.h2>
          {lastUpdated && (
            <span className="text-xs text-[#C5C8C7]/60">
              Updated {getLastUpdatedText()}
            </span>
          )}
        </motion.div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-sm text-[#66FCF1]"
          onClick={() => fetchLeaderboard(false)}
          disabled={isRefreshing}
          aria-label="Refresh leaderboard"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </motion.button>
      </div>
      
      {/* Time period header */}
      <motion.div 
        className="mb-4"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-center text-lg font-medium text-[#66FCF1]">
          All Time
        </h3>
      </motion.div>
      
      {/* Table headers */}
      <div className="grid grid-cols-3 text-xs text-[#66FCF1] uppercase mb-2 px-2">
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
            className="flex justify-center py-8"
          >
            <motion.div 
              className="h-8 w-8 border-2 border-[#66FCF1] rounded-full border-t-transparent"
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
            className="text-red-500 text-center py-4"
          >
            {error}
          </motion.div>
        ) : scores.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[#C5C8C7]/70 text-center py-8"
          >
            No scores yet. Be the first to play!
          </motion.div>
        ) : (
          <motion.div 
            key="scores"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {scores.slice(0, 5).map((score, index) => {
              const isCurrentUser = user?.id === score.user_id;
              
              return (
                <motion.div 
                  key={`${score.id}-${score.score}`} 
                  className={`grid grid-cols-3 items-center py-3 px-2 ${index !== scores.slice(0, 5).length - 1 ? 'border-b border-[#66FCF1]/10' : ''} ${isCurrentUser ? 'bg-[#66FCF1]/10 rounded-md' : ''}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: isCurrentUser ? "rgba(102, 252, 241, 0.15)" : "rgba(102, 252, 241, 0.05)" }}
                >
                  <div className="text-sm">
                    {index === 0 ? (
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-400/80 text-black font-bold">
                        {index + 1}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center w-6 h-6 text-[#C5C8C7]">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div className="text-sm">
                    {isCurrentUser ? (
                      <span className="flex items-center text-[#C5C8C7]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#66FCF1] mr-1">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        {score.username || 'You'}
                      </span>
                    ) : (
                      <span className="text-[#C5C8C7]">
                        {score.username || `Player ${score.user_id.slice(-4)}`}
                      </span>
                    )}
                  </div>
                  <div className="text-right text-[#66FCF1] font-bold">
                    {score.score}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 