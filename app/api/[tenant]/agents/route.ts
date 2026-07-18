import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/db';

/**
 * GET /api/[slug]/agents
 * Returns all agents with attributes + latest run status for tenant
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

    // Fetch all agents with attributes for this tenant
    const agents = await prisma.agent.findMany({
      where: { tenantId },
      include: {
        attributes: true,
        runs: {
          orderBy: { startedAt: 'desc' },
          take: 1,
        },
      },
    });

    // Map to response format with latestRun
    const agentsWithLatestRun = agents.map((agent) => ({
      ...agent,
      latestRun: agent.runs[0] || null,
      runs: undefined,
    }));

    return NextResponse.json({
      agents: agentsWithLatestRun,
    });
  } catch (error) {
    console.error('Error in GET /api/[tenant]/agents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
