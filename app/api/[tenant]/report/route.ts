import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: {
    tenant: string;
  };
}

/**
 * GET /api/[tenant]/report
 * Fetch the aggregated intelligence report from all agents
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { tenant: tenantSlug } = params;

    // Find tenant
    const tenant = await db.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Fetch all completed agent runs with their results
    const agentRuns = await db.agentRun.findMany({
      where: {
        agent: {
          tenantId: tenant.id,
        },
        status: 'completed',
      },
      include: {
        agent: {
          select: {
            type: true,
          },
        },
      },
      orderBy: {
        endedAt: 'desc',
      },
    });

    // Parse results and organize by agent type
    const report: Record<string, any> = {
      tenantId: tenant.id,
      tenantName: tenant.name,
      generatedAt: new Date().toISOString(),
      agents: {},
    };

    for (const run of agentRuns) {
      const agentType = run.agent.type;
      if (!report.agents[agentType]) {
        report.agents[agentType] = {
          latestRun: null,
          insights: [],
        };
      }

      if (run.result && !report.agents[agentType].latestRun) {
        report.agents[agentType].latestRun = {
          completedAt: run.endedAt,
          insights: JSON.parse(run.result),
        };
      }
    }

    // Fetch content statistics
    const contentStats = await db.contentItem.groupBy({
      by: ['channel'],
      where: { tenantId: tenant.id },
      _count: {
        id: true,
      },
    });

    report.contentStatistics = contentStats.map((stat) => ({
      channel: stat.channel,
      itemCount: stat._count.id,
    }));

    // Fetch competitors
    const competitors = await db.competitor.findMany({
      where: { tenantId: tenant.id },
      select: {
        id: true,
        name: true,
        url: true,
        notes: true,
      },
    });

    report.competitors = competitors;

    return NextResponse.json(report);
  } catch (error) {
    console.error('[GET /api/[tenant]/report] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
  }
}
