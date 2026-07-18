import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/db';

/**
 * PATCH /api/[slug]/agents/[agentType]
 * Toggle master agent enabled/disabled
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { tenant: string; agentType: string } }
) {
  try {
    const slug = params.tenant;
    const { agentType } = params;

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

    // Find and update agent
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

    const updatedAgent = await prisma.agent.update({
      where: { id: agent.id },
      data: { enabled },
    });

    return NextResponse.json({
      success: true,
      agent: updatedAgent,
    });
  } catch (error) {
    console.error('Error in PATCH /api/[tenant]/agents/[agentType]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
