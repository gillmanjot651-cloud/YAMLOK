'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Play, ExternalLink } from 'lucide-react';
import siteConfig from '@/lib/siteConfig';
import type { MediaVideo } from '@/types/media';

interface Props { videos: MediaVideo[]; }

const fadeUp  = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

function getThumb(v: MediaVideo) {
  if (v.type === 'youtube') return `https://img.youtube.com/vi/${v.id}/maxresdefault.jpg`;
  return v.thumb || '';
}
function getEmbedUrl(v: MediaVideo) {
  if (v.type === 'youtube') return `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`;
  return v.src;
}

/* ── Video player modal ── */
function VideoModal({ videos, index, onClose, setIndex }: {
  videos: MediaVideo[]; index: number;
  onClose: () => void; setIndex: (i: number) => void;
}) {
  const total = videos.length;
  const vid   = videos[index];
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9000] flex items-center justify-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose} />

        {/* counter */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/50 text-sm font-medium tracking-wider z-10">
          {index + 1} / {total}
        </div>

        {/* close */}
        <button onClick={onClose} className="lb-btn absolute top-5 right-5 z-10"><X size={18} /></button>

        {/* prev */}
        {total > 1 && (
          <button onClick={() => setIndex((index - 1 + total) % total)}
            className="lb-btn absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10">
            <ChevronLeft size={20} />
          </button>
        )}

        {/* player */}
        <motion.div key={index}
          className="relative z-10 w-full max-w-4xl px-4"
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.22 }}
        >
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            style={{ paddingTop: '56.25%' }}>
            <iframe
              src={getEmbedUrl(vid)}
              title={vid.title}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="flex items-center justify-center gap-3 mt-3">
            <p className="text-white/60 text-sm font-medium">{vid.title}</p>
            {vid.type === 'youtube' && (
              <a
                href={`https://www.youtube.com/watch?v=${vid.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
                style={{ background: 'rgba(255,0,0,0.15)', color: '#f87171', border: '1px solid rgba(255,0,0,0.25)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,0,0,0.28)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,0,0,0.15)'; }}
              >
                <ExternalLink size={13} />
                Watch on YouTube
              </a>
            )}
          </div>
        </motion.div>

        {/* next */}
        {total > 1 && (
          <button onClick={() => setIndex((index + 1) % total)}
            className="lb-btn absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10">
            <ChevronRight size={20} />
          </button>
        )}

        {/* thumbnail strip */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2 overflow-x-auto max-w-[80vw] pb-1">
          {videos.map((v, i) => (
            <button key={i} onClick={() => setIndex(i)}
              className={`flex-shrink-0 w-20 h-12 rounded-lg overflow-hidden border-2 transition-all
                ${i === index ? 'border-primary scale-105' : 'border-white/15 opacity-50 hover:opacity-80'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getThumb(v)} alt={v.title} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Horizontal scroll carousel ── */
export default function VideoSection({ videos }: Props) {
  const [playerIndex, setPlayerIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 340, behavior: 'smooth' });
  };

  if (videos.length === 0) {
    return (
      <motion.section variants={stagger} initial="hidden" animate="show" className="max-w-6xl mx-auto">
        <motion.div variants={fadeUp} className="mb-10">
          <span className="section-label">Cinematic Edits</span>
          <h2 className="font-rajdhani text-4xl font-bold text-white mt-1">{siteConfig.videos.heading}</h2>
        </motion.div>
        <motion.div variants={fadeUp} className="text-center py-24 glass-card rounded-2xl">
          <Play size={32} className="mx-auto mb-4 text-text-lo" />
          <p className="text-text-mid text-sm">No videos yet. Add some in the admin panel.</p>
        </motion.div>
      </motion.section>
    );
  }

  const featured = videos[0];

  return (
    <>
      <motion.section variants={stagger} initial="hidden" animate="show" className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div variants={fadeUp} className="mb-10">
          <span className="section-label">Cinematic Edits</span>
          <h2 className="font-rajdhani text-4xl font-bold text-white mt-1">{siteConfig.videos.heading}</h2>
          <p className="text-text-mid text-sm mt-2">{siteConfig.videos.subheading}</p>
          <div className="h-px mt-4 bg-gradient-to-r from-primary/40 to-transparent w-24" />
        </motion.div>

        {/* ── Featured (first video) ── */}
        <motion.div variants={fadeUp}
          className="relative rounded-2xl overflow-hidden cursor-pointer group mb-8 border border-white/[0.07]"
          style={{ paddingTop: '42%', background: '#0d0d14' }}
          onClick={() => setPlayerIndex(0)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={getThumb(featured)} alt={featured.title}
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" />
          {/* gradient */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, rgba(10,10,20,0.85) 0%, rgba(10,10,20,0.2) 60%, transparent 100%)' }} />
          {/* content */}
          <div className="absolute inset-0 flex items-center px-8 md:px-14">
            <div className="max-w-lg">
              <span className="section-label mb-2 block">Featured</span>
              <h3 className="font-rajdhani text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                {featured.title}
              </h3>
              <div className="flex items-center gap-3">
                <div className="play-circle">
                  <Play size={22} className="text-white ml-1" />
                </div>
                <span className="text-white/70 text-sm font-medium">Watch Now</span>
              </div>
            </div>
          </div>
          {/* hover border */}
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/40 transition-all duration-300" />
        </motion.div>

        {/* ── Scroll carousel ── */}
        {videos.length > 1 && (
          <motion.div variants={fadeUp} className="relative">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-rajdhani font-bold text-lg tracking-wider text-white/80 uppercase">All Videos</h4>
              <div className="flex gap-2">
                <button onClick={() => scrollBy(-1)} className="lb-btn"><ChevronLeft size={16} /></button>
                <button onClick={() => scrollBy(1)}  className="lb-btn"><ChevronRight size={16} /></button>
              </div>
            </div>

            {/* scroll container */}
            <div ref={scrollRef}
              className="flex gap-4 overflow-x-auto pb-3 scroll-smooth"
              style={{ scrollbarWidth: 'none' }}>
              {videos.map((vid, i) => (
                <motion.div key={i}
                  className="video-card"
                  style={{ width: '300px' }}
                  onClick={() => setPlayerIndex(i)}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getThumb(vid)} alt={vid.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(10,10,20,0.9) 0%, transparent 60%)' }} />
                  <div className="play-btn">
                    <div className="play-circle">
                      <Play size={18} className="text-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-xs font-semibold truncate">{vid.title}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] text-primary uppercase tracking-widest font-bold">
                        {i === 0 ? 'Featured' : `#${i + 1}`}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.section>

      {playerIndex !== null && (
        <VideoModal
          videos={videos}
          index={playerIndex}
          onClose={() => setPlayerIndex(null)}
          setIndex={setPlayerIndex}
        />
      )}
    </>
  );
}
