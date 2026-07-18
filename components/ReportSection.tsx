/**
 * ReportSection Component
 * @author sanat.k.mahapatra
 * 
 * Displays individual agent output in the unified report page
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

export function ReportSection({ agentType, title, data, status }: ReportSectionProps) {
  if (!data || status !== "COMPLETED") {
    return (
      <div className="card text-center py-8">
        <p className="text-slate-400">
          Run <span className="font-semibold">{agentNames[agentType]}</span> to generate this section
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      <div className="prose prose-invert max-w-none">
        {/* Render data based on type */}
        {typeof data === "string" ? (
          // String: render as paragraph
          <p className="text-slate-300">{data}</p>
        ) : Array.isArray(data) ? (
          // Array of objects: render as table
          data.length > 0 && typeof data[0] === "object" ? (
            <div className="overflow-x-auto">
              <table className="table-auto w-full text-sm text-slate-300">
                <thead>
                  <tr>
                    {Object.keys(data[0]).map((key) => (
                      <th key={key} className="text-left text-slate-400 pb-2 px-2">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr key={idx} className="border-t border-slate-800">
                      {Object.keys(data[0]).map((key) => (
                        <td key={`${idx}-${key}`} className="py-1 px-2">
                          {String(row[key] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <ul className="list-disc list-inside space-y-1">
              {data.map((item, idx) => (
                <li key={idx} className="text-slate-300">
                  {String(item)}
                </li>
              ))}
            </ul>
          )
        ) : typeof data === "object" && data !== null ? (
          // Flat object: render as definition list grid
          <dl className="grid grid-cols-2 gap-4">
            {Object.entries(data).map(([key, value]) => (
              <div key={key}>
                <dt className="text-slate-400 text-sm font-semibold">{key}</dt>
                <dd className="text-white text-sm">
                  {typeof value === "object" ? JSON.stringify(value) : String(value)}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          // Fallback
          <p className="text-slate-300">{String(data)}</p>
        )}
      </div>
    </div>
  );
}
