import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: {
    tenant: string;
    agentType: string;
    key: string;
  };
}

/**
 * PATCH /api/[tenant]/agents/[agentType]/attributes/[key]
 * Toggle an agent attribute on/off
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { tenant: tenantSlug, agentType, key } = params;
    const body = await req.json();
    const { value } = body; // boolean

    if (typeof value !== 'boolean') {
      return NextResponse.json({ error: 'Invalid value. Must be boolean' }, { status: 400 });
    }

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

    // Find and update attribute
    const attribute = await db.agentAttribute.findUnique({
      where: {
        agentId_key: {
          agentId: agent.id,
          key,
        },
      },
    });

    if (!attribute) {
      return NextResponse.json({ error: 'Attribute not found' }, { status: 404 });
    }

    const updatedAttribute = await db.agentAttribute.update({
      where: { id: attribute.id },
      data: { value },
    });

    return NextResponse.json(updatedAttribute);
  } catch (error) {
    console.error('[PATCH /api/[tenant]/agents/[agentType]/attributes/[key]] Error:', error);
    return NextResponse.json({ error: 'Failed to update attribute' }, { status: 500 });
  }
}
