/**
 * Tenant Agent Grid Page
 * @author sanat.k.mahapatra
 * 
 * Displays all agents for a tenant with run orchestration
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Play, Loader2 } from "lucide-react";
import { AgentCard } from "@/components/AgentCard";
import { TenantSwitcher } from "@/components/TenantSwitcher";
import { toast } from "sonner";

type AgentStatus = "IDLE" | "RUNNING" | "COMPLETED" | "ERROR";
type MockAgent = {
  agentType: string; name: string; description: string;
  status: AgentStatus; enabled: boolean;
  lastRun: string | null; resultPreview: string | null;
  attributes: { key: string; label: string; enabled: boolean }[];
};

// Mock data while backend isn't ready
const MOCK_AGENTS: MockAgent[] = [
  {
    agentType: "CONTENT_ANALYTICS",
    name: "Content Analytics",
    description: "Ingests and normalizes all channel data",
    status: "COMPLETED",
    enabled: true,
    lastRun: "2 hours ago",
    resultPreview: "127 content items analyzed across 3 channels",
    attributes: [
      { key: "linkedin", label: "Pull LinkedIn data", enabled: true },
      { key: "youtube", label: "Pull YouTube data", enabled: true },
      { key: "blog", label: "Pull Blog data", enabled: true },
      { key: "email", label: "Pull Email data", enabled: false },
    ],
  },
  {
    agentType: "AUDIENCE_INTELLIGENCE",
    name: "Audience Intelligence",
    description: "Analyzes who is engaging with your content",
    status: "COMPLETED",
    enabled: true,
    lastRun: "2 hours ago",
    resultPreview: "3 distinct audience segments identified",
    attributes: [
      { key: "timing", label: "Engagement timing analysis", enabled: true },
      { key: "segments", label: "Audience segment breakdown", enabled: true },
      { key: "overlap", label: "Cross-channel overlap", enabled: false },
    ],
  },
  {
    agentType: "CHANNEL_CONTENT_INTELLIGENCE",
    name: "Channel Intelligence",
    description: "Which channel works best for which format",
    status: "IDLE",
    enabled: true,
    lastRun: null,
    resultPreview: null,
    attributes: [
      { key: "matrix", label: "Format performance matrix", enabled: true },
      { key: "best_channel", label: "Best channel per content type", enabled: true },
    ],
  },
  {
    agentType: "SENTIMENT_ANALYSIS",
    name: "Sentiment Analysis",
    description: "Analyzes comments and reactions across channels",
    status: "RUNNING",
    enabled: true,
    lastRun: "5 min ago",
    resultPreview: null,
    attributes: [
      { key: "comments", label: "Comment sentiment scoring", enabled: true },
      { key: "themes", label: "Key theme extraction", enabled: true },
    ],
  },
  {
    agentType: "GAP_ANALYSIS",
    name: "Gap Analysis",
    description: "Finds content gaps in your strategy",
    status: "IDLE",
    enabled: true,
    lastRun: null,
    resultPreview: null,
    attributes: [
      { key: "topics", label: "Topic gap identification", enabled: true },
      { key: "formats", label: "Format gap analysis", enabled: true },
    ],
  },
  {
    agentType: "COMPETITOR_ANALYSIS",
    name: "Competitor Analysis",
    description: "Benchmarks your content against competitors",
    status: "ERROR",
    enabled: true,
    lastRun: "1 day ago",
    resultPreview: null,
    attributes: [
      { key: "topics", label: "Topic coverage comparison", enabled: true },
      { key: "formats", label: "Format mix comparison", enabled: false },
    ],
  },
  {
    agentType: "OPPORTUNITY_IDENTIFICATION",
    name: "Opportunity Finder",
    description: "Recommends what to create next",
    status: "IDLE",
    enabled: false,
    lastRun: null,
    resultPreview: null,
    attributes: [
      { key: "topics", label: "Topic recommendations", enabled: true },
      { key: "channels", label: "Channel expansion", enabled: true },
    ],
  },
];

const MOCK_TENANTS = [
  { id: "1", name: "DevInsights Blog", slug: "devinsights" },
  { id: "2", name: "GrowthStack Weekly", slug: "growthstack" },
];

export default function TenantPage() {
  const params = useParams();
  const tenantSlug = params.tenant as string;
  const [agents, setAgents] = useState(MOCK_AGENTS);
  const [loading, setLoading] = useState(false);
  const [runningAgents, setRunningAgents] = useState<Set<string>>(new Set());

  const handleAgentToggle = (agentType: string) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.agentType === agentType
          ? { ...agent, enabled: !agent.enabled }
          : agent
      )
    );
  };

  const handleAttributeToggle = (agentType: string, attrKey: string) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.agentType === agentType
          ? {
              ...agent,
              attributes: agent.attributes.map((attr) =>
                attr.key === attrKey ? { ...attr, enabled: !attr.enabled } : attr
              ),
            }
          : agent
      )
    );
  };

  const handleRunAgent = (agentType: string) => {
    // Simulate agent run
    setRunningAgents((prev) => new Set([...prev, agentType]));
    toast.loading(`Running ${agentType}...`);

    // Simulate completion after 3 seconds
    setTimeout(() => {
      setAgents((prev) =>
        prev.map((agent) =>
          agent.agentType === agentType
            ? {
                ...agent,
                status: "COMPLETED",
                lastRun: "Just now",
                resultPreview: `${agentType} analysis complete`,
              }
            : agent
        )
      );
      setRunningAgents((prev) => {
        const next = new Set(prev);
        next.delete(agentType);
        return next;
      });
      toast.success(`${agentType} completed`);
    }, 3000);
  };

  const handleRunAllEnabled = async () => {
    const enabledAgents = agents.filter((a) => a.enabled);
    setLoading(true);
    toast.loading(`Running ${enabledAgents.length} agents...`);

    // Simulate running all agents
    for (const agent of enabledAgents) {
      setRunningAgents((prev) => new Set([...prev, agent.agentType]));
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setAgents((prev) =>
        prev.map((a) =>
          a.agentType === agent.agentType
            ? {
                ...a,
                status: "COMPLETED",
                lastRun: "Just now",
                resultPreview: `${agent.agentType} complete`,
              }
            : a
        )
      );
      setRunningAgents((prev) => {
        const next = new Set(prev);
        next.delete(agent.agentType);
        return next;
      });
    }

    setLoading(false);
    toast.success("All agents completed");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Top Bar */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container-page flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">ContentPulse</h1>
          <TenantSwitcher tenants={MOCK_TENANTS} currentSlug={tenantSlug} />
        </div>
      </div>

      {/* Main Content */}
      <div className="container-page py-12">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Content Intelligence Agents</h2>
          <p className="text-slate-400">
            Deploy and orchestrate AI agents to analyze your content across channels
          </p>
        </div>

        {/* Run All Button */}
        <div className="mb-8 flex justify-end">
          <button
            onClick={handleRunAllEnabled}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run All Enabled Agents
              </>
            )}
          </button>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {agents.map((agent) => (
            <AgentCard
              key={agent.agentType}
              {...agent}
              onToggle={() => handleAgentToggle(agent.agentType)}
              onAttributeToggle={(key) => handleAttributeToggle(agent.agentType, key)}
              onRun={() => handleRunAgent(agent.agentType)}
            />
          ))}
        </div>

        {/* Bottom Links */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
          <Link href={`/${tenantSlug}/connect`} className="text-indigo-400 hover:text-indigo-300">
            → Connect Data Sources
          </Link>
          <span className="text-slate-700">•</span>
          <Link href={`/${tenantSlug}/report`} className="text-indigo-400 hover:text-indigo-300">
            → View Report
          </Link>
        </div>
      </div>
    </div>
  );
}
