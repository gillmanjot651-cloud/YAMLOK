import Link from 'next/link';
import siteConfig from '@/lib/siteConfig';

const NAV = [
  { label: 'Home',      href: '/'          },
  { label: 'About',     href: '/about'     },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Video',     href: '/video'     },
  { label: 'Contact',   href: '/contact'   },
];

export default function SiteFooter() {
  return (
    <footer className="border-t mt-12" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-deep)' }}>
      <div className="gradient-line w-full" />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-3 gap-8 mb-8">

          {/* Brand */}
          <div>
            <div className="font-rajdhani font-bold text-2xl tracking-[4px] text-white mb-2">{siteConfig.name}</div>
            <p className="text-text-lo text-xs leading-relaxed">
              Cinematic GTA&nbsp;V edits, motion graphics &amp; visual design.
              Creating premium content since 2021.
            </p>
          </div>

          {/* Nav */}
          <div>
            <p className="text-text-lo text-[10px] tracking-[3px] uppercase mb-3 font-semibold">Navigation</p>
            <div className="flex flex-col gap-2">
              {NAV.map(({ label, href }) => (
                <Link key={href} href={href}
                  className="text-text-lo text-xs hover:text-primary transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <p className="text-text-lo text-[10px] tracking-[3px] uppercase mb-3 font-semibold">Follow</p>
            <div className="flex gap-2 flex-wrap">
              {siteConfig.socials.map(s => (
                <a key={s.title} href={s.href} title={s.title} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs
                             text-text-mid bg-white/[0.04] border border-white/[0.07]
                             hover:bg-primary/10 hover:text-primary hover:border-primary/25 transition-all">
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t pt-5 flex items-center justify-between flex-wrap gap-3"
          style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <p className="text-text-lo text-xs">{siteConfig.footer}</p>
          <Link href="/admin" className="text-text-lo/40 hover:text-text-lo/70 text-[10px] tracking-wider transition-colors">
            Admin →
          </Link>
        </div>
      </div>
    </footer>
  );
}

