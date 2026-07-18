/**
 * Channel Intelligence Agent
 * Analyzes which channels and content formats perform best together
 */

import prisma from '../db';
import { mockLLMAnalyze } from './llm-helper';

/**
 * Result interface for channel intelligence analysis
 */
export interface ChannelIntelligenceResult {
  summary: string;
  matrix: Array<{
    format: string;
    channel: string;
    performanceScore: number;
    keyMetric: string;
    verdict: string;
  }>;
  topCombo: { format: string; channel: string; reason: string };
  avoidCombo: { format: string; channel: string; reason: string };
}

/**
 * Agent result wrapper
 */
export interface AgentResult {
  success: boolean;
  data?: ChannelIntelligenceResult;
  error?: string;
}

const SYSTEM_PROMPT =
  'You are a senior content strategist and data analyst with 10 years of experience. Analyze the provided data and generate specific, numbered, actionable insights. Always cite specific numbers. Output ONLY valid JSON matching the specified format exactly.';

/**
 * Builds a data summary of channel performance metrics
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

  let summary = 'Channel and Content Format Performance Data:\n\n';

  // Group by channel and content type
  const byChannelAndType: Record<string, Record<string, Array<any>>> = {};

  for (const item of contentItems) {
    const ch = item.channel || 'unknown';
    const ct = item.contentType || 'unknown';

    if (!byChannelAndType[ch]) {
      byChannelAndType[ch] = {};
    }
    if (!byChannelAndType[ch][ct]) {
      byChannelAndType[ch][ct] = [];
    }

    byChannelAndType[ch][ct].push(item);
  }

  // Analyze each channel + format combination
  for (const [channel, typeMap] of Object.entries(byChannelAndType)) {
    summary += `\n${channel.toUpperCase()}\n`;

    for (const [contentType, items] of Object.entries(typeMap)) {
      let totalViews = 0;
      let totalEngagement = 0;
      let totalClicks = 0;
      let totalConversions = 0;
      let itemCount = 0;

      for (const item of items) {
        if (item.metrics) {
          itemCount++;
          totalViews += item.metrics.views || item.metrics.impressions || 0;
          totalEngagement += (item.metrics.likes || 0) + (item.metrics.comments || 0) + (item.metrics.shares || 0);
          totalClicks += item.metrics.clicks || 0;
          totalConversions += item.metrics.conversions || 0;
        }
      }

      if (itemCount > 0) {
        const avgEngagement = totalViews > 0 ? (totalEngagement / itemCount).toFixed(0) : '0';
        const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0.00';
        summary += `  Format: ${contentType} - ${itemCount} pieces\n`;
        summary += `    Total Views: ${totalViews.toFixed(0)}, Avg Engagement: ${avgEngagement}, CTR: ${ctr}%, Conversions: ${totalConversions.toFixed(0)}\n`;
      }
    }
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

Analyze the performance of different content formats across channels to identify winning and losing combinations.

${
  enabledAttributes.includes('channel_format_combo')
    ? `
Channel-Format Analysis:
- Create a performance matrix of all channel-format combinations
- Score each combination (0-100) based on views, engagement, and conversions
- Identify the best and worst performing combinations
`
    : ''
}

${
  enabledAttributes.includes('top_channels')
    ? `
Top Performing Channels:
- Identify which channels drive the most views, engagement, and conversions
- Note any channel-specific trends
`
    : ''
}

${
  enabledAttributes.includes('top_formats')
    ? `
Top Performing Content Formats:
- Identify which content formats perform best across channels
- Provide specific performance metrics
`
    : ''
}

${
  enabledAttributes.includes('cross_channel_strategy')
    ? `
Cross-Channel Strategy:
- Identify which channel-format combinations should be prioritized
- Suggest which combinations to test or avoid
`
    : ''
}

Return your analysis as a JSON object with this exact structure:
{
  "summary": "Overview of channel and format performance (1-2 sentences with specific numbers)",
  "matrix": [
    {
      "format": "Content format name",
      "channel": "Channel name",
      "performanceScore": 85,
      "keyMetric": "The most important metric for this combo (e.g., 2500 views, 12% CTR)",
      "verdict": "Brief assessment of this combination"
    }
  ],
  "topCombo": {
    "format": "Best performing content format",
    "channel": "Best performing channel",
    "reason": "Why this combination works best (with specific numbers)"
  },
  "avoidCombo": {
    "format": "Worst performing content format",
    "channel": "Worst performing channel",
    "reason": "Why this combination underperforms (with specific numbers)"
  }
}`;

  return prompt;
}

/**
 * Calls the LLM analyzer (server-side helper, no fetch)
 */
async function callLLM(prompt: string): Promise<ChannelIntelligenceResult> {
  try {
    const result = await mockLLMAnalyze(SYSTEM_PROMPT, prompt);

    // Validate required fields
    if (
      !result.summary ||
      !Array.isArray(result.matrix) ||
      !result.topCombo ||
      !result.avoidCombo
    ) {
      throw new Error('Invalid LLM response format');
    }

    return result as ChannelIntelligenceResult;
  } catch (error) {
    throw new Error(
      `LLM call failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Main analyze function for channel intelligence
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
    console.error(`[channel-intelligence] Error: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
