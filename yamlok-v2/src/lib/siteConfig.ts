/**
 * ─────────────────────────────────────────────────────────────
 *  SITE CONFIG — Everything your friend might want to change
 *  Edit this file to update text, links, and social handles.
 * ─────────────────────────────────────────────────────────────
 */
const siteConfig = {
  /** The name shown in the header, hero, and browser tab */
  name: 'YAMLOK',

  /** Browser tab title */
  title: 'YAMLOK — Gaming Portfolio',

  /** Subtitle shown under the hero name */
  subtitle: 'PORTFOLIO',

  /**
   * Hero background image URL.
   * ⚠️  The original ImgBB link has expired — upload the image again via the
   *     admin panel and paste the new URL here, OR just replace with any direct image URL.
   */
  heroBg: 'https://cdn.discordapp.com/attachments/1453837697914241138/1454356892725018694/Yam_Final_mask.png?ex=6aa6e827&is=6aa596a7&hm=cff1595cbf067943846e77749aff1aed95bfb6036051f3b119d3fe5a887d13e2&',

  /** ── About Me section ── */
  about: {
    heading: 'About Me',
    subheading: 'Who I am & what I do',
    bio: 'Hi — I\'m <strong>Manjot Singh Gill (YAMLOK)</strong>. I create cinematic edits in GTA 5.',
    skills: [
      '🎬 Video editing & motion design',
      '🎨 Graphic & visual design',
      '🌐 AI Web Designing',
      '⚡ Using Premiere Pro, Photoshop & After Effects',
    ],
    extraLines: [
      'This Website made by me using Multiple AI <strong>ChatGPT, Gemini and Blackbox</strong>',
      'All Payment Regarding talks Create Ticket in Discord.',
      'The mentioned pricing applies only to graphic design work (images). Video graphics are charged separately, typically ranging from 1500 to 7000.',
    ],
  },

  /** ── Portfolio section ── */
  portfolio: {
    heading: 'Portfolio',
    subheading: 'All the work will cost between 150 and 300.',
  },

  /** ── Video section ── */
  videos: {
    heading: 'Video',
    subheading: 'Click to play in lightbox',
  },

  /** ── Contact section ── */
  contact: {
    heading: 'Contact',
    email: 'gillmanjot651@gmail.com',
    discord: 'https://discord.com/invite/Txe6XecMc7',
  },

  /** ── Social links (used in header + footer) ── */
  socials: [
    { label: 'Y', title: 'YouTube',   href: 'https://www.youtube.com/@YamRajSingh13' },
    { label: 'I', title: 'Instagram', href: 'https://www.instagram.com/hmp871/' },
    { label: 'D', title: 'Discord',   href: 'https://discord.gg/Txe6XecMc7' },
  ],

  /** ── Footer ── */
  footer: '© YAMLOK — Portfolio',
} as const;

export default siteConfig;
