import { NextRequest, NextResponse } from 'next/server';
import { incrementVideoViews, getVideoById } from '@/lib/db-store';
import { handleRequestMetrics } from '@/lib/extract-client';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  handleRequestMetrics(req);
  const { id } = await params;
  const video = getVideoById(id);

  if (!video) {
    return NextResponse.json({ success: false, error: 'Video not found' }, { status: 404 });
  }

  const newViews = incrementVideoViews(id);

  return NextResponse.json({
    success: true,
    viewsCount: newViews,
  });
}
