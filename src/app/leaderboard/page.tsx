import { Leaderboard } from '@/components/Leaderboard';
import Link from 'next/link';

export const metadata = {
  title: 'Leaderboard - Anime Character Guessing Game',
  description: 'See the top scores in our Anime Character Guessing Game!',
};

export default function LeaderboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-black to-[#2D0544]">
      <div className="max-w-4xl w-full py-12">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Top Players
        </h1>
        
        <Leaderboard />
        
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="text-[#8B11D1] hover:text-white transition-colors"
          >
            ← Back to Game
          </Link>
        </div>
      </div>
    </main>
  );
} 