import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: {
    tenant: string;
  };
}

/**
 * GET /api/[tenant]/connect/status
 * Fetch connector status (how many items have been uploaded)
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { tenant: tenantSlug } = params;

    // Find tenant
    const tenant = await db.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Count content items by channel
    const contentByChannel = await db.contentItem.groupBy({
      by: ['channel'],
      where: { tenantId: tenant.id },
      _count: {
        id: true,
      },
    });

    const channelMetrics = await db.channelMetrics.findMany({
      where: { tenantId: tenant.id },
      select: {
        channel: true,
        period: true,
        data: true,
      },
    });

    return NextResponse.json({
      connected: contentByChannel.length > 0,
      contentItemsCount: contentByChannel.reduce((sum, c) => sum + c._count.id, 0),
      channels: contentByChannel.map((c) => ({
        name: c.channel,
        count: c._count.id,
      })),
      metrics: channelMetrics,
    });
  } catch (error) {
    console.error('[GET /api/[tenant]/connect/status] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch connector status' }, { status: 500 });
  }
}
