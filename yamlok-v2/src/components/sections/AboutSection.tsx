'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mail } from 'lucide-react';
import siteConfig from '@/lib/siteConfig';

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };

interface AboutData { bio: string; skills: string[]; extraLines: string[] }

export default function AboutSection() {
  const [about, setAbout] = useState<AboutData>({
    bio:        siteConfig.about.bio,
    skills:     [...siteConfig.about.skills],
    extraLines: [...siteConfig.about.extraLines],
  });

  useEffect(() => {
    fetch('/api/media', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (d.about) setAbout(d.about); })
      .catch(() => {});
  }, []);

  return (
    <motion.section variants={stagger} initial="hidden" animate="show" className="max-w-3xl mx-auto">

      {/* Section header */}
      <motion.div variants={fadeUp} className="mb-10">
        <span className="section-label">Who I am</span>
        <h2 className="font-rajdhani text-4xl font-bold text-white mt-1">{siteConfig.about.heading}</h2>
        <div className="h-px mt-4 bg-gradient-to-r from-primary/40 to-transparent w-24" />
      </motion.div>

      {/* Bio */}
      <motion.p variants={fadeUp} className="text-text-mid text-base leading-relaxed mb-7"
        dangerouslySetInnerHTML={{ __html: about.bio }} />

      {/* Skills */}
      {about.skills.length > 0 && (
        <motion.div variants={fadeUp} className="mb-7">
          <p className="text-text-lo text-xs tracking-[3px] uppercase mb-3 font-semibold">Skills &amp; Tools</p>
          <div className="flex flex-wrap gap-2">
            {about.skills.map((s, i) => <span key={i} className="skill-badge">{s}</span>)}
          </div>
        </motion.div>
      )}

      {/* Extra info lines */}
      {about.extraLines.length > 0 && (
        <motion.ul variants={stagger} className="space-y-2 mb-8">
          {about.extraLines.map((line, i) => (
            <motion.li key={i} variants={fadeUp}
              className="text-sm text-text-mid leading-relaxed pl-4 border-l border-primary/30"
              dangerouslySetInnerHTML={{ __html: line }} />
          ))}
        </motion.ul>
      )}

      {/* CTAs */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
        <a href={siteConfig.contact.discord} target="_blank" rel="noopener noreferrer"
          className="hero-btn hero-btn-primary text-sm">
          <MessageCircle size={15} /> Join Discord
        </a>
        <a href={`mailto:${siteConfig.contact.email}`} className="hero-btn hero-btn-ghost text-sm">
          <Mail size={15} /> Send Email
        </a>
      </motion.div>

    </motion.section>
  );
}

