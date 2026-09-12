import { readFile } from 'fs/promises';
import path from 'path';
import type { MediaData } from '@/types/media';
import PortfolioSection from '@/components/sections/PortfolioSection';

export const metadata = { title: 'YAMLOK — Portfolio' };

async function getImages() {
  try {
    const raw = await readFile(path.join(process.cwd(), 'public', 'media.json'), 'utf-8');
    return (JSON.parse(raw) as MediaData).images;
  } catch { return []; }
}

export default async function PortfolioPage() {
  const images = await getImages();
  return (
    <div className="px-6 md:px-12 py-14" style={{ minHeight: 'calc(100vh - 130px)' }}>
      <PortfolioSection images={images} />
    </div>
  );
}
