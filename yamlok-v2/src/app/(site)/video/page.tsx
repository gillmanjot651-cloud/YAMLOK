import type { MediaData } from '@/types/media';
import VideoSection from '@/components/sections/VideoSection';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'YAMLOK — Videos' };

async function getVideos() {
  try {
    const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res  = await fetch(`${base}/api/media`, { cache: 'no-store' });
    if (!res.ok) return [];
    return ((await res.json()) as MediaData).videos;
  } catch { return []; }
}

export default async function VideoPage() {
  const videos = await getVideos();
  return (
    <div className="px-6 md:px-12 py-14" style={{ minHeight: 'calc(100vh - 130px)' }}>
      <VideoSection videos={videos} />
    </div>
  );
}
