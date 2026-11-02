import React, { useState } from 'react';
import { Moon, Sun, Lock, Unlock, Menu, X, ArrowUpRight } from 'lucide-react';
import { ProfileData } from '../types/portfolio';

interface NavbarProps {
  profile: ProfileData;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  isDark,
  onToggleTheme,
  onOpenAdmin,
  isAdminLoggedIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Projects', href: '#projects' },
    { label: 'Journey Tree', href: '#journey-tree' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleThemeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onToggleTheme();
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 dark:bg-slate-950/85 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark: Always full "Prabesh Bhusal" */}
          <a
            href="#"
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group select-none"
            title="Prabesh Bhusal Portfolio"
          >
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ff3d3d] to-[#ffb347] text-white flex items-center justify-center font-extrabold text-sm shadow-md group-hover:scale-105 transition-transform">
              PB
            </span>
            <span className="font-display font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Prabesh</span>
              <span className="text-[#ff3d3d] dark:text-[#ffb347]">Bhusal</span>
            </span>
            {isAdminLoggedIn && (
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Admin Active</span>
              </span>
            )}
          </a>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: 1 primary action / functional controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Rock-solid theme toggle button */}
            <button
              type="button"
              onClick={handleThemeClick}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer select-none"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Admin portal trigger */}
            <button
              type="button"
              onClick={onOpenAdmin}
              aria-label="Admin Dashboard"
              title={isAdminLoggedIn ? 'Admin Dashboard (Active)' : 'Admin Login'}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isAdminLoggedIn
                  ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isAdminLoggedIn ? (
                <Unlock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
            </button>

            {/* Primary Action Button */}
            <a
              href="#contact"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#ff3d3d] to-[#ffb347] hover:opacity-95 rounded-xl transition-all shadow-md hover:scale-105 whitespace-nowrap"
            >
              <span>Let’s Connect</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2">
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg"
              >
                Let’s Connect
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
