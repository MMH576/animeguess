"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import type { Score } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [scores, setScores] = useState<ExtendedScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'all' | 'week' | 'month'>(initialPeriod);
  
  // Note: Difficulty filtering removed until database supports it
  // const [difficulty, setDifficulty] = useState<'all' | 'easy' | 'normal' | 'hard'>(initialDifficulty);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Build query parameters - Note: difficulty parameter is not used until database supports it
        const params = new URLSearchParams();
        if (period !== 'all') params.append('period', period);
        params.append('limit', '20');
        
        // Fetch the leaderboard data
        const response = await fetch(`/api/scores?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
        
        const data = await response.json();
        setScores(data.leaderboard || []);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [period]);

  const handlePeriodChange = (newPeriod: 'all' | 'week' | 'month') => {
    setPeriod(newPeriod);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full rounded-md border border-[#66FCF1]/30 bg-[#1F2833] shadow-md p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <motion.h2 
          className="text-xl font-bold text-[#C5C8C7]"
          initial={{ y: -5 }}
          animate={{ y: 0 }}
        >
          Leaderboard
        </motion.h2>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-sm text-[#66FCF1]"
        >
          View Full Leaderboard
        </motion.button>
      </div>
      
      {/* Filter controls */}
      <motion.div 
        className="grid grid-cols-3 gap-1 mb-4"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
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
                        {score.username}
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