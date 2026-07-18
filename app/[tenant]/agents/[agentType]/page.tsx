/**
 * Single Agent Detail Page
 * @author sanat.k.mahapatra
 * 
 * View and manage individual agent configuration and run history
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Play } from "lucide-react";
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

const AGENT_DETAILS: Record<
  string,
  { name: string; description: string; attributes: any[] }
> = {
  CONTENT_ANALYTICS: {
    name: "Content Analytics",
    description: "Ingests and normalizes all channel data",
    attributes: [
      { key: "linkedin", label: "Pull LinkedIn data", enabled: true },
      { key: "youtube", label: "Pull YouTube data", enabled: true },
      { key: "blog", label: "Pull Blog data", enabled: true },
      { key: "email", label: "Pull Email data", enabled: false },
    ],
  },
  AUDIENCE_INTELLIGENCE: {
    name: "Audience Intelligence",
    description: "Analyzes who is engaging with your content",
    attributes: [
      { key: "timing", label: "Engagement timing analysis", enabled: true },
      { key: "segments", label: "Audience segment breakdown", enabled: true },
      { key: "overlap", label: "Cross-channel overlap", enabled: false },
    ],
  },
  CHANNEL_CONTENT_INTELLIGENCE: {
    name: "Channel Intelligence",
    description: "Which channel works best for which format",
    attributes: [
      { key: "matrix", label: "Format performance matrix", enabled: true },
      { key: "best_channel", label: "Best channel per content type", enabled: true },
    ],
  },
  SENTIMENT_ANALYSIS: {
    name: "Sentiment Analysis",
    description: "Analyzes comments and reactions across channels",
    attributes: [
      { key: "comments", label: "Comment sentiment scoring", enabled: true },
      { key: "themes", label: "Key theme extraction", enabled: true },
    ],
  },
  GAP_ANALYSIS: {
    name: "Gap Analysis",
    description: "Finds content gaps in your strategy",
    attributes: [
      { key: "topics", label: "Topic gap identification", enabled: true },
      { key: "formats", label: "Format gap analysis", enabled: true },
    ],
  },
  COMPETITOR_ANALYSIS: {
    name: "Competitor Analysis",
    description: "Benchmarks your content against competitors",
    attributes: [
      { key: "topics", label: "Topic coverage comparison", enabled: true },
      { key: "formats", label: "Format mix comparison", enabled: false },
    ],
  },
  OPPORTUNITY_IDENTIFICATION: {
    name: "Opportunity Finder",
    description: "Recommends what to create next",
    attributes: [
      { key: "topics", label: "Topic recommendations", enabled: true },
      { key: "channels", label: "Channel expansion", enabled: true },
    ],
  },
};

const MOCK_RUNS = [
  {
    id: 1,
    date: "Today, 10:30 AM",
    status: "COMPLETED",
    duration: "2m 34s",
  },
  {
    id: 2,
    date: "Yesterday, 11:15 AM",
    status: "COMPLETED",
    duration: "2m 18s",
  },
  {
    id: 3,
    date: "Dec 15, 3:45 PM",
    status: "COMPLETED",
    duration: "2m 41s",
  },
  {
    id: 4,
    date: "Dec 14, 9:20 AM",
    status: "COMPLETED",
    duration: "2m 22s",
  },
  {
    id: 5,
    date: "Dec 13, 2:30 PM",
    status: "ERROR",
    duration: "Failed",
  },
];

export default function AgentDetailPage() {
  const params = useParams();
  const tenantSlug = params.tenant as string;
  const agentType = (params.agentType as string).toUpperCase();
  const agent = AGENT_DETAILS[agentType];
  const [attributes, setAttributes] = useState(agent?.attributes || []);
  const [running, setRunning] = useState(false);
  const [agentStatus, setAgentStatus] = useState<"IDLE" | "RUNNING" | "COMPLETED" | "ERROR">("IDLE");

  if (!agent) {
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

  const handleRun = () => {
    setRunning(true);
    setAgentStatus("RUNNING");
    toast.loading("Running agent...");
    setTimeout(() => {
      setRunning(false);
      setAgentStatus("COMPLETED");
      toast.success("Agent completed");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Top Bar */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container-page flex items-center gap-4">
          <Link href={`/${tenantSlug}`} className="hover:text-indigo-400 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-page py-12">
        {/* Agent Header */}
        <div className="card mb-8">
          <div className="flex items-start gap-6 mb-6">
            <div className="text-indigo-500">{AGENT_ICONS[agentType]}</div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{agent.name}</h2>
              <p className="text-slate-400">{agent.description}</p>
            </div>
            <StatusBadge status={agentStatus} />
          </div>

          <button
            onClick={handleRun}
            disabled={running}
            className="btn-primary flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            {running ? "Running..." : "Run Agent"}
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

        {/* Run History */}
        <div className="card">
          <h3 className="text-xl font-bold text-white mb-6">Run History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Duration</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_RUNS.map((run) => (
                  <tr key={run.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 text-slate-300">{run.date}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={run.status as any} />
                    </td>
                    <td className="py-3 px-4 text-slate-400">{run.duration}</td>
                    <td className="py-3 px-4">
                      {run.status === "COMPLETED" && (
                        <button className="text-indigo-400 hover:text-indigo-300 text-sm">
                          View Result
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
