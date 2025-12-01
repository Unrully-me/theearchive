import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface AvatarPickerProps {
  currentAvatar?: string;
  onSelect: (avatar: string) => void;
  onClose: () => void;
}

// BEAUTIFUL DIVERSE AVATAR COLLECTION - EMOJI STYLE + GRADIENT BACKGROUNDS
const AVATARS = [
  // LIGHT SKIN TONES
  { id: 'light-male-1', emoji: '👨🏻', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', name: 'Light Male', category: 'light' },
  { id: 'light-male-2', emoji: '👨🏻‍💼', bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', name: 'Light Business', category: 'light' },
  { id: 'light-female-1', emoji: '👩🏻', bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', name: 'Light Female', category: 'light' },
  { id: 'light-female-2', emoji: '👩🏻‍🦰', bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', name: 'Light Red Hair', category: 'light' },
  { id: 'light-female-3', emoji: '👱🏻‍♀️', bg: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', name: 'Light Blonde', category: 'light' },
  { id: 'light-bald-1', emoji: '👨🏻‍🦲', bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', name: 'Light Bald', category: 'light' },

  // TAN SKIN TONES
  { id: 'tan-male-1', emoji: '👨🏽', bg: 'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)', name: 'Tan Male', category: 'tan' },
  { id: 'tan-male-2', emoji: '👨🏽‍💼', bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', name: 'Tan Business', category: 'tan' },
  { id: 'tan-female-1', emoji: '👩🏽', bg: 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)', name: 'Tan Female', category: 'tan' },
  { id: 'tan-female-2', emoji: '👩🏽‍🦱', bg: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', name: 'Tan Curly', category: 'tan' },
  { id: 'tan-bald-1', emoji: '👨🏽‍🦲', bg: 'linear-gradient(135deg, #f77062 0%, #fe5196 100%)', name: 'Tan Bald', category: 'tan' },

  // BROWN SKIN TONES
  { id: 'brown-male-1', emoji: '👨🏾', bg: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)', name: 'Brown Male', category: 'brown' },
  { id: 'brown-male-2', emoji: '👨🏾‍💼', bg: 'linear-gradient(135deg, #f953c6 0%, #b91d73 100%)', name: 'Brown Business', category: 'brown' },
  { id: 'brown-female-1', emoji: '👩🏾', bg: 'linear-gradient(135deg, #fa8bff 0%, #2bd2ff 90%)', name: 'Brown Female', category: 'brown' },
  { id: 'brown-female-2', emoji: '👩🏾‍🦱', bg: 'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)', name: 'Brown Curly', category: 'brown' },
  { id: 'brown-bald-1', emoji: '👨🏾‍🦲', bg: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', name: 'Brown Bald', category: 'brown' },

  // BLACK SKIN TONES
  { id: 'black-male-1', emoji: '👨🏿', bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', name: 'Black Male', category: 'black' },
  { id: 'black-male-2', emoji: '👨🏿‍💼', bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', name: 'Black Business', category: 'black' },
  { id: 'black-male-3', emoji: '👨🏿‍🦱', bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', name: 'Black Afro Male', category: 'black' },
  { id: 'black-female-1', emoji: '👩🏿', bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', name: 'Black Female', category: 'black' },
  { id: 'black-female-2', emoji: '👩🏿‍🦱', bg: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', name: 'Black Afro Female', category: 'black' },
  { id: 'black-bald-1', emoji: '👨🏿‍🦲', bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', name: 'Black Bald', category: 'black' },

  // ASIAN SKIN TONES
  { id: 'asian-male-1', emoji: '👨🏻', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', name: 'Asian Male', category: 'asian' },
  { id: 'asian-male-2', emoji: '👨🏻‍💼', bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', name: 'Asian Business', category: 'asian' },
  { id: 'asian-female-1', emoji: '👩🏻', bg: 'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)', name: 'Asian Female', category: 'asian' },
  { id: 'asian-female-2', emoji: '👩🏻‍🦰', bg: 'linear-gradient(135deg, #f77062 0%, #fe5196 100%)', name: 'Asian Red Hair', category: 'asian' },
  { id: 'asian-bald-1', emoji: '👨🏻‍🦲', bg: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', name: 'Asian Bald', category: 'asian' },

  // FUN & COLORFUL
  { id: 'fun-cool-1', emoji: '😎', bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', name: 'Cool Guy', category: 'fun' },
  { id: 'fun-cool-2', emoji: '🤠', bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', name: 'Cowboy', category: 'fun' },
  { id: 'fun-cool-3', emoji: '🥳', bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', name: 'Party', category: 'fun' },
  { id: 'fun-cool-4', emoji: '🤓', bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', name: 'Nerd', category: 'fun' },
  { id: 'fun-cool-5', emoji: '😇', bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', name: 'Angel', category: 'fun' },
  { id: 'fun-cool-6', emoji: '😈', bg: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', name: 'Devil', category: 'fun' },
  { id: 'fun-cool-7', emoji: '🤩', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', name: 'Star Eyes', category: 'fun' },
  { id: 'fun-cool-8', emoji: '🥸', bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', name: 'Disguise', category: 'fun' },

  // EXTRA DIVERSITY
  { id: 'woman-1', emoji: '👩‍🦳', bg: 'linear-gradient(135deg, #f77062 0%, #fe5196 100%)', name: 'White Hair', category: 'extra' },
  { id: 'woman-2', emoji: '🧕', bg: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', name: 'Hijab', category: 'extra' },
  { id: 'woman-3', emoji: '👩‍🎤', bg: 'linear-gradient(135deg, #fa8bff 0%, #2bd2ff 90%)', name: 'Rockstar', category: 'extra' },
  { id: 'man-1', emoji: '👨‍🎓', bg: 'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)', name: 'Graduate', category: 'extra' },
  { id: 'man-2', emoji: '👨‍🚀', bg: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)', name: 'Astronaut', category: 'extra' },
  { id: 'man-3', emoji: '👨‍🎨', bg: 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)', name: 'Artist', category: 'extra' },
];

export function AvatarPicker({ currentAvatar, onSelect, onClose }: AvatarPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All', emoji: '🌍' },
    { id: 'light', name: 'Light', emoji: '👨🏻' },
    { id: 'tan', name: 'Tan', emoji: '👨🏽' },
    { id: 'brown', name: 'Brown', emoji: '👨🏾' },
    { id: 'black', name: 'Black', emoji: '👨🏿' },
    { id: 'asian', name: 'Asian', emoji: '👨🏻' },
    { id: 'fun', name: 'Fun', emoji: '🎨' },
    { id: 'extra', name: 'More', emoji: '✨' },
  ];

  const filteredAvatars = selectedCategory === 'all' 
    ? AVATARS 
    : AVATARS.filter(a => a.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-2xl rounded-3xl border-2 border-purple-500/30 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="bg-black/60 backdrop-blur-xl p-6 border-b border-purple-500/30 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Choose Your Avatar
            </h2>
            <p className="text-gray-400 text-sm mt-1">Pick a profile picture that represents you! 🌍✨</p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* CATEGORY FILTERS */}
        <div className="bg-black/40 p-4 border-b border-white/10 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {cat.emoji} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* AVATARS GRID */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {filteredAvatars.map(avatar => (
              <button
                key={avatar.id}
                onClick={() => onSelect(avatar.id)}
                className={`relative aspect-square rounded-2xl overflow-hidden transition-all group ${
                  currentAvatar === avatar.id
                    ? 'ring-4 ring-purple-500 shadow-lg shadow-purple-500/50 scale-105'
                    : 'hover:scale-110 hover:shadow-xl'
                }`}
                style={{ background: avatar.bg }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl">{avatar.emoji}</span>
                </div>
                {currentAvatar === avatar.id && (
                  <div className="absolute inset-0 bg-purple-600/30 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-black/60 backdrop-blur-xl p-4 border-t border-purple-500/30">
          <p className="text-center text-gray-400 text-sm">
            💜 Representing all beautiful people! Pick your avatar and make it yours! ✨
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper function to get avatar by ID - Returns emoji with gradient bg
export function getAvatarById(id: string): string {
  const avatar = AVATARS.find(a => a.id === id);
  if (!avatar) return AVATARS[0].emoji;
  
  // Return HTML for the avatar - emoji size is responsive to container
  return `<div style="background: ${avatar.bg}; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
    <span style="font-size: 1.8em; line-height: 1;">${avatar.emoji}</span>
  </div>`;
}