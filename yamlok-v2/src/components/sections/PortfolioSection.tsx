'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ZoomIn, ExternalLink } from 'lucide-react';
import siteConfig from '@/lib/siteConfig';
import type { MediaImage, ImageCategory } from '@/types/media';

interface Props { images: MediaImage[]; }

const fadeUp  = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

/* ── Filter logic ──────────────────────────────────────────────────────────── */
type FilterTab = 'All' | 'Videos' | 'Graphics';

/** Maps the stored ImageCategory → which tab it belongs to. */
function tabForCategory(cat: ImageCategory | undefined): FilterTab {
  if (cat === 'Thumbnail' || cat === 'Cinematic') return 'Videos';
  return 'Graphics'; // 'Graphic' and undefined both land here
}

function applyFilter(images: MediaImage[], tab: FilterTab): MediaImage[] {
  if (tab === 'All') return images;
  return images.filter(img => tabForCategory(img.category) === tab);
}

/* ── Full-screen carousel lightbox ────────────────────────────────────────── */
function Lightbox({ images, index, onClose, setIndex }: {
  images: MediaImage[]; index: number;
  onClose: () => void;  setIndex: (i: number) => void;
}) {
  const total = images.length;
  const prev  = () => setIndex((index - 1 + total) % total);
  const next  = () => setIndex((index + 1) % total);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'Escape')     onClose();
  };

  const current = images[index];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9000] flex items-center justify-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        onKeyDown={handleKey}
        tabIndex={-1}
        autoFocus
      >
        {/* backdrop */}
        <div className="absolute inset-0 bg-black/92 backdrop-blur-md" />

        {/* counter */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/50 text-sm font-medium tracking-wider z-10 select-none">
          {index + 1} / {total}
        </div>

        {/* top-right actions: open-original + close */}
        <div className="absolute top-5 right-5 z-10 flex items-center gap-2">
          <a
            href={current.src}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="lb-btn flex items-center gap-1.5 px-3 rounded-xl text-xs font-semibold tracking-wide"
            aria-label="Open original image in new tab"
            title="Open original"
            style={{ width: 'auto', borderRadius: '10px' }}
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline">Open original</span>
          </a>
          <button onClick={e => { e.stopPropagation(); onClose(); }} className="lb-btn" aria-label="Close lightbox">
            <X size={18} />
          </button>
        </div>

        {/* prev */}
        <button onClick={e => { e.stopPropagation(); prev(); }}
          className="lb-btn absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10" aria-label="Previous image">
          <ChevronLeft size={20} />
        </button>

        {/* image */}
        <motion.div
          key={index}
          className="relative z-10 max-w-[90vw] max-h-[85vh] flex flex-col items-center gap-3"
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.25 }}
          onClick={e => e.stopPropagation()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.src} alt={current.alt}
            className="max-w-[90vw] max-h-[80vh] object-contain rounded-xl shadow-2xl border border-white/10" />
          {current.alt && (
            <p className="text-white/50 text-sm tracking-wider">{current.alt}</p>
          )}
        </motion.div>

        {/* next */}
        <button onClick={e => { e.stopPropagation(); next(); }}
          className="lb-btn absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10" aria-label="Next image">
          <ChevronRight size={20} />
        </button>

        {/* thumbnail strip */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2 overflow-x-auto max-w-[80vw] pb-1">
          {images.map((img, i) => (
            <button key={img.id} onClick={e => { e.stopPropagation(); setIndex(i); }}
              className={`flex-shrink-0 w-14 h-9 rounded overflow-hidden border-2 transition-all
                ${i === index ? 'border-primary scale-110' : 'border-white/15 opacity-50 hover:opacity-80'}`}
              aria-label={`Go to image ${i + 1}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Main section ──────────────────────────────────────────────────────────── */
export default function PortfolioSection({ images }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab]         = useState<FilterTab>('All');

  const filtered = applyFilter(images, activeTab);

  // Build tab list dynamically from data (always show All; only show Videos/Graphics
  // if at least one image maps to that tab).
  const tabs: FilterTab[] = ['All'];
  if (images.some(img => tabForCategory(img.category) === 'Videos'))   tabs.push('Videos');
  if (images.some(img => tabForCategory(img.category) === 'Graphics'))  tabs.push('Graphics');

  return (
    <>
      <motion.section variants={stagger} initial="hidden" animate="show" className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div variants={fadeUp} className="mb-8">
          <span className="section-label">My Work</span>
          <h2 className="font-rajdhani text-4xl font-bold text-white mt-1">{siteConfig.portfolio.heading}</h2>
          <p className="text-text-mid text-sm mt-2">{siteConfig.portfolio.subheading}</p>
          <div className="h-px mt-4 bg-gradient-to-r from-primary/40 to-transparent w-24" />
        </motion.div>

        {/* Filter tabs + count */}
        <motion.div variants={fadeUp} className="flex items-center justify-between flex-wrap gap-3 mb-6">
          {/* tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                style={activeTab === tab
                  ? { background: 'var(--primary)', color: '#fff', boxShadow: '0 2px 8px rgba(99,102,241,0.35)' }
                  : { color: 'var(--text-mid)' }}
                onMouseEnter={e => { if (activeTab !== tab) (e.currentTarget as HTMLElement).style.color = 'var(--text-hi)'; }}
                onMouseLeave={e => { if (activeTab !== tab) (e.currentTarget as HTMLElement).style.color = 'var(--text-mid)'; }}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* count */}
          <span className="text-text-lo text-xs tracking-[2px] uppercase font-semibold select-none">
            {filtered.length} work{filtered.length !== 1 ? 's' : ''}
          </span>
        </motion.div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <motion.div variants={fadeUp} className="text-center py-24 glass-card rounded-2xl">
            <ZoomIn size={32} className="mx-auto mb-4 text-text-lo" />
            <p className="text-text-mid text-sm">
              {images.length === 0
                ? 'No images yet. Add some in the admin panel.'
                : `No works in the "${activeTab}" category yet.`}
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={stagger}
            className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3"
          >
            {filtered.map((img, i) => (
              <motion.div key={img.id} variants={fadeUp}
                className="portfolio-item group"
                onClick={() => setLightboxIndex(i)}
                onKeyDown={e => e.key === 'Enter' && setLightboxIndex(i)}
                tabIndex={0} role="button" aria-label={img.alt || `Portfolio image ${i + 1}`}>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.alt} loading="lazy"
                  className="w-full h-auto block group-hover:scale-105 transition-transform duration-500" />

                {/*
                  Overlay caption:
                  - Desktop: visible on hover (CSS via .portfolio-item:hover .overlay)
                  - Mobile (pointer:coarse / hover:none): always visible via .caption-mobile-always class
                */}
                <div className="overlay">
                  <div className="flex items-center justify-between w-full">
                    {img.alt && <p className="text-white/90 text-xs font-semibold tracking-wide truncate pr-2">{img.alt}</p>}
                    <ZoomIn size={14} className="text-white/60 flex-shrink-0 ml-auto" />
                  </div>
                </div>

                {/* Mobile-always caption: rendered as a separate element, only shown on touch devices */}
                {img.alt && (
                  <div className="portfolio-mobile-caption">
                    {img.alt}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.section>

      {lightboxIndex !== null && (
        <Lightbox
          images={filtered}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          setIndex={setLightboxIndex}
        />
      )}
    </>
  );
}
