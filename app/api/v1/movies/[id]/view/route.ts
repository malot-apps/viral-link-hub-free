import { NextRequest, NextResponse } from 'next/server';
import { incrementVideoViewCount, fetchVideoById } from '@/lib/data-service';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const video = await fetchVideoById(id);

    if (!video) {
      return NextResponse.json({ success: false, error: 'Video not found' }, { status: 404 });
    }

    const newViews = await incrementVideoViewCount(id);

    return NextResponse.json({
      success: true,
      viewsCount: newViews,
    });
  } catch (error: any) {
    console.error('[Movie View Error]:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to record view' },
      { status: 500 }
    );
  }
}
