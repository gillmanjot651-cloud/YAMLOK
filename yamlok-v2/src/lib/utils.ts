import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Extract YouTube video ID from any YouTube URL or bare 11-char ID */
export function extractYouTubeId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m =
    s.match(/youtu\.be\/([\w-]{11})/) ||
    s.match(/(?:v=|\/embed\/|\/shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}

/** Convert a Google Drive share link to an embeddable preview URL */
export function convertDriveLink(url: string): string {
  const m = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  return m ? `https://drive.google.com/file/d/${m[1]}/preview` : url;
}

/** Simple HTML-attribute escaper */
export function escAttr(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
