"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import type { Score } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { useScoreContext } from '@/lib/ScoreContext';
import supabase from '@/lib/supabaseClient';

// Extend the Score type to include username
type ExtendedScore = Score & {
  username: string;
};

interface LeaderboardProps {
  initialPeriod?: 'all' | 'week' | 'month';
  // initialDifficulty removed until database supports it
}

export function Leaderboard({ 
  initialPeriod = 'all'
}: LeaderboardProps) {
  const { user } = useUser();
  const { refreshLeaderboard } = useScoreContext();
  const [scores, setScores] = useState<ExtendedScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'all' | 'week' | 'month'>(initialPeriod);
  const [retryCount, setRetryCount] = useState(0);
  const [isLiveEnabled, setIsLiveEnabled] = useState(true);
  const realtimeSubscription = useRef<{ unsubscribe: () => void } | null>(null);
  
  // Track if any new scores have been received in real-time
  const [hasNewScores, setHasNewScores] = useState(false);
  
  // Store fetchLeaderboard in a ref to avoid dependency loops
  const fetchLeaderboardRef = useRef<() => Promise<void>>(async () => {});
  
  // Function to fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
    if (typeof window === 'undefined') return;
    setLoading(true);
    setError(null);
    setHasNewScores(false);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (period !== 'all') params.append('period', period);
      params.append('limit', '20');
      
      // Add cache-busting timestamp with more precision
      params.append('t', `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`);
      
      console.log('Fetching leaderboard data...');
      
      // Try the simplified endpoint first (more reliable)
      const apiUrl = `/api/scores/simple?${params.toString()}`;
      console.log('Using API endpoint:', apiUrl);
      
      // Fetch the leaderboard data with stronger no-cache directives
      const response = await fetch(apiUrl, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      // Force cache invalidation with this extra headers check
      if (!response.headers.get('date')) {
        console.warn('Response may be cached, attempting retry with forced revalidation');
        const retryResponse = await fetch(apiUrl, {
          method: 'GET',
          cache: 'reload',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          console.log('Leaderboard retry data received:', retryData.leaderboard?.length || 0, 'entries');
          
          // Apply the same filtering to retry data, safely handling user being null
          let filteredRetryScores = retryData.leaderboard?.filter((score: ExtendedScore) => {
            return !score.username.startsWith('Player ') || (user && score.user_id === user.id);
          }) || [];
          
          // Filter out duplicate usernames in the retry data as well
          const uniqueRetryUsernames = new Set<string>();
          filteredRetryScores = filteredRetryScores.filter((score: ExtendedScore) => {
            if (uniqueRetryUsernames.has(score.username)) {
              return false;
            }
            uniqueRetryUsernames.add(score.username);
            return true;
          });
          
          console.log('Filtered retry leaderboard entries:', filteredRetryScores.length);
          setScores(filteredRetryScores);
          setLoading(false);
          setRetryCount(0);
          
          // Set up real-time subscription after successful fetch
          setupRealtimeSubscription();
          return;
        }
      }
      
      const responseText = await response.text();
      
      // Try to parse the response as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        console.error('Failed to parse leaderboard response:', responseText);
        throw new Error(`Invalid response format: ${responseText.substring(0, 100)}`);
      }
      
      // Check for error in the response
      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch leaderboard data (${response.status})`);
      }
      
      console.log('Leaderboard data received:', data.leaderboard?.length || 0, 'entries');
      
      // Filter placeholder users, safely handling user being null
      let filteredScores = data.leaderboard?.filter((score: ExtendedScore) => {
        return !score.username.startsWith('Player ') || (user && score.user_id === user.id);
      }) || [];
      
      // Filter duplicate usernames, keeping only the highest score for each user
      const uniqueUsernames = new Set<string>();
      filteredScores = filteredScores.filter((score: ExtendedScore) => {
        if (uniqueUsernames.has(score.username)) {
          return false;
        }
        uniqueUsernames.add(score.username);
        return true;
      });
      
      console.log('Filtered leaderboard entries:', filteredScores.length);
      setScores(filteredScores);
      setLoading(false);
      setRetryCount(0); // Reset retry count on success
      
      // Set up real-time subscription after successful fetch
      setupRealtimeSubscription();
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
      setLoading(false);
      
      // Implement retry logic with exponential backoff
      if (retryCount < 3) {
        const backoffDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`Retrying in ${backoffDelay}ms (attempt ${retryCount + 1}/3)`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, backoffDelay);
      }
    }
  }, [period, retryCount, user]);
  
  // Update the ref whenever the callback changes
  useEffect(() => {
    fetchLeaderboardRef.current = fetchLeaderboard;
  }, [fetchLeaderboard]);
  
  // Function to subscribe to real-time updates
  const setupRealtimeSubscription = useCallback(() => {
    // Clean up any existing subscription
    if (realtimeSubscription.current) {
      realtimeSubscription.current.unsubscribe();
      realtimeSubscription.current = null;
    }
    
    if (!isLiveEnabled) return;
    
    console.log('[Leaderboard] Setting up real-time subscription');
    
    try {
      // Create a channel for the scores table
      const channel = supabase.channel('leaderboard-changes');
      
      // Subscribe to INSERT events on the scores table
      const subscription = channel
        .on(
          'postgres_changes',
          {
            event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'scores',
          },
          async (payload) => {
            console.log('[Leaderboard] Real-time event received:', payload);
            setHasNewScores(true);
            
            // When we receive a realtime update, fetch the entire leaderboard again
            // This is simpler and more reliable than trying to manipulate the state directly
            if (fetchLeaderboardRef.current) {
              fetchLeaderboardRef.current();
            }
          }
        )
        .subscribe((status) => {
          console.log('[Leaderboard] Subscription status:', status);
        });
      
      // Store the subscription for cleanup
      realtimeSubscription.current = {
        unsubscribe: () => {
          console.log('[Leaderboard] Unsubscribing from real-time updates');
          subscription.unsubscribe();
        }
      };
    } catch (error) {
      console.error('[Leaderboard] Error setting up real-time subscription:', error);
    }
  }, [isLiveEnabled]);
  
  // Clean up subscription when component unmounts
  useEffect(() => {
    return () => {
      if (realtimeSubscription.current) {
        realtimeSubscription.current.unsubscribe();
      }
    };
  }, []);

  // Manual refresh function for the user to trigger
  const handleRefresh = () => {
    console.log('Manual leaderboard refresh triggered');
    setScores([]);  // Clear current scores to show loading state
    setLoading(true);
    setError(null);
    setRetryCount(0);
    setHasNewScores(false);
    
    // Clear existing subscription before fetching
    if (realtimeSubscription.current) {
      realtimeSubscription.current.unsubscribe();
      realtimeSubscription.current = null;
    }
    
    // Add slight delay to ensure visual feedback
    setTimeout(() => {
      fetchLeaderboard();
    }, 100);
  };

  // Effect to fetch leaderboard when refreshLeaderboard changes
  useEffect(() => {
    console.log('Leaderboard effect triggered by refreshLeaderboard:', refreshLeaderboard);
    // Reset states before fetching
    setScores([]);
    setLoading(true);
    setError(null);
    setRetryCount(0);
    setHasNewScores(false);
    
    // Clean up any existing subscription
    if (realtimeSubscription.current) {
      realtimeSubscription.current.unsubscribe();
      realtimeSubscription.current = null;
    }
    
    // Immediate fetch with slight delay to ensure visual feedback
    const timer = setTimeout(() => {
      fetchLeaderboard();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [fetchLeaderboard, refreshLeaderboard]);
  
  // Effect to refresh leaderboard when period changes
  useEffect(() => {
    // Clean up any existing subscription
    if (realtimeSubscription.current) {
      realtimeSubscription.current.unsubscribe();
      realtimeSubscription.current = null;
    }
    
    fetchLeaderboard();
  }, [period, fetchLeaderboard]);

  const handlePeriodChange = (newPeriod: 'all' | 'week' | 'month') => {
    setPeriod(newPeriod);
    setRetryCount(0); // Reset retry count when period changes
  };
  
  // Toggle live updates
  const toggleLiveUpdates = () => {
    setIsLiveEnabled(prev => {
      const newValue = !prev;
      if (newValue) {
        // If enabling, set up subscription
        setupRealtimeSubscription();
      } else {
        // If disabling, clear subscription
        if (realtimeSubscription.current) {
          realtimeSubscription.current.unsubscribe();
          realtimeSubscription.current = null;
        }
      }
      return newValue;
    });
  };

  return (
    <motion.div 
      className="bg-[#1F2833]/50 backdrop-blur-sm rounded-lg p-4 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-[#66FCF1]">Leaderboard</h2>
          {hasNewScores && (
            <span className="bg-[#66FCF1] text-[#0B0C10] text-xs px-1.5 py-0.5 rounded-full animate-pulse">
              New!
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={toggleLiveUpdates}
            className={`px-2 py-1.5 rounded-md text-xs flex items-center transition-colors duration-200 ${
              isLiveEnabled 
                ? 'bg-[#66FCF1]/20 text-[#66FCF1]' 
                : 'bg-[#0B0C10] text-[#C5C8C7]/70'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className={`h-2 w-2 rounded-full mr-1.5 ${isLiveEnabled ? 'bg-[#66FCF1] animate-pulse' : 'bg-[#C5C8C7]/50'}`}></span>
            Live
          </motion.button>
          <motion.button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-[#0B0C10] hover:bg-[#1F2833] text-[#66FCF1] px-3 py-1.5 rounded-md text-sm flex items-center transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </motion.svg>
            {loading ? 'Loading...' : 'Refresh'}
          </motion.button>
          <a href="/leaderboard" className="text-sm text-[#66FCF1] hover:text-[#45A29E] transition-colors">
            View Full
          </a>
        </div>
      </div>

      {/* Period selector */}
      <motion.div className="flex gap-2 mb-4">
        <motion.button 
          className={`px-3 py-2 text-sm rounded-md transition-all ${period === 'all' ? 'bg-[#66FCF1]' : 'bg-[#0B0C10]'} ${period === 'all' ? 'text-[#0B0C10]' : 'text-[#C5C8C7]'}`}
          onClick={() => handlePeriodChange('all')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          All Time
        </motion.button>
        
        <motion.button 
          className={`px-3 py-2 text-sm rounded-md transition-all ${period === 'month' ? 'bg-[#66FCF1]' : 'bg-[#0B0C10]'} ${period === 'month' ? 'text-[#0B0C10]' : 'text-[#C5C8C7]'}`}
          onClick={() => handlePeriodChange('month')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Month
        </motion.button>
        
        <motion.button 
          className={`px-3 py-2 text-sm rounded-md transition-all ${period === 'week' ? 'bg-[#66FCF1]' : 'bg-[#0B0C10]'} ${period === 'week' ? 'text-[#0B0C10]' : 'text-[#C5C8C7]'}`}
          onClick={() => handlePeriodChange('week')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Week
        </motion.button>
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
            className="text-red-500 text-center py-4 flex flex-col items-center"
          >
            <div className="mb-2">{error}</div>
            <motion.button
              onClick={handleRefresh}
              className="px-3 py-1 bg-[#0B0C10] text-[#66FCF1] text-xs rounded-md hover:bg-[#1F2833] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </motion.button>
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
                  key={score.id} 
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
                        {score.username || `Player ${score.user_id.substring(0, 4)}`}
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