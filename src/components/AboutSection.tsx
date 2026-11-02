import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { ProfileData } from '../types/portfolio';
import { TiltCard } from './TiltCard';

interface AboutSectionProps {
  profile: ProfileData;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ profile }) => {
  const whatIBring = [
    'Practical software development',
    'Database design & management',
    'Network & IT administration',
    'Troubleshooting & problem-solving',
    'Teamwork & continuous learning',
  ];

  return (
    <section id="about" className="py-24 relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-10 text-center sm:text-left">
          <div className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-1.5 sm:justify-start justify-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Background &amp; Mindset</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
            About <span className="bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">Me</span>
          </h2>
        </div>

        {/* Narrative Card with 3D Tilt */}
        <TiltCard className="p-8 sm:p-10 rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 shadow-2xl space-y-8">
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
            {profile.aboutMe}
          </p>

          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-transparent border border-rose-500/20">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-1.5">
              Engineering Philosophy
            </div>
            <blockquote className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 italic">
              &ldquo;Technology should be practical, reliable, and accessible — solving real bottlenecks for businesses and everyday people.&rdquo;
            </blockquote>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              What I Bring
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {whatIBring.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </TiltCard>
      </div>
    </section>
  );
};
