'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import toast from 'react-hot-toast';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Images, PlaySquare, Settings, GripVertical, X, Save,
  AlertTriangle, ExternalLink, LogOut, GitBranch, Upload,
  Pencil, Lock, ImagePlus, Video, CloudUpload, CheckCircle2,
  XCircle, PlusCircle, ChevronRight, User, Trash2, Mail, Eye,
} from 'lucide-react';
import type { MediaData, MediaImage, MediaVideo, AboutData, HeroData, ContactData, SocialLink, ImageCategory } from '@/types/media';
import { extractYouTubeId, convertDriveLink } from '@/lib/utils';
import ConfirmModal from '@/components/ui/ConfirmModal';

type Tab = 'images' | 'videos' | 'home' | 'about' | 'contact' | 'analytics' | 'settings';

interface DayLog { date: string; count: number }

/* ── helpers ── */
const uid = () => Math.random().toString(36).slice(2, 9);

/* Styled toasts matching new indigo palette */
const adminToast = {
  success: (msg: string) =>
    toast.custom(t => (
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-poppins
        transition-all duration-300 ${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
        style={{
          background: '#111118',
          borderColor: 'rgba(99,102,241,0.35)',
          color: '#f1f5f9',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)',
          minWidth: '260px',
        }}>
        <CheckCircle2 size={16} className="text-indigo-400 flex-shrink-0" />
        <span>{msg}</span>
      </div>
    ), { duration: 3500 }),

  error: (msg: string) =>
    toast.custom(t => (
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-poppins
        transition-all duration-300 ${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
        style={{
          background: '#111118',
          borderColor: 'rgba(239,68,68,0.35)',
          color: '#f1f5f9',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          minWidth: '260px',
        }}>
        <XCircle size={16} className="text-red-400 flex-shrink-0" />
        <span>{msg}</span>
      </div>
    ), { duration: 4500 }),
};

/* ── Input shared style ── */
const INPUT = `w-full bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm px-3 py-2
  text-slate-200 placeholder:text-slate-600
  focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-colors`;

/* ── Count badge ── */
function Badge({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
      style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
      {n}
    </span>
  );
}

/* ─────────────── SORTABLE ROWS ─────────────── */
const CATEGORIES: ImageCategory[] = ['Thumbnail', 'Cinematic', 'Graphic'];
const SELECT_CLS = `bg-white/[0.04] border border-white/[0.08] rounded-lg text-xs px-2 py-1.5
  text-slate-400 focus:outline-none focus:border-indigo-500/50 transition-colors`;

function SortableImageRow({ img, onRemove, onChange }: {
  img: MediaImage; onRemove: () => void;
  onChange: (field: 'src' | 'alt' | 'category', val: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: img.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  const rowStyle = { ...style, background: '#0e0e16', borderColor: 'rgba(255,255,255,0.06)' };
  return (
    <div ref={setNodeRef} style={rowStyle}
      className="flex items-center gap-3 rounded-lg p-2.5 border group transition-colors"
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}>
      <span {...attributes} {...listeners}
        className="cursor-grab text-slate-600 hover:text-slate-400 select-none flex-shrink-0 transition-colors">
        <GripVertical size={16} />
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img.src} alt={img.alt} loading="lazy"
        className="w-20 h-12 object-cover rounded-md flex-shrink-0"
        style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0a0a0f' }}
        onError={e => {
          (e.target as HTMLImageElement).src =
            "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='48'><rect fill='%23111' width='80' height='48'/></svg>";
        }} />
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <input type="url" defaultValue={img.src} placeholder="Image URL"
          onBlur={e => onChange('src', e.target.value)} className={INPUT} />
        <div className="flex gap-1.5">
          <input type="text" defaultValue={img.alt} placeholder="Caption"
            onBlur={e => onChange('alt', e.target.value)}
            className={INPUT + ' text-xs text-slate-500 flex-1'} />
          <select
            defaultValue={img.category ?? 'Graphic'}
            onChange={e => onChange('category', e.target.value)}
            className={SELECT_CLS}
            style={{ background: '#0e0e16', minWidth: '90px' }}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <button onClick={onRemove}
        className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-all
                   opacity-0 group-hover:opacity-100 text-red-400/50 hover:text-red-400
                   border border-transparent hover:border-red-800/50 hover:bg-red-950/40">
        <X size={13} />
      </button>
    </div>
  );
}

function SortableVideoRow({ vid, index, onRemove, onChange }: {
  vid: MediaVideo; index: number; onRemove: () => void;
  onChange: (field: 'url' | 'title', val: string) => void;
}) {
  const id = vid.type === 'youtube' ? vid.id : `direct-${index}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style    = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  const rowStyle = { ...style, background: '#0e0e16', borderColor: 'rgba(255,255,255,0.06)' };
  const thumb    = vid.type === 'youtube' ? `https://img.youtube.com/vi/${vid.id}/mqdefault.jpg` : (vid.thumb ?? '');
  const urlVal   = vid.type === 'youtube' ? `https://www.youtube.com/watch?v=${vid.id}` : vid.src;

  return (
    <div ref={setNodeRef} style={rowStyle}
      className="flex items-center gap-3 rounded-lg p-2.5 border group transition-colors"
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}>
      <span {...attributes} {...listeners}
        className="cursor-grab text-slate-600 hover:text-slate-400 select-none flex-shrink-0 transition-colors">
        <GripVertical size={16} />
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={thumb} alt={vid.title} loading="lazy"
        className="w-20 h-12 object-cover rounded-md flex-shrink-0"
        style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0a0a0f' }} />
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <input type="text" defaultValue={urlVal} placeholder="YouTube URL or direct URL"
          onBlur={e => onChange('url', e.target.value)} className={INPUT} />
        <input type="text" defaultValue={vid.title} placeholder="Title"
          onBlur={e => onChange('title', e.target.value)}
          className={INPUT + ' text-xs text-slate-500'} />
      </div>
      <button onClick={onRemove}
        className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-all
                   opacity-0 group-hover:opacity-100 text-red-400/50 hover:text-red-400
                   border border-transparent hover:border-red-800/50 hover:bg-red-950/40">
        <X size={13} />
      </button>
    </div>
  );
}

/* ─────────────── EMPTY STATE ─────────────── */
function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center select-none">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(99,102,241,0.07)', border: '1px dashed rgba(99,102,241,0.2)', color: 'rgba(99,102,241,0.5)' }}>
        {icon}
      </div>
      <div>
        <p className="text-slate-400 font-medium text-sm">{title}</p>
        <p className="text-slate-600 text-xs mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

/* ─────────────── SECTION HEADER ─────────────── */
function SectionHead({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h2 className="font-rajdhani text-2xl font-bold tracking-wide text-white">{title}</h2>
      <p className="text-slate-500 text-sm mt-1">{desc}</p>
    </div>
  );
}

/* ─────────────── ADD CARD ─────────────── */
function AddCard({ label, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-6 flex flex-col gap-5"
      style={{ background: '#0e0e16', border: '1px solid rgba(255,255,255,0.06)' }}>
      <p className="text-[11px] font-bold uppercase tracking-[2px] text-indigo-400">{label}</p>
      {children}
    </div>
  );
}

/* ─────────────── ANALYTICS PANEL ─────────────── */
function AnalyticsPanel({ logs }: { logs: DayLog[] }) {
  const allMonths = Array.from(new Set(logs.map(l => l.date.slice(0, 7)))).sort().reverse();
  const [selMonth, setSelMonth] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');

  const filtered = logs.filter(l => {
    if (selMonth !== 'all' && !l.date.startsWith(selMonth)) return false;
    if (dateFrom && l.date < dateFrom) return false;
    if (dateTo   && l.date > dateTo)   return false;
    return true;
  });
  const total = filtered.reduce((s, l) => s + l.count, 0);
  const peak  = filtered.length ? Math.max(...filtered.map(l => l.count)) : 0;
  const avg   = filtered.length ? Math.round(total / filtered.length) : 0;

  const selectCls = 'bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm px-3 py-1.5 text-slate-300 focus:outline-none focus:border-indigo-500/50';
  const inputStyle = { background: '#0e0e16', colorScheme: 'dark' as const };

  return (
    <div className="p-8 flex flex-col gap-7 max-w-4xl w-full">
      <SectionHead title="Analytics" desc="Visitor traffic broken down by day. Updates each time someone visits the public site." />

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Visits', value: total.toLocaleString() },
          { label: 'Peak Day',     value: peak.toLocaleString() },
          { label: 'Daily Avg',    value: avg.toLocaleString() },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 flex flex-col gap-1"
            style={{ background: '#0e0e16', border: '1px solid rgba(99,102,241,0.12)' }}>
            <div className="font-rajdhani text-2xl font-bold text-indigo-300">{s.value}</div>
            <div className="text-[10px] text-slate-600 uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-wider text-slate-600">Month</label>
          <select value={selMonth} onChange={e => setSelMonth(e.target.value)}
            className={selectCls} style={{ background: '#0e0e16' }}>
            <option value="all">All time</option>
            {allMonths.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-wider text-slate-600">From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className={selectCls} style={inputStyle} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-wider text-slate-600">To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className={selectCls} style={inputStyle} />
        </div>
        {(selMonth !== 'all' || dateFrom || dateTo) && (
          <button onClick={() => { setSelMonth('all'); setDateFrom(''); setDateTo(''); }}
            className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-300 border border-white/[0.08] transition-colors self-end">
            Clear
          </button>
        )}
      </div>

      {/* Bar chart */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-600 gap-2">
          <Eye size={28} className="opacity-30" />
          <p className="text-sm">No data for this period.</p>
        </div>
      ) : (
        <div className="rounded-xl p-5" style={{ background: '#0e0e16', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[11px] font-bold uppercase tracking-[2px] text-indigo-400 mb-4">Daily Visitors</p>
          <div className="flex items-end gap-1 overflow-x-auto pb-2" style={{ minHeight: '120px' }}>
            {filtered.map(l => {
              const pct = peak > 0 ? (l.count / peak) * 100 : 0;
              return (
                <div key={l.date} className="flex flex-col items-center gap-1 flex-shrink-0" style={{ minWidth: '28px' }}>
                  <span className="text-[9px] text-slate-600">{l.count}</span>
                  <div className="rounded-t w-5 transition-all"
                    style={{ height: `${Math.max(pct, 4)}px`, background: 'rgba(99,102,241,0.7)', minHeight: '4px' }}
                    title={`${l.date}: ${l.count}`} />
                  <span className="text-[8px] text-slate-700 leading-none"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', maxHeight: '52px', overflow: 'hidden' }}>
                    {l.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#0e0e16', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="text-left px-4 py-2.5 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Date</th>
                <th className="text-right px-4 py-2.5 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Visitors</th>
                <th className="px-4 py-2.5 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold w-40">Bar</th>
              </tr>
            </thead>
            <tbody>
              {[...filtered].reverse().map((l, i) => (
                <tr key={l.date} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="px-4 py-2 text-slate-300 font-mono text-xs">{l.date}</td>
                  <td className="px-4 py-2 text-right font-bold text-indigo-300 font-rajdhani">{l.count}</td>
                  <td className="px-4 py-2">
                    <div className="h-1.5 rounded-full bg-indigo-500/20 w-full max-w-[160px]">
                      <div className="h-full rounded-full bg-indigo-500/60"
                        style={{ width: `${peak > 0 ? (l.count / peak) * 100 : 0}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─────────────── MAIN DASHBOARD ─────────────── */
const DEFAULT_HERO: HeroData = {
  badge:       'Available for commissions',
  description: 'Crafting cinematic edits, motion graphics & visual designs for GTA\u00a0V and beyond. Delivering premium content worldwide.',
  roles:       ['Cinematic Editor', 'GTA V Content Creator', 'Motion Designer', 'Visual Artist'],
  heroBg:      '',
};

const DEFAULT_ABOUT: AboutData = {
  bio: "Hi — I'm <strong>Manjot Singh Gill (YAMLOK)</strong>. I create cinematic edits in GTA 5.",
  skills: ['🎬 Video editing & motion design', '🎨 Graphic & visual design', '🌐 AI Web Designing', '⚡ Using Premiere Pro, Photoshop & After Effects'],
  extraLines: [
    'This Website made by me using Multiple AI <strong>ChatGPT, Gemini and Blackbox</strong>',
    'All Payment Regarding talks Create Ticket in Discord.',
    'The mentioned pricing applies only to graphic design work (images). Video graphics are charged separately, typically ranging from 1500 to 7000.',
  ],
};

const DEFAULT_CONTACT: ContactData = {
  email: 'gillmanjot651@gmail.com', discord: 'https://discord.com/invite/Txe6XecMc7',
  tagline: "Ready to create something epic? Let's talk.",
  graphicMin: '150', graphicMax: '300', videoMin: '1500', videoMax: '7000',
  socials: [
    { label: 'Y', title: 'YouTube',   href: 'https://www.youtube.com/@YamRajSingh13' },
    { label: 'I', title: 'Instagram', href: 'https://www.instagram.com/hmp871/' },
    { label: 'D', title: 'Discord',   href: 'https://discord.gg/Txe6XecMc7' },
  ],
};

export default function AdminDashboard() {
  const [tab, setTab]         = useState<Tab>('images');
  const [media, setMedia]     = useState<MediaData>({ images: [], videos: [] });
  const [hero,  setHero]      = useState<HeroData>(DEFAULT_HERO);
  const [about, setAbout]     = useState<AboutData>(DEFAULT_ABOUT);
  const [contact, setContact] = useState<ContactData>(DEFAULT_CONTACT);
  const [visitorTotal, setVisitorTotal] = useState<number | null>(null);
  const [visitorLogs,  setVisitorLogs]  = useState<DayLog[]>([]);
  const [isDirty, setDirty]   = useState(false);
  const [saving, setSaving]   = useState(false);

  const [confirm, setConfirm] = useState<{ open: boolean; message: string; onConfirm: () => void }>({
    open: false, message: '', onConfirm: () => {},
  });
  const openConfirm = (message: string, onConfirm: () => void) => setConfirm({ open: true, message, onConfirm });
  const closeConfirm = () => setConfirm(c => ({ ...c, open: false }));

  const [newImgUrl, setNewImgUrl]       = useState('');
  const [newImgAlt, setNewImgAlt]       = useState('');
  const [newImgCat, setNewImgCat]       = useState<ImageCategory>('Graphic');
  const [uploadState, setUpState]   = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [uploadMsg, setUpMsg]       = useState('');
  const [isDragOver, setDragOver]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [newVidYt, setNewVidYt]         = useState('');
  const [newVidDirect, setNewVidDirect] = useState('');
  const [newVidThumb, setNewVidThumb]   = useState('');
  const [newVidTitle, setNewVidTitle]   = useState('');

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  useEffect(() => {
    fetch('/api/media').then(r => r.json()).then(d => {
      setMedia(d);
      if (d.hero)    setHero(d.hero);
      if (d.about)   setAbout(d.about);
      if (d.contact) setContact(d.contact);
    }).catch(() => {});
    fetch('/api/visitors').then(r => r.json()).then(d => {
      if (typeof d.total === 'number') setVisitorTotal(d.total);
      if (Array.isArray(d.logs))       setVisitorLogs(d.logs);
    }).catch(() => {});
  }, []);

  const dirty = useCallback(() => setDirty(true), []);

  /* ── hero field helpers ── */
  const updateHeroField = (field: keyof HeroData, val: string | string[]) => {
    setHero(h => ({ ...h, [field]: val }));
    dirty();
  };

  /* ── about field helpers ── */
  const updateAboutField = (field: keyof AboutData, val: string | string[]) => {
    setAbout(a => ({ ...a, [field]: val }));
    dirty();
  };

  /* ── contact field helpers ── */
  const updateContactField = (field: keyof ContactData, val: string | SocialLink[]) => {
    setContact(c => ({ ...c, [field]: val }));
    dirty();
  };

  /* ── save ── */
  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...media, hero, about, contact };
      const res  = await fetch('/api/media', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (res.ok || res.status === 207) {
        setDirty(false);
        if (json.published)        adminToast.success('Published to GitHub!');
        else if (json.githubError) adminToast.error(`Saved locally — GitHub: ${json.githubError}`);
        else                       adminToast.success('Saved locally');
      } else { adminToast.error(json.error || 'Save failed'); }
    } catch { adminToast.error('Network error — could not save.'); }
    setSaving(false);
  };

  /* ── drags ── */
  const onImageDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = media.images.map(i => i.id);
    setMedia(m => ({ ...m, images: arrayMove(m.images, ids.indexOf(active.id as string), ids.indexOf(over.id as string)) }));
    dirty();
  };
  const videoIds = media.videos.map((v, i) => v.type === 'youtube' ? v.id : `direct-${i}`);
  const onVideoDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setMedia(m => ({ ...m, videos: arrayMove(m.videos, videoIds.indexOf(active.id as string), videoIds.indexOf(over.id as string)) }));
    dirty();
  };

  /* ── add image ── */
  const addImage = () => {
    if (!newImgUrl.trim()) { adminToast.error('Paste an image URL first.'); return; }
    setMedia(m => ({ ...m, images: [...m.images, { id: uid(), src: newImgUrl.trim(), alt: newImgAlt.trim() || `Work Sample ${m.images.length + 1}`, category: newImgCat }] }));
    setNewImgUrl(''); setNewImgAlt(''); setNewImgCat('Graphic'); setUpState('idle'); setUpMsg('');
    dirty(); adminToast.success('Image added.');
  };

  /* ── upload ── */
  const uploadImage = async (file: File) => {
    setUpState('uploading'); setUpMsg(`Uploading ${file.name}…`);
    const form = new FormData(); form.append('image', file);
    try {
      const res  = await fetch('/api/upload', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      setNewImgUrl(json.url); setUpState('done'); setUpMsg(file.name);
      adminToast.success('Uploaded — click "+ Add Image" to insert.');
    } catch (e: unknown) { setUpState('error'); setUpMsg(e instanceof Error ? e.message : 'Upload failed'); }
  };

  /* ── add video ── */
  const addVideo = () => {
    const title = newVidTitle.trim() || `Video ${media.videos.length + 1}`;
    if (newVidYt.trim()) {
      const id = extractYouTubeId(newVidYt.trim());
      if (!id) { adminToast.error('Could not parse YouTube ID.'); return; }
      setMedia(m => ({ ...m, videos: [...m.videos, { type: 'youtube', id, title }] }));
    } else if (newVidDirect.trim()) {
      const src = convertDriveLink(newVidDirect.trim());
      const entry: MediaVideo = { type: 'direct', src, title };
      if (newVidThumb.trim()) (entry as any).thumb = newVidThumb.trim();
      setMedia(m => ({ ...m, videos: [...m.videos, entry] }));
    } else { adminToast.error('Enter a YouTube URL or direct URL.'); return; }
    setNewVidYt(''); setNewVidDirect(''); setNewVidThumb(''); setNewVidTitle('');
    dirty(); adminToast.success('Video added.');
  };

  /* ── field helpers ── */
  const updateImageField = (idx: number, field: 'src' | 'alt' | 'category', val: string) => {
    setMedia(m => { const imgs = [...m.images]; imgs[idx] = { ...imgs[idx], [field]: val }; return { ...m, images: imgs }; });
    dirty();
  };
  const updateVideoField = (idx: number, field: 'url' | 'title', val: string) => {
    setMedia(m => {
      const vids = [...m.videos];
      if (field === 'title') { vids[idx] = { ...vids[idx], title: val }; }
      else {
        const ytId = extractYouTubeId(val);
        vids[idx] = ytId ? { type: 'youtube', id: ytId, title: vids[idx].title }
          : { type: 'direct', src: convertDriveLink(val), title: vids[idx].title };
      }
      return { ...m, videos: vids };
    });
    dirty();
  };

  /* ── dropzone classes ── */
  const dropZoneCls = isDragOver
    ? 'border-indigo-500/60 bg-indigo-500/[0.06] text-indigo-300'
    : uploadState === 'uploading' ? 'border-amber-500/40 bg-amber-500/[0.04] text-amber-400'
    : uploadState === 'done'      ? 'border-emerald-500/50 bg-emerald-500/[0.05] text-emerald-400'
    : uploadState === 'error'     ? 'border-red-500/50 bg-red-500/[0.05] text-red-400'
    : 'border-white/[0.08] text-slate-500 hover:border-indigo-500/30 hover:text-slate-400';

  /* ── NAV items ── */
  const NAV: [Tab, React.ReactNode, string, number][] = [
    ['images',    <Images size={15} />,     'Portfolio Images',  media.images.length],
    ['videos',    <PlaySquare size={15} />, 'Videos',            media.videos.length],
    ['home',      <Pencil size={15} />,     'Home',              0],
    ['about',     <User size={15} />,       'About Me',          0],
    ['contact',   <Mail size={15} />,       'Contact & Socials', 0],
    ['analytics', <Eye size={15} />,        'Analytics',         0],
    ['settings',  <Settings size={15} />,   'Settings',          0],
  ];

  return (
    <>
      <ConfirmModal
        open={confirm.open}
        title="Delete this item?"
        message={confirm.message}
        confirmLabel="Yes, delete"
        onConfirm={() => { confirm.onConfirm(); closeConfirm(); }}
        onCancel={closeConfirm}
      />

      <div className="flex min-h-screen font-poppins" style={{ background: '#0a0a0f', color: '#f1f5f9' }}>

        {/* ── SIDEBAR ── */}
        <aside className="w-56 flex-shrink-0 flex flex-col px-3 pt-6 pb-5 gap-1 sticky top-0 h-screen overflow-y-auto"
          style={{ background: '#0d0d15', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

          {/* Logo */}
          <div className="px-3 mb-5">
            <div className="font-rajdhani font-bold text-lg tracking-[3px] text-white">YAMLOK</div>
            <div className="text-[10px] tracking-[2px] uppercase text-indigo-400/60 mt-0.5">Admin Panel</div>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-0.5 flex-1">
            {NAV.map(([id, icon, label, count]) => (
              <button key={id} onClick={() => setTab(id)}
                className="text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2.5"
                style={tab === id
                  ? { background: 'rgba(99,102,241,0.12)', color: '#c7d2fe', borderLeft: '2px solid #6366f1' }
                  : { color: '#64748b' }}
                onMouseEnter={e => { if (tab !== id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
                onMouseLeave={e => { if (tab !== id) { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = '#64748b'; } }}>
                {icon} {label}
                <Badge n={count} />
              </button>
            ))}
          </nav>

          {/* Visitor count */}
          {visitorTotal !== null && (
            <button onClick={() => setTab('analytics')}
              className="mx-2 mb-2 rounded-xl px-3 py-2.5 flex items-center gap-2.5 w-[calc(100%-16px)] text-left transition-colors"
              style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.14)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.35)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.14)')}>
              <Eye size={13} className="text-indigo-400 flex-shrink-0" />
              <div>
                <div className="text-indigo-300 font-bold font-rajdhani text-base leading-none">{visitorTotal.toLocaleString()}</div>
                <div className="text-[10px] text-slate-600 mt-0.5 tracking-wide">visitors · view analytics</div>
              </div>
            </button>
          )}

          {/* Bottom actions */}
          <div className="flex flex-col gap-2 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <a href="/" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs transition-colors"
              style={{ color: '#475569' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#818cf8')}
              onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
              <ExternalLink size={11} /> View Site
            </a>
            <button onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all"
              style={{ border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}>
              <LogOut size={13} /> Logout
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Top bar */}
          <div className="sticky top-0 z-50 flex items-center justify-between px-8 py-3"
            style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="text-slate-600">Admin</span>
              <ChevronRight size={14} className="text-slate-700" />
              <span className="text-slate-300 capitalize">{tab}</span>
            </div>
            <div className="flex items-center gap-4">
              {isDirty && (
                <span className="text-amber-400/80 text-xs flex items-center gap-1.5">
                  <AlertTriangle size={13} /> Unsaved changes
                </span>
              )}
              <button onClick={save} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                style={{ background: '#6366f1', color: '#fff', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
                onMouseEnter={e => !saving && ((e.currentTarget as HTMLElement).style.background = '#818cf8')}
                onMouseLeave={e => !saving && ((e.currentTarget as HTMLElement).style.background = '#6366f1')}>
                <Save size={14} /> {saving ? 'Saving…' : 'Save & Publish'}
              </button>
            </div>
          </div>

          {/* ── IMAGES TAB ── */}
          {tab === 'images' && (
            <div className="p-8 flex flex-col gap-7 max-w-4xl">
              <SectionHead title="Portfolio Images" desc="Add by URL or upload a file. Drag rows to reorder." />

              <AddCard label="Add New Image">
                <div className="flex gap-4 flex-wrap">
                  <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                    <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Image URL</label>
                    <input type="url" value={newImgUrl} onChange={e => setNewImgUrl(e.target.value)}
                      placeholder="https://i.ibb.co/…" className={INPUT} />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
                    <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Caption</label>
                    <input type="text" value={newImgAlt} onChange={e => setNewImgAlt(e.target.value)}
                      placeholder="e.g. GTA V Edit" className={INPUT} />
                  </div>
                  <div className="flex flex-col gap-1.5" style={{ minWidth: '110px' }}>
                    <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Category</label>
                    <select value={newImgCat} onChange={e => setNewImgCat(e.target.value as ImageCategory)}
                      className={INPUT} style={{ background: '#0e0e16' }}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
                  <span className="text-[11px] uppercase tracking-widest text-slate-600">or upload a file</span>
                  <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
                </div>

                <label
                  className={`border-2 border-dashed rounded-xl p-6 text-center text-sm cursor-pointer transition-all ${dropZoneCls}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) uploadImage(f); }}>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ''; }} />
                  {uploadState === 'idle' && (
                    <div className="flex flex-col items-center gap-2">
                      <CloudUpload size={26} className="opacity-40" />
                      <span>Click or drag an image here</span>
                      <span className="text-[11px] opacity-40">PNG, JPG, WEBP — proxied → ImgBB</span>
                    </div>
                  )}
                  {uploadState === 'uploading' && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
                      <span>{uploadMsg}</span>
                    </div>
                  )}
                  {uploadState === 'done' && (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 size={22} />
                      <span className="font-semibold">{uploadMsg}</span>
                      <span className="text-[11px] opacity-60">URL filled above — click "+ Add Image" to insert</span>
                    </div>
                  )}
                  {uploadState === 'error' && (
                    <div className="flex flex-col items-center gap-2">
                      <XCircle size={22} />
                      <span className="font-semibold">Upload failed</span>
                      <span className="text-[11px] opacity-60">{uploadMsg}</span>
                    </div>
                  )}
                </label>

                <button onClick={addImage}
                  className="self-start flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{ background: '#6366f1', color: '#fff' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#818cf8')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#6366f1')}>
                  <PlusCircle size={14} /> Add Image
                </button>
              </AddCard>

              {/* List */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Current Images</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full text-slate-500"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {media.images.length}
                  </span>
                  <span className="ml-auto text-xs text-slate-600 flex items-center gap-1">
                    <GripVertical size={11} /> drag to reorder
                  </span>
                </div>
                {media.images.length === 0 ? (
                  <EmptyState icon={<Images size={24} />} title="No images yet"
                    subtitle="Add an image URL above or upload a file to get started." />
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onImageDragEnd}>
                    <SortableContext items={media.images.map(i => i.id)} strategy={verticalListSortingStrategy}>
                      <div className="flex flex-col gap-2">
                        {media.images.map((img, idx) => (
                          <SortableImageRow key={img.id} img={img}
                            onRemove={() => openConfirm(
                              `Remove "${img.alt || img.src.split('/').pop()}"? This cannot be undone.`,
                              () => { setMedia(m => ({ ...m, images: m.images.filter((_, i) => i !== idx) })); dirty(); }
                            )}
                            onChange={(f, v) => updateImageField(idx, f, v)} />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>
          )}

          {/* ── VIDEOS TAB ── */}
          {tab === 'videos' && (
            <div className="p-8 flex flex-col gap-7 max-w-4xl">
              <SectionHead title="Videos" desc="Add YouTube links or direct URLs. Drag to reorder." />

              <AddCard label="Add New Video">
                <div className="flex gap-4 flex-wrap">
                  <div className="flex flex-col gap-1.5 flex-1 min-w-[220px]">
                    <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                      YouTube URL <span className="normal-case tracking-normal font-normal text-slate-600">(e.g. youtu.be/ABC)</span>
                    </label>
                    <input type="text" value={newVidYt} onChange={e => setNewVidYt(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=…" className={INPUT} />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
                    <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Title</label>
                    <input type="text" value={newVidTitle} onChange={e => setNewVidTitle(e.target.value)}
                      placeholder="e.g. GTA V Cinematic Edit" className={INPUT} />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
                  <span className="text-[11px] uppercase tracking-widest text-slate-600">or direct video URL</span>
                  <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
                </div>

                <div className="flex gap-4 flex-wrap">
                  <div className="flex flex-col gap-1.5 flex-1 min-w-[220px]">
                    <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                      Direct URL <span className="normal-case tracking-normal font-normal text-slate-600">(Drive, Streamable…)</span>
                    </label>
                    <input type="url" value={newVidDirect} onChange={e => setNewVidDirect(e.target.value)}
                      placeholder="https://drive.google.com/…" className={INPUT} />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
                    <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                      Thumbnail <span className="normal-case tracking-normal font-normal text-slate-600">(optional)</span>
                    </label>
                    <input type="url" value={newVidThumb} onChange={e => setNewVidThumb(e.target.value)}
                      placeholder="https://…" className={INPUT} />
                  </div>
                </div>

                <button onClick={addVideo}
                  className="self-start flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{ background: '#6366f1', color: '#fff' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#818cf8')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#6366f1')}>
                  <PlusCircle size={14} /> Add Video
                </button>
              </AddCard>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Current Videos</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full text-slate-500"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {media.videos.length}
                  </span>
                  <span className="ml-auto text-xs text-slate-600 flex items-center gap-1">
                    <GripVertical size={11} /> drag to reorder
                  </span>
                </div>
                {media.videos.length === 0 ? (
                  <EmptyState icon={<PlaySquare size={24} />} title="No videos yet"
                    subtitle="Paste a YouTube link above and click '+ Add Video' to get started." />
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onVideoDragEnd}>
                    <SortableContext items={videoIds} strategy={verticalListSortingStrategy}>
                      <div className="flex flex-col gap-2">
                        {media.videos.map((vid, idx) => (
                          <SortableVideoRow key={videoIds[idx]} vid={vid} index={idx}
                            onRemove={() => openConfirm(
                              `Remove "${vid.title}"? This cannot be undone.`,
                              () => { setMedia(m => ({ ...m, videos: m.videos.filter((_, i) => i !== idx) })); dirty(); }
                            )}
                            onChange={(f, v) => updateVideoField(idx, f, v)} />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>
          )}

          {/* ── HOME TAB ── */}
          {tab === 'home' && (
            <div className="p-8 flex flex-col gap-7 max-w-3xl">
              <SectionHead title="Home" desc="Edit the hero section — badge, description, typewriter roles, and background image." />

              {/* Badge */}
              <AddCard label="Badge Text">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                    Badge <span className="normal-case tracking-normal font-normal text-slate-600">(shown above the name, leave blank to hide)</span>
                  </label>
                  <input
                    type="text"
                    value={hero.badge}
                    onChange={e => updateHeroField('badge', e.target.value)}
                    placeholder="Available for commissions"
                    className={INPUT}
                  />
                </div>
              </AddCard>

              {/* Description */}
              <AddCard label="Description">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                    Description <span className="normal-case tracking-normal font-normal text-slate-600">(shown below the typewriter, leave blank to hide)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={hero.description}
                    onChange={e => updateHeroField('description', e.target.value)}
                    placeholder="Crafting cinematic edits…"
                    className={INPUT + ' resize-y min-h-[72px]'}
                  />
                </div>
              </AddCard>

              {/* Typewriter Roles */}
              <AddCard label="Typewriter Roles">
                <p className="text-xs text-slate-600 -mt-2">These cycle one-by-one under the name.</p>
                <div className="flex flex-col gap-2">
                  {hero.roles.map((role, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={role}
                        onChange={e => {
                          const next = [...hero.roles];
                          next[i] = e.target.value;
                          updateHeroField('roles', next);
                        }}
                        className={INPUT}
                        placeholder="e.g. Cinematic Editor"
                      />
                      <button
                        onClick={() => updateHeroField('roles', hero.roles.filter((_, idx) => idx !== i))}
                        className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 text-red-400/50 hover:text-red-400 border border-transparent hover:border-red-800/50 hover:bg-red-950/40 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => updateHeroField('roles', [...hero.roles, ''])}
                    className="self-start flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all mt-1"
                    style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.18)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.1)')}>
                    <PlusCircle size={12} /> Add Role
                  </button>
                </div>
              </AddCard>

              {/* Background Image URL */}
              <AddCard label="Background Image">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                    Image URL <span className="normal-case tracking-normal font-normal text-slate-600">(leave blank for no background)</span>
                  </label>
                  <input
                    type="url"
                    value={hero.heroBg}
                    onChange={e => updateHeroField('heroBg', e.target.value)}
                    placeholder="https://i.ibb.co/…"
                    className={INPUT}
                  />
                  {hero.heroBg && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={hero.heroBg} alt="Hero background preview"
                      className="mt-2 rounded-lg object-cover w-full max-h-40"
                      style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0a0a0f' }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  )}
                </div>
              </AddCard>
            </div>
          )}

          {/* ── ABOUT TAB ── */}
          {tab === 'about' && (
            <div className="p-8 flex flex-col gap-7 max-w-3xl">
              <SectionHead title="About Me" desc="Edit the bio, skills, and info lines shown on the About section." />

              {/* Bio */}
              <AddCard label="Bio">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                    Bio <span className="normal-case tracking-normal font-normal text-slate-600">(HTML allowed, e.g. &lt;strong&gt;)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={about.bio}
                    onChange={e => updateAboutField('bio', e.target.value)}
                    placeholder="Hi — I'm…"
                    className={INPUT + ' resize-y min-h-[72px]'}
                  />
                </div>
              </AddCard>

              {/* Skills */}
              <AddCard label="Skills & Tools">
                <p className="text-xs text-slate-600 -mt-2">One skill per line. Emoji at the start is fine.</p>
                <div className="flex flex-col gap-2">
                  {about.skills.map((skill, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={skill}
                        onChange={e => {
                          const next = [...about.skills];
                          next[i] = e.target.value;
                          updateAboutField('skills', next);
                        }}
                        className={INPUT}
                        placeholder="e.g. 🎬 Video editing"
                      />
                      <button
                        onClick={() => {
                          updateAboutField('skills', about.skills.filter((_, idx) => idx !== i));
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 text-red-400/50 hover:text-red-400 border border-transparent hover:border-red-800/50 hover:bg-red-950/40 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => updateAboutField('skills', [...about.skills, ''])}
                    className="self-start flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all mt-1"
                    style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.18)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.1)')}>
                    <PlusCircle size={12} /> Add Skill
                  </button>
                </div>
              </AddCard>

              {/* Extra Lines */}
              <AddCard label="Info Lines">
                <p className="text-xs text-slate-600 -mt-2">These appear as bullet points. HTML allowed.</p>
                <div className="flex flex-col gap-2">
                  {about.extraLines.map((line, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <textarea
                        rows={2}
                        value={line}
                        onChange={e => {
                          const next = [...about.extraLines];
                          next[i] = e.target.value;
                          updateAboutField('extraLines', next);
                        }}
                        className={INPUT + ' resize-y'}
                        placeholder="Info line…"
                      />
                      <button
                        onClick={() => {
                          updateAboutField('extraLines', about.extraLines.filter((_, idx) => idx !== i));
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 mt-1 text-red-400/50 hover:text-red-400 border border-transparent hover:border-red-800/50 hover:bg-red-950/40 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => updateAboutField('extraLines', [...about.extraLines, ''])}
                    className="self-start flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all mt-1"
                    style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.18)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.1)')}>
                    <PlusCircle size={12} /> Add Line
                  </button>
                </div>
              </AddCard>
            </div>
          )}

          {/* ── CONTACT TAB ── */}
          {tab === 'contact' && (
            <div className="p-8 flex flex-col gap-7 max-w-3xl">
              <SectionHead title="Contact & Socials" desc="Edit email, Discord, social links, tagline, and pricing shown on the Contact section." />

              {/* Core contact */}
              <AddCard label="Contact Info">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Email</label>
                    <input type="email" value={contact.email}
                      onChange={e => updateContactField('email', e.target.value)}
                      placeholder="you@example.com" className={INPUT} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Discord Invite URL</label>
                    <input type="url" value={contact.discord}
                      onChange={e => updateContactField('discord', e.target.value)}
                      placeholder="https://discord.com/invite/…" className={INPUT} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                      Tagline <span className="normal-case tracking-normal font-normal text-slate-600">(shown under heading, leave blank to hide)</span>
                    </label>
                    <input type="text" value={contact.tagline}
                      onChange={e => updateContactField('tagline', e.target.value)}
                      placeholder="Ready to create something epic?" className={INPUT} />
                  </div>
                </div>
              </AddCard>

              {/* Pricing */}
              <AddCard label="Pricing">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Graphic Min (₹)</label>
                    <input type="text" value={contact.graphicMin}
                      onChange={e => updateContactField('graphicMin', e.target.value)}
                      placeholder="150" className={INPUT} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Graphic Max (₹)</label>
                    <input type="text" value={contact.graphicMax}
                      onChange={e => updateContactField('graphicMax', e.target.value)}
                      placeholder="300" className={INPUT} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Video Min (₹)</label>
                    <input type="text" value={contact.videoMin}
                      onChange={e => updateContactField('videoMin', e.target.value)}
                      placeholder="1500" className={INPUT} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Video Max (₹)</label>
                    <input type="text" value={contact.videoMax}
                      onChange={e => updateContactField('videoMax', e.target.value)}
                      placeholder="7000" className={INPUT} />
                  </div>
                </div>
              </AddCard>

              {/* Social links */}
              <AddCard label="Social Links">
                <p className="text-xs text-slate-600 -mt-2">These appear as cards on the Contact page and as icons in the header.</p>
                <div className="flex flex-col gap-3">
                  {contact.socials.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 flex-wrap">
                      <input type="text" value={s.title}
                        onChange={e => {
                          const next = [...contact.socials];
                          next[i] = { ...next[i], title: e.target.value };
                          updateContactField('socials', next);
                        }}
                        placeholder="Name (e.g. YouTube)" className={INPUT + ' w-28 flex-shrink-0'} style={{ maxWidth: '110px' }} />
                      <input type="text" value={s.label}
                        onChange={e => {
                          const next = [...contact.socials];
                          next[i] = { ...next[i], label: e.target.value };
                          updateContactField('socials', next);
                        }}
                        placeholder="Icon letter" className={INPUT + ' w-16 flex-shrink-0'} style={{ maxWidth: '64px' }} />
                      <input type="url" value={s.href}
                        onChange={e => {
                          const next = [...contact.socials];
                          next[i] = { ...next[i], href: e.target.value };
                          updateContactField('socials', next);
                        }}
                        placeholder="https://…" className={INPUT + ' flex-1 min-w-[140px]'} />
                      <button
                        onClick={() => updateContactField('socials', contact.socials.filter((_, idx) => idx !== i))}
                        className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 text-red-400/50 hover:text-red-400 border border-transparent hover:border-red-800/50 hover:bg-red-950/40 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => updateContactField('socials', [...contact.socials, { label: '', title: '', href: '' }])}
                    className="self-start flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all mt-1"
                    style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.18)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.1)')}>
                    <PlusCircle size={12} /> Add Social
                  </button>
                </div>
              </AddCard>
            </div>
          )}

          {/* ── ANALYTICS TAB ── */}
          {tab === 'analytics' && <AnalyticsPanel logs={visitorLogs} />}

          {/* ── SETTINGS TAB ── */}
          {tab === 'settings' && (
            <div className="p-8 flex flex-col gap-7 max-w-4xl">
              <SectionHead title="Settings"
                desc="All credentials live in .env.local on your server — never in the browser." />

              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                {[
                  {
                    icon: <GitBranch size={16} />, title: 'GitHub Publishing',
                    body: <>Set <code>GITHUB_TOKEN</code>, <code>GITHUB_REPO</code>, and <code>GITHUB_BRANCH</code> in <strong>.env.local</strong>. "Save &amp; Publish" will push <code>public/media.json</code> to your repo.</>,
                    link: { href: 'https://github.com/settings/tokens/new?scopes=repo', label: 'Create a GitHub token' },
                  },
                  {
                    icon: <Upload size={16} />, title: 'Image Upload (ImgBB)',
                    body: <>Set <code>IMGBB_API_KEY</code> in <strong>.env.local</strong>. Files are proxied through your server — your key is never exposed to the browser.</>,
                    link: { href: 'https://api.imgbb.com/', label: 'Get a free ImgBB key' },
                  },
                  {
                    icon: <Pencil size={16} />, title: 'Site Text & Config',
                    body: <>Edit <code>src/lib/siteConfig.ts</code> to change the name, bio, social links, and section headings. Every field is clearly labeled.</>,
                    link: null,
                  },
                  {
                    icon: <Lock size={16} />, title: 'Change Password',
                    body: <>Use the <strong>Forgot Password?</strong> link on the login page with your <code>RESET_TOKEN</code> to set a new password without restarting the server. Or edit <code>ADMIN_PASSWORD</code> in <strong>.env.local</strong> directly.</>,
                    link: null,
                  },
                ].map(card => (
                  <div key={card.title} className="rounded-xl p-5 flex flex-col gap-3"
                    style={{ background: '#0e0e16', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2 text-indigo-400">
                      {card.icon}
                      <h3 className="font-rajdhani font-bold tracking-wide text-white text-base">{card.title}</h3>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed [&_code]:bg-indigo-500/10 [&_code]:text-indigo-300 [&_code]:px-1 [&_code]:rounded [&_strong]:text-slate-400">
                      {card.body}
                    </p>
                    {card.link && (
                      <a href={card.link.href} target="_blank" rel="noopener"
                        className="text-indigo-400 text-xs hover:underline flex items-center gap-1 mt-1">
                        <ExternalLink size={11} /> {card.link.label}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
