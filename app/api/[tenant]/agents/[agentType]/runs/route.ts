import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: {
    tenant: string;
    agentType: string;
  };
}

/**
 * GET /api/[tenant]/agents/[agentType]/runs/latest
 * Fetch the latest run for an agent (for status polling)
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { tenant: tenantSlug, agentType } = params;

    // Find tenant
    const tenant = await db.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Find agent
    const agent = await db.agent.findUnique({
      where: {
        tenantId_type: {
          tenantId: tenant.id,
          type: agentType,
        },
      },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Fetch latest run
    const latestRun = await db.agentRun.findFirst({
      where: { agentId: agent.id },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestRun) {
      return NextResponse.json(
        { status: 'no_runs', message: 'No runs yet' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: latestRun.id,
      status: latestRun.status,
      result: latestRun.result ? JSON.parse(latestRun.result) : null,
      error: latestRun.error,
      startedAt: latestRun.startedAt,
      endedAt: latestRun.endedAt,
    });
  } catch (error) {
    console.error('[GET /api/[tenant]/agents/[agentType]/runs/latest] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch run status' }, { status: 500 });
  }
}
