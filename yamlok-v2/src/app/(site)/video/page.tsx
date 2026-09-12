import { readFile } from 'fs/promises';
import path from 'path';
import type { MediaData } from '@/types/media';
import VideoSection from '@/components/sections/VideoSection';

export const metadata = { title: 'YAMLOK — Videos' };

async function getVideos() {
  try {
    const raw = await readFile(path.join(process.cwd(), 'public', 'media.json'), 'utf-8');
    return (JSON.parse(raw) as MediaData).videos;
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
