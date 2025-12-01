import React from 'react';

interface Category {
  id: string;
  name: string;
  backgroundImage?: string;
}

interface CategoryGridProps {
  categories: Category[];
  onCategoryClick: (categoryId: string) => void;
}

export function CategoryGrid({ categories, onCategoryClick }: CategoryGridProps) {
  return (
    <div className="px-4 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-1 w-1 bg-[#FFD700] rounded-full animate-pulse" />
        <h2 className="text-2xl font-black gradient-gold">Quick Browse</h2>
        <div className="h-1 flex-1 bg-gradient-to-r from-[#FFD700]/20 to-transparent rounded-full" />
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryClick(category.id)}
            className="glass-card glass-card-hover relative h-24 rounded-2xl overflow-hidden transition-all group"
          >
            {category.backgroundImage ? (
              <>
                <img
                  src={category.backgroundImage}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
            )}
            <div className="absolute inset-0 flex items-center justify-center p-2">
              <span className="text-white font-black text-xs md:text-sm drop-shadow-lg text-center leading-tight">
                {category.name}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}