import React, { useState } from 'react';
import { ArrowLeft, Mail, MessageSquare, User, Send } from 'lucide-react';

interface ContactUsProps {
  onClose: () => void;
}

export function ContactUs({ onClose }: ContactUsProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to backend
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

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
            Contact Us
          </h1>
          
          <p className="text-gray-400 mb-8">
            Have a question, suggestion, or need support? We'd love to hear from you! Fill out the form below and 
            we'll get back to you as soon as possible.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Send us a Message</h2>
              
              {submitted ? (
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/30 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Message Sent! ✅</h3>
                  <p className="text-gray-400">
                    Thank you for contacting us. We'll respond within 24-48 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Your Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="What's this about?"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">
                      Message
                    </label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us what's on your mind..."
                      rows={6}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-black rounded-xl hover:shadow-lg hover:shadow-[#FFD700]/50 transition-all"
                  >
                    <Send className="w-4 h-4 inline mr-2" />
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Other Ways to Reach Us</h2>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/20 rounded-xl p-4 border border-[#FFD700]/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-[#FFD700]/30 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-[#FFD700]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Email</h3>
                      <p className="text-sm text-gray-400">General Inquiries</p>
                    </div>
                  </div>
                  <a 
                    href="mailto:support@theearchive.com" 
                    className="text-[#FFD700] hover:text-[#FFA500] transition-colors text-sm font-bold"
                  >
                    support@theearchive.com
                  </a>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/30 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Technical Support</h3>
                      <p className="text-sm text-gray-400">Bug Reports & Issues</p>
                    </div>
                  </div>
                  <a 
                    href="mailto:tech@theearchive.com" 
                    className="text-purple-400 hover:text-pink-400 transition-colors text-sm font-bold"
                  >
                    tech@theearchive.com
                  </a>
                </div>

                <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-4 border border-cyan-500/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/30 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Business</h3>
                      <p className="text-sm text-gray-400">Partnerships & Advertising</p>
                    </div>
                  </div>
                  <a 
                    href="mailto:business@theearchive.com" 
                    className="text-cyan-400 hover:text-blue-400 transition-colors text-sm font-bold"
                  >
                    business@theearchive.com
                  </a>
                </div>

                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/30 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Legal</h3>
                      <p className="text-sm text-gray-400">Copyright & DMCA</p>
                    </div>
                  </div>
                  <a 
                    href="mailto:legal@theearchive.com" 
                    className="text-orange-400 hover:text-red-400 transition-colors text-sm font-bold"
                  >
                    legal@theearchive.com
                  </a>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <h3 className="font-bold text-white mb-2">Response Time</h3>
                <p className="text-sm text-gray-400">
                  We typically respond to all inquiries within <strong className="text-[#FFD700]">24-48 hours</strong> during 
                  business days (Monday-Friday). For urgent issues, please mark your subject line with "URGENT".
                </p>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 rounded-xl border border-[#FFD700]/20">
                <h3 className="font-bold text-[#FFD700] mb-2">📚 Need Quick Help?</h3>
                <p className="text-sm text-gray-400 mb-3">
                  Before contacting us, check if your question is answered in our FAQ or Help Center.
                </p>
                <button
                  onClick={onClose}
                  className="text-xs font-bold text-[#FFD700] hover:text-[#FFA500] transition-colors"
                >
                  Browse Help Center →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
