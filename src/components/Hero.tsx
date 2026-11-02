import React from 'react';
import { motion } from 'motion/react';
import { MapPin, ArrowRight, TreePine, Terminal, Download, ShieldCheck, Sparkles } from 'lucide-react';
import { ProfileData } from '../types/portfolio';
import { Hero3DOrb } from './Hero3DOrb';

interface HeroProps {
  profile: ProfileData;
}

export const Hero: React.FC<HeroProps> = ({ profile }) => {
  const headline = profile.tagline || 'Transforming Ideas Into Digital Reality';
  const words = headline.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' as const },
    },
  };

  return (
    <section id="top" className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28">
      {/* Ambient background glow */}
      <div
        className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[480px] bg-gradient-to-tr from-rose-500/15 via-amber-500/10 to-transparent blur-3xl pointer-events-none rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Typographic Hierarchy & Letter Animation */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Candidate Identity: Bold prominent name */}
            <div className="mb-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white font-display tracking-tight flex items-center gap-2">
                <span>Prabesh</span>
                <span className="text-[#ff3d3d] dark:text-[#ffb347]">Bhusal</span>
              </h2>
              <div className="text-xs sm:text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Software Developer &amp; Network Administrator · {profile.location || 'Bhairahawa, Nepal'}</span>
              </div>
            </div>

            {/* Letter-animated Main Headline */}
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08] mb-6 font-display"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <span className="text-slate-900 dark:text-white">Transforming Ideas Into </span>
              <span className="bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">
                Digital Reality
              </span>
            </motion.h1>

            {/* Lead Bio Description */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed mb-8">
              {profile.bioSummary}
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:opacity-95 rounded-2xl transition-all shadow-lg hover:shadow-rose-500/30 hover:-translate-y-0.5"
              >
                <span>Let’s Get Connected</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#journey-tree"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all shadow-sm hover:-translate-y-0.5"
              >
                <TreePine className="w-4 h-4 text-emerald-500" />
                <span>Climb Journey Tree</span>
              </a>

              {/* Rotating Circular Badge */}
              <a
                href="#projects"
                aria-label="My projects"
                className="relative w-20 h-20 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl flex items-center justify-center p-1.5 select-none hover:scale-105 transition-transform ml-2"
              >
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full animate-spin [animation-duration:14s]"
                >
                  <path
                    id="circlePath"
                    d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                    fill="none"
                  />
                  <text className="text-[10px] font-bold uppercase tracking-[0.22em] fill-current">
                    <textPath href="#circlePath" startOffset="0%">
                      MY PROJECTS • MY PROJECTS •
                    </textPath>
                  </text>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-extrabold text-xs">
                  →
                </div>
              </a>
            </div>
          </div>

          {/* Right Column: 3D Interactive Gyroscope Orb with Orbiting Rings & Spatial Depth */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <Hero3DOrb profile={profile} />
          </div>
        </div>
      </div>
    </section>
  );
};
