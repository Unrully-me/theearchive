import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface TermsOfServiceProps {
  onClose: () => void;
}

export function TermsOfService({ onClose }: TermsOfServiceProps) {
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
            Terms of Service
          </h1>
          
          <p className="text-gray-400 mb-8">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-400">
                By accessing and using THEE ARCHIVE ("the Service"), you accept and agree to be bound by the terms and 
                provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">2. Description of Service</h2>
              <p className="text-gray-400">
                THEE ARCHIVE provides a platform for users to discover, watch, and download movies, TV series, music videos, 
                and other entertainment content. The Service is provided free of charge and is supported by advertising.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">3. User Accounts</h2>
              <p className="mb-2">When you create an account with us, you agree to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-gray-400">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Keep your password secure and confidential</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Be responsible for all activities that occur under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">4. User Conduct</h2>
              <p className="mb-2">You agree not to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-gray-400">
                <li>Use the Service for any illegal purpose or in violation of any laws</li>
                <li>Attempt to gain unauthorized access to the Service or other user accounts</li>
                <li>Upload, post, or transmit any malicious code or viruses</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Scrape, spider, or use automated means to access the Service</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Circumvent any access restrictions or security measures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">5. Content</h2>
              <p className="text-gray-400 mb-2">
                All content provided through the Service, including movies, images, text, graphics, logos, and software, 
                is the property of THEE ARCHIVE or its content suppliers and is protected by copyright and other intellectual 
                property laws.
              </p>
              <p className="text-gray-400">
                You may download content for personal, non-commercial use only. You may not distribute, modify, transmit, 
                reuse, or use the content for public or commercial purposes without our written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">6. Age Restrictions</h2>
              <p className="text-gray-400 mb-2">
                You must be at least 13 years old to use the Service. Certain content may be restricted to users 18 years 
                or older. By accessing age-restricted content, you confirm that you meet the minimum age requirement.
              </p>
              <p className="text-gray-400">
                Parents and guardians are responsible for monitoring their children's use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">7. Advertising</h2>
              <p className="text-gray-400">
                The Service is supported by advertising. By using the Service, you agree to view advertisements displayed 
                throughout the platform. We use Google AdSense and other advertising partners to display ads. These advertisers 
                may use cookies and other tracking technologies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">8. Disclaimer of Warranties</h2>
              <p className="text-gray-400">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. 
                WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE. WE DO NOT GUARANTEE THE 
                ACCURACY, COMPLETENESS, OR USEFULNESS OF ANY CONTENT.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">9. Limitation of Liability</h2>
              <p className="text-gray-400">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, THEE ARCHIVE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR 
                OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE SERVICE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">10. Account Termination</h2>
              <p className="text-gray-400">
                We reserve the right to suspend or terminate your account at any time, with or without notice, for any 
                reason, including if we believe you have violated these Terms of Service. Upon termination, your right to 
                use the Service will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">11. Changes to Terms</h2>
              <p className="text-gray-400">
                We reserve the right to modify these Terms of Service at any time. We will notify users of any material 
                changes by posting the new Terms of Service on this page and updating the "Last Updated" date. Your continued 
                use of the Service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">12. Governing Law</h2>
              <p className="text-gray-400">
                These Terms of Service shall be governed by and construed in accordance with applicable laws, without regard 
                to conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">13. Contact Information</h2>
              <p className="text-gray-400">
                If you have any questions about these Terms of Service, please contact us at:{' '}
                <a href="mailto:legal@theearchive.com" className="text-[#FFD700] hover:text-[#FFA500] underline">
                  legal@theearchive.com
                </a>
              </p>
            </section>

            <section className="mt-8 p-4 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-xl">
              <p className="text-sm text-gray-400">
                By using THEE ARCHIVE, you acknowledge that you have read, understood, and agree to be bound by these 
                Terms of Service and our Privacy Policy.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
