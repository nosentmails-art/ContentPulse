import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: {
    tenant: string;
    agentType: string;
  };
}

/**
 * POST /api/[tenant]/agents/[agentType]/run
 * Trigger an agent run with current content data
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
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
      include: {
        attributes: true,
      },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (agent.status !== 'ENABLED') {
      return NextResponse.json({ error: 'Agent is disabled' }, { status: 400 });
    }

    // Create a new run record
    const run = await db.agentRun.create({
      data: {
        agentId: agent.id,
        status: 'pending',
      },
    });

    // TODO: Trigger the actual agent analyzer (async)
    // This will be implemented in the agents/ module

    return NextResponse.json(
      {
        id: run.id,
        status: 'pending',
        message: 'Agent run queued. Check /api/[tenant]/agents/[agentType]/runs/latest for status.',
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('[POST /api/[tenant]/agents/[agentType]/run] Error:', error);
    return NextResponse.json({ error: 'Failed to run agent' }, { status: 500 });
  }
}
