/**
 * Agent List Index Page
 * @author sanat.k.mahapatra
 * 
 * Lists all agents in a searchable, filterable view with links to individual agent detail pages
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import {
  BarChart3,
  Users,
  Layers,
  MessageCircle,
  TrendingUp,
  Swords,
  Lightbulb,
} from "lucide-react";

interface Agent {
  id: string;
  agentType: string;
  name: string;
  description: string;
  enabled: boolean;
  status: "IDLE" | "RUNNING" | "COMPLETED" | "ERROR";
  lastRun: string | null;
}

const AGENTS: Agent[] = [
  {
    id: "1",
    agentType: "CONTENT_ANALYTICS",
    name: "Content Analytics",
    description: "Ingests and normalizes all channel data",
    enabled: true,
    status: "COMPLETED",
    lastRun: "2 hours ago",
  },
  {
    id: "2",
    agentType: "AUDIENCE_INTELLIGENCE",
    name: "Audience Intelligence",
    description: "Analyzes audience demographics and behavior",
    enabled: true,
    status: "IDLE",
    lastRun: "4 hours ago",
  },
  {
    id: "3",
    agentType: "CHANNEL_CONTENT_INTELLIGENCE",
    name: "Channel Intelligence",
    description: "Compares performance across channels",
    enabled: true,
    status: "RUNNING",
    lastRun: null,
  },
  {
    id: "4",
    agentType: "SENTIMENT_ANALYSIS",
    name: "Sentiment Analysis",
    description: "Analyzes emotional tone and sentiment",
    enabled: true,
    status: "COMPLETED",
    lastRun: "1 hour ago",
  },
  {
    id: "5",
    agentType: "GAP_ANALYSIS",
    name: "Gap & Opportunity Analysis",
    description: "Finds content strategy gaps and turns them into recommended opportunities",
    enabled: false,
    status: "IDLE",
    lastRun: null,
  },
  {
    id: "6",
    agentType: "COMPETITOR_ANALYSIS",
    name: "Competitor Analysis",
    description: "Benchmarks against competitors",
    enabled: true,
    status: "COMPLETED",
    lastRun: "30 minutes ago",
  },
];

const AGENT_ICONS: Record<string, React.ReactNode> = {
  CONTENT_ANALYTICS: <BarChart3 className="w-5 h-5" />,
  AUDIENCE_INTELLIGENCE: <Users className="w-5 h-5" />,
  CHANNEL_CONTENT_INTELLIGENCE: <Layers className="w-5 h-5" />,
  SENTIMENT_ANALYSIS: <MessageCircle className="w-5 h-5" />,
  GAP_ANALYSIS: <TrendingUp className="w-5 h-5" />,
  COMPETITOR_ANALYSIS: <Swords className="w-5 h-5" />,
  OPPORTUNITY_IDENTIFICATION: <Lightbulb className="w-5 h-5" />,
};

const STATUS_COLORS: Record<string, string> = {
  IDLE: "bg-slate-700 text-slate-200",
  RUNNING: "bg-yellow-500/20 text-yellow-300 animate-pulse",
  COMPLETED: "bg-green-500/20 text-green-300",
  ERROR: "bg-red-500/20 text-red-300",
};

export default function AgentsIndexPage() {
  const params = useParams();
  const tenantSlug = params.tenant as string;
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEnabled, setFilterEnabled] = useState<"all" | "enabled" | "disabled">("all");

  const filteredAgents = AGENTS.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterEnabled === "all" ||
      (filterEnabled === "enabled" && agent.enabled) ||
      (filterEnabled === "disabled" && !agent.enabled);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Top Bar */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container-page flex items-center gap-4">
          <Link href={`/${tenantSlug}`} className="hover:text-indigo-400 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">All Agents</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-page py-12">
        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search analyses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterEnabled("all")}
              className={`px-4 py-2 rounded-lg transition ${
                filterEnabled === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              All ({AGENTS.length})
            </button>
            <button
              onClick={() => setFilterEnabled("enabled")}
              className={`px-4 py-2 rounded-lg transition ${
                filterEnabled === "enabled"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              Enabled ({AGENTS.filter((a) => a.enabled).length})
            </button>
            <button
              onClick={() => setFilterEnabled("disabled")}
              className={`px-4 py-2 rounded-lg transition ${
                filterEnabled === "disabled"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              Disabled ({AGENTS.filter((a) => !a.enabled).length})
            </button>
          </div>
        </div>

        {/* Agents Grid */}
        {filteredAgents.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAgents.map((agent) => (
              <Link
                key={agent.id}
                href={`/${tenantSlug}/agents/${agent.agentType.toLowerCase()}`}
                className="card group hover:border-indigo-500 transition cursor-pointer"
              >
                {/* Agent Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-indigo-500 mt-1">{AGENT_ICONS[agent.agentType]}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white group-hover:text-indigo-400 transition">
                      {agent.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {agent.enabled ? "✓ Enabled" : "✗ Disabled"}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{agent.description}</p>

                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      STATUS_COLORS[agent.status]
                    }`}
                  >
                    {agent.status}
                  </span>
                  <span className="text-xs text-slate-500">
                    {agent.lastRun ? `${agent.lastRun}` : "Never run"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-slate-400">
              {searchTerm ? "No agents match your search" : "No agents found"}
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 p-6 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-slate-300 text-sm">
            💡 Click any agent card above to view details, run history, and configuration options.
          </p>
        </div>
      </div>
    </div>
  );
}
