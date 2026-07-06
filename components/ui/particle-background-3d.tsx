"use client";

import React, { useEffect, useRef } from 'react';

interface ParticleBackground3DProps {
  opacity?: number;
}

interface RainDrop3D {
  x: number;
  y: number;
  z: number;
  speed: number;
  length: number;
  width: number;
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

    // Initialize 3D Rain Drops
    const dropCount = Math.min(180, Math.floor((width * height) / 8000));
    const drops: RainDrop3D[] = [];
    const maxRange = 500; // 3D boundaries
    const focalLength = 350; // Camera perspective depth

    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: (Math.random() - 0.5) * maxRange * 2.5,
        y: (Math.random() - 0.5) * maxRange * 2,
        z: Math.random() * maxRange * 2 - maxRange, // spread in depth [-maxRange, maxRange]
        speed: Math.random() * 8 + 6, // Base speed of rain falling
        length: Math.random() * 20 + 15, // Base length of rain streak
        width: Math.random() * 0.8 + 0.6,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth) - 0.5;
      mouseRef.current.targetY = (e.clientY / window.innerHeight) - 0.5;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      // Mouse movements create horizontal wind drift
      const windX = mouse.x * 4.5;
      const gravityY = 1.0;

      const centerX = width / 2;
      const centerY = height / 2;

      const isDark = document.documentElement.classList.contains('dark');
      // Set rain colors (neon blue/purple in dark theme, soft terracotta in light theme)
      const rainColor = isDark ? '147, 197, 253' : '200, 122, 83';

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];

        // 3D Perspective Scale
        const scale = focalLength / (focalLength + d.z + maxRange);

        // Update positions based on gravity (downward) and wind (horizontal drift)
        d.y += d.speed * scale * gravityY;
        d.x += windX * scale;

        // Reset if raindrop goes out of bounds
        if (d.y > maxRange || (centerY + d.y * scale) > height + 50) {
          d.y = -maxRange;
          d.x = (Math.random() - 0.5) * maxRange * 2.5;
          d.z = Math.random() * maxRange * 2 - maxRange;
        }
        if (d.x < -maxRange * 2 || d.x > maxRange * 2) {
          d.x = (Math.random() - 0.5) * maxRange * 2.5;
        }

        // Project 3D coordinates onto 2D screen
        const px = centerX + d.x * scale;
        const py = centerY + d.y * scale;

        // Skip rendering if off screen
        if (px < -100 || px > width + 100 || py < -100 || py > height + 100) {
          continue;
        }

        // Draw raindrop streak lines
        const dx = windX * 2 * scale;
        const dy = d.length * scale;

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - dx, py - dy);
        ctx.strokeStyle = `rgba(${rainColor}, ${0.35 * scale})`;
        ctx.lineWidth = d.width * scale;
        ctx.stroke();

        // Add subtle splash/glow for closer drops
        if (scale > 0.8) {
          ctx.beginPath();
          ctx.arc(px, py, d.width * 1.5 * scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rainColor}, ${0.1 * scale})`;
          ctx.fill();
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
