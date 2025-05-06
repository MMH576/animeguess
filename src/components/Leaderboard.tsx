"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

type LeaderboardEntry = {
  user_id: string;
  score: number;
  created_at?: string;
};

type PeriodOption = 'week' | 'month' | 'all';

export function Leaderboard() {
  const { isLoaded, user } = useUser();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodOption>('week');
  const [error, setError] = useState<string | null>(null);

  // Fetch leaderboard data when period changes or component mounts
  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/scores?period=${period}&limit=10`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
        
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Unable to load leaderboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchLeaderboard();
  }, [period]);

  const handlePeriodChange = (newPeriod: PeriodOption) => {
    setPeriod(newPeriod);
  };

  // Format username to display first 3 chars + last 4 chars for privacy
  const formatUserId = (userId: string) => {
    if (user && user.id === userId) {
      return 'You';
    }
    
    if (userId.length <= 7) {
      return userId;
    }
    
    return `${userId.substring(0, 3)}...${userId.substring(userId.length - 4)}`;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="bg-black/80 p-6 rounded-lg shadow-lg max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-[#8B11D1] mb-4">Leaderboard</h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8B11D1]"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-black/80 p-6 rounded-lg shadow-lg max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-[#8B11D1] mb-4">Leaderboard</h2>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-black/80 p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-[#8B11D1] mb-4">Leaderboard</h2>
      
      {/* Period selector */}
      <div className="flex space-x-2 mb-4">
        <button 
          onClick={() => handlePeriodChange('week')}
          className={`px-3 py-1 rounded-md ${period === 'week' 
            ? 'bg-[#8B11D1] text-white' 
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
        >
          This Week
        </button>
        <button 
          onClick={() => handlePeriodChange('month')}
          className={`px-3 py-1 rounded-md ${period === 'month' 
            ? 'bg-[#8B11D1] text-white' 
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
        >
          This Month
        </button>
        <button 
          onClick={() => handlePeriodChange('all')}
          className={`px-3 py-1 rounded-md ${period === 'all' 
            ? 'bg-[#8B11D1] text-white' 
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
        >
          All Time
        </button>
      </div>
      
      {/* Leaderboard table */}
      {leaderboard.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-800">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Player
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-black divide-y divide-gray-800">
              {leaderboard.map((entry, index) => (
                <tr key={`${entry.user_id}-${index}`} className={
                  isLoaded && user && user.id === entry.user_id
                    ? "bg-[#8B11D1]/10"
                    : ""
                }>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    {formatUserId(entry.user_id)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right font-mono">
                    {entry.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400 text-center py-8">
          No scores recorded for this time period yet. Be the first!
        </p>
      )}
    </div>
  );
} 