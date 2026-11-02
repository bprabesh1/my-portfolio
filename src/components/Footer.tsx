import React from 'react';
import { Github, Linkedin, MessageSquare, Lock, Unlock, ArrowUp } from 'lucide-react';
import { ProfileData } from '../types/portfolio';

interface FooterProps {
  profile: ProfileData;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  profile,
  onOpenAdmin,
  isAdminLoggedIn,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white/80 dark:bg-[#08081b]/90 border-t border-slate-200 dark:border-slate-800/80 transition-colors relative z-10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-200/80 dark:border-slate-800/80">
          {/* Brand info */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center font-extrabold text-xs shadow-md">
                {profile.initials || 'PB'}
              </span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white font-display">
                Prabesh <span className="text-[#ff3d3d] dark:text-[#ffb347]">Bhusal</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Building practical solutions through technology. Software Developer &amp; Network Administrator based in {profile.location || 'Bhairahawa, Nepal'}.
            </p>
          </div>

          {/* Clean Social / Navigation Links */}
          <div className="flex items-center gap-3">
            {profile.github && (
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="GitHub profile"
              >
                <Github className="w-4 h-4" />
              </a>
            )}

            {profile.linkedin && (
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="LinkedIn profile"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}

            <a
              href="#contact"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Contact directly"
              title="Send Inquiry"
            >
              <MessageSquare className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={scrollToTop}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Scroll to top"
              title="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom row: Copyright & Admin trigger */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-slate-500 dark:text-slate-400">
          <div>
            © 2026 {profile.name}. All Rights Reserved.
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] text-slate-400">
              BIM · Tribhuvan University · Care Computer Sewa Alum
            </span>

            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
              title="Admin Portal"
            >
              {isAdminLoggedIn ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] font-semibold text-emerald-400">
                    Admin Active
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3" />
                  <span className="text-[11px]">Admin CMS</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
