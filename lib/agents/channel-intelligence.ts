/**
 * Channel Intelligence Agent
 * Analyzes channel performance and content format performance by channel.
 */

import prisma from '../db';
import { mockLLMAnalyze } from './llm-helper';

type ContentWithMetrics = {
  channel: string;
  title: string | null;
  contentType: string | null;
  metrics: any;
};

interface ContentTypeStats {
  count: number;
  avgEngagement: number;
  avgReach: number;
  engagementRate: string;
  formatPerformance: number;
}

interface ChannelStats {
  metrics: {
    totalContent: number;
    totalReach: number;
    totalEngagement: number;
    avgReach: number;
    avgEngagement: number;
    avgEngagementRate: number;
    conversions: number;
    leadsGenerated: number;
    websiteClicks: number;
    topPerformer: {
      title: string;
      contentType: string;
      engagement: number;
    } | null;
  };
  performanceScore: number;
  contentTypes: Record<string, ContentTypeStats>;
}

export interface ChannelIntelligenceResult {
  summary: string;
  channels: Record<string, ChannelStats>;
  recommendations: Array<{
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    why: string;
    action: string;
    affectedChannels: string[];
  }>;
  topCombo: { format: string; channel: string; reason: string } | null;
  avoidCombo: { format: string; channel: string; reason: string } | null;
}

export interface AgentResult {
  success: boolean;
  data?: ChannelIntelligenceResult;
  error?: string;
}

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function engagementFor(item: ContentWithMetrics): number {
  const metrics = item.metrics || {};
  return (
    toNumber(metrics.likes) +
    toNumber(metrics.comments) +
    toNumber(metrics.shares) +
    toNumber(metrics.upvotes) +
    toNumber(metrics.clicks) +
    toNumber(metrics.conversions) +
    toNumber(metrics.leadsGenerated) +
    toNumber(metrics.subscribersGained)
  );
}

function reachFor(item: ContentWithMetrics): number {
  const metrics = item.metrics || {};
  return (
    toNumber(metrics.impressions) ||
    toNumber(metrics.reach) ||
    toNumber(metrics.views) ||
    toNumber(metrics.sessions) ||
    0
  );
}

function calculatePerformanceScore(totalContent: number, engagementRate: number, acquisitionSignals: number): number {
  let score = 5;
  if (engagementRate > 10) score += 3;
  else if (engagementRate > 5) score += 2;
  else if (engagementRate > 2) score += 1;
  else score -= 1;

  if (totalContent > 20) score += 1;
  else if (totalContent < 3) score -= 1;

  if (acquisitionSignals > 25) score += 1;
  else if (acquisitionSignals === 0) score -= 0.5;

  return Math.max(0, Math.min(10, Number(score.toFixed(1))));
}

function formatRate(engagement: number, reach: number): string {
  if (reach <= 0) return '0.00%';
  return `${((engagement / reach) * 100).toFixed(2)}%`;
}

function buildChannelStats(items: ContentWithMetrics[]): ChannelStats {
  let totalReach = 0;
  let totalEngagement = 0;
  let conversions = 0;
  let leadsGenerated = 0;
  let websiteClicks = 0;
  const byType: Record<string, { count: number; engagement: number; reach: number }> = {};
  let topPerformer: ChannelStats['metrics']['topPerformer'] = null;

  for (const item of items) {
    const metrics = item.metrics || {};
    const reach = reachFor(item);
    const engagement = engagementFor(item);
    const contentType = item.contentType || 'Unknown';

    totalReach += reach;
    totalEngagement += engagement;
    conversions += toNumber(metrics.conversions);
    leadsGenerated += toNumber(metrics.leadsGenerated);
    websiteClicks += toNumber(metrics.clicks);

    if (!byType[contentType]) byType[contentType] = { count: 0, engagement: 0, reach: 0 };
    byType[contentType].count += 1;
    byType[contentType].engagement += engagement;
    byType[contentType].reach += reach;

    if (!topPerformer || engagement > topPerformer.engagement) {
      topPerformer = {
        title: item.title || 'Untitled content',
        contentType,
        engagement,
      };
    }
  }

  const contentTypes = Object.fromEntries(
    Object.entries(byType).map(([type, stats]) => {
      const avgEngagement = stats.engagement / Math.max(stats.count, 1);
      const avgReach = stats.reach / Math.max(stats.count, 1);
      const rate = stats.reach > 0 ? (stats.engagement / stats.reach) * 100 : 0;
      return [
        type,
        {
          count: stats.count,
          avgEngagement: Number(avgEngagement.toFixed(1)),
          avgReach: Number(avgReach.toFixed(1)),
          engagementRate: formatRate(stats.engagement, stats.reach),
          formatPerformance: Math.max(0, Math.min(10, Number(rate.toFixed(1)))),
        },
      ];
    })
  );

  const avgEngagementRate = totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0;
  const acquisitionSignals = conversions + leadsGenerated + websiteClicks;

  return {
    metrics: {
      totalContent: items.length,
      totalReach,
      totalEngagement,
      avgReach: totalReach / Math.max(items.length, 1),
      avgEngagement: totalEngagement / Math.max(items.length, 1),
      avgEngagementRate,
      conversions,
      leadsGenerated,
      websiteClicks,
      topPerformer,
    },
    performanceScore: calculatePerformanceScore(items.length, avgEngagementRate, acquisitionSignals),
    contentTypes,
  };
}

export async function analyze(
  tenantId: string,
  enabledAttributes: string[] = []
): Promise<AgentResult> {
  try {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return { success: false, error: `Tenant not found: ${tenantId}` };

    const contentItems = await prisma.contentItem.findMany({
      where: { tenantId },
      include: { metrics: true },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    if (contentItems.length === 0) {
      return {
        success: true,
        data: {
          summary: 'No uploaded content data is available yet for channel intelligence.',
          channels: {},
          recommendations: [],
          topCombo: null,
          avoidCombo: null,
        },
      };
    }

    const byChannel = new Map<string, ContentWithMetrics[]>();
    for (const item of contentItems) {
      const list = byChannel.get(item.channel) || [];
      list.push(item);
      byChannel.set(item.channel, list);
    }

    const channels = Object.fromEntries(
      [...byChannel.entries()].map(([channel, items]) => [channel, buildChannelStats(items)])
    );

    const channelEntries = Object.entries(channels).sort((a, b) => b[1].performanceScore - a[1].performanceScore);
    const formatRows = channelEntries.flatMap(([channel, data]) =>
      Object.entries(data.contentTypes).map(([format, stats]) => ({ channel, format, stats }))
    );
    const bestFormat = [...formatRows].sort((a, b) => b.stats.formatPerformance - a.stats.formatPerformance)[0];
    const weakestFormat = [...formatRows].sort((a, b) => a.stats.formatPerformance - b.stats.formatPerformance)[0];
    const bestChannel = channelEntries[0];
    const recommendations: ChannelIntelligenceResult['recommendations'] = [];

    if (bestChannel) {
      recommendations.push({
        priority: 'HIGH',
        title: `Prioritize ${bestChannel[0]} for distribution`,
        why: `${bestChannel[0]} has the highest channel performance score (${bestChannel[1].performanceScore}/10) with ${bestChannel[1].metrics.totalEngagement.toFixed(0)} current engagement actions.`,
        action: `Use ${bestChannel[0]} for the strongest observed formats first, then repurpose to secondary channels.`,
        affectedChannels: [bestChannel[0]],
      });
    }

    if (bestFormat) {
      recommendations.push({
        priority: 'MEDIUM',
        title: `Create more ${bestFormat.format} on ${bestFormat.channel}`,
        why: `${bestFormat.format} has the strongest format performance (${bestFormat.stats.formatPerformance}/10) on ${bestFormat.channel}.`,
        action: `Increase production of this format and measure the next upload cycle.`,
        affectedChannels: [bestFormat.channel],
      });
    }

    if (weakestFormat && weakestFormat.stats.count > 0) {
      recommendations.push({
        priority: 'LOW',
        title: `Review ${weakestFormat.format} on ${weakestFormat.channel}`,
        why: `${weakestFormat.format} is the weakest observed format on ${weakestFormat.channel} (${weakestFormat.stats.formatPerformance}/10).`,
        action: `Reduce, rework, or test a different angle before scaling this format.`,
        affectedChannels: [weakestFormat.channel],
      });
    }

    // Base combos from statistical analysis
    const baseTopCombo = bestFormat
      ? {
          format: bestFormat.format,
          channel: bestFormat.channel,
          reason: `${bestFormat.format} on ${bestFormat.channel} has ${bestFormat.stats.engagementRate} engagement rate and ${bestFormat.stats.formatPerformance}/10 format performance.`,
        }
      : null;
    const baseAvoidCombo = weakestFormat
      ? {
          format: weakestFormat.format,
          channel: weakestFormat.channel,
          reason: `${weakestFormat.format} on ${weakestFormat.channel} has the weakest observed format performance at ${weakestFormat.stats.formatPerformance}/10.`,
        }
      : null;

    // Use LLM to enhance combo reasoning and add verdicts to matrix
    let enhancedTopCombo = baseTopCombo;
    let enhancedAvoidCombo = baseAvoidCombo;
    let enhancedChannels = channels;

    try {
      const llmPrompt = JSON.stringify({
        totalContent: contentItems.length,
        totalChannels: channelEntries.length,
        formatRows: formatRows.map(f => ({ format: f.format, channel: f.channel, engagementRate: f.stats.engagementRate, formatPerformance: f.stats.formatPerformance })),
        baseTopCombo,
        baseAvoidCombo
      });
      const systemPrompt = 'You are a channel intelligence analyst. Analyze the provided channel/format statistics and return JSON with enhanced insights. Return ONLY valid JSON with this structure: { "topCombo": {"format": string, "channel": string, "reason": string}, "avoidCombo": {"format": string, "channel": string, "reason": string}, "verdicts": [{"format": string, "channel": string, "verdict": string}] }';
      const llmResult = await mockLLMAnalyze(systemPrompt, llmPrompt);
      
      if (llmResult.topCombo && llmResult.topCombo.reason) {
        enhancedTopCombo = { ...baseTopCombo, ...llmResult.topCombo };
      }
      
      if (llmResult.avoidCombo && llmResult.avoidCombo.reason) {
        enhancedAvoidCombo = { ...baseAvoidCombo, ...llmResult.avoidCombo };
      }
      
      if (llmResult.verdicts && Array.isArray(llmResult.verdicts)) {
        enhancedChannels = Object.fromEntries(
          Object.entries(channels).map(([channel, data]) => [
            channel,
            {
              ...data,
              contentTypes: Object.fromEntries(
                Object.entries(data.contentTypes).map(([format, stats]) => {
                  const verdict = llmResult.verdicts.find((v: any) => v.format === format && v.channel === channel);
                  return [format, { ...stats, verdict: verdict?.verdict || null }];
                })
              ),
            }
          ])
        );
      }
    } catch (error) {
      console.warn('[channel-intelligence] LLM enhancement failed, using statistical fallback:', error);
    }

    return {
      success: true,
      data: {
        summary: `Analyzed ${contentItems.length} content rows across ${channelEntries.length} active channels. Channel Intelligence focuses on where content performs and which formats work best or worst inside each channel.`,
        channels: enhancedChannels,
        recommendations,
        topCombo: enhancedTopCombo,
        avoidCombo: enhancedAvoidCombo,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[channel-intelligence] Error: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
}
