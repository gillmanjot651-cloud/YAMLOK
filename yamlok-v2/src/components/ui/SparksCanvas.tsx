'use client';
import { useEffect, useRef } from 'react';

export default function SparksCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let dpr = Math.max(1, window.devicePixelRatio || 1);
    let running = true;

    const resize = () => {
      dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width  = Math.floor(window.innerWidth  * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width  = window.innerWidth  + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const rand = (a: number, b: number) => Math.random() * (b - a) + a;
    const MAX = 100;
    const CHANCE = 0.12;

    class Spark {
      x: number; y: number; vx: number; vy: number;
      life: number; age: number; size: number; color: string;
      constructor(x: number, y: number, fx = 0) {
        this.x = x; this.y = y;
        const a = rand(0, Math.PI * 2), s = rand(0.6, 3.2);
        this.vx = Math.cos(a) * s + fx;
        this.vy = Math.sin(a) * s + rand(-1.2, 1.2);
        this.life = rand(600, 1200); this.age = 0; this.size = rand(1.2, 3.2);
        this.color = Math.random() < 0.5 ? 'rgba(0,234,255,' : 'rgba(123,44,191,';
      }
      update(dt: number) { this.age += dt; this.vx *= 0.99; this.vy += 0.02; this.x += this.vx; this.y += this.vy; }
      draw() {
        const r = 1 - this.age / this.life;
        if (r <= 0) return;
        ctx.beginPath();
        ctx.fillStyle = this.color + r * 0.9 + ')';
        ctx.arc(this.x, this.y, this.size * r, 0, Math.PI * 2);
        ctx.fill();
      }
      alive() { return this.age < this.life; }
    }

    const sparks: Spark[] = [];
    const spawnAt = (x: number, y: number, fx = 0) => {
      const n = Math.floor(rand(2, 5));
      for (let i = 0; i < n; i++) {
        if (sparks.length >= MAX) break;
        sparks.push(new Spark(x + rand(-6, 6), y + rand(-6, 6), fx));
      }
    };

    const onMove = (e: MouseEvent) => {
      if (performance.now() - lastSpawn > 40) { spawnAt(e.clientX, e.clientY); lastSpawn = performance.now(); }
    };
    let lastSpawn = 0;
    window.addEventListener('mousemove', onMove);

    const edgeTimer = setInterval(() => {
      if (!running) return;
      if (Math.random() < 0.65) {
        if (Math.random() < 0.5) spawnAt(rand(0, 50), rand(0, window.innerHeight), 1.2);
        else spawnAt(rand(window.innerWidth - 50, window.innerWidth), rand(0, window.innerHeight), -1.2);
      }
    }, 900);

    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running) { last = performance.now(); requestAnimationFrame(loop); }
    });

    let last = performance.now();
    const loop = (now: number) => {
      if (!running) return;
      const dt = now - last; last = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (sparks.length < MAX && Math.random() < CHANCE)
        spawnAt(rand(0, window.innerWidth), rand(0, window.innerHeight));
      for (let i = sparks.length - 1; i >= 0; i--) {
        sparks[i].update(dt);
        if (!sparks[i].alive()) { sparks.splice(i, 1); continue; }
        sparks[i].draw();
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    return () => {
      running = false;
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      clearInterval(edgeTimer);
    };
  }, []);

  return <canvas id="sparksCanvas" ref={canvasRef} aria-hidden="true" className="fixed inset-0 pointer-events-none" style={{ zIndex: 10000 }} />;
}
