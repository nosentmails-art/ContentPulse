import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/db';

/**
 * GET /api/[slug]/connect/status
 * Per-channel import status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tenant: string } }
) {
  try {
    const slug = params.tenant;

    // Resolve slug to tenant
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    const tenantId = tenant.id;

    // Get content items grouped by channel
    const channels = [
      'LINKEDIN',
      'YOUTUBE',
      'BLOG',
      'EMAIL_NEWSLETTER',
      'REDDIT',
      'GOOGLE_PPC',
    ];

    const channelStatus = await Promise.all(
      channels.map(async (channel) => {
        const items = await prisma.contentItem.findMany({
          where: {
            tenantId,
            channel,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        });

        const rowCount = await prisma.contentItem.count({
          where: {
            tenantId,
            channel,
          },
        });

        return {
          channel,
          rowCount,
          lastImport: items[0]?.createdAt || null,
        };
      })
    );

    return NextResponse.json({
      channels: channelStatus,
    });
  } catch (error) {
    console.error('Error in GET /api/[tenant]/connect/status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
