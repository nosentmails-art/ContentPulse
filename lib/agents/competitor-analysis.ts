/**
 * Competitor Analysis Agent
 * Analyzes coverage gaps and competitive advantages
 */

import prisma from '../db';
import { mockLLMAnalyze } from './llm-helper';

/**
 * Result interface for competitor analysis
 */
export interface CompetitorAnalysisResult {
  summary: string;
  gaps: Array<{
    topic: string;
    competitorCoverage: string;
    yourCoverage: string;
    opportunity: string;
  }>;
  theirStrengths: string[];
  yourAdvantages: string[];
  topRecommendation: string;
}

/**
 * Agent result wrapper
 */
export interface AgentResult {
  success: boolean;
  data?: CompetitorAnalysisResult;
  error?: string;
}

const SYSTEM_PROMPT =
  'You are a senior content strategist and data analyst with 10 years of experience. Analyze the provided data and generate specific, numbered, actionable insights. Always cite specific numbers. Output ONLY valid JSON matching the specified format exactly.';

/**
 * Builds a data summary comparing your content with competitors
 */
async function buildDataSummary(
  tenantId: string,
  enabledAttributes: string[]
): Promise<string> {
  // Get tenant's content
  const contentItems = await prisma.contentItem.findMany({
    where: { tenantId },
    include: { metrics: true },
    take: 50,
  });

  // Get competitors
  const competitors = await prisma.competitor.findMany({
    where: { tenantId },
    take: 5,
  });

  let summary = 'Competitive Content Analysis:\n\n';

  // Your content overview
  summary += 'YOUR CONTENT:\n';
  if (contentItems.length === 0) {
    summary += '  No content data available.\n';
  } else {
    const uniqueTopics = new Set<string>();
    const uniqueFormats = new Set<string>();
    let totalEngagement = 0;

    for (const item of contentItems) {
      if (item.title) {
        uniqueTopics.add(item.title.substring(0, 50));
      }
      if (item.contentType) {
        uniqueFormats.add(item.contentType);
      }
      if (item.metrics) {
        totalEngagement += (item.metrics.likes || 0) + (item.metrics.comments || 0) + (item.metrics.shares || 0);
      }
    }

    summary += `  Total pieces: ${contentItems.length}\n`;
    summary += `  Unique formats: ${Array.from(uniqueFormats).join(', ') || 'unknown'}\n`;
    summary += `  Total engagement: ${totalEngagement.toFixed(0)}\n`;
    summary += `  Avg engagement per piece: ${(totalEngagement / contentItems.length).toFixed(0)}\n`;
  }

  // Competitors overview
  if (competitors.length > 0) {
    summary += `\nCOMPETITORS (${competitors.length} tracked):\n`;
    for (const competitor of competitors) {
      summary += `  - ${competitor.name} (${competitor.url})\n`;
      if (competitor.niche) {
        summary += `    Niche: ${competitor.niche}\n`;
      }
    }
  } else {
    summary += '\nNO COMPETITORS TRACKED - Unable to perform comparative analysis.\n';
  }

  // Content comparison hints
  summary += '\nCONTENT COMPARISON FOCUS:\n';
  summary += '  - Topics you cover vs competitors\n';
  summary += '  - Content formats used\n';
  summary += '  - Engagement levels and growth\n';
  summary += '  - Unique positioning and gaps\n';

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

Analyze the competitive landscape and identify content gaps and opportunities.

${
  enabledAttributes.includes('coverage_gaps')
    ? `
Coverage Gaps:
- Identify 2-3 topics competitors cover that you don't (or cover minimally)
- For each gap, suggest how you could capitalize on it
- Cite specific numbers from the data
`
    : ''
}

${
  enabledAttributes.includes('competitor_strengths')
    ? `
Competitor Strengths:
- Identify what competitors do well
- Note their high-performing content types or topics
- Provide specific metrics where available
`
    : ''
}

${
  enabledAttributes.includes('your_advantages')
    ? `
Your Competitive Advantages:
- Identify where you outperform competitors
- Highlight unique content angles or formats you use
- Note higher engagement or reach where applicable
`
    : ''
}

${
  enabledAttributes.includes('market_positioning')
    ? `
Market Positioning:
- Define your unique positioning relative to competitors
- Identify white space or underserved areas
- Suggest strategic focus areas
`
    : ''
}

Return your analysis as a JSON object with this exact structure:
{
  "summary": "Overview of competitive landscape (1-2 sentences with specific numbers)",
  "gaps": [
    {
      "topic": "Topic competitors cover more than you",
      "competitorCoverage": "How competitors approach this topic (e.g., 10+ pieces/month)",
      "yourCoverage": "Your current coverage (e.g., 2 pieces/month or none)",
      "opportunity": "Why this is an opportunity and how to leverage it"
    }
  ],
  "theirStrengths": [
    "Specific strength #1 with metrics",
    "Specific strength #2 with metrics"
  ],
  "yourAdvantages": [
    "Your advantage #1 with proof",
    "Your advantage #2 with proof"
  ],
  "topRecommendation": "Your single most important competitive action (with specific numbers/timeline)"
}`;

  return prompt;
}

/**
 * Calls the LLM analyzer (server-side helper, no fetch)
 */
async function callLLM(prompt: string): Promise<CompetitorAnalysisResult> {
  try {
    const result = await mockLLMAnalyze(SYSTEM_PROMPT, prompt);

    // Validate required fields
    if (
      !result.summary ||
      !Array.isArray(result.gaps) ||
      !Array.isArray(result.theirStrengths) ||
      !Array.isArray(result.yourAdvantages) ||
      !result.topRecommendation
    ) {
      throw new Error('Invalid LLM response format');
    }

    return result as CompetitorAnalysisResult;
  } catch (error) {
    throw new Error(
      `LLM call failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Main analyze function for competitor analysis
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
    console.error(`[competitor-analysis] Error: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
