'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
}

export default function CursorParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: 0, y: 0 });
  const animationId = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // B&W Suited Colors
    const colors = [
      'rgba(0, 0, 0, ALPHA)',      // Black
      'rgba(50, 50, 50, ALPHA)',   // Dark Gray
      'rgba(100, 100, 100, ALPHA)', // Medium Gray
      'rgba(150, 150, 150, ALPHA)', // Light Gray
      'rgba(200, 200, 200, ALPHA)', // Ultra Light Gray
    ];

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      for (let i = 0; i < 2; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5 + 0.5;
        const maxLife = Math.random() * 40 + 20;
        particles.current.push({
          x: mouse.current.x,
          y: mouse.current.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3 + 1,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 0,
          maxLife,
        });
      }

      if (particles.current.length > 100) {
        particles.current = particles.current.slice(-100);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create a copy to avoid mutation issues during iteration
      const currentParticles = [...particles.current];
      particles.current = currentParticles.filter(p => p.life < p.maxLife);

      for (const p of particles.current) {
        if (!p) continue;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02; 
        p.life++;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        const radius = Math.max(0, p.size * p.alpha);
        if (radius > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color.replace('ALPHA', String(p.alpha * 0.4));
          ctx.fill();

          // Subtle Dark Glow
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius * 2, 0, Math.PI * 2);
          ctx.fillStyle = p.color.replace('ALPHA', String(p.alpha * 0.1));
          ctx.fill();
        }
      }

      // Connecting lines (Grayscale)
      for (let i = 0; i < particles.current.length; i++) {
        for (let j = i + 1; j < particles.current.length; j++) {
          const a = particles.current[i];
          const b = particles.current[j];
          if (!a || !b) continue;
          
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 60) {
            const lineAlpha = (1 - dist / 60) * Math.min(a.alpha, b.alpha) * 0.2;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0, 0, 0, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none opacity-50"
      style={{ mixBlendMode: 'multiply' }}
    />
  );
}
