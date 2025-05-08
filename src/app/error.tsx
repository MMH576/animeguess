'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0C10] p-4">
      <div className="max-w-md w-full p-6 bg-[#1F2833] rounded-lg shadow-xl border border-[#66FCF1]/30">
        <h2 className="text-2xl font-bold text-[#66FCF1] mb-4">Something went wrong!</h2>
        <p className="text-[#C5C8C7] mb-6">
          We encountered an unexpected error. Please try refreshing the page.
        </p>
        <div className="flex flex-col gap-3">
          <Button 
            onClick={reset}
            className="bg-[#66FCF1] hover:bg-[#66FCF1]/80 text-[#0B0C10]"
          >
            Try again
          </Button>
          <Button 
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="border-[#66FCF1] text-[#66FCF1] hover:bg-[#66FCF1]/10"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
} 