import React from 'react';
import { Film, Mail, Shield, FileText, Info } from 'lucide-react';

interface FooterProps {
  onNavigateToPrivacy: () => void;
  onNavigateToTerms: () => void;
  onNavigateToAbout: () => void;
  onNavigateToContact: () => void;
}

export function Footer({ 
  onNavigateToPrivacy, 
  onNavigateToTerms, 
  onNavigateToAbout, 
  onNavigateToContact 
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black/95 border-t border-white/10 mt-16 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#FF4500] flex items-center justify-center">
                <Film className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-black bg-gradient-to-r from-[#FFD700] to-[#FF4500] bg-clip-text text-transparent">
                THEE ARCHIVE
              </h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your ultimate movie library. Watch, download, and enjoy unlimited entertainment.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={onNavigateToAbout}
                  className="text-gray-400 hover:text-[#FFD700] transition-colors flex items-center gap-2"
                >
                  <Info className="w-3 h-3" />
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigateToContact}
                  className="text-gray-400 hover:text-[#FFD700] transition-colors flex items-center gap-2"
                >
                  <Mail className="w-3 h-3" />
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigateToPrivacy}
                  className="text-gray-400 hover:text-[#FFD700] transition-colors flex items-center gap-2"
                >
                  <Shield className="w-3 h-3" />
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigateToTerms}
                  className="text-gray-400 hover:text-[#FFD700] transition-colors flex items-center gap-2"
                >
                  <FileText className="w-3 h-3" />
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-3">Contact</h4>
            <div className="text-sm text-gray-400 space-y-3">
              <p>
                <a 
                  href="mailto:support@theearchive.com" 
                  className="hover:text-[#FFD700] transition-colors flex items-center gap-2"
                >
                  <Mail className="w-3 h-3" />
                  support@theearchive.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-400">
              © {currentYear} THEE ARCHIVE. All rights reserved.
            </p>
            <p className="text-sm text-gray-500">
              Powered by <span className="text-[#FFD700] font-bold">ZENTECHX</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}