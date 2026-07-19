/**
 * Shared utility functions for agents
 */

/**
 * Standard engagement calculation - consistent across all agents
 * Includes: likes, comments, shares, upvotes, clicks, conversions, leads, subscribers
 */
export function calculateEngagement(metrics: any): number {
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

/**
 * Basic engagement calculation (for sentiment analysis - likes, comments, shares only)
 */
export function calculateBasicEngagement(metrics: any): number {
  if (!metrics) return 0;
  
  return (
    (metrics.likes || 0) +
    (metrics.comments || 0) +
    (metrics.shares || 0)
  );
}

/**
 * Standard reach/impressions calculation
 */
export function calculateReach(metrics: any): number {
  if (!metrics) return 0;
  
  return (
    (metrics.impressions || 0) ||
    (metrics.reach || 0) ||
    (metrics.views || 0) ||
    (metrics.sessions || 0)
  );
}

/**
 * Safe number conversion
 */
export function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}
