'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  /* close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  const isDanger  = variant === 'danger';
  const accentClr = isDanger ? '#ef4444' : '#f59e0b';
  const accentBg  = isDanger ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)';
  const confirmCls = isDanger
    ? 'bg-red-600 hover:bg-red-500 text-white border-red-500'
    : 'bg-amber-500 hover:bg-amber-400 text-black border-amber-400';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[9000] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onCancel}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            className="fixed inset-0 z-[9001] flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            <div
              className="pointer-events-auto relative w-full max-w-sm rounded-xl border p-6 shadow-2xl font-poppins"
              style={{
                background: 'rgba(10,13,20,0.97)',
                borderColor: accentClr + '44',
                boxShadow: `0 0 40px ${accentClr}22, 0 20px 60px rgba(0,0,0,0.8)`,
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onCancel}
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded text-white/30
                           hover:text-white/70 hover:bg-white/[0.06] transition-colors"
              >
                <X size={14} />
              </button>

              {/* Icon + title */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: accentBg, color: accentClr }}
                >
                  {isDanger ? <Trash2 size={17} /> : <AlertTriangle size={17} />}
                </div>
                <h2
                  className="font-rajdhani font-bold text-lg tracking-wider text-white"
                  style={{ textShadow: `0 0 16px ${accentClr}55` }}
                >
                  {title}
                </h2>
              </div>

              {/* Divider */}
              <div
                className="h-px mb-4"
                style={{ background: `linear-gradient(to right, ${accentClr}33, transparent)` }}
              />

              {/* Message */}
              <p className="text-white/55 text-sm leading-relaxed mb-6">{message}</p>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 rounded text-sm font-semibold text-white/50 border border-white/10
                             hover:text-white hover:border-white/25 hover:bg-white/[0.04] transition-all"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  className={`px-4 py-2 rounded text-sm font-bold border transition-all ${confirmCls}`}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
