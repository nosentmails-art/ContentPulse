import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: {
    tenant: string;
  };
}

/**
 * GET /api/[tenant]/agents
 * Fetch all agents with their attributes and latest run status
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { tenant: tenantSlug } = params;

    // Find tenant by slug
    const tenant = await db.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Fetch all agents with their attributes and latest run
    const agents = await db.agent.findMany({
      where: { tenantId: tenant.id },
      include: {
        attributes: {
          select: {
            id: true,
            key: true,
            label: true,
            value: true,
          },
        },
        runs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            status: true,
            result: true,
            error: true,
            startedAt: true,
            endedAt: true,
          },
        },
      },
      orderBy: { type: 'asc' },
    });

    return NextResponse.json(agents);
  } catch (error) {
    console.error('[GET /api/[tenant]/agents] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}
