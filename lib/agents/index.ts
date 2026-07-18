/**
 * AI Analyzer Agents Index
 * Central export point for all ContentPulse analyzers
 */

export { analyze as analyzeAudienceIntelligence } from './audience-intelligence';
export type { AudienceIntelligenceResult } from './audience-intelligence';

export { analyze as analyzeChannelIntelligence } from './channel-intelligence';
export type { ChannelIntelligenceResult } from './channel-intelligence';

export { analyze as analyzeSentiment } from './sentiment-analysis';
export type { SentimentAnalysisResult } from './sentiment-analysis';

export { analyze as analyzeCompetitors } from './competitor-analysis';
export type { CompetitorAnalysisResult } from './competitor-analysis';

export { analyze as identifyOpportunities } from './opportunity-identification';
export type { OpportunityIdentificationResult } from './opportunity-identification';

export { analyze as analyzeGapAnalysis } from './gap-analysis';
export type { GapAnalysisResult } from './gap-analysis';

/**
 * Agent analysis result - generic wrapper for any agent result
 */
export interface GenericAgentResult {
  success: boolean;
  data?: any;
  error?: string;
}
