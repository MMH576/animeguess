"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import type { Score } from '@/lib/supabaseClient';

interface LeaderboardProps {
  initialPeriod?: 'all' | 'week' | 'month';
  // initialDifficulty removed until database supports it
}

export function Leaderboard({ 
  initialPeriod = 'all'
}: LeaderboardProps) {
  const { user } = useUser();
  const [scores, setScores] = useState<Score[]>([]);
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
    <div className="flex flex-col space-y-4 w-full max-w-md mx-auto bg-black/50 p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold text-center text-white">Leaderboard</h2>
      
      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between">
        <div className="flex gap-2">
          <button 
            className={`px-3 py-1 text-sm rounded-full ${period === 'all' ? 'bg-[#8B11D1] text-white' : 'bg-black/30 text-[#8B11D1]'}`}
            onClick={() => handlePeriodChange('all')}
          >
            All Time
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-full ${period === 'month' ? 'bg-[#8B11D1] text-white' : 'bg-black/30 text-[#8B11D1]'}`}
            onClick={() => handlePeriodChange('month')}
          >
            Month
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-full ${period === 'week' ? 'bg-[#8B11D1] text-white' : 'bg-black/30 text-[#8B11D1]'}`}
            onClick={() => handlePeriodChange('week')}
          >
            Week
          </button>
        </div>
        
        {/* Difficulty filter removed until database supports it */}
      </div>
      
      {/* Leaderboard table */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B11D1]"></div>
        </div>
      ) : error ? (
        <div className="text-red-400 text-center py-4">{error}</div>
      ) : scores.length === 0 ? (
        <div className="text-[#8B11D1]/70 text-center py-8">
          No scores yet. Be the first to play!
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#8B11D1]/20">
          <table className="min-w-full divide-y divide-[#8B11D1]/20">
            <thead className="bg-black/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#8B11D1] uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#8B11D1] uppercase tracking-wider">
                  Player
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#8B11D1] uppercase tracking-wider">
                  Score
                </th>
                {/* Difficulty column removed until database supports it */}
              </tr>
            </thead>
            <tbody className="bg-black/20 divide-y divide-[#8B11D1]/10">
              {scores.map((score, index) => {
                const isCurrentUser = user?.id === score.user_id;
                
                return (
                  <tr 
                    key={score.id} 
                    className={isCurrentUser ? "bg-[#8B11D1]/20" : ""}
                  >
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-white">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <span className={isCurrentUser ? "text-white font-semibold" : "text-white/80"}>
                        {isCurrentUser ? "You" : `Player ${score.user_id.substring(0, 8)}`}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-white font-medium">
                      {score.score}
                    </td>
                    {/* Difficulty column removed until database supports it */}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 