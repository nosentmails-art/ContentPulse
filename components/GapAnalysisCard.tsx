/**
 * Gap Analysis Card Component
 * Displays gaps and opportunities analysis with summary, evidence coverage, strategy gaps, opportunities, and next best action
 */

interface EvidenceCoverage {
  sourceCategory: 'INTERNAL_SOURCE' | 'EXTERNAL_SOURCE';
  evidenceType: string;
  description: string;
  status: 'AVAILABLE' | 'COMING_SOON';
}

interface StrategyGap {
  topic: string;
  coverage: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  evidenceType: string;
  reason: string;
}

interface Opportunity {
  topic: string;
  suggestedTitle: string;
  format: string;
  channel: string;
  urgency: 'HOT' | 'WARM' | 'EVERGREEN';
  reason: string;
}

interface GapAnalysisData {
  summary: string;
  evidenceCoverage: EvidenceCoverage[];
  strategyGaps: StrategyGap[];
  opportunities: Opportunity[];
  nextBestAction: string;
}

interface GapAnalysisCardProps {
  data: GapAnalysisData;
}

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: 'bg-gradient-to-r from-red-600 to-orange-500 text-white',
  MEDIUM: 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white',
  LOW: 'bg-slate-500/20 text-slate-300',
};

const URGENCY_COLORS: Record<string, string> = {
  HOT: 'bg-gradient-to-r from-red-600 to-orange-500 text-white',
  WARM: 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white',
  EVERGREEN: 'bg-gradient-to-r from-green-600 to-emerald-500 text-white',
};

export default function GapAnalysisCard({ data }: GapAnalysisCardProps) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      {data.summary && (
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-sm font-semibold text-slate-300 mb-2">Summary</p>
          <p className="text-white">{data.summary}</p>
        </div>
      )}

      {/* Evidence Coverage */}
      {data.evidenceCoverage && data.evidenceCoverage.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-300 mb-4">Evidence Coverage</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-3 font-semibold text-slate-400">Source</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-400">Type</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-400">Description</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.evidenceCoverage.map((evidence, idx) => (
                  <tr key={idx} className="border-b border-slate-800">
                    <td className="py-2 px-3">{evidence.sourceCategory}</td>
                    <td className="py-2 px-3">{evidence.evidenceType}</td>
                    <td className="py-2 px-3">{evidence.description}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        evidence.status === 'AVAILABLE' 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {evidence.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Strategy Gaps */}
      {data.strategyGaps && data.strategyGaps.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-300 mb-4">Strategy Gaps</h3>
          <div className="space-y-4">
            {data.strategyGaps.map((gap, idx) => (
              <div key={idx} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className="font-semibold text-white">{gap.topic}</p>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${PRIORITY_COLORS[gap.priority]}`}>
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

      {/* Opportunities */}
      {data.opportunities && data.opportunities.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-300 mb-4">Recommended Opportunities</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {data.opportunities.map((opportunity, idx) => (
              <div key={idx} className="p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/30">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <p className="font-semibold text-white">{opportunity.suggestedTitle}</p>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${URGENCY_COLORS[opportunity.urgency]}`}>
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

      {/* Next Best Action */}
      {data.nextBestAction && (
        <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
          <p className="text-sm font-semibold text-green-300 mb-2">Next Best Action</p>
          <p className="text-white">{data.nextBestAction}</p>
        </div>
      )}
    </div>
  );
}
