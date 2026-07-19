/**
 * ReportSection Component
 * @author sanat.k.mahapatra
 * 
 * Displays individual agent output in the unified report page
 * Handles nested objects (matrix, segments, gaps, competitors) with proper rendering
 */

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
  GAP_ANALYSIS: "Gap Analysis",
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
      {data.segments && (
        <div>
          <h3 className="text-lg font-semibold text-slate-300 mb-4">Audience Segments</h3>
          {renderTable(data.segments)}
        </div>
      )}
      {data.top_insight && (
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-sm font-semibold text-slate-300 mb-2">Top Insight</p>
          <p className="text-white">{data.top_insight}</p>
        </div>
      )}
    </div>
  );
}

function renderChannelIntelligence(data: any): React.ReactNode {
  return (
    <div className="space-y-6">
      {data.matrix && (
        <div>
          <h3 className="text-lg font-semibold text-slate-300 mb-4">Format Performance Matrix</h3>
          {renderMatrix(data.matrix)}
        </div>
      )}
      {data.best_channel && (
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Best Channel Per Format</h3>
          {renderValue(data.best_channel)}
        </div>
      )}
    </div>
  );
}

function renderGapAnalysis(data: any): React.ReactNode {
  return (
    <div className="space-y-6">
      {data.gaps && (
        <div>
          <h3 className="text-lg font-semibold text-slate-300 mb-4">Content Gaps</h3>
          <div className="space-y-4">
            {data.gaps.map((gap: any, idx: number) => (
              <div key={idx} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="font-semibold text-white mb-2">{gap.topic}</p>
                <div className="text-sm text-slate-300 space-y-1">
                  <p>Coverage: <span className="text-white">{gap.coverage}%</span></p>
                  <p>Opportunity Score: <span className="text-white">{gap.opportunity_score?.toFixed(1)}</span></p>
                  <p className="text-slate-400 italic">{gap.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
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

  const content = renderValue(data, agentType);

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      <div className="space-y-4">{content}</div>
    </div>
  );
}


