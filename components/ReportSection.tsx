/**
 * ReportSection Component
 * @author sanat.k.mahapatra
 * 
 * Displays individual agent output in the unified report page
 * Handles nested objects (matrix, segments, gaps, competitors) with proper rendering
 */

import SentimentDashboard from './SentimentDashboard';

interface ReportSectionProps {
  agentType: string;
  title: string;
  data: any;
  status: string;
}

const agentNames: Record<string, string> = {
  CONTENT_ANALYTICS: "Content Analytics",
  AUDIENCE_INTELLIGENCE: "Audience Intelligence",
  CHANNEL_CONTENT_INTELLIGENCE: "Channel Intelligence",
  SENTIMENT_ANALYSIS: "Sentiment Analysis",
  GAP_ANALYSIS: "Gap & Opportunity Analysis",
  COMPETITOR_ANALYSIS: "Competitor Analysis",
  OPPORTUNITY_IDENTIFICATION: "Opportunity Finder",
};

/**
 * Renders a 2D matrix (object with nested object values)
 * Example: { "How-to": { LinkedIn: 8.2, YouTube: 9.1 }, ... }
 */
function renderMatrix(matrix: Record<string, Record<string, any>>) {
  if (!matrix || Object.keys(matrix).length === 0) {
    return <p className="text-slate-400">No matrix data available.</p>;
  }

  const rows = Object.keys(matrix);
  const columns = rows.length > 0 ? Object.keys(matrix[rows[0]]) : [];

  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full text-sm text-slate-300">
        <thead>
          <tr>
            <th className="text-left text-slate-400 pb-2 px-2 font-semibold">Type</th>
            {columns.map((col) => (
              <th key={col} className="text-left text-slate-400 pb-2 px-2 font-semibold">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-t border-slate-800">
              <td className="py-2 px-2 font-medium text-white">{row}</td>
              {columns.map((col) => (
                <td key={`${idx}-${col}`} className="py-2 px-2">
                  {typeof matrix[row][col] === "number"
                    ? matrix[row][col].toFixed(1)
                    : String(matrix[row][col] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Renders an array of objects as a table
 */
function renderTable(data: Record<string, any>[]) {
  if (data.length === 0) {
    return <p className="text-slate-400">No data available.</p>;
  }

  const keys = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full text-sm text-slate-300">
        <thead>
          <tr>
            {keys.map((key) => (
              <th
                key={key}
                className="text-left text-slate-400 pb-2 px-2 font-semibold"
              >
                {key
                  .split("_")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-t border-slate-800">
              {keys.map((key) => (
                <td key={`${idx}-${key}`} className="py-2 px-2">
                  {renderValue(row[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Renders an array of strings as a bullet list
 */
function renderList(items: string[]) {
  if (items.length === 0) {
    return <p className="text-slate-400">No items available.</p>;
  }

  return (
    <ul className="list-disc list-inside space-y-1">
      {items.map((item, idx) => (
        <li key={idx} className="text-slate-300">
          {String(item)}
        </li>
      ))}
    </ul>
  );
}

/**
 * Intelligently renders any value, dispatching to specialized renderers for nested objects
 */
function renderValue(value: any, agentType?: string): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-slate-500">—</span>;
  }

  if (typeof value === "string") {
    return <p className="text-slate-300">{value}</p>;
  }

  if (typeof value === "number") {
    return <span className="text-white font-medium">{Number.isInteger(value) ? value.toString() : value.toFixed(1)}</span>;
  }

  if (typeof value === "boolean") {
    return <span className="text-white">{value ? "Yes" : "No"}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <p className="text-slate-400">Empty array</p>;
    }
    // If it's an array of objects, render as table
    if (value.length > 0 && typeof value[0] === "object") {
      return renderTable(value);
    }
    // Otherwise render as a list (strings, numbers, booleans)
    return renderList(value.map(String));
  }

  // If it's an object, check if it's a matrix (nested objects with numeric values)
  if (typeof value === "object" && value !== null) {
    const keys = Object.keys(value);
    const allValuesAreObjects = keys.every(
      (k) => typeof value[k] === "object" && value[k] !== null && !Array.isArray(value[k])
    );

    if (allValuesAreObjects) {
      // It's a matrix
      return renderMatrix(value);
    }

    // Otherwise, render as key-value pairs
    return (
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {keys.map((key) => (
          <div key={key}>
            <dt className="text-slate-400 text-sm font-semibold capitalize">
              {key.replace(/_/g, " ").replace(/([A-Z])/g, " $1").trim()}
            </dt>
            <dd className="text-white text-sm mt-1">
              {renderValue(value[key], agentType)}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return <p className="text-slate-300">{String(value)}</p>;
}

/**
 * Agent-specific render functions
 */
function renderAudienceIntelligence(data: any): React.ReactNode {
  return (
    <div className="space-y-6">
      {data.summary && (
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-sm font-semibold text-slate-300 mb-2">Summary</p>
          <p className="text-white">{data.summary}</p>
        </div>
      )}

      {data.personaEngagement && data.personaEngagement.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-300 mb-4">Persona Engagement</h3>
          <div className="space-y-3">
            {data.personaEngagement.map((persona: any, idx: number) => (
              <div key={idx} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-semibold text-white">{persona.name}</p>
                    <p className="text-xs text-slate-400">{persona.personaId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{persona.currentEngagement}</p>
                    <p className="text-xs text-slate-400">current engagement</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-slate-400">Engagement Rate</p>
                    <p className="text-white">{persona.currentEngagementRate}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Matched Content</p>
                    <p className="text-white">{persona.contentCount}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Strong Content Types</p>
                    <p className="text-white">{persona.topContentTypes?.join(", ") || "Not available"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Weak Content Types</p>
                    <p className="text-white">{persona.weakContentTypes?.join(", ") || "None observed"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Top Channels</p>
                    <p className="text-white">{persona.topChannels?.join(", ") || "Not available"}</p>
                  </div>
                </div>
                {persona.observedSignals && Object.keys(persona.observedSignals).length > 0 && (
                  <div className="mb-3">
                    <p className="text-slate-400 text-sm mb-1">Observed Audience Signals</p>
                    <div className="text-sm">{renderValue(persona.observedSignals)}</div>
                  </div>
                )}
                <p className="text-sm text-slate-300">{persona.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.observedSegments && data.observedSegments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-300 mb-4">Observed Audience Segments</h3>
          <div className="space-y-3">
            {data.observedSegments.map((segment: any, idx: number) => (
              <div key={idx} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-semibold text-white">{segment.segmentName}</p>
                    <p className="text-xs text-slate-400">{segment.segmentType}</p>
                  </div>
                  <span className="px-3 py-1 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-300">
                    {segment.confidence} confidence
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-slate-400">Current Engagement</p>
                    <p className="text-white">{segment.currentEngagement}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Engagement Rate</p>
                    <p className="text-white">{segment.currentEngagementRate}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Content Types</p>
                    <p className="text-white">{segment.contentTypesEngagingWith?.join(", ") || "Not available"}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Top Channels</p>
                    <p className="text-white">{segment.topChannels?.join(", ") || "Not available"}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-400 mt-3">{segment.whyThisSegmentExists}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.demographicInsights && data.demographicInsights.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-300 mb-4">Demographic Signals</h3>
          {renderTable(data.demographicInsights)}
        </div>
      )}

      {data.topInsight && (
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-sm font-semibold text-slate-300 mb-2">Top Insight</p>
          <p className="text-white">{data.topInsight}</p>
        </div>
      )}
      {data.recommendation && (
        <div className="p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/30">
          <p className="text-sm font-semibold text-indigo-300 mb-2">Recommendation</p>
          <p className="text-white">{data.recommendation}</p>
        </div>
      )}
    </div>
  );
}

function renderChannelIntelligence(data: any): React.ReactNode {
  const channelEntries = data.channels && typeof data.channels === "object"
    ? Object.entries(data.channels)
        .map(([channel, channelData]: [string, any]) => ({ channel, ...channelData }))
        .sort((a: any, b: any) => (b.performanceScore || 0) - (a.performanceScore || 0))
    : [];

  const contentTypeRows = channelEntries.flatMap((entry: any) =>
    Object.entries(entry.contentTypes || {}).map(([type, stats]: [string, any]) => ({
      channel: entry.channel,
      contentType: type,
      count: stats.count,
      avgEngagement: stats.avgEngagement,
      avgReach: stats.avgReach,
      engagementRate: stats.engagementRate,
      formatPerformance: `${Number(stats.formatPerformance || 0).toFixed(1)}/10`,
    }))
  );

  return (
    <div className="space-y-6">
      {data.summary && (
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-sm font-semibold text-slate-300 mb-2">Summary</p>
          <p className="text-white">{data.summary}</p>
        </div>
      )}

      {channelEntries.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-300 mb-4">Channel Performance</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {channelEntries.map((entry: any) => {
              const contentTypes = Object.entries(entry.contentTypes || {})
                .sort(([, a]: [string, any], [, b]: [string, any]) => (b.formatPerformance || 0) - (a.formatPerformance || 0));
              const bestType = contentTypes[0];
              const weakestType = contentTypes[contentTypes.length - 1];

              return (
                <div key={entry.channel} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="font-semibold text-white">{entry.channel}</p>
                      <p className="text-xs text-slate-400">Channel performance: {Number(entry.performanceScore || 0).toFixed(1)}/10</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        {entry.metrics?.avgEngagementRate?.toFixed?.(2) ?? "0.00"}%
                      </p>
                      <p className="text-xs text-slate-400">engagement rate</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm mb-4">
                    <div>
                      <p className="text-slate-400">Content</p>
                      <p className="text-white">{entry.metrics?.totalContent ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Reach</p>
                      <p className="text-white">{Math.round(entry.metrics?.totalReach ?? 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Engagement</p>
                      <p className="text-white">{Math.round(entry.metrics?.totalEngagement ?? 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded bg-green-500/10 border border-green-500/20">
                      <p className="text-green-300 font-semibold mb-1">Best Content Type</p>
                      <p className="text-white">{bestType?.[0] || "Not available"}</p>
                      {bestType && (
                        <p className="text-xs text-slate-400">
                          Format performance {Number((bestType[1] as any).formatPerformance || 0).toFixed(1)}/10 from {(bestType[1] as any).count} pieces
                        </p>
                      )}
                    </div>
                    <div className="p-3 rounded bg-red-500/10 border border-red-500/20">
                      <p className="text-red-300 font-semibold mb-1">Weak Content Type</p>
                      <p className="text-white">{weakestType?.[0] || "Not available"}</p>
                      {weakestType && (
                        <p className="text-xs text-slate-400">
                          Format performance {Number((weakestType[1] as any).formatPerformance || 0).toFixed(1)}/10 from {(weakestType[1] as any).count} pieces
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {contentTypeRows.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-300 mb-4">Content Type Performance by Channel</h3>
          {renderTable(contentTypeRows)}
        </div>
      )}

      {data.recommendations && data.recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-300 mb-4">Channel Recommendations</h3>
          <div className="space-y-3">
            {data.recommendations.map((rec: any, idx: number) => (
              <div key={idx} className="p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/30">
                <p className="font-semibold text-white mb-1">{rec.title}</p>
                <p className="text-sm text-slate-300 mb-1">{rec.why}</p>
                <p className="text-sm text-slate-400">{rec.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function renderGapAnalysis(data: any): React.ReactNode {
  return (
    <div className="space-y-6">
      {data.summary && (
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-sm font-semibold text-slate-300 mb-2">Summary</p>
          <p className="text-white">{data.summary}</p>
        </div>
      )}

      {data.evidenceCoverage && data.evidenceCoverage.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-300 mb-4">Evidence Coverage</h3>
          {renderTable(data.evidenceCoverage)}
        </div>
      )}

      {data.strategyGaps && data.strategyGaps.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-300 mb-4">Strategy Gaps</h3>
          <div className="space-y-4">
            {data.strategyGaps.map((gap: any, idx: number) => (
              <div key={idx} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className="font-semibold text-white">{gap.topic}</p>
                  <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
                    {gap.priority}
                  </span>
                </div>
                <div className="text-sm text-slate-300 space-y-1">
                  <p>Coverage: <span className="text-white">{gap.coverage}%</span></p>
                  <p>Evidence: <span className="text-white">{gap.evidenceType}</span></p>
                  <p className="text-slate-400 italic">{gap.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.opportunities && data.opportunities.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-300 mb-4">Recommended Opportunities</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {data.opportunities.map((opportunity: any, idx: number) => (
              <div key={idx} className="p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/30">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <p className="font-semibold text-white">{opportunity.suggestedTitle}</p>
                  <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
                    {opportunity.urgency}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-slate-400">Format</p>
                    <p className="text-white">{opportunity.format}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Channel</p>
                    <p className="text-white">{opportunity.channel}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300">{opportunity.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.nextBestAction && (
        <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
          <p className="text-sm font-semibold text-green-300 mb-2">Next Best Action</p>
          <p className="text-white">{data.nextBestAction}</p>
        </div>
      )}
    </div>
  );
}

function renderCompetitorAnalysis(data: any): React.ReactNode {
  return (
    <div className="space-y-6">
      {data.competitors && (
        <div>
          <h3 className="text-lg font-semibold text-slate-300 mb-4">Competitor Comparison</h3>
          {renderTable(data.competitors)}
        </div>
      )}
    </div>
  );
}

export function ReportSection({ agentType, title, data, status }: ReportSectionProps) {
  if (!data || status !== "COMPLETED") {
    return (
      <div className="card text-center py-8">
        <p className="text-slate-400">
          Analyze <span className="font-semibold">{agentNames[agentType]}</span> to see this section
        </p>
      </div>
    );
  }

  // Use specialized component for sentiment analysis
  if (agentType === "SENTIMENT_ANALYSIS") {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
        <SentimentDashboard data={data} />
      </div>
    );
  }

  let content = renderValue(data, agentType);
  if (agentType === "AUDIENCE_INTELLIGENCE") content = renderAudienceIntelligence(data);
  if (agentType === "CHANNEL_CONTENT_INTELLIGENCE") content = renderChannelIntelligence(data);
  if (agentType === "GAP_ANALYSIS") content = renderGapAnalysis(data);
  if (agentType === "COMPETITOR_ANALYSIS") content = renderCompetitorAnalysis(data);

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      <div className="space-y-4">{content}</div>
    </div>
  );
}


