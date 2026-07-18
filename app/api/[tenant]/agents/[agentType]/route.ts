import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: {
    tenant: string;
    agentType: string;
  };
}

/**
 * PATCH /api/[tenant]/agents/[agentType]
 * Toggle an agent on/off
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { tenant: tenantSlug, agentType } = params;
    const body = await req.json();
    const { status } = body; // "ENABLED" or "DISABLED"

    if (!['ENABLED', 'DISABLED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be ENABLED or DISABLED' },
        { status: 400 }
      );
    }

    // Find tenant
    const tenant = await db.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Find and update agent
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

    const updatedAgent = await db.agent.update({
      where: { id: agent.id },
      data: { status },
      include: {
        attributes: true,
      },
    });

    return NextResponse.json(updatedAgent);
  } catch (error) {
    console.error('[PATCH /api/[tenant]/agents/[agentType]] Error:', error);
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
  }
}
