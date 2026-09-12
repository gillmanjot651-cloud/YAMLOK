'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lock } from 'lucide-react';
import siteConfig from '@/lib/siteConfig';
import type { SocialLink } from '@/types/media';

const NAV = [
  { label: 'Home',      href: '/'          },
  { label: 'About',     href: '/about'     },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Video',     href: '/video'     },
  { label: 'Contact',   href: '/contact'   },
];

export default function SiteHeader() {
  const pathname  = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [socials, setSocials] = useState<SocialLink[]>([...siteConfig.socials]);

  useEffect(() => {
    fetch('/api/media')
      .then(r => r.json())
      .then(d => { if (d.contact?.socials?.length) setSocials(d.contact.socials); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const onScroll = () => {
      const scrolled = window.scrollY > 8;
      el.style.background    = scrolled ? 'rgba(10,10,15,0.95)' : 'rgba(10,10,15,0.6)';
      el.style.backdropFilter = 'blur(24px)';
      el.style.boxShadow     = scrolled ? '0 1px 0 rgba(255,255,255,0.06)' : 'none';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Top accent line */}
      <div className="gradient-line w-full fixed top-0 left-0 z-[5001]" />

      <header
        ref={headerRef}
        className="fixed top-[1px] left-0 right-0 z-[5000] transition-all duration-300"
        style={{ backdropFilter: 'blur(24px)' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">

          {/* Logo */}
          <Link href="/"
            className="font-rajdhani font-bold text-xl tracking-[4px] text-white hover:text-primary transition-colors flex items-center gap-2">
            <span className="w-2 h-2 rounded-sm bg-primary rotate-45 inline-block" />
            {siteConfig.name}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(({ label, href }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href}
                  className={`nav-item ${active ? 'active-nav' : ''}`}>
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right: socials + admin */}
          <div className="flex items-center gap-2">
            {socials.map(s => (
              <a key={s.title} href={s.href} title={s.title}
                target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                           text-text-mid bg-white/[0.04] border border-white/[0.07]
                           hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all">
                {s.label}
              </a>
            ))}
            <Link href="/admin" title="Admin"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-lo
                         border border-white/[0.04] hover:text-primary-lt hover:border-primary/20 transition-all"
              aria-label="Admin Panel">
              <Lock size={13} />
            </Link>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden flex overflow-x-auto gap-1 px-4 pb-2 scrollbar-none">
          {NAV.map(({ label, href }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className={`flex-shrink-0 nav-item capitalize text-xs py-1.5 ${active ? 'active-nav' : ''}`}>
                {label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Spacer */}
      <div className="h-[70px]" />
    </>
  );
}
