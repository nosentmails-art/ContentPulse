import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../../lib/db';
import {
  analyzeAudienceIntelligence,
  analyzeChannelIntelligence,
  analyzeSentiment,
  analyzeCompetitors,
  identifyOpportunities,
  analyzeGapAnalysis,
} from '../../../../../../lib/agents';

/**
 * POST /api/[slug]/agents/[agentType]/run
 * Execute agent analysis
 */
export async function POST(
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
      include: { attributes: true },
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Check if agent is enabled
    if (!agent.enabled) {
      return NextResponse.json(
        { error: 'Agent is disabled' },
        { status: 400 }
      );
    }

    // Create AgentRun with status RUNNING
    const run = await prisma.agentRun.create({
      data: {
        agentId: agent.id,
        status: 'RUNNING',
      },
    });

    // Get enabled attributes
    const enabledAttributes = agent.attributes
      .filter((attr) => attr.enabled)
      .map((attr) => attr.key);

    try {
      let result;

      // Call appropriate analyzer based on agent type
      switch (agentType) {
        case 'AUDIENCE_INTELLIGENCE':
          result = await analyzeAudienceIntelligence(tenantId, enabledAttributes);
          break;
        case 'CHANNEL_CONTENT_INTELLIGENCE':
          result = await analyzeChannelIntelligence(tenantId, enabledAttributes);
          break;
        case 'SENTIMENT_ANALYSIS':
          result = await analyzeSentiment(tenantId, enabledAttributes);
          break;
        case 'COMPETITOR_ANALYSIS':
          result = await analyzeCompetitors(tenantId, enabledAttributes);
          break;
        case 'OPPORTUNITY_IDENTIFICATION':
          result = await identifyOpportunities(tenantId, enabledAttributes);
          break;
        case 'GAP_ANALYSIS':
          result = await analyzeGapAnalysis(tenantId, enabledAttributes);
          break;
        case 'CONTENT_ANALYTICS':
          // Compute real metrics from database
          const contentItems = await prisma.contentItem.findMany({
            where: { tenantId },
            include: { metrics: true },
          });

          let totalImpressions = 0;
          let totalEngagement = 0;
          let totalConversions = 0;
          const channelMetrics: Record<string, { count: number; engagement: number }> = {};

          for (const item of contentItems) {
            if (item.metrics) {
              totalImpressions += item.metrics.impressions || 0;
              totalEngagement +=
                (item.metrics.likes || 0) +
                (item.metrics.comments || 0) +
                (item.metrics.shares || 0);
              totalConversions += item.metrics.conversions || 0;

              if (!channelMetrics[item.channel]) {
                channelMetrics[item.channel] = { count: 0, engagement: 0 };
              }
              channelMetrics[item.channel].count++;
              channelMetrics[item.channel].engagement +=
                (item.metrics.likes || 0) +
                (item.metrics.comments || 0) +
                (item.metrics.shares || 0);
            }
          }

          const topChannel = Object.entries(channelMetrics).sort(
            (a, b) => b[1].engagement - a[1].engagement
          )[0];

          result = {
            success: true,
            data: {
              summary: `Analyzed ${contentItems.length} content pieces across ${
                Object.keys(channelMetrics).length
              } channels. Total engagement: ${totalEngagement.toFixed(0)}.`,
              metrics: {
                totalContent: contentItems.length,
                totalImpressions: totalImpressions.toFixed(0),
                totalEngagement: totalEngagement.toFixed(0),
                averageEngagement: (
                  totalEngagement / Math.max(contentItems.length, 1)
                ).toFixed(1),
                totalConversions: totalConversions.toFixed(0),
                topChannel: topChannel ? topChannel[0] : 'N/A',
                channels: Object.entries(channelMetrics).map(([channel, data]) => ({
                  channel,
                  count: data.count,
                  engagement: data.engagement.toFixed(0),
                })),
              },
            },
          };
          break;
        default:
          throw new Error(`Unknown agent type: ${agentType}`);
      }

      // Update AgentRun with result
      const completedRun = await prisma.agentRun.update({
        where: { id: run.id },
        data: {
          status: result.success ? 'COMPLETED' : 'ERROR',
          completedAt: new Date(),
          resultJson: JSON.stringify(result.data || {}),
          logs: result.error || undefined,
        },
      });

      // Update Agent lastRun
      await prisma.agent.update({
        where: { id: agent.id },
        data: { lastRun: new Date() },
      });

      if (!result.success) {
        return NextResponse.json(
          {
            runId: completedRun.id,
            status: 'ERROR',
            error: result.error,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        runId: completedRun.id,
        status: 'COMPLETED',
        result: result.data,
      });
    } catch (error) {
      // Update AgentRun status to ERROR
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error executing agent ${agentType}:`, error);

      await prisma.agentRun.update({
        where: { id: run.id },
        data: {
          status: 'ERROR',
          completedAt: new Date(),
          logs: errorMessage,
        },
      });

      return NextResponse.json(
        {
          runId: run.id,
          status: 'ERROR',
          error: errorMessage,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/[tenant]/agents/[agentType]/run:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
