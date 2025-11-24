import React from 'react';
import { ArrowLeft, Film, Users, Zap, Shield, Heart, Award } from 'lucide-react';

interface AboutUsProps {
  onClose: () => void;
}

export function AboutUs({ onClose }: AboutUsProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-[#FFD700]/20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-[#FFD700] hover:text-[#FFA500] transition-colors font-bold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
          <h1 className="text-4xl font-black bg-gradient-to-r from-[#FFD700] to-[#FF4500] bg-clip-text text-transparent mb-6">
            About THEE ARCHIVE
          </h1>
          
          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Your Ultimate Movie Library 🎬</h2>
              <p className="text-gray-400 mb-4">
                Welcome to THEE ARCHIVE - the premier destination for movie lovers, series enthusiasts, and entertainment 
                seekers worldwide. We're not just another streaming platform; we're your personal cinema vault, curated with 
                love and powered by cutting-edge technology.
              </p>
              <p className="text-gray-400">
                Founded with a passion for bringing the magic of cinema to everyone, THEE ARCHIVE combines the latest blockbusters, 
                timeless classics, binge-worthy series, and exclusive content all in one place. Our mission is simple: Make 
                entertainment accessible, enjoyable, and free for everyone.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">What Makes Us Different? ✨</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/20 rounded-xl p-4 border border-[#FFD700]/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-[#FFD700]/30 flex items-center justify-center">
                      <Film className="w-5 h-5 text-[#FFD700]" />
                    </div>
                    <h3 className="font-black text-white">Massive Library</h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    Thousands of movies, TV series, music videos, and kids content. Something for everyone!
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/30 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="font-black text-white">100% Free</h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    No subscriptions, no hidden fees. Supported by ads so you can enjoy unlimited entertainment.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-4 border border-cyan-500/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/30 flex items-center justify-center">
                      <Users className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h3 className="font-black text-white">User-Friendly</h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    Netflix-style interface with smart categorization, personalized recommendations, and seamless navigation.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-green-500/30 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-400" />
                    </div>
                    <h3 className="font-black text-white">Safe & Secure</h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    Your data is protected with industry-standard security. Family-friendly content with PIN-protected sections.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Our Content Categories 📚</h2>
              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="font-bold text-[#FFD700] mb-1">🎬 Movies</h3>
                  <p className="text-sm text-gray-400">
                    From Hollywood blockbusters to indie gems, action-packed thrillers to heartwarming dramas.
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="font-bold text-purple-400 mb-1">📺 Series</h3>
                  <p className="text-sm text-gray-400">
                    Binge-worthy TV shows organized by seasons and episodes for your marathon viewing.
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="font-bold text-cyan-400 mb-1">🎵 Music</h3>
                  <p className="text-sm text-gray-400">
                    Music videos and audio tracks with a Spotify-style player for the perfect soundtrack.
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="font-bold text-green-400 mb-1">👶 KIDo Corner</h3>
                  <p className="text-sm text-gray-400">
                    Safe, age-appropriate content for kids 3+ with colorful animations and family favorites.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Our Technology 🚀</h2>
              <p className="text-gray-400 mb-3">
                Built with cutting-edge web technologies for a fast, responsive, and beautiful experience:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-gray-400">
                <li>React & TypeScript for robust frontend performance</li>
                <li>Tailwind CSS for stunning, responsive design</li>
                <li>Supabase for secure authentication and data storage</li>
                <li>AWS Cloud Storage for reliable content delivery</li>
                <li>Google AdSense for non-intrusive advertising</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Our Commitment ❤️</h2>
              <p className="text-gray-400 mb-3">
                We're committed to:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Heart className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">
                    <strong className="text-white">Quality Content:</strong> Curating the best entertainment for our users
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">
                    <strong className="text-white">User Privacy:</strong> Protecting your data and respecting your privacy
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Award className="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">
                    <strong className="text-white">Constant Innovation:</strong> Always improving and adding new features
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">
                    <strong className="text-white">Community First:</strong> Building a platform for movie lovers, by movie lovers
                  </span>
                </li>
              </ul>
            </section>

            <section className="mt-8 p-6 bg-gradient-to-r from-[#FFD700]/20 to-[#FF4500]/20 border border-[#FFD700]/30 rounded-xl">
              <h2 className="text-2xl font-bold text-white mb-3 text-center">Join Our Community! 🌟</h2>
              <p className="text-gray-400 text-center mb-4">
                THEE ARCHIVE is more than a platform - it's a community of entertainment enthusiasts. Sign up today and 
                discover your next favorite movie, series, or song!
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-black rounded-xl hover:shadow-lg hover:shadow-[#FFD700]/50 transition-all"
                >
                  Explore Content
                </button>
              </div>
            </section>

            <section className="text-center text-sm text-gray-500">
              <p>© {new Date().getFullYear()} THEE ARCHIVE. All rights reserved.</p>
              <p className="mt-1">Making entertainment accessible to everyone, everywhere.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
