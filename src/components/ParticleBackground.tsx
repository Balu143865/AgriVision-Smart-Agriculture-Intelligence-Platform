import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  baseOpacity: number;
  color: string;
  glow: boolean;
  pulseSpeed: number;
  pulseStep: number;
  type: 'particle' | 'leaf' | 'data';
  angle: number;
  angularSpeed: number;
}

export const ParticleBackground: React.FC<{ density?: number }> = ({ density = 45 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse parallax
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Create particles
    const particles: Particle[] = [];
    const colors = [
      'rgba(16, 185, 129,', // emerald
      'rgba(52, 211, 153,', // light emerald
      'rgba(132, 204, 22,', // lime
      'rgba(234, 179, 8,',  // subtle golden pollen
      'rgba(167, 243, 208,', // soft mint
    ];

    for (let i = 0; i < density; i++) {
      const isGlow = Math.random() > 0.82;
      const typeRand = Math.random();
      const type: 'particle' | 'leaf' | 'data' = typeRand > 0.85 ? 'leaf' : typeRand > 0.7 ? 'data' : 'particle';
      const color = colors[Math.floor(Math.random() * colors.length)];

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: isGlow ? Math.random() * 2.5 + 2 : Math.random() * 1.8 + 0.8,
        speedX: (Math.random() - 0.5) * 0.35 + 0.05, // gentle eastern drift
        speedY: (Math.random() - 0.5) * 0.25 - 0.1, // gentle upward floating
        opacity: Math.random() * 0.4 + 0.15,
        baseOpacity: Math.random() * 0.4 + 0.15,
        color,
        glow: isGlow,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        pulseStep: Math.random() * Math.PI * 2,
        type,
        angle: Math.random() * Math.PI * 2,
        angularSpeed: (Math.random() - 0.5) * 0.015,
      });
    }

    const drawLeaf = (x: number, y: number, size: number, angle: number, opacity: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = `rgba(52, 211, 153, ${opacity * 0.7})`;
      ctx.beginPath();
      ctx.moveTo(0, -size * 2);
      ctx.quadraticCurveTo(size * 1.2, -size * 0.5, 0, size * 2);
      ctx.quadraticCurveTo(-size * 1.2, -size * 0.5, 0, -size * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawDataNode = (x: number, y: number, size: number, opacity: number) => {
      ctx.save();
      ctx.fillStyle = `rgba(16, 185, 129, ${opacity * 0.85})`;
      ctx.strokeStyle = `rgba(52, 211, 153, ${opacity * 0.4})`;
      ctx.lineWidth = 1;
      ctx.fillRect(x - size, y - size, size * 2, size * 2);
      ctx.beginPath();
      ctx.arc(x, y, size * 2.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation for parallax
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      const parallaxX = (mouseX / width - 0.5) * 18;
      const parallaxY = (mouseY / height - 0.5) * 18;

      // Draw subtle connection lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 105) {
            const alpha = (1 - dist / 105) * 0.12 * Math.min(particles[i].opacity, particles[j].opacity);
            ctx.strokeStyle = `rgba(52, 211, 153, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x + parallaxX, particles[i].y + parallaxY);
            ctx.lineTo(particles[j].x + parallaxX, particles[j].y + parallaxY);
            ctx.stroke();
          }
        }
      }

      // Draw each particle
      particles.forEach(p => {
        if (!prefersReducedMotion) {
          p.x += p.speedX;
          p.y += p.speedY;
          p.angle += p.angularSpeed;
          p.pulseStep += p.pulseSpeed;
          p.opacity = p.baseOpacity + Math.sin(p.pulseStep) * 0.12;

          // Wrap boundaries smoothly
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
          if (p.y < -20) p.y = height + 20;
          if (p.y > height + 20) p.y = -20;
        }

        const renderX = p.x + parallaxX;
        const renderY = p.y + parallaxY;

        if (p.type === 'leaf') {
          drawLeaf(renderX, renderY, p.size * 1.5, p.angle, Math.max(0.05, p.opacity));
        } else if (p.type === 'data') {
          drawDataNode(renderX, renderY, p.size, Math.max(0.08, p.opacity));
        } else {
          // Standard glowing agricultural particle
          ctx.beginPath();
          ctx.arc(renderX, renderY, p.size, 0, Math.PI * 2);

          if (p.glow) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(16, 185, 129, 0.6)';
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.fillStyle = `${p.color} ${Math.max(0.05, p.opacity)})`;
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-60"
    />
  );
};
