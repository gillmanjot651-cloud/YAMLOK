'use client';
import { useEffect, useRef } from 'react';

export default function CursorRing() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      el.style.left = e.clientX + 'px';
      el.style.top  = e.clientY + 'px';
    };
    const enter = () => el.classList.add('cursor-large');
    const leave = () => el.classList.remove('cursor-large');

    window.addEventListener('mousemove', move);
    document.querySelectorAll('button, a, .img-slot, .video-card').forEach(node => {
      node.addEventListener('mouseenter', enter);
      node.addEventListener('mouseleave', leave);
    });
    return () => {
      window.removeEventListener('mousemove', move);
    };
  }, []);

  return <div id="cursorRing" ref={ref} aria-hidden="true" />;
}
