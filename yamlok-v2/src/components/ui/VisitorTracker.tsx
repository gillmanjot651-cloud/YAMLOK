'use client';
import { useEffect } from 'react';

/** Fires a single POST /api/visitors once per browser session, sending today's date. */
export default function VisitorTracker() {
  useEffect(() => {
    if (sessionStorage.getItem('visited')) return;
    sessionStorage.setItem('visited', '1');
    const date = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    fetch('/api/visitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    }).catch(() => {});
  }, []);
  return null;
}
