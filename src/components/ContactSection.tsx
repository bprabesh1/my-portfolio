import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { ProfileData } from '../types/portfolio';
import { canSendMessage, markMessageSent } from '../services/security';
import { addContactMessage } from '../services/storage';

interface ContactSectionProps {
  profile: ProfileData;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ profile }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const openedAt = React.useRef(Date.now());
  const trapRef = React.useRef<HTMLInputElement>(null);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email)) return;
    if (canSendMessage(openedAt.current, trapRef.current?.value || '')) return;
    markMessageSent();

    setLoading(true);
    setTimeout(() => {
      addContactMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        subject: formData.subject || 'Direct Portfolio Inquiry',
        message: formData.message,
      });

      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 8000);
    }, 400);
  };

  return (
    <section id="contact" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* Left Column: Direct Consultation Info */}
          <div className="lg:col-span-5">
            <div className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Direct Inquiries</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display mb-4">
              Let’s <span className="bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">Connect</span>
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
              Have a software development requirement, need network administration consultation, or want to discuss enterprise solutions? Send your inquiry directly through this portal.
            </p>
          </div>

          {/* Right Column: Contact Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display mb-1">
                Send a Direct Message
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Your message is stored securely in the database and notified directly to the admin.
              </p>

              {submitted && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                      Message Sent Successfully!
                    </div>
                    <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                      Thank you for getting in touch. Prabesh will get back to you shortly.
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
                <input ref={trapRef} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Name"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-[#141438] border border-slate-200 dark:border-[rgba(160,150,255,0.2)] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-[#141438] border border-slate-200 dark:border-[rgba(160,150,255,0.2)] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Phone Number (optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="Your contact number"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-[#141438] border border-slate-200 dark:border-[rgba(160,150,255,0.2)] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      placeholder="Title"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-[#141438] border border-slate-200 dark:border-[rgba(160,150,255,0.2)] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Hello Prabesh, I would like to discuss..."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-[#141438] border border-slate-200 dark:border-[rgba(160,150,255,0.2)] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-7 py-3 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:opacity-95 rounded-xl transition-all shadow-md hover:shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Sending Message...' : 'Send Message'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
