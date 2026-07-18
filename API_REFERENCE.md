/**
 * API Reference for Frontend Team
 * All endpoints ready to use with fetch() or axios
 */

// ============================================================================
// TENANTS
// ============================================================================

/**
 * GET /api/tenants
 * Fetch all available tenants for the tenant switcher
 * 
 * Response:
 * [
 *   { id: "...", name: "DevInsights Blog", slug: "devinsights" },
 *   { id: "...", name: "GrowthStack Weekly", slug: "growthstack" }
 * ]
 */

// ============================================================================
// AGENTS
// ============================================================================

/**
 * GET /api/[tenant]/agents
 * Fetch all agents with their attributes and latest run status
 * 
 * Response:
 * [
 *   {
 *     id: "...",
 *     type: "SENTIMENT_ANALYSIS",
 *     status: "ENABLED",
 *     attributes: [
 *       { id: "...", key: "detect_emotions", label: "Detect Emotions", value: true }
 *     ],
 *     runs: [
 *       { id: "...", status: "completed", result: {...}, startedAt: "...", endedAt: "..." }
 *     ]
 *   }
 * ]
 */

/**
 * PATCH /api/[tenant]/agents/[agentType]
 * Toggle an agent on/off
 * 
 * Request Body:
 * { status: "ENABLED" | "DISABLED" }
 * 
 * Response:
 * { id: "...", tenantId: "...", type: "SENTIMENT_ANALYSIS", status: "DISABLED", ... }
 */

/**
 * PATCH /api/[tenant]/agents/[agentType]/attributes/[key]
 * Toggle an agent attribute
 * 
 * Request Body:
 * { value: true | false }
 * 
 * Response:
 * { id: "...", agentId: "...", key: "detect_emotions", label: "Detect Emotions", value: false, ... }
 */

/**
 * POST /api/[tenant]/agents/[agentType]/run
 * Trigger an agent run
 * 
 * Response (202 Accepted):
 * {
 *   id: "...",
 *   status: "pending",
 *   message: "Agent run queued. Check /api/[tenant]/agents/[agentType]/runs/latest for status."
 * }
 */

/**
 * GET /api/[tenant]/agents/[agentType]/runs
 * Fetch the latest run status for polling
 * 
 * Response (200 if exists):
 * {
 *   id: "...",
 *   status: "pending" | "running" | "completed" | "failed",
 *   result: { insights: [...], summary: "..." },
 *   error: null | "error message",
 *   startedAt: "2024-01-18T10:30:00Z",
 *   endedAt: "2024-01-18T10:35:00Z"
 * }
 * 
 * Response (404 if no runs):
 * { status: "no_runs", message: "No runs yet" }
 */

// ============================================================================
// FILE UPLOAD
// ============================================================================

/**
 * POST /api/[tenant]/upload
 * Upload CSV or Excel file with content metrics
 * 
 * Request Body: multipart/form-data
 * FormData.append('file', fileObject)
 * 
 * Response (202 Accepted):
 * {
 *   message: "File upload received",
 *   fileName: "data.csv",
 *   size: 5240,
 *   itemsCreated: 0
 * }
 */

/**
 * GET /api/[tenant]/connect/status
 * Fetch connector status (how many items uploaded, by channel)
 * 
 * Response:
 * {
 *   connected: true,
 *   contentItemsCount: 125,
 *   channels: [
 *     { name: "LINKEDIN", count: 45 },
 *     { name: "BLOG", count: 80 }
 *   ],
 *   metrics: [
 *     { channel: "LINKEDIN", period: "2024-01", data: {...} }
 *   ]
 * }
 */

/**
 * GET /api/[tenant]/connect/template/[channel]
 * Download CSV template for a specific channel
 * Channels: LINKEDIN | YOUTUBE | BLOG | EMAIL | REDDIT | GOOGLE_PPC
 * 
 * Response: CSV file (text/csv)
 * Headers depend on channel
 */

// ============================================================================
// REPORTS
// ============================================================================

/**
 * GET /api/[tenant]/report
 * Fetch aggregated intelligence report from all agents
 * 
 * Response:
 * {
 *   tenantId: "...",
 *   tenantName: "DevInsights Blog",
 *   generatedAt: "2024-01-18T10:40:00Z",
 *   agents: {
 *     SENTIMENT_ANALYSIS: {
 *       latestRun: {
 *         completedAt: "2024-01-18T10:35:00Z",
 *         insights: { overall: {...}, byChannel: {...} }
 *       }
 *     },
 *     CHANNEL_PERFORMANCE: { latestRun: {...} },
 *     ...
 *   },
 *   contentStatistics: [
 *     { channel: "LINKEDIN", itemCount: 45 },
 *     { channel: "BLOG", itemCount: 80 }
 *   ],
 *   competitors: [
 *     { id: "...", name: "TechBlog Pro", url: "https://...", notes: "..." }
 *   ]
 * }
 */

// ============================================================================
// COMPETITORS
// ============================================================================

/**
 * GET /api/[tenant]/competitors
 * Fetch all tracked competitors
 * 
 * Response:
 * [
 *   {
 *     id: "...",
 *     name: "TechBlog Pro",
 *     url: "https://techblogpro.com",
 *     notes: "Main competitor in dev blog space",
 *     createdAt: "2024-01-01T...",
 *     updatedAt: "2024-01-18T..."
 *   }
 * ]
 */

/**
 * POST /api/[tenant]/competitors
 * Add a new competitor to track
 * 
 * Request Body:
 * {
 *   name: "TechBlog Pro",
 *   url: "https://techblogpro.com",
 *   notes: "Main competitor in dev blog space"
 * }
 * 
 * Response (201 Created):
 * { id: "...", name: "TechBlog Pro", url: "...", notes: "...", ... }
 */

// ============================================================================
// AGENT TYPES
// ============================================================================

/**
 * The 7 agent types available:
 * 
 * 1. AUDIENCE_BEHAVIOR
 *    - Analyzes audience demographics, psychographics, behavior patterns
 *    - Result: { segments, peakTimes, demographics, psychographics, recommendations }
 * 
 * 2. CHANNEL_PERFORMANCE
 *    - Compares performance across channels (LinkedIn, Blog, YouTube, etc.)
 *    - Result: { channels, topPerformer, recommendedFocus, channelComparison }
 * 
 * 3. SENTIMENT_ANALYSIS
 *    - Analyzes emotional tone and sentiment from content
 *    - Result: { overall, byChannel, emotionalDrivers, brandMentions, recommendations }
 * 
 * 4. CONTENT_GAPS
 *    - Identifies missing topics and content opportunities
 *    - Result: { gaps, topicClusters, recommendations, contentCalendar }
 * 
 * 5. COMPETITOR_BENCHMARKING
 *    - Tracks and compares competitor performance
 *    - Result: { competitors, marketPosition, recommendations, opportunitiesVsCompetitors }
 * 
 * 6. ENGAGEMENT_OPTIMIZER
 *    - Recommends timing, formats, and content strategy
 *    - Result: { timingRecommendations, formatRecommendations, contentStrategy, actionItems }
 * 
 * 7. TREND_SPOTTER
 *    - Detects emerging trends and predicts performance peaks
 *    - Result: { emergingTrends, performancePeaks, seasonalPatterns, recommendations }
 */

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/*

// Get all tenants
const tenants = await fetch('/api/tenants').then(r => r.json());

// Get agents for a tenant
const agents = await fetch('/api/devinsights/agents').then(r => r.json());

// Toggle agent on
await fetch('/api/devinsights/agents/SENTIMENT_ANALYSIS', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'ENABLED' })
});

// Toggle an attribute
await fetch('/api/devinsights/agents/SENTIMENT_ANALYSIS/attributes/detect_emotions', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ value: false })
});

// Run an agent (returns immediately with pending status)
const run = await fetch('/api/devinsights/agents/SENTIMENT_ANALYSIS/run', {
  method: 'POST'
}).then(r => r.json());

// Poll for results
let status = await fetch('/api/devinsights/agents/SENTIMENT_ANALYSIS/runs').then(r => r.json());
while (status.status === 'pending') {
  await new Promise(resolve => setTimeout(resolve, 1000));
  status = await fetch('/api/devinsights/agents/SENTIMENT_ANALYSIS/runs').then(r => r.json());
}

// Get the full report
const report = await fetch('/api/devinsights/report').then(r => r.json());

// Upload a file
const formData = new FormData();
formData.append('file', csvFileObject);
await fetch('/api/devinsights/upload', {
  method: 'POST',
  body: formData
});

// Get connector status
const status = await fetch('/api/devinsights/connect/status').then(r => r.json());

// Download a CSV template
const template = await fetch('/api/devinsights/connect/template/LINKEDIN').then(r => r.text());

// Get competitors
const competitors = await fetch('/api/devinsights/competitors').then(r => r.json());

// Add a competitor
await fetch('/api/devinsights/competitors', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Competitor Name',
    url: 'https://competitor.com',
    notes: 'Notes'
  })
});

*/
