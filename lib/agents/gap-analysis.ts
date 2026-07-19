/**
 * Gap & Opportunity Analysis Agent
 * Finds gaps in the current content strategy and turns them into recommended opportunities.
 */

import prisma from '@/lib/db';

type GapPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface GapAnalysisResult {
  success: boolean;
  data?: {
    summary: string;
    strategyGaps: Array<{
      topic: string;
      coverage: number;
      evidenceType: string;
      reason: string;
      priority: GapPriority;
    }>;
    opportunities: Array<{
      topic: string;
      suggestedTitle: string;
      format: string;
      channel: string;
      urgency: 'HOT' | 'WARM' | 'EVERGREEN';
      evidenceType: string;
      reason: string;
    }>;
    evidenceCoverage: Array<{
      evidenceType: string;
      status: 'AVAILABLE' | 'COMING_SOON';
      description: string;
    }>;
    nextBestAction: string;
  };
  error?: string;
}

const TOPICS = [
  'AI',
  'Machine Learning',
  'Data',
  'Security',
  'Cloud',
  'DevOps',
  'Performance',
  'Scale',
  'Enterprise',
  'Startups',
  'Growth',
  'Analytics',
  'Testing',
  'API',
];

function scoreEngagement(metrics: any): number {
  if (!metrics) return 0;
  return (
    (metrics.likes || 0) +
    (metrics.comments || 0) +
    (metrics.shares || 0) +
    (metrics.upvotes || 0) +
    (metrics.clicks || 0) +
    (metrics.conversions || 0) +
    (metrics.leadsGenerated || 0) +
    (metrics.subscribersGained || 0)
  );
}

function bestEntry<T extends string>(map: Map<T, number>, fallback: T): T {
  return [...map.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || fallback;
}

export async function analyze(
  tenantId: string,
  enabledAttributes: string[] = []
): Promise<GapAnalysisResult> {
  try {
    const contentItems = await prisma.contentItem.findMany({
      where: { tenantId },
      include: { metrics: true },
      orderBy: { createdAt: 'desc' },
    });

    if (contentItems.length === 0) {
      return {
        success: true,
        data: {
          summary: 'No content data available yet. Upload content to identify gaps and opportunities.',
          strategyGaps: [],
          opportunities: [],
          evidenceCoverage: [
            {
              evidenceType: 'current_content_coverage',
              status: 'COMING_SOON',
              description: 'Upload channel data to compare topic and format coverage.',
            },
          ],
          nextBestAction: 'Upload content data from at least one channel.',
        },
      };
    }

    const topicCounts = new Map<string, number>();
    const topicEngagement = new Map<string, number>();
    const formatEngagement = new Map<string, number>();
    const channelEngagement = new Map<string, number>();

    for (const item of contentItems) {
      const title = (item.title || '').toLowerCase();
      const engagement = scoreEngagement(item.metrics);
      const format = item.contentType || 'article';
      formatEngagement.set(format, (formatEngagement.get(format) || 0) + engagement);
      channelEngagement.set(item.channel, (channelEngagement.get(item.channel) || 0) + engagement);

      for (const topic of TOPICS) {
        if (title.includes(topic.toLowerCase())) {
          topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
          topicEngagement.set(topic, (topicEngagement.get(topic) || 0) + engagement);
        }
      }
    }

    const bestFormat = bestEntry(formatEngagement, 'article');
    const bestChannel = bestEntry(channelEngagement, 'BLOG');
    const totalContent = contentItems.length;

    const strategyGaps = TOPICS.map((topic) => {
      const count = topicCounts.get(topic) || 0;
      const coverage = Math.round((count / Math.max(totalContent, 1)) * 100);
      const priority: GapPriority = coverage < 10 ? 'HIGH' : coverage < 25 ? 'MEDIUM' : 'LOW';

      return {
        topic,
        coverage,
        evidenceType: 'current_content_coverage',
        reason:
          count === 0
            ? `${topic} has no visible coverage in the uploaded content titles.`
            : `${topic} appears in ${count} of ${totalContent} uploaded content rows.`,
        priority,
      };
    })
      .filter((gap) => gap.priority !== 'LOW')
      .sort((a, b) => a.coverage - b.coverage)
      .slice(0, 6);

    const opportunities: NonNullable<GapAnalysisResult['data']>['opportunities'] = strategyGaps
      .slice(0, 5)
      .map((gap, index) => ({
        topic: gap.topic,
        suggestedTitle: `${gap.topic}: Practical Guide for Your Audience`,
        format: bestFormat,
        channel: bestChannel,
        urgency: index === 0 ? 'HOT' : gap.priority === 'HIGH' ? 'WARM' : 'EVERGREEN',
        evidenceType: gap.evidenceType,
        reason: `${gap.reason} Use the currently strongest observed format (${bestFormat}) and channel (${bestChannel}) to test this gap.`,
      }));

    const nextBestAction = opportunities[0]
      ? `Create one ${opportunities[0].format} on ${opportunities[0].channel} about ${opportunities[0].topic}, then compare engagement in the next upload cycle.`
      : 'No major content coverage gaps were found from current uploaded data.';

    return {
      success: true,
      data: {
        summary: `Analyzed ${totalContent} uploaded content rows. Gap and Opportunity are merged here because opportunities are derived from visible coverage gaps and current channel/format performance, not external keyword or search-console data.`,
        strategyGaps,
        opportunities,
        evidenceCoverage: [
          {
            evidenceType: 'current_content_coverage',
            status: 'AVAILABLE',
            description: 'Uses uploaded titles, channels, formats, and engagement metrics.',
          },
          {
            evidenceType: 'search_console_or_keyword_demand',
            status: 'COMING_SOON',
            description: 'External search demand is not connected yet, so no keyword volume is inferred.',
          },
          {
            evidenceType: 'competitor_public_content',
            status: 'COMING_SOON',
            description: 'Public competitor content analysis can be added later when approved sources are connected.',
          },
        ],
        nextBestAction,
      },
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in GAP_ANALYSIS:', error);
    return { success: false, error: errorMsg };
  }
}
