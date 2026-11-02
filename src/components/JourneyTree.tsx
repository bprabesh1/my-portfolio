import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  GraduationCap,
  Briefcase,
  Play,
  RotateCcw,
  Sparkles,
  Building,
  CheckCircle2,
  TreePine,
  ExternalLink,
} from 'lucide-react';
import { JourneyMilestone } from '../types/portfolio';

interface JourneyTreeProps {
  milestones: JourneyMilestone[];
  onEditMilestone?: (milestone: JourneyMilestone) => void;
  isAdmin?: boolean;
}

export const JourneyTree: React.FC<JourneyTreeProps> = ({
  milestones,
  onEditMilestone,
  isAdmin,
}) => {
  const treeRef = useRef<HTMLDivElement>(null);
  const monkeyRef = useRef<HTMLDivElement>(null);
  const [activeRows, setActiveRows] = useState<Set<string>>(new Set());
  const [monkeyText, setMonkeyText] = useState('🐒');
  const [isClimbing, setIsClimbing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const runIdRef = useRef(0);
  const userScrolledRef = useRef(false);

  // Sort descending by year so highest achievements appear at top branches near the canopy
  const sortedMilestones = useMemo(() => {
    return [...milestones].sort((a, b) => {
      const yearA = parseInt(a.year.replace(/\D/g, '') || '0', 10);
      const yearB = parseInt(b.year.replace(/\D/g, '') || '0', 10);
      return yearB - yearA;
    });
  }, [milestones]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3600);
  };

  // Generate lush canopy foliage elements
  const canopyLeaves = useMemo(() => {
    const leafColors = ['#1f9d55', '#2fbf6c', '#3ddc84', '#14804a', '#58e08f'];
    const leaves: Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      color: string;
      delay: number;
    }> = [];

    for (let i = 0; i < 48; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random());
      const x = 50 + Math.cos(angle) * r * 46;
      const y = 48 + Math.sin(angle) * r * 38;
      const size = 50 + Math.random() * 80;
      leaves.push({
        id: i,
        x,
        y,
        size,
        color: leafColors[i % leafColors.length],
        delay: -Math.random() * 5,
      });
    }
    return leaves;
  }, []);

  const getTrunkX = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      return 32;
    }
    return treeRef.current ? treeRef.current.offsetWidth / 2 : 400;
  };

  // Show all milestones immediately
  const handleShowAll = () => {
    runIdRef.current += 1;
    setIsClimbing(false);
    const allIds = new Set(milestones.map((m) => m.id));
    setActiveRows(allIds);
    setMonkeyText('🎉');
    if (monkeyRef.current) {
      monkeyRef.current.classList.add('done');
      monkeyRef.current.style.left = `${getTrunkX()}px`;
      monkeyRef.current.style.top = '190px';
    }
    showToast('All milestones illuminated! 🌴');
  };

  // Replay Climb Algorithm: monkey starts at roots and climbs up row by row
  const handleClimb = async () => {
    if (!treeRef.current || !monkeyRef.current) return;
    const currentRun = ++runIdRef.current;
    setIsClimbing(true);
    userScrolledRef.current = false;
    setMonkeyText('🐒');
    monkeyRef.current.classList.remove('done');

    // Reset active rows
    setActiveRows(new Set());

    // Position monkey at bottom roots
    monkeyRef.current.style.transition = 'none';
    monkeyRef.current.style.top = `${treeRef.current.offsetHeight - 60}px`;
    monkeyRef.current.style.left = `${getTrunkX()}px`;

    await new Promise((r) => setTimeout(r, 60));
    monkeyRef.current.style.transition = '';

    // Climb rows from bottom (earliest year) to top (latest year)
    const rowElements = Array.from(
      treeRef.current.querySelectorAll<HTMLDivElement>('.jr-milestone')
    ).reverse();

    for (const r of rowElements) {
      if (currentRun !== runIdRef.current) return;

      const fruitEl = r.querySelector<HTMLDivElement>('.fr');
      const milestoneId = r.getAttribute('data-id');

      if (fruitEl) {
        const treeRect = treeRef.current.getBoundingClientRect();
        const fruitRect = fruitEl.getBoundingClientRect();

        // 1. Climb up trunk to row height
        const targetY = fruitRect.top - treeRect.top + fruitEl.offsetHeight / 2;
        monkeyRef.current.style.left = `${getTrunkX()}px`;
        monkeyRef.current.style.top = `${targetY}px`;

        if (!userScrolledRef.current) {
          r.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        await new Promise((res) => setTimeout(res, 950));
        if (currentRun !== runIdRef.current) return;

        // 2. Scamper out onto the branch to the fruit node
        const targetX = fruitRect.left - treeRect.left + fruitEl.offsetWidth / 2;
        monkeyRef.current.style.left = `${targetX}px`;

        await new Promise((res) => setTimeout(res, 850));
        if (currentRun !== runIdRef.current) return;

        // 3. Pick the fruit / activate row
        if (milestoneId) {
          setActiveRows((prev) => new Set([...prev, milestoneId]));
        }

        await new Promise((res) => setTimeout(res, 650));
        if (currentRun !== runIdRef.current) return;

        // 4. Return to trunk
        monkeyRef.current.style.left = `${getTrunkX()}px`;
        await new Promise((res) => setTimeout(res, 600));
      }
    }

    if (currentRun !== runIdRef.current) return;

    // Reach summit canopy
    monkeyRef.current.style.left = `${getTrunkX()}px`;
    monkeyRef.current.style.top = '190px';
    await new Promise((res) => setTimeout(res, 900));

    setMonkeyText('🎉');
    monkeyRef.current.classList.add('done');
    setIsClimbing(false);
    showToast('All milestones picked! 🎓 BIM Scholar 2026!');
  };

  // Click on a specific milestone: sends monkey directly to it
  const handleMilestoneClick = (milestoneId: string, e: React.MouseEvent) => {
    setActiveRows((prev) => new Set([...prev, milestoneId]));
    if (!treeRef.current || !monkeyRef.current) return;

    const rowEl = treeRef.current.querySelector<HTMLDivElement>(
      `[data-id="${milestoneId}"]`
    );
    if (rowEl) {
      const fruitEl = rowEl.querySelector<HTMLDivElement>('.fr');
      if (fruitEl) {
        const treeRect = treeRef.current.getBoundingClientRect();
        const fruitRect = fruitEl.getBoundingClientRect();
        const targetX = fruitRect.left - treeRect.left + fruitEl.offsetWidth / 2;
        const targetY = fruitRect.top - treeRect.top + fruitEl.offsetHeight / 2;

        monkeyRef.current.style.left = `${targetX}px`;
        monkeyRef.current.style.top = `${targetY}px`;
        setMonkeyText('🐒');
      }
    }
  };

  // Initially show all milestones so content is immediately readable
  useEffect(() => {
    handleShowAll();
  }, [milestones]);

  return (
    <section id="journey-tree" className="py-20 relative overflow-hidden bg-slate-100/40 dark:bg-slate-900/30 border-t border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">
              <TreePine className="w-4 h-4" />
              <span>Living Interactive Career Tree</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
              My Journey Tree
            </h2>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-300 max-w-2xl">
              Watch the monkey climb the tree and pick each milestone —{' '}
              <strong className="text-emerald-700 dark:text-emerald-400">
                Education on the left
              </strong>
              ,{' '}
              <strong className="text-amber-700 dark:text-amber-400">
                Training & Experience on the right
              </strong>
              .
            </p>
          </div>

          {/* Interactive Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleClimb}
              disabled={isClimbing}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm ${
                isClimbing
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 cursor-wait'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer hover:shadow-emerald-500/20'
              }`}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isClimbing ? 'animate-spin' : ''}`} />
              <span>🐒 Replay climb</span>
            </button>

            <button
              type="button"
              onClick={handleShowAll}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-xs"
            >
              Show all
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="mb-6 p-3 max-w-md mx-auto rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold text-center shadow-xl animate-in fade-in slide-in-from-top-2">
            {toastMessage}
          </div>
        )}

        {/* Central Tree Structure */}
        <div ref={treeRef} className="jt anim" id="tree">
          {/* Lush Tree Foliage Canopy */}
          <div className="canopy">
            {canopyLeaves.map((leaf) => (
              <i
                key={leaf.id}
                style={{
                  left: `${leaf.x}%`,
                  top: `${leaf.y}%`,
                  width: `${leaf.size}px`,
                  height: `${leaf.size}px`,
                  background: `radial-gradient(circle at 35% 30%, ${leaf.color}, #0d5a32)`,
                  animationDelay: `${leaf.delay}s`,
                }}
              />
            ))}
          </div>

          {/* Grand Carved Wooden Signboard Hanging from Canopy */}
          <div className="board font-display select-none">
            MY JOURNEY
          </div>

          {/* Upper Branch Split Headers: EDUCATION ◄ and ► EXPERIENCE */}
          <div className="jr hd">
            <div className="jc L">
              <div className="hg">
                <div className="sign sl font-display flex items-center gap-2 select-none shadow-md">
                  <GraduationCap className="w-4 h-4 text-emerald-300 inline-block shrink-0" />
                  <span>🎓 EDUCATION</span>
                </div>
              </div>
            </div>

            {/* Heavy Fork Branch Junction */}
            <div className="jm hm">
              <i className="br bl" />
              <i className="br brr" />
            </div>

            <div className="jc R">
              <div className="hg">
                <div className="sign sr font-display flex items-center gap-2 select-none shadow-md">
                  <span>EXPERIENCE 💼</span>
                  <Briefcase className="w-4 h-4 text-amber-300 inline-block shrink-0" />
                </div>
              </div>
            </div>
          </div>

          {/* Milestone Rows along the Central Tree */}
          <div id="tree-milestone-rows">
            {sortedMilestones.map((m) => {
              const isEducation = m.category === 'education';
              const isOn = activeRows.has(m.id);

              return (
                <div
                  key={m.id}
                  data-id={m.id}
                  className={`jr jr-milestone ${isOn ? 'on' : ''}`}
                >
                  {/* Left Column: Education Signboard Card */}
                  <div className="jc L">
                    {isEducation ? (
                      <div
                        onClick={(e) => handleMilestoneClick(m.id, e)}
                        className={`branch-card cursor-pointer border transition-all text-left ${
                          isOn
                            ? 'bg-white dark:bg-slate-900 border-emerald-500/60 shadow-lg'
                            : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {/* Stylized wooden header ribbon on card */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-mono">
                            🎓 Education
                          </span>
                          <span className="text-xs font-bold text-amber-800 dark:text-amber-400 font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60">
                            {m.period || m.year}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
                          {m.title}
                        </h3>

                        <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{m.organization}</span>
                        </div>

                        {m.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                            {m.description}
                          </p>
                        )}

                        {m.skills && m.skills.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                            {m.skills.map((skill, sIdx) => (
                              <React.Fragment key={skill}>
                                <span className="text-slate-700 dark:text-slate-300 font-medium">
                                  {skill}
                                </span>
                                {sIdx < m.skills!.length - 1 && (
                                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        )}

                        {isAdmin && onEditMilestone && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditMilestone(m);
                            }}
                            className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                          >
                            Edit Milestone
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="w-full" />
                    )}
                  </div>

                  {/* Center Column: Branch, Leaves & Fruit Node */}
                  <div className="jm">
                    <i className={`br ${isEducation ? 'bl' : 'brr'}`} />
                    <b
                      onClick={(e) => handleMilestoneClick(m.id, e)}
                      title={`Click to pick ${m.year}`}
                      className={`fr ${isEducation ? 'fl' : 'fq'} select-none`}
                    >
                      {m.year}
                    </b>
                  </div>

                  {/* Right Column: Experience Signboard Card */}
                  <div className="jc R">
                    {!isEducation ? (
                      <div
                        onClick={(e) => handleMilestoneClick(m.id, e)}
                        className={`branch-card cursor-pointer border transition-all text-left ${
                          isOn
                            ? 'bg-white dark:bg-slate-900 border-amber-500/60 shadow-lg'
                            : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {/* Stylized wooden header ribbon on card */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-400 font-mono">
                            💼 Experience & Training
                          </span>
                          <span className="text-xs font-bold text-amber-800 dark:text-amber-400 font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60">
                            {m.period || m.year}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
                          {m.title}
                        </h3>

                        <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{m.organization}</span>
                        </div>

                        {m.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                            {m.description}
                          </p>
                        )}

                        {m.skills && m.skills.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                            {m.skills.map((skill, sIdx) => (
                              <React.Fragment key={skill}>
                                <span className="text-slate-700 dark:text-slate-300 font-medium">
                                  {skill}
                                </span>
                                {sIdx < m.skills!.length - 1 && (
                                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        )}

                        {isAdmin && onEditMilestone && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditMilestone(m);
                            }}
                            className="mt-2 text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                          >
                            Edit Milestone
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="w-full" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grassy Ground Mound */}
          <div className="ground" />

          {/* The Animated Monkey */}
          <div ref={monkeyRef} id="mk-climber" className="select-none pointer-events-none">
            {monkeyText}
          </div>
        </div>
      </div>
    </section>
  );
};
