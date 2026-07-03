"use client";

import React, { useEffect, useRef } from 'react';

interface ParticleBackground3DProps {
  opacity?: number;
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
}

export const ParticleBackground3D: React.FC<ParticleBackground3DProps> = ({ opacity = 0.35 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Initialize 3D particles
    const particleCount = Math.min(100, Math.floor((width * height) / 15000));
    const particles: Particle3D[] = [];
    const maxRange = 600; // Particle spread boundaries
    const focalLength = 400; // 3D Camera Perspective depth

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * maxRange * 2,
        y: (Math.random() - 0.5) * maxRange * 2,
        z: (Math.random() - 0.5) * maxRange * 2,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 0.8,
      });
    }

    // Handle Resize
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Track mouse coordinates
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth) - 0.5;
      mouseRef.current.targetY = (e.clientY / window.innerHeight) - 0.5;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 3D rotation helper functions
    const rotateY = (x: number, z: number, angle: number) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return [x * cos - z * sin, x * sin + z * cos];
    };

    const rotateX = (y: number, z: number, angle: number) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return [y * cos - z * sin, y * sin + z * cos];
    };

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const rotYAngle = 0.0008 + mouse.x * 0.005;
      const rotXAngle = 0.0003 + mouse.y * 0.005;

      const centerX = width / 2;
      const centerY = height / 2;

      const projected: Array<{ px: number; py: number; scale: number; origin: Particle3D }> = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (Math.abs(p.x) > maxRange) p.vx *= -1;
        if (Math.abs(p.y) > maxRange) p.vy *= -1;
        if (Math.abs(p.z) > maxRange) p.vz *= -1;

        let [rx, rz] = rotateY(p.x, p.z, rotYAngle);
        let [ry, finalZ] = rotateX(p.y, rz, rotXAngle);

        p.x = rx;
        p.y = ry;
        p.z = finalZ;

        const scale = focalLength / (focalLength + p.z + maxRange);
        const px = centerX + p.x * scale;
        const py = centerY + p.y * scale;

        projected.push({ px, py, scale, origin: p });
      }

      const maxConnectDistance = 150;
      const isDark = document.documentElement.classList.contains('dark');
      const lineColor = isDark ? '139, 92, 246' : '200, 122, 83';

      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const a = projected[i];
          const b = projected[j];

          const dx = a.origin.x - b.origin.x;
          const dy = a.origin.y - b.origin.y;
          const dz = a.origin.z - b.origin.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < maxConnectDistance) {
            const alpha = (1 - dist / maxConnectDistance) * 0.15 * a.scale * b.scale;
            ctx.beginPath();
            ctx.moveTo(a.px, a.py);
            ctx.lineTo(b.px, b.py);
            ctx.strokeStyle = `rgba(${lineColor}, ${alpha})`;
            ctx.lineWidth = 0.5 * Math.min(a.scale, b.scale);
            ctx.stroke();
          }
        }
      }

      const particleColor = isDark ? '226, 164, 120' : '75, 66, 57';
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const r = p.origin.radius * p.scale;

        ctx.beginPath();
        ctx.arc(p.px, p.py, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleColor}, ${0.5 * p.scale})`;
        ctx.fill();

        if (p.scale > 0.8) {
          ctx.shadowColor = `rgba(${particleColor}, 0.3)`;
          ctx.shadowBlur = 4 * p.scale;
          ctx.beginPath();
          ctx.arc(p.px, p.py, r * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${particleColor}, ${0.08 * p.scale})`;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ opacity }}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};

export default ParticleBackground3D;
