import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * PATCH /api/[slug]/agents/[agentType]/attributes/[key]
 * Toggle individual attribute
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { tenant: string; agentType: string; key: string } }
) {
  try {
    const slug = params.tenant;
    const { agentType, key } = params;

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

    // Parse request body
    const body = await request.json();
    const { enabled } = body;

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'enabled must be a boolean' },
        { status: 400 }
      );
    }

    // Find agent
    const agent = await prisma.agent.findUnique({
      where: {
        tenantId_type: {
          tenantId,
          type: agentType,
        },
      },
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Find and update attribute
    const attribute = await prisma.agentAttribute.findFirst({
      where: {
        agentId: agent.id,
        key,
      },
    });

    if (!attribute) {
      return NextResponse.json(
        { error: 'Attribute not found' },
        { status: 404 }
      );
    }

    const updatedAttribute = await prisma.agentAttribute.update({
      where: { id: attribute.id },
      data: { enabled },
    });

    return NextResponse.json({
      success: true,
      attribute: updatedAttribute,
    });
  } catch (error) {
    console.error('Error in PATCH /api/[tenant]/agents/[agentType]/attributes/[key]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
