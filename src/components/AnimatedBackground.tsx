import React from 'react';

export function AnimatedBackground() {
  return (
    <>
      {/* Netflix-style clean dark background */}
      <div className="fixed inset-0 -z-10 bg-[#141414]" />
      
      {/* Optional: Very subtle gradient for depth (barely noticeable) */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black/50 via-transparent to-black/30" />
    </>
  );
}
