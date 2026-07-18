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
        {typeof data === "object" ? (
          <pre className="bg-slate-800 p-4 rounded overflow-auto text-sm text-slate-300">
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : (
          <p className="text-slate-300">{data}</p>
        )}
      </div>
    </div>
  );
}
