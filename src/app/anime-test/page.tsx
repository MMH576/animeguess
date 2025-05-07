"use client";

import AniListImage from "@/components/AniListImage";

export default function AnimeTestPage() {
  const handleNewImage = (characterName: string) => {
    console.log("New character loaded:", characterName);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-8">Anime Character Test</h1>
      
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <AniListImage 
          onNewImage={handleNewImage}
          width={250}
          height={350}
          className="mx-auto"
        />
      </div>
      
      <p className="mt-6 text-sm text-gray-500">
        Images provided by AniList API
      </p>
    </main>
  );
} 