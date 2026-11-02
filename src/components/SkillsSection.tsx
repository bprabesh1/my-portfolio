import React, { useState } from 'react';
import {
  Code,
  Globe,
  Database,
  Server,
  Wrench,
  Cpu,
  Search,
  Sparkles,
} from 'lucide-react';
import { SkillCategory } from '../types/portfolio';
import { TiltCard } from './TiltCard';

interface SkillsSectionProps {
  categories: SkillCategory[];
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ categories }) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code':
        return Code;
      case 'Globe':
        return Globe;
      case 'Database':
        return Database;
      case 'Server':
        return Server;
      case 'Wrench':
        return Wrench;
      case 'Cpu':
        return Cpu;
      default:
        return Code;
    }
  };

  const filteredCategories = categories
    .filter((cat) => (activeTab === 'all' ? true : cat.id === activeTab))
    .map((cat) => ({
      ...cat,
      skills: cat.skills.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      ),
    }))
    .filter((cat) => cat.skills.length > 0);

  return (
    <section id="skills" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Technical Stack & Domain Knowledge</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
              Technical <span className="bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">Skills</span>
            </h2>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-300 max-w-xl">
              Practical competencies forged through academic BIM studies, full-stack projects, and enterprise IT administration at Care Computer Sewa.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills (e.g. MySQL, PHP)..."
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            />
          </div>
        </div>

        {/* Interactive Segmented Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl mb-10 w-fit border border-slate-300 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Skills
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.id)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === cat.id
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* 3D Tilt Skills Grid (Clean unboxed tags, no percentages) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => {
            const Icon = getIcon(category.iconName);
            return (
              <TiltCard
                key={category.id}
                className="p-6 rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between hover:border-rose-500/40"
              >
                <div>
                  <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500/20 to-amber-500/20 text-rose-500 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {category.title}
                    </h3>
                  </div>

                  {/* Clean Skill Tags (No percentages) */}
                  <div className="flex flex-wrap gap-2.5">
                    {category.skills.map((skill) => (
                      <span
                        key={skill.name}
                        className="text-xs px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 font-medium hover:border-rose-500/40 hover:-translate-y-0.5 transition-all select-none"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};
