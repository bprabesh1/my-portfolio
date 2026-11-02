import { safeUrl } from '../services/security';
import React, { useState } from 'react';
import {
  ExternalLink,
  Github,
  Layers,
  ArrowUpRight,
  X,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { ProjectItem } from '../types/portfolio';
import { TiltCard } from './TiltCard';

interface ProjectsSectionProps {
  projects: ProjectItem[];
  onEditProject?: (project: ProjectItem) => void;
  isAdmin?: boolean;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  onEditProject,
  isAdmin,
}) => {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const categories = ['All', 'Full-Stack', 'Networking', 'Database', 'Systems'];

  const filteredProjects = projects.filter((p) =>
    categoryFilter === 'All' ? true : p.category === categoryFilter
  );

  return (
    <section id="projects" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Engineered Deployments</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
              Featured <span className="bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">Projects</span>
            </h2>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-300 max-w-xl">
              Real-world systems spanning full-stack web platforms, database schemas, and enterprise network infrastructure.
            </p>
          </div>

          {/* Interactive Filter Tabs */}
          <div className="flex items-center gap-1 p-1.5 bg-slate-200/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-300 dark:border-slate-800 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {filteredProjects.map((project, idx) => {
            const isLarge = project.featured && idx === 0;
            const colSpan = isLarge ? 'lg:col-span-8' : 'lg:col-span-4';

            return (
              <TiltCard
                key={project.id}
                className={`${colSpan} group rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200 dark:border-slate-800/90 overflow-hidden shadow-xl hover:border-rose-500/50 transition-all flex flex-col justify-between`}
              >
                <div>
                  {/* Media Frame */}
                  <div
                    className="relative w-full aspect-video bg-slate-900 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedProject(project)}
                  >
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        if (target.parentElement) {
                          const fallback = target.parentElement.querySelector('.banner-fallback');
                          if (fallback) fallback.classList.remove('hidden');
                        }
                      }}
                    />

                    {/* Fallback container */}
                    <div className="banner-fallback hidden absolute inset-0 bg-gradient-to-br from-slate-900 via-rose-950/30 to-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
                      <Layers className="w-10 h-10 text-amber-400 mb-2 opacity-80" />
                      <div className="font-bold text-sm">{project.title}</div>
                      <div className="text-xs text-slate-400 mt-1">{project.category}</div>
                    </div>

                    {/* Overlay scrim on hover */}
                    <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white text-xs font-bold shadow-lg">
                        View 3D System Breakdown
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2.5 font-medium">
                      <span className="text-rose-500 font-bold">
                        {project.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Production Deployment</span>
                    </div>

                    <h3
                      onClick={() => setSelectedProject(project)}
                      className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors font-display cursor-pointer"
                    >
                      {project.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {project.description}
                    </p>

                    {/* Unboxed Tags */}
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-y-1 gap-x-2 text-xs text-slate-500 dark:text-slate-400">
                      {project.tags.map((tag, tIdx) => (
                        <React.Fragment key={tag}>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">
                            {tag}
                          </span>
                          {tIdx < project.tags.length - 1 && (
                            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                              ·
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-6 pb-6 pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setSelectedProject(project)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <span>Inspect System</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    {project.githubUrl && project.githubUrl !== '#' && (
                      <a
                        href={safeUrl(project.githubUrl)} rel="noopener noreferrer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                        title="View Source on GitHub"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {isAdmin && onEditProject && (
                      <button
                        type="button"
                        onClick={() => onEditProject(project)}
                        className="text-xs text-slate-400 hover:text-rose-500 underline ml-1 cursor-pointer"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>

        {/* Project Detail Modal */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-500 hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-1.5">
                {selectedProject.category} · Technical Architecture
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display mb-4">
                {selectedProject.title}
              </h3>

              <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6 bg-slate-900">
                <img
                  src={selectedProject.imageUrl}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                    System Architecture & Overview
                  </h4>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedProject.description}
                  </p>
                </div>

                {selectedProject.highlights && selectedProject.highlights.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                      Key Engineering Highlights
                    </h4>
                    <ul className="space-y-2">
                      {selectedProject.highlights.map((h, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  {selectedProject.githubUrl && selectedProject.githubUrl !== '#' && (
                    <a
                      href={safeUrl(selectedProject.githubUrl)} rel="noopener noreferrer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity"
                    >
                      <Github className="w-4 h-4" />
                      <span>View GitHub Repository</span>
                    </a>
                  )}
                  {selectedProject.liveDemoUrl && selectedProject.liveDemoUrl !== '#' && (
                    <a
                      href={safeUrl(selectedProject.liveDemoUrl)} rel="noopener noreferrer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white hover:opacity-95 transition-opacity"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Live Demo Instance</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
