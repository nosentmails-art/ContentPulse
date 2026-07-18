/**
 * Agent Analyzer Index
 * Central export for all agent analyzers
 */

export { analyzeAudienceBehavior } from './audienceBehavior';
export { analyzeChannelPerformance } from './channelPerformance';
export { analyzeSentiment } from './sentimentAnalysis';
export { analyzeContentGaps } from './contentGaps';
export { analyzeBenchmarking } from './competitorBenchmarking';
export { analyzeEngagementOptimization } from './engagementOptimizer';
export { analyzeAndSpotTrends } from './trendSpotter';

export type { AudienceBehaviorResult } from './audienceBehavior';
export type { ChannelPerformanceResult } from './channelPerformance';
export type { SentimentAnalysisResult } from './sentimentAnalysis';
export type { ContentGapsResult } from './contentGaps';
export type { CompetitorBenchmarkingResult } from './competitorBenchmarking';
export type { EngagementOptimizerResult } from './engagementOptimizer';
export type { TrendSpotterResult } from './trendSpotter';

// Map agent types to analyzer functions
export const agentAnalyzers: Record<string, (tenantId: string, attributes?: Record<string, boolean>) => Promise<any>> = {
  AUDIENCE_BEHAVIOR: analyzeAudienceBehavior,
  CHANNEL_PERFORMANCE: analyzeChannelPerformance,
  SENTIMENT_ANALYSIS: analyzeSentiment,
  CONTENT_GAPS: analyzeContentGaps,
  COMPETITOR_BENCHMARKING: analyzeBenchmarking,
  ENGAGEMENT_OPTIMIZER: analyzeEngagementOptimization,
  TREND_SPOTTER: analyzeAndSpotTrends,
};
