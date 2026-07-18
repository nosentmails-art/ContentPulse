/**
 * Audience Intelligence Agent
 * Analyzes audience segments, engagement patterns, and demographic insights
 */

import prisma from '../db';
import { mockLLMAnalyze } from './llm-helper';

/**
 * Result interface for audience intelligence analysis
 */
export interface AudienceIntelligenceResult {
  summary: string;
  segments: Array<{
    name: string;
    description: string;
    topContent: string;
    bestTime: string;
    engagementRate: string;
  }>;
  topInsight: string;
  recommendation: string;
}

/**
 * Agent result wrapper
 */
export interface AgentResult {
  success: boolean;
  data?: AudienceIntelligenceResult;
  error?: string;
}

const SYSTEM_PROMPT =
  'You are a senior content strategist and data analyst with 10 years of experience. Analyze the provided data and generate specific, numbered, actionable insights. Always cite specific numbers. Output ONLY valid JSON matching the specified format exactly.';

/**
 * Builds a data summary from ContentItems and ChannelMetrics for the tenant
 */
async function buildDataSummary(
  tenantId: string,
  enabledAttributes: string[]
): Promise<string> {
  const contentItems = await prisma.contentItem.findMany({
    where: { tenantId },
    include: { metrics: true },
    take: 100,
  });

  if (contentItems.length === 0) {
    return 'No content data available for analysis.';
  }

  let summary = 'Content and Audience Data Summary:\n\n';

  // Group by channel
  const byChannel = contentItems.reduce(
    (acc, item) => {
      if (!acc[item.channel]) {
        acc[item.channel] = [];
      }
      acc[item.channel].push(item);
      return acc;
    },
    {} as Record<string, typeof contentItems>
  );

  for (const [channel, items] of Object.entries(byChannel)) {
    summary += `Channel: ${channel}\n`;
    summary += `  Total content pieces: ${items.length}\n`;

    // Aggregate metrics
    let totalImpressions = 0;
    let totalEngagement = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let itemsWithMetrics = 0;

    for (const item of items) {
      if (item.metrics) {
        itemsWithMetrics++;
        totalImpressions += item.metrics.impressions || 0;
        totalLikes += item.metrics.likes || 0;
        totalComments += item.metrics.comments || 0;
        totalShares += item.metrics.shares || 0;
        totalEngagement += (item.metrics.likes || 0) + (item.metrics.comments || 0) + (item.metrics.shares || 0);
      }
    }

    if (itemsWithMetrics > 0) {
      const avgEngagementRate = totalImpressions > 0
        ? ((totalEngagement / totalImpressions) * 100).toFixed(2)
        : '0.00';
      summary += `  Total impressions: ${totalImpressions.toFixed(0)}\n`;
      summary += `  Total engagement: ${totalEngagement.toFixed(0)} (likes: ${totalLikes.toFixed(0)}, comments: ${totalComments.toFixed(0)}, shares: ${totalShares.toFixed(0)})\n`;
      summary += `  Average engagement rate: ${avgEngagementRate}%\n`;
    }

    summary += '\n';
  }

  // Enabled attributes section
  if (enabledAttributes.length > 0) {
    summary += `\nEnabled Analysis Attributes: ${enabledAttributes.join(', ')}\n`;
    summary += 'Only analyze the enabled attributes in your response.\n';
  }

  return summary;
}

/**
 * Constructs the LLM prompt with data and enabled attributes
 */
function buildPrompt(dataSummary: string, enabledAttributes: string[]): string {
  let prompt = `${dataSummary}

Analyze the content and engagement data to identify audience segments and patterns.

${
  enabledAttributes.includes('segments')
    ? `
Audience Segments:
- Identify 3-4 distinct audience segments based on engagement patterns
- For each segment, describe their characteristics, top performing content type, best posting time, and engagement rate
`
    : ''
}

${
  enabledAttributes.includes('timing')
    ? `
Timing Insights:
- Identify when audience is most engaged
- Note any peak engagement times
`
    : ''
}

${
  enabledAttributes.includes('top_type')
    ? `
Top Content Type:
- Identify which content types resonate most with the audience
- Provide specific metrics
`
    : ''
}

${
  enabledAttributes.includes('demographics')
    ? `
Demographic Patterns:
- Identify any demographic patterns in the audience
- Note any growth or decline trends
`
    : ''
}

Return your analysis as a JSON object with this exact structure:
{
  "summary": "Brief overview of audience composition (1-2 sentences with specific numbers)",
  "segments": [
    {
      "name": "Segment name",
      "description": "What defines this segment",
      "topContent": "The type of content that performs best",
      "bestTime": "When this segment is most engaged",
      "engagementRate": "Specific engagement rate percentage"
    }
  ],
  "topInsight": "The single most important finding about your audience (1-2 sentences with numbers)",
  "recommendation": "One specific, actionable recommendation for improving audience engagement"
}`;

  return prompt;
}

/**
 * Calls the LLM analyzer
 */
async function callLLM(prompt: string): Promise<AudienceIntelligenceResult> {
  try {
    const result = await mockLLMAnalyze(SYSTEM_PROMPT, prompt);

    // Validate that result has required fields
    if (
      !result.summary ||
      !Array.isArray(result.segments) ||
      !result.topInsight ||
      !result.recommendation
    ) {
      throw new Error('Invalid LLM response format');
    }

    return result as AudienceIntelligenceResult;
  } catch (error) {
    throw new Error(
      `LLM API call failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Main analyze function for audience intelligence
 */
export async function analyze(
  tenantId: string,
  enabledAttributes: string[] = []
): Promise<AgentResult> {
  try {
    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return {
        success: false,
        error: `Tenant not found: ${tenantId}`,
      };
    }

    // Build data summary
    const dataSummary = await buildDataSummary(tenantId, enabledAttributes);

    // Construct LLM prompt
    const prompt = buildPrompt(dataSummary, enabledAttributes);

    // Call LLM
    const result = await callLLM(prompt);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[audience-intelligence] Error: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
