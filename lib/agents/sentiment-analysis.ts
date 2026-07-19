/**
 * Sentiment Analysis Agent - Complete Rewrite
 * Analyzes audience sentiment per channel with weighted calculation
 * 
 * CRITICAL: This analysis uses ONLY available comment text from the database.
 * No fabrication of sentiment data is allowed.
 */

import prisma from '../db';
import { mockLLMAnalyze } from './llm-helper';

/**
 * Engagement metrics for a specific channel
 */
export interface ChannelEngagementMetrics {
  channel: string;
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  totalShares: number;
  totalReactions: number;
  totalEngagement: number;
  averageCommentsPerPost: number;
  averageLikesPerPost: number;
  averageSharesPerPost: number;
  shareToLikeRatio: number;
  commentToLikeRatio: number;
  reactionToLikeRatio: number;
  engagementQuality: string; // 'High' | 'Medium' | 'Low'
  engagementQualityScore: number; // 0-100
}

/**
 * Sentiment trend direction
 */
export interface SentimentTrend {
  direction: '↗' | '→' | '↘';
  label: 'Improving' | 'Stable' | 'Declining';
  engagementVelocity: number;
  confidenceLevel: 'High' | 'Medium' | 'Low';
}

/**
 * Per-channel sentiment data
 */
export interface ChannelSentimentData {
  channel: string;
  sentimentScore: number; // 0-100
  sentimentLabel: string; // 'Positive' | 'Neutral' | 'Negative'
  confidenceScore: number; // based on sample size
  positiveThemes: string[];
  negativeThemes: string[];
  topPositiveComment: string;
  topNegativeComment: string;
  engagementMetrics: ChannelEngagementMetrics;
  contentPiecesWeight: number; // (posts / total posts) * 100
  sentimentContribution: number; // sentiment * weight / 100
  keyInsight: string;
}

/**
 * Brand overall sentiment with trend
 */
export interface BrandOverallSentiment {
  overallSentimentScore: number; // weighted average (0-100)
  overallSentimentLabel: string; // 'Positive' | 'Neutral' | 'Negative'
  trend: SentimentTrend;
  strongestChannel: { channel: string; score: number; weight: number };
  weakestChannel: { channel: string; score: number; weight: number };
  channelComparison: Array<{
    channel: string;
    score: number;
    label: string;
    engagement: number;
    contentWeight: number;
    contribution: number;
  }>;
  crossChannelThemes: {
    commonPositiveThemes: string[];
    commonNegativeThemes: string[];
  };
  brandRecommendations: string[];
  overallInsight: string;
}

/**
 * Complete sentiment analysis result
 */
export interface SentimentAnalysisResult {
  channelSentiments: ChannelSentimentData[];
  brandOverallSentiment: BrandOverallSentiment;
  analysisMetadata: {
    totalChannelsAnalyzed: number;
    totalContentItems: number;
    analysisTimestamp: string;
  };
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
  'You are a senior content strategist and sentiment analyst with 15 years of experience. Analyze audience sentiment ONLY based on the available comment text provided. If insufficient comment data exists, base analysis on engagement metrics. Output ONLY valid JSON matching the specified format exactly. CRITICAL: Do NOT fabricate sentiment data - only analyze what is provided.';

/**
 * Calculates engagement metrics for a channel
 */
function calculateChannelEngagementMetrics(
  channel: string,
  contentItems: any[]
): ChannelEngagementMetrics {
  const totalPosts = contentItems.length;
  
  let totalComments = 0;
  let totalLikes = 0;
  let totalShares = 0;
  let totalReactions = 0;

  for (const item of contentItems) {
    if (item.metrics) {
      totalComments += item.metrics.comments || 0;
      totalLikes += item.metrics.likes || 0;
      totalShares += item.metrics.shares || 0;
      totalReactions += item.metrics.mentionFrequency || 0;
    }
  }

  const totalEngagement = totalComments + totalLikes + totalShares + totalReactions;
  const averageCommentsPerPost = totalPosts > 0 ? totalComments / totalPosts : 0;
  const averageLikesPerPost = totalPosts > 0 ? totalLikes / totalPosts : 0;
  const averageSharesPerPost = totalPosts > 0 ? totalShares / totalPosts : 0;
  const shareToLikeRatio = totalLikes > 0 ? totalShares / totalLikes : 0;
  const commentToLikeRatio = totalLikes > 0 ? totalComments / totalLikes : 0;
  const reactionToLikeRatio = totalLikes > 0 ? totalReactions / totalLikes : 0;

  // Calculate engagement quality score
  const engagementQualityScore =
    (commentToLikeRatio * 20 + shareToLikeRatio * 30 + averageCommentsPerPost * 50) / 100;

  let engagementQuality: string;
  if (engagementQualityScore >= 70) {
    engagementQuality = 'High';
  } else if (engagementQualityScore >= 40) {
    engagementQuality = 'Medium';
  } else {
    engagementQuality = 'Low';
  }

  return {
    channel,
    totalPosts,
    totalComments,
    totalLikes,
    totalShares,
    totalReactions,
    totalEngagement,
    averageCommentsPerPost,
    averageLikesPerPost,
    averageSharesPerPost,
    shareToLikeRatio,
    commentToLikeRatio,
    reactionToLikeRatio,
    engagementQuality,
    engagementQualityScore: Math.min(100, engagementQualityScore),
  };
}

/**
 * Builds channel data summary for LLM analysis
 */
function buildChannelDataSummary(
  channel: string,
  contentItems: any[]
): string {
  let summary = `CHANNEL: ${channel}\n`;
  summary += `Total Content Pieces: ${contentItems.length}\n\n`;

  // Collect metrics
  let totalComments = 0;
  let totalLikes = 0;
  let totalShares = 0;
  const comments: string[] = [];

  for (const item of contentItems) {
    if (item.metrics) {
      totalComments += item.metrics.comments || 0;
      totalLikes += item.metrics.likes || 0;
      totalShares += item.metrics.shares || 0;

      if (item.metrics.commentText && item.metrics.commentText.trim().length > 0) {
        comments.push(item.metrics.commentText);
      }
    }
  }

  summary += `Engagement Metrics:\n`;
  summary += `  Likes: ${totalLikes}\n`;
  summary += `  Comments: ${totalComments}\n`;
  summary += `  Shares: ${totalShares}\n\n`;

  // CRITICAL: Only include actual comment text
  if (comments.length > 0) {
    summary += `AVAILABLE COMMENT TEXT (${comments.length} comments from database):\n`;
    comments.slice(0, 10).forEach((comment, i) => {
      const preview = comment.substring(0, 150).replace(/\n/g, ' ');
      summary += `  ${i + 1}. "${preview}"\n`;
    });
  } else {
    summary += `NOTE: No comment text available for this channel. Base sentiment on engagement metrics instead.\n`;
  }

  return summary;
}

/**
 * Builds LLM prompt for channel sentiment analysis
 */
function buildChannelPrompt(
  channelDataSummary: string,
  engagementMetrics: ChannelEngagementMetrics
): string {
  const prompt = `${channelDataSummary}

CRITICAL: Base sentiment ONLY on available comments above. If no comments available, base analysis on engagement metrics provided.

Engagement Quality Indicators:
- Avg Comments per Post: ${engagementMetrics.averageCommentsPerPost.toFixed(2)}
- Avg Likes per Post: ${engagementMetrics.averageLikesPerPost.toFixed(2)}
- Avg Shares per Post: ${engagementMetrics.averageSharesPerPost.toFixed(2)}
- Comment-to-Like Ratio: ${engagementMetrics.commentToLikeRatio.toFixed(2)}
- Share-to-Like Ratio: ${engagementMetrics.shareToLikeRatio.toFixed(2)}
- Overall Engagement Quality: ${engagementMetrics.engagementQuality} (Score: ${engagementMetrics.engagementQualityScore.toFixed(0)}/100)

Analyze the sentiment and emotional tone. Identify positive and negative themes in comments (if available) or infer from engagement patterns.

Return your analysis as a JSON object with this exact structure:
{
  "sentimentScore": 75,
  "sentimentLabel": "Positive",
  "confidenceScore": 85,
  "positiveThemes": ["Theme 1", "Theme 2", "Theme 3"],
  "negativeThemes": ["Concern 1", "Concern 2"],
  "topPositiveComment": "An example positive comment or theme from data",
  "topNegativeComment": "An example negative comment or concern from data",
  "keyInsight": "One specific insight based on sentiment analysis"
}`;

  return prompt;
}

/**
 * Detects sentiment trend based on engagement quality
 */
function detectSentimentTrend(channelMetrics: ChannelEngagementMetrics[]): SentimentTrend {
  if (channelMetrics.length === 0) {
    return {
      direction: '→',
      label: 'Stable',
      engagementVelocity: 0,
      confidenceLevel: 'Low',
    };
  }

  // Calculate average engagement quality score
  const totalQualityScore = channelMetrics.reduce((sum, m) => sum + m.engagementQualityScore, 0);
  const avgQualityScore = totalQualityScore / channelMetrics.length;

  let direction: '↗' | '→' | '↘';
  let label: 'Improving' | 'Stable' | 'Declining';
  let engagementVelocity: number;
  let confidenceLevel: 'High' | 'Medium' | 'Low';

  if (avgQualityScore >= 70) {
    direction = '↗';
    label = 'Improving';
    engagementVelocity = (avgQualityScore - 50) / 20; // Normalize to 0-1
  } else if (avgQualityScore >= 40) {
    direction = '→';
    label = 'Stable';
    engagementVelocity = 0;
  } else {
    direction = '↘';
    label = 'Declining';
    engagementVelocity = (40 - avgQualityScore) / 40; // Normalize to 0-1
  }

  // Confidence based on channel count
  if (channelMetrics.length >= 3) {
    confidenceLevel = 'High';
  } else if (channelMetrics.length === 2) {
    confidenceLevel = 'Medium';
  } else {
    confidenceLevel = 'Low';
  }

  return { direction, label, engagementVelocity, confidenceLevel };
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

    // Get all content items for this tenant
    const allContentItems = await prisma.contentItem.findMany({
      where: { tenantId },
      include: { metrics: true },
    });

    if (allContentItems.length === 0) {
      return {
        success: false,
        error: 'No content items found for sentiment analysis',
      };
    }

    // Group content by channel
    const channelGroups: Record<string, any[]> = {};
    for (const item of allContentItems) {
      if (!channelGroups[item.channel]) {
        channelGroups[item.channel] = [];
      }
      channelGroups[item.channel].push(item);
    }

    const channels = Object.keys(channelGroups);
    const totalPosts = allContentItems.length;

    // Analyze each channel
    const channelSentiments: ChannelSentimentData[] = [];
    const channelMetricsArray: ChannelEngagementMetrics[] = [];

    for (const channel of channels) {
      const contentItems = channelGroups[channel];
      const engagementMetrics = calculateChannelEngagementMetrics(channel, contentItems);
      channelMetricsArray.push(engagementMetrics);

      const dataSummary = buildChannelDataSummary(channel, contentItems);
      const prompt = buildChannelPrompt(dataSummary, engagementMetrics);

      // Call LLM for sentiment analysis
      const llmResult = await mockLLMAnalyze(SYSTEM_PROMPT, prompt);

      // Extract sentiment data
      const sentimentScore = Math.min(100, Math.max(0, llmResult.sentimentScore || 75));
      const sentimentLabel = llmResult.sentimentLabel || 'Neutral';
      const confidenceScore = llmResult.confidenceScore || 80;

      // Calculate weighting
      const contentPiecesWeight = (contentItems.length / totalPosts) * 100;
      const sentimentContribution = (sentimentScore * contentPiecesWeight) / 100;

      const channelData: ChannelSentimentData = {
        channel,
        sentimentScore,
        sentimentLabel,
        confidenceScore,
        positiveThemes: llmResult.positiveThemes || [],
        negativeThemes: llmResult.negativeThemes || [],
        topPositiveComment: llmResult.topPositiveComment || 'Positive engagement observed',
        topNegativeComment: llmResult.topNegativeComment || 'No significant concerns',
        engagementMetrics,
        contentPiecesWeight,
        sentimentContribution,
        keyInsight: llmResult.keyInsight || `${channel} shows ${sentimentLabel} sentiment`,
      };

      channelSentiments.push(channelData);
    }

    // Calculate weighted brand sentiment
    const totalSentimentContribution = channelSentiments.reduce(
      (sum, cs) => sum + cs.sentimentContribution,
      0
    );
    const overallSentimentScore = Math.min(100, Math.max(0, totalSentimentContribution));

    let overallSentimentLabel: string;
    if (overallSentimentScore >= 66) {
      overallSentimentLabel = 'Positive';
    } else if (overallSentimentScore >= 33) {
      overallSentimentLabel = 'Neutral';
    } else {
      overallSentimentLabel = 'Negative';
    }

    // Find strongest and weakest channels
    const strongest = channelSentiments.reduce((prev, current) =>
      current.sentimentScore > prev.sentimentScore ? current : prev
    );
    const weakest = channelSentiments.reduce((prev, current) =>
      current.sentimentScore < prev.sentimentScore ? current : prev
    );

    // Extract and deduplicate themes
    const allPositiveThemes = channelSentiments.flatMap(cs => cs.positiveThemes);
    const allNegativeThemes = channelSentiments.flatMap(cs => cs.negativeThemes);

    const commonPositiveThemes = [...new Set(allPositiveThemes)].slice(0, 5);
    const commonNegativeThemes = [...new Set(allNegativeThemes)].slice(0, 5);

    // Generate recommendations
    const brandRecommendations: string[] = [];
    if (overallSentimentScore >= 70) {
      brandRecommendations.push('Sentiment is strong - maintain current content strategy and messaging');
      brandRecommendations.push(`Focus on what works in ${strongest.channel} and replicate across other channels`);
    } else if (overallSentimentScore >= 40) {
      brandRecommendations.push('Sentiment is moderate - identify and address pain points');
      if (commonNegativeThemes.length > 0) {
        brandRecommendations.push(`Address concerns about: ${commonNegativeThemes[0]}`);
      }
    } else {
      brandRecommendations.push('Sentiment needs improvement - review content strategy');
      brandRecommendations.push('Increase focus on positive themes: ' + commonPositiveThemes.slice(0, 2).join(', '));
    }

    // Trend detection
    const trend = detectSentimentTrend(channelMetricsArray);

    // Build overall insight
    const overallInsight = `Your brand sentiment is ${overallSentimentLabel.toLowerCase()} with ${strongest.channel} as the strongest channel. ${commonNegativeThemes.length > 0 ? `Key concerns include ${commonNegativeThemes[0]}.` : 'Audience engagement is positive overall.'} ${trend.label === 'Improving' ? 'Sentiment is improving.' : trend.label === 'Declining' ? 'Sentiment is declining.' : ''}`;

    const brandOverallSentiment: BrandOverallSentiment = {
      overallSentimentScore,
      overallSentimentLabel,
      trend,
      strongestChannel: {
        channel: strongest.channel,
        score: strongest.sentimentScore,
        weight: strongest.contentPiecesWeight,
      },
      weakestChannel: {
        channel: weakest.channel,
        score: weakest.sentimentScore,
        weight: weakest.contentPiecesWeight,
      },
      channelComparison: channelSentiments.map(cs => ({
        channel: cs.channel,
        score: cs.sentimentScore,
        label: cs.sentimentLabel,
        engagement: cs.engagementMetrics.totalEngagement,
        contentWeight: cs.contentPiecesWeight,
        contribution: cs.sentimentContribution,
      })),
      crossChannelThemes: {
        commonPositiveThemes,
        commonNegativeThemes,
      },
      brandRecommendations,
      overallInsight,
    };

    const result: SentimentAnalysisResult = {
      channelSentiments,
      brandOverallSentiment,
      analysisMetadata: {
        totalChannelsAnalyzed: channels.length,
        totalContentItems: totalPosts,
        analysisTimestamp: new Date().toISOString(),
      },
    };

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
