/**
 * Opportunity Identification Agent
 * Identifies high-value content opportunities based on trends, gaps, and performance patterns
 */

import prisma from '../db';
import { mockLLMAnalyze } from './llm-helper';

/**
 * Result interface for opportunity identification
 */
export interface OpportunityIdentificationResult {
  summary: string;
  opportunities: Array<{
    topic: string;
    format: string;
    channel: string;
    urgency: string;
    reason: string;
    suggestedTitle: string;
  }>;
  priorityAction: string;
}

/**
 * Agent result wrapper
 */
export interface AgentResult {
  success: boolean;
  data?: OpportunityIdentificationResult;
  error?: string;
}

const SYSTEM_PROMPT =
  'You are a senior content strategist and data analyst with 10 years of experience. Analyze the provided data and generate specific, numbered, actionable insights. Always cite specific numbers. Output ONLY valid JSON matching the specified format exactly.';

/**
 * Builds a data summary of performance patterns and trends
 */
async function buildDataSummary(
  tenantId: string,
  enabledAttributes: string[]
): Promise<string> {
  const contentItems = await prisma.contentItem.findMany({
    where: { tenantId },
    include: { metrics: true },
    orderBy: { publishDate: 'desc' },
    take: 100,
  });

  if (contentItems.length === 0) {
    return 'No content data available for opportunity analysis.';
  }

  let summary = 'Content Performance and Opportunity Data:\n\n';

  // Recent performance trends
  summary += 'RECENT PERFORMANCE (Last 100 pieces):\n';

  // Analyze performance by content type
  const performanceByType: Record<
    string,
    { count: number; avgEngagement: number; avgViews: number }
  > = {};

  for (const item of contentItems) {
    const ct = item.contentType || 'unknown';
    if (!performanceByType[ct]) {
      performanceByType[ct] = { count: 0, avgEngagement: 0, avgViews: 0 };
    }

    performanceByType[ct].count++;

    if (item.metrics) {
      const engagement = (item.metrics.likes || 0) + (item.metrics.comments || 0) + (item.metrics.shares || 0);
      const views = item.metrics.views || item.metrics.impressions || 0;

      performanceByType[ct].avgEngagement += engagement;
      performanceByType[ct].avgViews += views;
    }
  }

  for (const [type, stats] of Object.entries(performanceByType)) {
    const avgEng = stats.count > 0 ? stats.avgEngagement / stats.count : 0;
    const avgV = stats.count > 0 ? stats.avgViews / stats.count : 0;
    summary += `  ${type}: ${stats.count} pieces | Avg views: ${avgV.toFixed(0)} | Avg engagement: ${avgEng.toFixed(0)}\n`;
  }

  // Channel performance
  summary += '\nCHANNEL PERFORMANCE:\n';
  const performanceByChannel: Record<
    string,
    { count: number; totalEngagement: number; totalViews: number }
  > = {};

  for (const item of contentItems) {
    const ch = item.channel || 'unknown';
    if (!performanceByChannel[ch]) {
      performanceByChannel[ch] = { count: 0, totalEngagement: 0, totalViews: 0 };
    }

    performanceByChannel[ch].count++;

    if (item.metrics) {
      performanceByChannel[ch].totalEngagement +=
        (item.metrics.likes || 0) +
        (item.metrics.comments || 0) +
        (item.metrics.shares || 0);
      performanceByChannel[ch].totalViews +=
        item.metrics.views || item.metrics.impressions || 0;
    }
  }

  for (const [channel, stats] of Object.entries(performanceByChannel)) {
    const engRate = stats.totalViews > 0
      ? ((stats.totalEngagement / stats.totalViews) * 100).toFixed(2)
      : '0.00';
    summary += `  ${channel}: ${stats.count} pieces | Total views: ${stats.totalViews.toFixed(0)} | Engagement rate: ${engRate}%\n`;
  }

  // Underperforming and overperforming content
  summary += '\nPERFORMANCE OUTLIERS:\n';
  const engagementRates = contentItems
    .filter((item) => item.metrics && (item.metrics.views || item.metrics.impressions))
    .map((item) => ({
      title: item.title || 'Untitled',
      type: item.contentType || 'unknown',
      channel: item.channel || 'unknown',
      engagement: ((
        ((item.metrics?.likes || 0) +
          (item.metrics?.comments || 0) +
          (item.metrics?.shares || 0)) /
        (item.metrics?.views || item.metrics?.impressions || 1)
      ) * 100),
    }))
    .sort((a, b) => b.engagement - a.engagement);

  if (engagementRates.length > 0) {
    summary += '  Top performers:\n';
    engagementRates.slice(0, 3).forEach((item) => {
      summary += `    - ${item.title} (${item.type} on ${item.channel}): ${item.engagement.toFixed(2)}% engagement\n`;
    });

    summary += '  Underperformers:\n';
    engagementRates.slice(-3).forEach((item) => {
      summary += `    - ${item.title} (${item.type} on ${item.channel}): ${item.engagement.toFixed(2)}% engagement\n`;
    });
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
  let sections = 'Identify the highest-value content opportunities based on performance patterns, gaps, and emerging trends.\n\n';

  if (enabledAttributes.includes('high_impact_topics')) {
    sections += 'High-Impact Topics:\n- Identify 2-3 topics that have strong performance potential\n- Base on successful patterns and audience interests\n- Provide specific numbers justifying each opportunity\n\n';
  }

  if (enabledAttributes.includes('format_channel_strategy')) {
    sections += 'Format-Channel Strategy:\n- For each opportunity, recommend the best format and channel\n- Cite which combinations have performed best\n- Note any untested combinations worth trying\n\n';
  }

  if (enabledAttributes.includes('urgency')) {
    sections += 'Urgency and Timing:\n- Prioritize opportunities by urgency (high, medium, or low)\n- Suggest timing based on audience engagement patterns\n- Note any trends showing increasing or decreasing interest\n\n';
  }

  if (enabledAttributes.includes('content_gaps')) {
    sections += 'Content Gaps:\n- Identify what your audience wants but you are not delivering\n- Note topics your top performers address\n- Suggest new angles on existing topics\n\n';
  }

  const jsonFormat = '{\n  "summary": "Overview of identified opportunities (1-2 sentences with specific opportunity count)",\n  "opportunities": [\n    {\n      "topic": "Specific topic or content angle",\n      "format": "Recommended format (e.g., video, blog post, infographic)",\n      "channel": "Recommended channel (e.g., YouTube, LinkedIn, Blog)",\n      "urgency": "high, medium, or low",\n      "reason": "Why this is an opportunity with specific metrics (e.g., related content got 45% engagement)",\n      "suggestedTitle": "A specific, actionable content title for this opportunity"\n    }\n  ],\n  "priorityAction": "The single most important content piece to create immediately (with justification and specific numbers)"\n}';

  const prompt = dataSummary + '\n' + sections + 'Return your analysis as a JSON object with this exact structure:\n' + jsonFormat;
  return prompt;
}

/**
 * Calls the LLM analyzer (server-side helper, no fetch)
 */
async function callLLM(
  prompt: string
): Promise<OpportunityIdentificationResult> {
  try {
    const result = await mockLLMAnalyze(SYSTEM_PROMPT, prompt);

    // Validate required fields
    if (
      !result.summary ||
      !Array.isArray(result.opportunities) ||
      !result.priorityAction
    ) {
      throw new Error('Invalid LLM response format');
    }

    return result as OpportunityIdentificationResult;
  } catch (error) {
    throw new Error(
      `LLM call failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Main analyze function for opportunity identification
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
    console.error(`[opportunity-identification] Error: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
