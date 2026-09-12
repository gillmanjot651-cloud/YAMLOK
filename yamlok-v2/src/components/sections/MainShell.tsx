'use client';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { MediaData } from '@/types/media';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import Hero from './Hero';
import AboutSection from './AboutSection';
import PortfolioSection from './PortfolioSection';
import VideoSection from './VideoSection';
import ContactSection from './ContactSection';

const PAGES = ['home', 'about', 'portfolio', 'video', 'contact'] as const;
type Page = typeof PAGES[number];

interface Props { media: MediaData; }

export default function MainShell({ media }: Props) {
  const [activePage, setActivePage] = useState<Page>('home');

  /* Wire nav clicks */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest('[data-target]') as HTMLElement | null;
      if (!btn) return;
      const tgt = btn.dataset.target as Page;
      if (PAGES.includes(tgt)) {
        setActivePage(tgt);
        document.querySelectorAll('[data-target]').forEach(b => b.classList.remove('active-nav'));
        document.querySelectorAll(`[data-target="${tgt}"]`).forEach(b => b.classList.add('active-nav'));
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  /* Scroll to top on page change */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [activePage]);

  return (
    <>
      <SiteHeader />

      <main style={{ minHeight: 'calc(100vh - 70px)' }}>

        {/* ── HOME ── */}
        <div style={{ display: activePage === 'home' ? 'block' : 'none' }}>
          <Hero />
        </div>

        {/* ── INNER PAGES ── */}
        <AnimatePresence mode="wait">
          {activePage !== 'home' && (
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="min-h-[calc(100vh-130px)] px-6 md:px-12 py-12"
              style={{ background: 'var(--bg-deep)' }}
            >
              {activePage === 'about'     && <AboutSection />}
              {activePage === 'portfolio' && <PortfolioSection images={media.images} />}
              {activePage === 'video'     && <VideoSection videos={media.videos} />}
              {activePage === 'contact'   && <ContactSection />}
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      <SiteFooter />
    </>
  );
}

