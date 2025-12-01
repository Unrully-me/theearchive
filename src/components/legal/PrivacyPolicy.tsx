import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onClose: () => void;
}

export function PrivacyPolicy({ onClose }: PrivacyPolicyProps) {
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
            Privacy Policy
          </h1>
          
          <p className="text-gray-400 mb-8">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">1. Information We Collect</h2>
              <p className="mb-2">We collect information you provide directly to us when you:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-gray-400">
                <li>Create an account (name, email, password)</li>
                <li>Use our service (watch history, downloads, preferences)</li>
                <li>Contact us (support requests, feedback)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">2. How We Use Your Information</h2>
              <p className="mb-2">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-gray-400">
                <li>Provide, maintain, and improve our services</li>
                <li>Process your requests and transactions</li>
                <li>Send you technical notices and support messages</li>
                <li>Personalize your experience with content recommendations</li>
                <li>Monitor and analyze trends, usage, and activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">3. Information Sharing</h2>
              <p className="mb-2">We do not sell your personal information. We may share information in the following circumstances:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-gray-400">
                <li>With your consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent fraud</li>
                <li>With service providers who assist our operations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">4. Cookies and Tracking</h2>
              <p className="text-gray-400">
                We use cookies and similar tracking technologies to track activity on our service and hold certain information. 
                Cookies are files with small amount of data sent to your browser. You can instruct your browser to refuse all 
                cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">5. Third-Party Advertising</h2>
              <p className="text-gray-400 mb-2">
                We use Google AdSense to display advertisements. Google AdSense uses cookies to serve ads based on your prior 
                visits to our website or other websites. Google's use of advertising cookies enables it and its partners to serve 
                ads based on your visit to our site and/or other sites on the Internet.
              </p>
              <p className="text-gray-400">
                You may opt out of personalized advertising by visiting{' '}
                <a 
                  href="https://www.google.com/settings/ads" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#FFD700] hover:text-[#FFA500] underline"
                >
                  Google Ads Settings
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">6. Data Security</h2>
              <p className="text-gray-400">
                We implement appropriate security measures to protect your personal information. However, no method of transmission 
                over the Internet or electronic storage is 100% secure. We use Supabase for secure data storage and authentication.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">7. Children's Privacy</h2>
              <p className="text-gray-400">
                Our service is intended for users aged 13 and older. We do not knowingly collect personal information from children 
                under 13. If you are a parent or guardian and believe your child has provided us with personal information, please 
                contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">8. Your Rights</h2>
              <p className="mb-2">You have the right to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-gray-400">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and personal data</li>
                <li>Object to processing of your information</li>
                <li>Export your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">9. Changes to This Policy</h2>
              <p className="text-gray-400">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
                Privacy Policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">10. Contact Us</h2>
              <p className="text-gray-400">
                If you have any questions about this Privacy Policy, please contact us at:{' '}
                <a href="mailto:privacy@theearchive.com" className="text-[#FFD700] hover:text-[#FFA500] underline">
                  privacy@theearchive.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
