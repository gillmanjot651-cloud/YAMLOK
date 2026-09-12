'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Briefcase } from 'lucide-react';
import siteConfig from '@/lib/siteConfig';
import type { HeroData } from '@/types/media';

const DEFAULT_HERO: HeroData = {
  badge:       'Available for commissions',
  description: 'Crafting cinematic edits, motion graphics & visual designs for GTA\u00a0V and beyond. Delivering premium content worldwide.',
  roles:       ['Cinematic Editor', 'GTA V Content Creator', 'Motion Designer', 'Visual Artist'],
  heroBg:      siteConfig.heroBg,
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };

export default function Hero() {
  const [hero, setHero]         = useState<HeroData>(DEFAULT_HERO);
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting,  setDeleting]  = useState(false);

  useEffect(() => {
    fetch('/api/media', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (d.hero) setHero(d.hero); })
      .catch(() => {});
  }, []);

  /* typewriter — re-runs whenever roles list changes */
  useEffect(() => {
    setRoleIndex(0);
    setDisplayed('');
    setDeleting(false);
  }, [hero.roles]);

  useEffect(() => {
    const roles   = hero.roles.length ? hero.roles : DEFAULT_HERO.roles;
    const current = roles[roleIndex % roles.length];
    let t: ReturnType<typeof setTimeout>;
    if (!deleting && displayed.length < current.length) {
      t = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 75);
    } else if (!deleting && displayed.length === current.length) {
      t = setTimeout(() => setDeleting(true), 2400);
    } else if (deleting && displayed.length > 0) {
      t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
    } else {
      setDeleting(false);
      setRoleIndex(i => (i + 1) % roles.length);
    }
    return () => clearTimeout(t);
  }, [displayed, deleting, roleIndex, hero.roles]);

  return (
    <section className="relative flex items-center justify-center overflow-hidden bg-grid"
      style={{ minHeight: 'calc(100vh - 70px)', background: 'var(--bg-deep)' }}>

      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
        <div className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
      </div>

      {/* Hero background image */}
      {hero.heroBg && (
        <div className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `url("${hero.heroBg}")`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'brightness(0.12) saturate(0.5)',
          }} />
      )}

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        variants={stagger} initial="hidden" animate="show"
      >
        {/* Badge */}
        {hero.badge && (
          <motion.div variants={fadeUp} className="flex justify-center mb-7">
            <span className="hero-badge float-anim">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-lt animate-pulse inline-block" />
              {hero.badge}
            </span>
          </motion.div>
        )}

        {/* Name */}
        <motion.h1 variants={fadeUp}
          className="font-rajdhani font-bold text-white mb-3 leading-none"
          style={{ fontSize: 'clamp(64px, 11vw, 116px)', letterSpacing: '6px' }}>
          <span className="shimmer-text">{siteConfig.name}</span>
        </motion.h1>

        {/* Typewriter role */}
        <motion.div variants={fadeUp}
          className="font-rajdhani text-xl md:text-2xl tracking-[4px] uppercase mb-6 h-8 text-primary"
          style={{ letterSpacing: '5px' }}>
          {displayed}<span className="typewriter-cursor" />
        </motion.div>

        {/* Description */}
        {hero.description && (
          <motion.p variants={fadeUp}
            className="text-text-mid max-w-lg mx-auto mb-10 text-sm md:text-base leading-relaxed">
            {hero.description}
          </motion.p>
        )}

        {/* CTA */}
        <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3">
          <button data-target="portfolio" className="hero-btn hero-btn-primary">
            View Work <ArrowRight size={16} />
          </button>
          <button data-target="video" className="hero-btn hero-btn-ghost">
            <Play size={14} className="fill-current" /> Watch Videos
          </button>
          <button data-target="contact" className="hero-btn hero-btn-ghost">
            <Briefcase size={14} /> Hire Me
          </button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div variants={fadeUp} className="mt-16 flex flex-col items-center gap-2 opacity-30">
          <span className="text-[10px] tracking-[4px] uppercase text-text-mid">Scroll</span>
          <motion.div
            className="w-px h-10 bg-gradient-to-b from-primary to-transparent"
            animate={{ scaleY: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

