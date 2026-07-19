/**
 * Gap & Opportunity Analysis Agent
 * Finds gaps in the current content strategy and turns them into recommended opportunities.
 */

import prisma from '@/lib/db';
import { mockLLMAnalyze } from './llm-helper';

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


function toValidUrgency(value: any, fallback: 'HOT' | 'WARM' | 'EVERGREEN'): 'HOT' | 'WARM' | 'EVERGREEN' {
  const str = String(value || '').toUpperCase();
  if (str === 'HOT' || str === 'WARM' || str === 'EVERGREEN') {
    return str as 'HOT' | 'WARM' | 'EVERGREEN';
  }
  return fallback;
}

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
    const allTopics = new Set<string>();

    for (const item of contentItems) {
      const title = (item.title || '').toLowerCase();
      const engagement = scoreEngagement(item.metrics);
      const format = item.contentType || 'article';
      formatEngagement.set(format, (formatEngagement.get(format) || 0) + engagement);
      channelEngagement.set(item.channel, (channelEngagement.get(item.channel) || 0) + engagement);

      // Extract topics from titles (simple word extraction for topic discovery)
      const words = title.split(/\s+/).filter(w => w.length > 3);
      for (const word of words) {
        allTopics.add(word.charAt(0).toUpperCase() + word.slice(1));
        topicCounts.set(word, (topicCounts.get(word) || 0) + 1);
        topicEngagement.set(word, (topicEngagement.get(word) || 0) + engagement);
      }
    }

    const TOPICS = [...allTopics].slice(0, 15);

    const bestFormat = bestEntry(formatEngagement, 'article');
    const bestChannel = bestEntry(channelEngagement, 'BLOG');
    const totalContent = contentItems.length;

    const strategyGaps = TOPICS.map((topic) => {
      const count = topicCounts.get(topic.toLowerCase()) || 0;
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

    // Base opportunities from statistical analysis
    const baseOpportunities: NonNullable<GapAnalysisResult['data']>['opportunities'] = strategyGaps
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

    // Use LLM to enhance gap reasons, opportunity titles, and next best action
    let enhancedGaps = strategyGaps;
    let enhancedOpportunities = baseOpportunities;
    let enhancedNextBestAction = baseOpportunities[0]
      ? `Create one ${baseOpportunities[0].format} on ${baseOpportunities[0].channel} about ${baseOpportunities[0].topic}, then compare engagement in the next upload cycle.`
      : 'No major content coverage gaps were found from current uploaded data.';

    try {
      const llmPrompt = JSON.stringify({
        totalContent,
        bestFormat,
        bestChannel,
        strategyGaps: strategyGaps.map(g => ({ topic: g.topic, coverage: g.coverage, priority: g.priority })),
        baseOpportunities: baseOpportunities.map(o => ({ topic: o.topic, format: o.format, channel: o.channel, urgency: o.urgency }))
      });
      const systemPrompt = 'You are a content strategy analyst. Analyze the provided content gap statistics and return JSON with enhanced insights. Return ONLY valid JSON with this structure: { "gapReasons": [{"topic": string, "reason": string}], "opportunityEnhancements": [{"topic": string, "suggestedTitle": string, "urgency": "HOT"|"WARM"|"EVERGREEN", "reason": string}], "nextBestAction": string }';
      const llmResult = await mockLLMAnalyze(systemPrompt, llmPrompt);
      
      if (llmResult.gapReasons && Array.isArray(llmResult.gapReasons)) {
        enhancedGaps = strategyGaps.map(gap => {
          const enhanced = llmResult.gapReasons.find((r: any) => r.topic === gap.topic);
          return enhanced ? { ...gap, reason: enhanced.reason } : gap;
        });
      }
      
      if (llmResult.opportunityEnhancements && Array.isArray(llmResult.opportunityEnhancements)) {
        enhancedOpportunities = baseOpportunities.map(opp => {
          const enhanced = llmResult.opportunityEnhancements.find((e: any) => e.topic === opp.topic);
          if (enhanced) {
            return { 
              ...opp, 
              suggestedTitle: enhanced.suggestedTitle || opp.suggestedTitle, 
              urgency: toValidUrgency(enhanced.urgency, opp.urgency), 
              reason: enhanced.reason || opp.reason 
            };
          }
          return opp;
        });
      }
      
      if (llmResult.nextBestAction) {
        enhancedNextBestAction = llmResult.nextBestAction;
      }
    } catch (error) {
      console.warn('[gap-analysis] LLM enhancement failed, using statistical fallback:', error);
    }

    return {
      success: true,
      data: {
        summary: `Analyzed ${totalContent} uploaded content rows. Gap and Opportunity are merged here because opportunities are derived from visible coverage gaps and current channel/format performance, not external keyword or search-console data.`,
        strategyGaps: enhancedGaps,
        opportunities: enhancedOpportunities,
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
        nextBestAction: enhancedNextBestAction,
      },
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in GAP_ANALYSIS:', error);
    return { success: false, error: errorMsg };
  }
}
