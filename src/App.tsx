import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { SkillsSection } from './components/SkillsSection';
import { ProjectsSection } from './components/ProjectsSection';
import { JourneyTree } from './components/JourneyTree';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AdminModal } from './components/AdminModal';
import { Background3D } from './components/Background3D';
import { ScrollProgress, CursorSpotlight, Preloader, Reveal } from './components/Effects';
import { SideDock } from './components/SideDock';
import { getDatabase, subscribeDatabase } from './services/storage';
import { PortfolioDatabase, JourneyMilestone, ProjectItem } from './types/portfolio';

export default function App() {
  const [db, setDb] = useState<PortfolioDatabase>(getDatabase());
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [editItem, setEditItem] = useState<{
    type: 'milestone' | 'project';
    item: any;
  } | null>(null);

  // Dark / Light Mode State
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('prabesh_portfolio_theme');
      if (stored) return stored === 'dark';
      return (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
    } catch {
      return false;
    }
  });

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('prabesh_portfolio_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('prabesh_portfolio_theme', 'light');
    }
  }, [isDark]);

  // Subscribe to persistent database changes
  useEffect(() => {
    const unsubscribe = subscribeDatabase(() => {
      setDb(getDatabase());
    });
    return unsubscribe;
  }, []);

  // Auto sign-out after 10 minutes of inactivity
  useEffect(() => {
    if (!isAdminLoggedIn) return;
    let t = setTimeout(() => setIsAdminLoggedIn(false), 600_000);
    const reset = () => { clearTimeout(t); t = setTimeout(() => setIsAdminLoggedIn(false), 600_000); };
    const ev = ['pointerdown', 'keydown', 'scroll'];
    ev.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => { clearTimeout(t); ev.forEach((e) => window.removeEventListener(e, reset)); };
  }, [isAdminLoggedIn]);

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleOpenAdminWithItem = (type: 'milestone' | 'project', item: any) => {
    setEditItem({ type, item });
    setIsAdminOpen(true);
  };

  const handleScrollToContact = () => {
    const el = document.querySelector('#contact');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f6f4fb] dark:bg-[#0a0a1f] text-[#14142b] dark:text-[#eef0fb] antialiased selection:bg-rose-500/25 selection:text-rose-400 transition-colors duration-300 flex flex-col relative overflow-x-hidden">
      {/* 3D Interactive Floating Plexus Background */}
      <Preloader initials={db.profile.initials || 'PB'} />
      <ScrollProgress />
      <div className="aurora" aria-hidden="true"><i /><i /><i /></div>
      <CursorSpotlight />
      <Background3D isDark={isDark} />

      {/* 3D Floating Side Navigation Dock on Right Edge */}
      <SideDock onOpenContact={handleScrollToContact} />

      {/* Top Bar Navigation */}
      <Navbar
        profile={db.profile}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onOpenAdmin={() => {
          setEditItem(null);
          setIsAdminOpen(true);
        }}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Content Sections with 3D Depth */}
      <main className="flex-1 relative z-10">
        {/* Hero Section with 3D Gyroscope Orb & Letter Animation */}
        <Hero profile={db.profile} />

        {/* About Section with 3D Tilt Cards */}
        <Reveal>
        <AboutSection profile={db.profile} />
        </Reveal>

        {/* Technical Skills Stack with 3D Tilt Cards */}
        <Reveal>
        <SkillsSection categories={db.skillCategories} />
        </Reveal>

        {/* Featured Projects with 3D Bento Grid & Perspective Tilt */}
        <Reveal>
        <ProjectsSection
          projects={db.projects}
          onEditProject={(project: ProjectItem) =>
            handleOpenAdminWithItem('project', project)
          }
          isAdmin={isAdminLoggedIn}
        />
        </Reveal>

        {/* Living Journey Tree with Central Tree & Monkey Climb */}
        <Reveal>
        <JourneyTree
          milestones={db.milestones}
          onEditMilestone={(milestone: JourneyMilestone) =>
            handleOpenAdminWithItem('milestone', milestone)
          }
          isAdmin={isAdminLoggedIn}
        />
        </Reveal>

        {/* Direct Contact Section with database persistence */}
        <Reveal>
        <ContactSection profile={db.profile} />
        </Reveal>
      </main>

      {/* Footer */}
      <Footer
        profile={db.profile}
        onOpenAdmin={() => {
          setEditItem(null);
          setIsAdminOpen(true);
        }}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Admin CMS Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          setEditItem(null);
        }}
        isLoggedIn={isAdminLoggedIn}
        setIsLoggedIn={setIsAdminLoggedIn}
        initialEditItem={editItem}
      />
    </div>
  );
}
