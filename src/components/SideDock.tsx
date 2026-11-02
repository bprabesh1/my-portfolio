import React, { useEffect, useState } from 'react';

interface SideDockProps {
  onOpenContact: () => void;
}

export const SideDock: React.FC<SideDockProps> = ({ onOpenContact }) => {
  const [activeSection, setActiveSection] = useState('top');

  const navItems = [
    { href: '#top', label: 'Home', icon: '🏠', id: 'top' },
    { href: '#about', label: 'About', icon: '👤', id: 'about' },
    { href: '#skills', label: 'Skills', icon: '🛠', id: 'skills' },
    { href: '#projects', label: 'Projects', icon: '📁', id: 'projects' },
    { href: '#journey-tree', label: 'Journey Tree', icon: '🌴', id: 'journey-tree' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const item of [...navItems].reverse()) {
        const el = document.querySelector(item.href);
        if (el) {
          const top = (el as HTMLElement).offsetTop;
          if (scrollPos >= top) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav id="side-dock" aria-label="Quick Section Navigation">
      {navItems.map((item) => (
        <a
          key={item.id}
          href={item.href}
          title={item.label}
          className={`transition-all select-none ${
            activeSection === item.id
              ? 'bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-lg scale-110'
              : 'hover:bg-slate-800/60 text-slate-300'
          }`}
        >
          <span>{item.icon}</span>
        </a>
      ))}

      {/* Direct Contact Modal Trigger */}
      <a
        href="#contact"
        onClick={(e) => {
          e.preventDefault();
          onOpenContact();
        }}
        title="Connect & Contact"
        className="hover:bg-slate-800/60 text-slate-300 select-none cursor-pointer"
      >
        <span>✉️</span>
      </a>
    </nav>
  );
};
