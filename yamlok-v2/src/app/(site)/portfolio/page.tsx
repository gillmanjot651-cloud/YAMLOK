import type { MediaData } from '@/types/media';
import PortfolioSection from '@/components/sections/PortfolioSection';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'YAMLOK — Portfolio' };

async function getImages() {
  try {
    const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res  = await fetch(`${base}/api/media`, { cache: 'no-store' });
    if (!res.ok) return [];
    return ((await res.json()) as MediaData).images;
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
