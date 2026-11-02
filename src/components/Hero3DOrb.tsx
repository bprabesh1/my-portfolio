import React, { useEffect, useRef } from 'react';
import { ProfileData } from '../types/portfolio';

interface Hero3DOrbProps {
  profile: ProfileData;
}

export const Hero3DOrb: React.FC<Hero3DOrbProps> = ({ profile }) => {
  const orbRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let animationFrame: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 44;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 36;
    };

    const updateLoop = () => {
      // Smooth interpolation for 3D gyroscope
      currentRotX += (mouseY - currentRotX) * 0.08;
      currentRotY += (mouseX - currentRotY) * 0.08;

      if (orbRef.current) {
        orbRef.current.style.transform = `rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;
      }

      animationFrame = requestAnimationFrame(updateLoop);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationFrame = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="orb-container w-full max-w-[380px] select-none">
      <div ref={orbRef} className="orb-spatial">
        {/* Orbiting 3D Gyroscopic Rings */}
        <div className="rg-ring" />
        <div className="rg-ring" />
        <div className="rg-ring" />

        {/* Central Glowing 3D Energy Core */}
        <div className="orb-core shadow-2xl group cursor-pointer">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <span className="font-extrabold tracking-tight font-display">
              {profile.initials || 'PB'}
            </span>
          )}
        </div>

        {/* Floating 3D Depth Chips */}
        <div
          className="spatial-chip"
          style={{
            top: '-15px',
            left: '-25px',
            transform: 'translateZ(85px)',
          }}
        >
          <span className="text-amber-400 mr-1.5">⚡</span>
          <span>PHP · MySQL</span>
        </div>

        <div
          className="spatial-chip"
          style={{
            top: '65px',
            right: '-50px',
            transform: 'translateZ(95px)',
            animationDelay: '-1.2s',
          }}
        >
          <span className="text-emerald-400 mr-1.5">🌐</span>
          <span>Networking & Admin</span>
        </div>

        <div
          className="spatial-chip"
          style={{
            bottom: '-12px',
            left: '15px',
            transform: 'translateZ(75px)',
            animationDelay: '-2.4s',
          }}
        >
          <span className="text-sky-400 mr-1.5">⚛</span>
          <span>JavaScript · React</span>
        </div>

        <div
          className="spatial-chip"
          style={{
            top: '160px',
            left: '-45px',
            transform: 'translateZ(90px)',
            animationDelay: '-3.1s',
          }}
        >
          <span className="text-rose-400 mr-1.5">🎓</span>
          <span>BIM Graduate (2026)</span>
        </div>
      </div>
    </div>
  );
};
