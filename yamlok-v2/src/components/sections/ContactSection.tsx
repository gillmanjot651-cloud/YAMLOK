'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, Play, Camera, IndianRupee, ImageIcon, Film, ExternalLink, Globe } from 'lucide-react';
import type { ReactNode } from 'react';
import siteConfig from '@/lib/siteConfig';
import type { ContactData } from '@/types/media';

const fadeUp  = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

const ICON_MAP: Record<string, ReactNode> = {
  YouTube:   <Play size={22} />,
  Instagram: <Camera size={22} />,
  Discord:   <MessageCircle size={22} />,
};
const ACCENT_MAP: Record<string, string> = {
  YouTube:   '#ef4444',
  Instagram: '#ec4899',
  Discord:   '#5865f2',
};

const DEFAULT_CONTACT: ContactData = {
  email:      siteConfig.contact.email,
  discord:    siteConfig.contact.discord,
  tagline:    "Ready to create something epic? Let's talk.",
  graphicMin: '150',
  graphicMax: '300',
  videoMin:   '1500',
  videoMax:   '7000',
  socials:    [...siteConfig.socials],
};

export default function ContactSection() {
  const [contact, setContact] = useState<ContactData>(DEFAULT_CONTACT);

  useEffect(() => {
    fetch('/api/media', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (d.contact) setContact(d.contact); })
      .catch(() => {});
  }, []);

  const emailCard = {
    icon: <Mail size={22} />, label: 'Email',
    value: contact.email, href: `mailto:${contact.email}`,
    cta: 'Send Email', accent: '#6366f1',
  };
  const discordCard = {
    icon: <MessageCircle size={22} />, label: 'Discord',
    value: 'Join for project inquiries & payments', href: contact.discord,
    cta: 'Join Discord', accent: '#5865f2',
  };
  const socialCards = contact.socials.map(s => ({
    icon: ICON_MAP[s.title] ?? <Globe size={22} />,
    label: s.title, value: s.href.replace(/https?:\/\/(www\.)?/, '').replace(/\/$/, ''),
    href: s.href, cta: 'Visit', accent: ACCENT_MAP[s.title] ?? '#6366f1',
  }));

  const allCards = [emailCard, discordCard, ...socialCards];

  return (
    <motion.section variants={stagger} initial="hidden" animate="show" className="max-w-6xl mx-auto">

      {/* Header */}
      <motion.div variants={fadeUp} className="mb-10">
        <span className="section-label">Get in Touch</span>
        <h2 className="font-rajdhani text-4xl font-bold text-white mt-1">{siteConfig.contact.heading}</h2>
        {contact.tagline && (
          <p className="text-text-mid text-sm mt-2">{contact.tagline}</p>
        )}
        <div className="h-px mt-4 bg-gradient-to-r from-primary/40 to-transparent w-24" />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left — contact cards */}
        <motion.div variants={stagger} className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {allCards.map(card => (
            <motion.a
              key={card.label}
              variants={fadeUp}
              href={card.href}
              target={card.href.startsWith('mailto') ? undefined : '_blank'}
              rel="noopener noreferrer"
              className="contact-card flex items-start gap-4 group"
              style={{ borderColor: `${card.accent}22` }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
                style={{ background: `${card.accent}18`, color: card.accent }}>
                {card.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-text-lo text-[11px] tracking-[3px] uppercase mb-1">{card.label}</p>
                <p className="text-text-hi font-semibold text-sm break-all leading-snug">{card.value}</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold tracking-wider uppercase opacity-50 group-hover:opacity-100 transition-opacity"
                  style={{ color: card.accent }}>
                  {card.cta} <ExternalLink size={10} />
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>

        {/* Right — pricing */}
        <motion.div variants={fadeUp} className="glass-card p-6 flex flex-col gap-5 h-fit">
          <div className="flex items-center gap-2">
            <IndianRupee size={18} className="text-accent" />
            <h3 className="font-rajdhani font-bold text-lg tracking-wider">Pricing</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.12)' }}>
              <ImageIcon size={16} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-text-hi text-sm font-semibold">Graphic Design</p>
                <p className="text-accent font-bold text-base font-rajdhani">₹{contact.graphicMin} – ₹{contact.graphicMax}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.12)' }}>
              <Film size={16} className="text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-text-hi text-sm font-semibold">Video Editing</p>
                <p className="text-accent font-bold text-base font-rajdhani">₹{contact.videoMin} – ₹{contact.videoMax}</p>
              </div>
            </div>
          </div>

          <p className="text-text-lo text-xs leading-relaxed border-t border-white/[0.06] pt-4">
            All payment discussions via{' '}
            <a href={contact.discord} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              Discord ticket
            </a>.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}

