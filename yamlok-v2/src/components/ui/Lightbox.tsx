'use client';
import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MediaImage, MediaVideo } from '@/types/media';

type LightboxItem =
  | { type: 'image'; src: string; alt: string }
  | { type: 'video-yt'; id: string }
  | { type: 'video-direct'; src: string; title: string };

interface Props {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function buildImageItem(img: MediaImage): LightboxItem {
  return { type: 'image', src: img.src, alt: img.alt };
}
export function buildVideoItem(vid: MediaVideo): LightboxItem {
  if (vid.type === 'youtube') return { type: 'video-yt', id: vid.id };
  return { type: 'video-direct', src: vid.src, title: vid.title };
}

export default function Lightbox({ items, index, onClose, onPrev, onNext }: Props) {
  const item = items[index];

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') onNext();
    if (e.key === 'ArrowLeft') onPrev();
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[20000] flex items-center justify-center"
        style={{ background: 'rgba(5,7,10,0.95)', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Prev */}
        <button
          onClick={e => { e.stopPropagation(); onPrev(); }}
          className="absolute left-5 top-1/2 -translate-y-1/2 z-[20001] w-10 h-14 flex items-center justify-content text-primary border border-primary bg-black/50 hover:bg-primary hover:text-black transition-colors text-2xl"
          aria-label="Previous"
        >‹</button>

        {/* Content */}
        <div
          className="max-w-[90%] max-h-[80vh] flex items-center justify-center"
          onClick={e => e.stopPropagation()}
        >
          {item.type === 'image' && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.src} alt={item.alt} className="max-w-full max-h-[80vh] rounded border border-primary shadow-[0_0_20px_rgba(0,234,255,0.2)]" />
          )}
          {item.type === 'video-yt' && (
            <iframe
              src={`https://www.youtube.com/embed/${item.id}?autoplay=1&rel=0`}
              title="YouTube video" frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-[80vw] rounded border border-primary shadow-[0_0_20px_rgba(0,234,255,0.2)]"
              style={{ aspectRatio: '16/9' }}
            />
          )}
          {item.type === 'video-direct' && (
            <iframe
              src={item.src} title={item.title} frameBorder="0"
              allow="autoplay; fullscreen" allowFullScreen
              className="w-[80vw] rounded border border-primary shadow-[0_0_20px_rgba(0,234,255,0.2)]"
              style={{ aspectRatio: '16/9' }}
            />
          )}
        </div>

        {/* Next */}
        <button
          onClick={e => { e.stopPropagation(); onNext(); }}
          className="absolute right-5 top-1/2 -translate-y-1/2 z-[20001] w-10 h-14 flex items-center justify-center text-primary border border-primary bg-black/50 hover:bg-primary hover:text-black transition-colors text-2xl"
          aria-label="Next"
        >›</button>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 border border-primary text-primary px-4 py-2 font-rajdhani font-bold hover:bg-primary hover:text-black transition-colors"
          aria-label="Close"
        >Close</button>
      </motion.div>
    </AnimatePresence>
  );
}
