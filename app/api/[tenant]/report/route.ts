import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/db';

/**
 * GET /api/[tenant]/report
 * Returns aggregated, synthesized acquisition-focused report
 * Combines all agent insights into strategic summary
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tenant: string } }
) {
  try {
    // Resolve tenant from path parameter
    const tenant = params.tenant;

    // Resolve tenant to tenant record
    const tenantRecord = await prisma.tenant.findUnique({
      where: { slug: tenant },
    });

    if (!tenantRecord) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Get all agents with latest completed runs
    const agents = await prisma.agent.findMany({
      where: { tenantId: tenantRecord.id },
      include: {
        runs: {
          where: { status: 'COMPLETED' },
          orderBy: { completedAt: 'desc' },
          take: 1,
        },
      },
    });

    // Parse agent results
    const agentReports = agents
      .filter((agent) => agent.runs.length > 0)
      .map((agent) => {
        const latestRun = agent.runs[0];
        let result = null;
        if (latestRun.resultJson) {
          try {
            result = JSON.parse(latestRun.resultJson);
          } catch {
            result = { error: 'parse error' };
          }
        }
        return {
          type: agent.type,
          name: agent.name,
          status: latestRun.status,
          lastRun: latestRun.completedAt,
          result,
        };
      });

    // Build synthesized acquisition-focused summary
    const synthesis = synthesizeReport(agentReports);

    return NextResponse.json({
      tenant: {
        id: tenantRecord.id,
        slug: tenantRecord.slug,
        name: tenantRecord.name,
      },
      synthesis,
      agents: agentReports,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in GET /api/[tenant]/report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Synthesizes agent results into acquisition-focused insights
 */
function synthesizeReport(agentReports: any[]): {
  acquisitionStrategy: string;
  priorityOpportunities: any[];
  nextActions: string[];
  keyMetrics: any;
} {
  const synthesis = {
    acquisitionStrategy: '',
    priorityOpportunities: [] as any[],
    nextActions: [] as string[],
    keyMetrics: {
      topPerformingChannel: 'N/A',
      strongestAudienceSegment: 'N/A',
      contentGapOpportunity: 'N/A',
    },
  };

  // Extract insights from each agent
  for (const report of agentReports) {
    if (!report.result) continue;

    switch (report.type) {
      case 'CONTENT_ANALYTICS':
        if (report.result.metrics?.topChannel) {
          synthesis.keyMetrics.topPerformingChannel = report.result.metrics.topChannel;
        }
        break;

      case 'AUDIENCE_INTELLIGENCE':
        if (report.result.segments?.[0]) {
          synthesis.keyMetrics.strongestAudienceSegment = report.result.segments[0].name;
        }
        break;

      case 'CHANNEL_CONTENT_INTELLIGENCE':
        if (report.result.topCombo) {
          synthesis.priorityOpportunities.push({
            type: 'Channel-Format Combo',
            recommendation: `Double down on ${report.result.topCombo.format} on ${report.result.topCombo.channel}`,
            reason: report.result.topCombo.reason,
            priority: 'high',
          });
        }
        break;

      case 'SENTIMENT_ANALYSIS':
        if (report.result.actionableInsight) {
          synthesis.nextActions.push(`Sentiment: ${report.result.actionableInsight}`);
        }
        break;

      case 'GAP_ANALYSIS':
        if (report.result.topGaps?.[0]) {
          synthesis.keyMetrics.contentGapOpportunity = report.result.topGaps[0];
          synthesis.priorityOpportunities.push({
            type: 'Content Gap',
            recommendation: report.result.topRecommendation,
            priority: 'high',
          });
        }
        break;

      case 'COMPETITOR_ANALYSIS':
        if (report.result.gaps?.[0]) {
          synthesis.priorityOpportunities.push({
            type: 'Competitive Gap',
            recommendation: `Address: ${report.result.gaps[0].topic}`,
            reason: report.result.gaps[0].opportunity,
            priority: 'medium',
          });
        }
        break;

      case 'OPPORTUNITY_IDENTIFICATION':
        if (report.result.opportunities?.[0]) {
          synthesis.priorityOpportunities.push({
            type: 'Market Opportunity',
            recommendation: report.result.opportunities[0].suggestedTitle,
            reason: report.result.opportunities[0].reason,
            priority: report.result.opportunities[0].urgency === 'hot' ? 'critical' : 'high',
          });
        }
        if (report.result.priorityAction) {
          synthesis.nextActions.push(`Priority: ${report.result.priorityAction}`);
        }
        break;
    }
  }

  // Sort opportunities by priority
  const priorityMap = { critical: 0, high: 1, medium: 2, low: 3 };
  synthesis.priorityOpportunities.sort(
    (a, b) => (priorityMap[a.priority as keyof typeof priorityMap] ?? 99) - (priorityMap[b.priority as keyof typeof priorityMap] ?? 99)
  );

  // Build synthesis narrative
  if (synthesis.priorityOpportunities.length > 0) {
    const topOpp = synthesis.priorityOpportunities[0];
    synthesis.acquisitionStrategy = `Focus on ${topOpp.recommendation}. This is a high-ROI opportunity based on audience response and channel performance data. Secondary focus: address content gaps in ${synthesis.keyMetrics.contentGapOpportunity || 'emerging topics'}.`;
  } else {
    synthesis.acquisitionStrategy =
      'All agents have been executed. Review individual agent insights below for strategy recommendations.';
  }

  return synthesis;
}
