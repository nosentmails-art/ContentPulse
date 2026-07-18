import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * GET /api/[slug]/agents/[agentType]/runs/latest
 * Get latest AgentRun with resultJson for this agent
 */
export async function GET(
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

    // Get latest run
    const latestRun = await prisma.agentRun.findFirst({
      where: { agentId: agent.id },
      orderBy: { startedAt: 'desc' },
      take: 1,
    });

    return NextResponse.json({
      run: latestRun || null,
    });
  } catch (error) {
    console.error('Error in GET /api/[tenant]/agents/[agentType]/runs/latest:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
