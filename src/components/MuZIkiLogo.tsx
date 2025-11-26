import React from 'react';

interface MuZIkiLogoProps {
  className?: string;
  isActive?: boolean;
}

export function MuZIkiLogo({ className = "w-6 h-6", isActive = false }: MuZIkiLogoProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Glow effect when active */}
      {isActive && (
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      )}
      
      {/* Music Note with Vinyl Record Style */}
      <g filter={isActive ? "url(#glow)" : undefined}>
        {/* Vinyl Record Circle */}
        <circle 
          cx="12" 
          cy="14" 
          r="7" 
          fill={isActive ? "url(#activeGradient)" : "url(#inactiveGradient)"}
          stroke={isActive ? "#FFD700" : "#6B7280"}
          strokeWidth="0.5"
        />
        
        {/* Record Grooves */}
        <circle 
          cx="12" 
          cy="14" 
          r="5.5" 
          fill="none"
          stroke={isActive ? "#FFD700" : "#6B7280"}
          strokeWidth="0.3"
          opacity="0.4"
        />
        <circle 
          cx="12" 
          cy="14" 
          r="4" 
          fill="none"
          stroke={isActive ? "#FFD700" : "#6B7280"}
          strokeWidth="0.3"
          opacity="0.4"
        />
        
        {/* Center Hole */}
        <circle 
          cx="12" 
          cy="14" 
          r="1.5" 
          fill={isActive ? "#000000" : "#1F2937"}
          stroke={isActive ? "#FFD700" : "#6B7280"}
          strokeWidth="0.5"
        />
        
        {/* Musical Note Stem */}
        <path 
          d="M 15 6 L 15 13" 
          stroke={isActive ? "#FFD700" : "#6B7280"}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        
        {/* Note Flag - Wave Style */}
        <path 
          d="M 15 6 Q 18 7 18 9 Q 18 11 15 12" 
          stroke={isActive ? "#06B6D4" : "#6B7280"}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Sound Waves */}
        <path 
          d="M 20 12 Q 21 14 20 16" 
          stroke={isActive ? "#FFD700" : "#6B7280"}
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
        <path 
          d="M 21.5 11 Q 23 14 21.5 17" 
          stroke={isActive ? "#06B6D4" : "#6B7280"}
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
      </g>
      
      {/* Gradients */}
      <defs>
        <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1DB954" />
          <stop offset="50%" stopColor="#1ED760" />
          <stop offset="100%" stopColor="#FFD700" />
        </linearGradient>
        <linearGradient id="inactiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4B5563" />
          <stop offset="100%" stopColor="#6B7280" />
        </linearGradient>
      </defs>
    </svg>
  );
}