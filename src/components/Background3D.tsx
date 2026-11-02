import React, { useEffect, useRef } from 'react';

interface Background3DProps {
  isDark: boolean;
}

export const Background3D: React.FC<Background3DProps> = ({ isDark }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // 85 points in 3D sphere coordinate space [-1, 1]
    const points: Array<[number, number, number]> = Array.from({ length: 90 }, () => [
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
    ]);

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX / window.innerWidth - 0.5;
      targetMouseY = e.clientY / window.innerHeight - 0.5;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();

    const render = (time: number) => {
      // Smooth mouse damping
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // 3D camera angles
      const angleA = time * 0.00015 + mouseX * 0.9;
      const angleB = mouseY * 0.6;
      const cosA = Math.cos(angleA);
      const sinA = Math.sin(angleA);
      const cosB = Math.cos(angleB);
      const sinB = Math.sin(angleB);

      const scale = Math.min(width, height) * 0.75;

      // Project 3D points to 2D screen with perspective division
      const projected = points.map((p) => {
        let x = p[0] * cosA + p[2] * sinA;
        let z = -p[0] * sinA + p[2] * cosA;
        let y = p[1] * cosB - z * sinB;
        z = p[1] * sinB + z * cosB;

        const f = 1 / (z + 2.5); // perspective distance
        return [
          width / 2 + x * scale * f * 1.5,
          height / 2 + y * scale * f * 1.5,
          f,
        ];
      });

      // Accent colors
      const strokeColor = isDark ? '#ff3d3d' : '#e11d2e';
      const nodeColor = isDark ? '#ffb347' : '#d97706';
      const maxDistance = scale * 0.22;

      // Draw connecting 3D spatial lines
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i][0] - projected[j][0];
          const dy = projected[i][1] - projected[j][1];
          const dist = Math.hypot(dx, dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * (isDark ? 0.35 : 0.2);
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(projected[i][0], projected[i][1]);
            ctx.lineTo(projected[j][0], projected[j][1]);
            ctx.stroke();
          }
        }

        // Draw glowing 3D node
        const size = Math.max(1.5, projected[i][2] * 5.5);
        ctx.globalAlpha = Math.min(0.85, projected[i][2] * 1.6);
        ctx.fillStyle = nodeColor;
        ctx.beginPath();
        ctx.arc(projected[i][0], projected[i][1], size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-65 dark:opacity-85 transition-opacity"
      aria-hidden="true"
    />
  );
};
