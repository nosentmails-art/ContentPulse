/**
 * GAP_ANALYSIS Agent
 * Analyzes content coverage gaps by topic
 * Identifies where you have low coverage but high opportunity
 */

import prisma from '@/lib/db';

export interface GapAnalysisResult {
  success: boolean;
  data?: {
    summary: string;
    topics: Array<{
      topic: string;
      coverage: number; // percentage
      opportunity: number; // percentage, inverse of coverage
    }>;
    topGaps: string[];
    topRecommendation: string;
  };
  error?: string;
}

export async function analyze(
  tenantId: string,
  enabledAttributes: string[]
): Promise<GapAnalysisResult> {
  try {
    // Fetch all content items for tenant
    const contentItems = await prisma.contentItem.findMany({
      where: { tenantId },
      include: { metrics: true },
    });

    if (contentItems.length === 0) {
      return {
        success: true,
        data: {
          summary: 'No content data available yet. Upload content to analyze gaps.',
          topics: [],
          topGaps: [],
          topRecommendation: 'Start by uploading content from your channels.',
        },
      };
    }

    // Extract topics from titles (simple heuristic: split by keywords)
    const topicMap = new Map<string, number>();
    const defaultKeywords = [
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

    // Use enabledAttributes if provided, otherwise use default keywords
    const keywords = enabledAttributes && enabledAttributes.length > 0 
      ? enabledAttributes 
      : defaultKeywords;

    // Count topic mentions in content titles
    for (const item of contentItems) {
      const title = (item.title || "").toLowerCase();
      for (const keyword of keywords) {
        if (title.includes(keyword.toLowerCase())) {
          topicMap.set(keyword, (topicMap.get(keyword) || 0) + 1);
        }
      }
    }

    // Calculate coverage percentages
    const totalContent = contentItems.length;
    const topics = Array.from(topicMap.entries())
      .map(([topic, count]) => ({
        topic,
        coverage: Math.round((count / totalContent) * 100),
        opportunity: Math.round(100 - (count / totalContent) * 100),
      }))
      .sort((a, b) => b.opportunity - a.opportunity)
      .slice(0, 8); // Top 8 gaps

    // Identify top gaps
    const topGaps = topics
      .filter((t) => t.coverage < 30)
      .slice(0, 3)
      .map(
        (t) =>
          `${t.topic} (${t.coverage}% coverage, ${t.opportunity}% opportunity)`
      );

    // Build recommendation
    let topRecommendation = 'No significant gaps identified.';
    if (topGaps.length > 0) {
      const topGap = topics[0];
      topRecommendation = `Prioritize ${topGap.topic} content - highest opportunity (${topGap.opportunity}%) with lowest current coverage (${topGap.coverage}%). Create 4-6 pieces targeting this topic in next quarter.`;
    }

    return {
      success: true,
      data: {
        summary: `Gap analysis shows ${topics.length} main topics in your content. Identified ${topGaps.length} areas with significant coverage gaps and high opportunity.`,
        topics,
        topGaps,
        topRecommendation,
      },
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in GAP_ANALYSIS:', error);
    return {
      success: false,
      error: errorMsg,
    };
  }
}
