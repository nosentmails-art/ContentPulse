/**
 * Sentiment Analysis Agent
 * Analyzes audience sentiment and emotional themes in comments/engagement
 */

import prisma from '../db';
import { mockLLMAnalyze } from './llm-helper';

/**
 * Result interface for sentiment analysis
 */
export interface SentimentAnalysisResult {
  overallScore: number;
  overallLabel: string;
  positiveThemes: string[];
  negativeThemes: string[];
  topPositiveComment: string;
  topNegativeComment: string;
  actionableInsight: string;
}

/**
 * Agent result wrapper
 */
export interface AgentResult {
  success: boolean;
  data?: SentimentAnalysisResult;
  error?: string;
}

const SYSTEM_PROMPT =
  'You are a senior content strategist and data analyst with 10 years of experience. Analyze the provided data and generate specific, numbered, actionable insights. Always cite specific numbers. Output ONLY valid JSON matching the specified format exactly.';

/**
 * Builds a data summary from content comments and sentiment indicators
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
    return 'No content data available for sentiment analysis.';
  }

  let summary = 'Content Comments and Sentiment Data:\n\n';

  // Collect comment text and metrics
  const comments: string[] = [];
  let totalComments = 0;
  let totalLikes = 0;
  let totalShares = 0;
  let positiveMetricsCount = 0;

  for (const item of contentItems) {
    if (item.metrics) {
      totalComments += item.metrics.comments || 0;
      totalLikes += item.metrics.likes || 0;
      totalShares += item.metrics.shares || 0;

      // Collect comment text if available
      if (item.metrics.commentText) {
        comments.push(item.metrics.commentText);
      }

      // Items with high engagement are generally positive
      const engagement =
        (item.metrics.likes || 0) + (item.metrics.comments || 0) + (item.metrics.shares || 0);
      if (engagement > 10) {
        positiveMetricsCount++;
      }
    }
  }

  summary += `Total Content Pieces: ${contentItems.length}\n`;
  summary += `Total Engagement Metrics:\n`;
  summary += `  Comments: ${totalComments}\n`;
  summary += `  Likes: ${totalLikes}\n`;
  summary += `  Shares: ${totalShares}\n`;
  summary += `  High-engagement pieces (10+ total engagement): ${positiveMetricsCount}\n`;

  // Add sample comments
  if (comments.length > 0) {
    summary += `\nSample Comments (${comments.length} available):\n`;
    comments.slice(0, 5).forEach((comment, i) => {
      const preview = comment.substring(0, 100).replace(/\n/g, ' ');
      summary += `  ${i + 1}. "${preview}..."\n`;
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
  let prompt = `${dataSummary}

Analyze the sentiment and emotional tone of audience engagement. Identify positive and negative themes in comments and metrics.

${
  enabledAttributes.includes('sentiment_score')
    ? `
Overall Sentiment Score:
- Calculate an overall sentiment score (0-100, where 100 is most positive)
- Base it on engagement metrics, comment tone, and share/like ratios
`
    : ''
}

${
  enabledAttributes.includes('themes')
    ? `
Sentiment Themes:
- Identify 3-4 positive themes mentioned in comments/engagement
- Identify 2-3 negative themes or concerns
- Cite specific patterns from the data
`
    : ''
}

${
  enabledAttributes.includes('audience_tone')
    ? `
Audience Tone:
- Describe the overall emotional tone of your audience
- Note any shifts in sentiment over recent content
- Identify what triggers positive vs negative responses
`
    : ''
}

${
  enabledAttributes.includes('recommendations')
    ? `
Sentiment-Based Recommendations:
- Suggest what topics/themes to emphasize more
- Highlight what to avoid or address
- Recommend how to leverage positive sentiment
`
    : ''
}

Return your analysis as a JSON object with this exact structure:
{
  "overallScore": 75,
  "overallLabel": "Positive" or "Neutral" or "Negative",
  "positiveThemes": [
    "Theme 1 with evidence",
    "Theme 2 with evidence"
  ],
  "negativeThemes": [
    "Concern 1 with evidence",
    "Concern 2 with evidence"
  ],
  "topPositiveComment": "An example of a positive comment or theme from the data",
  "topNegativeComment": "An example of a negative comment or concern from the data",
  "actionableInsight": "One specific action based on sentiment analysis (with numbers where applicable)"
}`;

  return prompt;
}

/**
 * Calls the LLM analyzer (server-side helper, no fetch)
 */
async function callLLM(prompt: string): Promise<SentimentAnalysisResult> {
  try {
    const result = await mockLLMAnalyze(SYSTEM_PROMPT, prompt);

    // Validate required fields
    if (
      typeof result.overallScore !== 'number' ||
      !result.overallLabel ||
      !Array.isArray(result.positiveThemes) ||
      !Array.isArray(result.negativeThemes) ||
      !result.topPositiveComment ||
      !result.topNegativeComment ||
      !result.actionableInsight
    ) {
      throw new Error('Invalid LLM response format');
    }


    return result as SentimentAnalysisResult;
  } catch (error) {
    throw new Error(
      `LLM call failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Main analyze function for sentiment analysis
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
    console.error(`[sentiment-analysis] Error: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
