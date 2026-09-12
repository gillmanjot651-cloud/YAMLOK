import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ImgBB API key not configured on server.' }, { status: 503 });
  }

  const formData = await req.formData();
  const file = formData.get('image') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  const upload = new FormData();
  upload.append('key', apiKey);
  upload.append('image', file);

  const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: upload });
  const json = await res.json();

  if (!json.success) {
    return NextResponse.json({ error: json.error?.message || 'ImgBB upload failed.' }, { status: 502 });
  }

  return NextResponse.json({ url: json.data.url, thumb: json.data.thumb?.url });
}
