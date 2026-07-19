/**
 * Single Agent Detail Page
 * @author sanat.k.mahapatra
 * 
 * View and manage individual agent configuration and run history
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Play } from "lucide-react";
import { ReportSection } from "@/components/ReportSection";
import {
  BarChart3,
  Users,
  Layers,
  MessageCircle,
  TrendingUp,
  Swords,
  Lightbulb,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";

const AGENT_ICONS: Record<string, React.ReactNode> = {
  CONTENT_ANALYTICS: <BarChart3 className="w-8 h-8" />,
  AUDIENCE_INTELLIGENCE: <Users className="w-8 h-8" />,
  CHANNEL_CONTENT_INTELLIGENCE: <Layers className="w-8 h-8" />,
  SENTIMENT_ANALYSIS: <MessageCircle className="w-8 h-8" />,
  GAP_ANALYSIS: <TrendingUp className="w-8 h-8" />,
  COMPETITOR_ANALYSIS: <Swords className="w-8 h-8" />,
  OPPORTUNITY_IDENTIFICATION: <Lightbulb className="w-8 h-8" />,
};

const DEFAULT_AGENT_CONFIG: Record<string, { name: string; description: string; defaultAttributes: any[] }> = {
  CONTENT_ANALYTICS: {
    name: "Content Analytics",
    description: "Ingests and normalizes all channel data",
    defaultAttributes: [
      { key: "linkedin", label: "Pull LinkedIn data", enabled: true },
      { key: "youtube", label: "Pull YouTube data", enabled: true },
      { key: "blog", label: "Pull Blog data", enabled: true },
      { key: "email", label: "Pull Email data", enabled: false },
    ],
  },
  AUDIENCE_INTELLIGENCE: {
    name: "Audience Intelligence",
    description: "Analyzes who is engaging with your content",
    defaultAttributes: [
      { key: "timing", label: "Engagement timing analysis", enabled: true },
      { key: "segments", label: "Audience segment breakdown", enabled: true },
      { key: "overlap", label: "Cross-channel overlap", enabled: false },
    ],
  },
  CHANNEL_CONTENT_INTELLIGENCE: {
    name: "Channel Intelligence",
    description: "Which channel works best for which format",
    defaultAttributes: [
      { key: "matrix", label: "Format performance matrix", enabled: true },
      { key: "best_channel", label: "Best channel per content type", enabled: true },
    ],
  },
  SENTIMENT_ANALYSIS: {
    name: "Sentiment Analysis",
    description: "Analyzes comments and reactions across channels",
    defaultAttributes: [
      { key: "comments", label: "Comment sentiment scoring", enabled: true },
      { key: "themes", label: "Key theme extraction", enabled: true },
    ],
  },
  GAP_ANALYSIS: {
    name: "Gap & Opportunity Analysis",
    description: "Finds content strategy gaps and recommended opportunities",
    defaultAttributes: [
      { key: "topics", label: "Topic gap identification", enabled: true },
      { key: "formats", label: "Format gap analysis", enabled: true },
      { key: "opportunities", label: "Recommended opportunities", enabled: true },
    ],
  },
  COMPETITOR_ANALYSIS: {
    name: "Competitor Analysis",
    description: "Benchmarks your content against competitors",
    defaultAttributes: [
      { key: "topics", label: "Topic coverage comparison", enabled: true },
      { key: "formats", label: "Format mix comparison", enabled: false },
    ],
  },
  OPPORTUNITY_IDENTIFICATION: {
    name: "Opportunity Finder",
    description: "Recommends what to create next",
    defaultAttributes: [
      { key: "topics", label: "Topic recommendations", enabled: true },
      { key: "channels", label: "Channel expansion", enabled: true },
    ],
  },
};

export default function AgentDetailPage() {
  const params = useParams();
  const tenantSlug = params.tenant as string;
  const agentTypeParam = (params.agentType as string).toUpperCase();
  const agentConfig = DEFAULT_AGENT_CONFIG[agentTypeParam];
  const [agentData, setAgentData] = useState<any>(null);
  const [runs, setRuns] = useState<any[]>([]);
  const [attributes, setAttributes] = useState(agentConfig?.defaultAttributes || []);
  const [running, setRunning] = useState(false);
  const [agentStatus, setAgentStatus] = useState<"IDLE" | "RUNNING" | "COMPLETED" | "ERROR">("IDLE");
  const [loading, setLoading] = useState(true);
  const [selectedRun, setSelectedRun] = useState<any>(null);

  // Fetch agent data on mount
  useEffect(() => {
    fetch(`/api/${tenantSlug}/agents`)
      .then((res) => res.json())
      .then((data) => {
        const found = data.agents?.find((a: any) => a.type === agentTypeParam);
        if (found) {
          setAgentData(found);
          setAttributes(found.attributes ?? []);
          setRuns(found.runs ?? []);
          setAgentStatus(found.latestRun?.status ?? "IDLE");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch agent data:", err);
        setLoading(false);
      });
  }, [tenantSlug, agentTypeParam]);

  if (!agentConfig) {
    return (
      <div className="container-page py-12 text-center">
        <p className="text-slate-400">Agent not found</p>
        <Link href={`/${tenantSlug}`} className="text-indigo-400 hover:text-indigo-300 mt-4">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const handleAttributeToggle = (key: string) => {
    setAttributes((prev) =>
      prev.map((attr) =>
        attr.key === key ? { ...attr, enabled: !attr.enabled } : attr
      )
    );
  };

  const handleRun = async () => {
    setRunning(true);
    setAgentStatus("RUNNING");
    const id = toast.loading("Analyzing...");

    try {
      const res = await fetch(`/api/${tenantSlug}/agents/${agentTypeParam.toLowerCase()}/run`, {
        method: "POST",
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.dismiss(id);
        toast.error(result.error || "Analysis failed");
        setAgentStatus("ERROR");
      } else {
        toast.dismiss(id);
        toast.success("Analysis complete");
        const data = await fetch(`/api/${tenantSlug}/agents`).then((r) => r.json());
        const found = data.agents?.find((a: any) => a.type === agentTypeParam);
        if (found) {
          setAgentData(found);
          setAttributes(found.attributes ?? []);
          setRuns(found.runs ?? []);
          setAgentStatus(found.latestRun?.status ?? "IDLE");
        }
      }
    } catch (e) {
      toast.dismiss(id);
      toast.error("Analysis failed");
      setAgentStatus("ERROR");
    } finally {
      setRunning(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Top Bar */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container-page flex items-center gap-4">
          <Link href={`/${tenantSlug}`} className="hover:text-indigo-400 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">{agentConfig.name}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-page py-12">
        {/* Agent Header */}
        <div className="card mb-8">
          <div className="flex items-start gap-6 mb-6">
            <div className="text-indigo-500">{AGENT_ICONS[agentTypeParam]}</div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{agentConfig.name}</h2>
              <p className="text-slate-400">{agentConfig.description}</p>
            </div>
            <StatusBadge status={agentStatus} />
          </div>

          <button
            onClick={handleRun}
            disabled={running}
            className="btn-primary flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            {running ? "Analyzing..." : "Run Analysis"}
          </button>
        </div>

        {/* Attributes */}
        <div className="card mb-8">
          <h3 className="text-xl font-bold text-white mb-6">Agent Attributes</h3>
          <div className="space-y-3">
            {attributes.map((attr) => (
              <label
                key={attr.key}
                className="flex items-center gap-3 p-3 rounded hover:bg-slate-800/50 transition cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={attr.enabled}
                  onChange={() => handleAttributeToggle(attr.key)}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 cursor-pointer"
                />
                <span className="text-slate-300">{attr.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Latest Result */}
        {(selectedRun || agentData?.latestRun?.resultJson) && (
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {selectedRun ? `Result from ${new Date(selectedRun.startedAt).toLocaleString()}` : 'Latest Result'}
              </h3>
              {selectedRun && (
                <button 
                  onClick={() => setSelectedRun(null)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  Back to Latest
                </button>
              )}
            </div>
            <ReportSection
              agentType={agentTypeParam}
              title="Analysis Output"
              data={JSON.parse(selectedRun?.resultJson || agentData?.latestRun?.resultJson)}
              status={selectedRun?.status || agentData?.latestRun?.status || "COMPLETED"}
              source="AI-generated analysis"
            />
          </div>
        )}

        {/* Run History */}
        <div className="card">
          <h3 className="text-xl font-bold text-white mb-6">Run History</h3>
          {runs.length === 0 ? (
            <p className="text-slate-400">No runs yet. Click "Run Analysis" to start.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => (
                    <tr key={run.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 text-slate-300">{new Date(run.startedAt).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={run.status as any} />
                      </td>
                      <td className="py-3 px-4">
                        {run.status === "COMPLETED" && (
                          <button 
                            onClick={() => setSelectedRun(run)}
                            className="text-indigo-400 hover:text-indigo-300 text-sm"
                          >
                            View Result
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
