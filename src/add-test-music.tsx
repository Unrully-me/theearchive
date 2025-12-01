import React, { useState } from 'react';
import { projectId, publicAnonKey } from './utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4d451974`;

const TEST_MUSIC = [
  {
    title: "Blinding Lights",
    artist: "The Weeknd",
    description: "Hit single from After Hours album - Synthwave masterpiece",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
    genre: "Pop, Synthwave",
    year: "2020",
    type: "music",
    category: "music",
    contentType: "music-video",
    ageRating: "PG",
  },
  {
    title: "One Dance",
    artist: "Drake ft. Wizkid & Kyla",
    description: "Chart-topping dancehall-pop fusion hit",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    genre: "Dancehall, Pop",
    year: "2016",
    type: "music",
    category: "music",
    contentType: "music-video",
    ageRating: "PG",
  },
  {
    title: "Levitating",
    artist: "Dua Lipa ft. DaBaby",
    description: "Disco-pop anthem from Future Nostalgia",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80",
    genre: "Disco, Pop",
    year: "2020",
    type: "music",
    category: "music",
    contentType: "music-video",
    ageRating: "PG",
  },
  {
    title: "Save Your Tears",
    artist: "The Weeknd",
    description: "Emotional synth-pop ballad with 80s vibes",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
    genre: "Synth-pop",
    year: "2021",
    type: "music",
    category: "music",
    contentType: "music-video",
    ageRating: "PG",
  },
  {
    title: "SICKO MODE",
    artist: "Travis Scott ft. Drake",
    description: "Multi-part hip-hop epic from ASTROWORLD",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&q=80",
    genre: "Hip-Hop, Trap",
    year: "2018",
    type: "music",
    category: "music",
    contentType: "music-video",
    ageRating: "PG-13",
  },
  {
    title: "Peaches",
    artist: "Justin Bieber ft. Daniel Caesar & Giveon",
    description: "Smooth R&B summer vibe",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
    genre: "R&B, Pop",
    year: "2021",
    type: "music",
    category: "music",
    contentType: "music-video",
    ageRating: "PG",
  },
  {
    title: "Heat Waves",
    artist: "Glass Animals",
    description: "Indie pop sensation with dreamy production",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&q=80",
    genre: "Indie Pop",
    year: "2020",
    type: "music",
    category: "music",
    contentType: "music-video",
    ageRating: "PG",
  },
  {
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    description: "Feel-good summer anthem",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800&q=80",
    genre: "Pop Rock",
    year: "2020",
    type: "music",
    category: "music",
    contentType: "music-video",
    ageRating: "PG",
  },
  {
    title: "Good 4 U",
    artist: "Olivia Rodrigo",
    description: "Pop-punk breakup anthem",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    genre: "Pop Punk",
    year: "2021",
    type: "music",
    category: "music",
    contentType: "music-video",
    ageRating: "PG",
  },
  {
    title: "Stay",
    artist: "The Kid LAROI & Justin Bieber",
    description: "Catchy pop collaboration",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800&q=80",
    genre: "Pop",
    year: "2021",
    type: "music",
    category: "music",
    contentType: "music-video",
    ageRating: "PG",
  },
  {
    title: "Anti-Hero",
    artist: "Taylor Swift",
    description: "Self-reflective pop masterpiece from Midnights",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
    genre: "Pop",
    year: "2022",
    type: "music",
    category: "music",
    contentType: "music-video",
    ageRating: "PG",
  },
  {
    title: "As It Was",
    artist: "Harry Styles",
    description: "Introspective synth-pop reflection",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1501612780327-45045538702b?w=800&q=80",
    genre: "Synth-pop",
    year: "2022",
    type: "music",
    category: "music",
    contentType: "music-video",
    ageRating: "PG",
  },
];

export default function AddTestMusic() {
  const [isAdding, setIsAdding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
    console.log(message);
  };

  const addTestMusic = async () => {
    setIsAdding(true);
    setProgress(0);
    setLogs([]);

    addLog('🎵 Starting to add test music...');

    for (let i = 0; i < TEST_MUSIC.length; i++) {
      const music = TEST_MUSIC[i];
      addLog(`\n📀 Adding: ${music.title} by ${music.artist}`);

      try {
        const response = await fetch(`${API_URL}/movies`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(music),
        });

        const data = await response.json();

        if (data.success) {
          addLog(`✅ Successfully added: ${music.title}`);
        } else {
          addLog(`❌ Failed to add ${music.title}: ${data.error}`);
        }
      } catch (error) {
        addLog(`❌ Error adding ${music.title}: ${error}`);
      }

      setProgress(((i + 1) / TEST_MUSIC.length) * 100);
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    addLog('\n🎉 FINISHED! All test music added!');
    addLog('🎵 Go to the Music tab to see your Spotify player in action!');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gradient-to-br from-green-900/50 to-purple-900/50 backdrop-blur-xl rounded-2xl border-2 border-green-500/50 shadow-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            🎵 ADD TEST MUSIC
          </h1>
          <p className="text-gray-300">
            This will add {TEST_MUSIC.length} popular songs to your music library
          </p>
        </div>

        {!isAdding && progress === 0 && (
          <button
            onClick={addTestMusic}
            className="w-full py-6 bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 text-black font-black text-2xl rounded-xl hover:shadow-2xl hover:shadow-green-500/50 transition-all transform hover:scale-105 mb-4"
          >
            🚀 ADD {TEST_MUSIC.length} TEST SONGS NOW
          </button>
        )}

        {isAdding && (
          <div className="mb-4">
            <div className="w-full h-4 bg-black/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-cyan-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-white font-bold mt-2">
              {Math.round(progress)}% Complete
            </p>
          </div>
        )}

        <div className="bg-black/50 rounded-xl p-4 max-h-96 overflow-y-auto">
          <h3 className="text-white font-bold mb-2">📋 Progress Log:</h3>
          {logs.length === 0 ? (
            <p className="text-gray-500 text-sm">Waiting to start...</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, i) => (
                <div key={i} className="text-sm text-gray-300 font-mono">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

        {progress === 100 && !isAdding && (
          <button
            onClick={() => window.location.href = '/'}
            className="w-full mt-4 py-4 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-black text-xl rounded-xl hover:shadow-xl transition-all"
          >
            ✅ GO TO MUSIC TAB & TEST PLAYER
          </button>
        )}

        <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
          <h3 className="text-white font-bold mb-2">📝 Test Music Includes:</h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
            {TEST_MUSIC.slice(0, 6).map((music, i) => (
              <div key={i}>• {music.title} - {music.artist}</div>
            ))}
            <div className="col-span-2 text-center text-gray-500">
              ... and {TEST_MUSIC.length - 6} more hits!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
