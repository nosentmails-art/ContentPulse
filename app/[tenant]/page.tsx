/**
 * Tenant Agent Grid Page
 * @author sanat.k.mahapatra
 * 
 * Displays all agents for a tenant with run orchestration
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Play, Loader2, X, FileText, Upload } from "lucide-react";
import { AgentCard } from "@/components/AgentCard";
import { TenantSwitcher } from "@/components/TenantSwitcher";
import { toast } from "sonner";

type AgentStatus = "IDLE" | "RUNNING" | "COMPLETED" | "ERROR";

function extractSummary(resultJson: string | null | undefined): string | null {
  if (!resultJson) return null;
  try {
    const data = JSON.parse(resultJson);
    return (
      data.summary ||
      data.priorityAction ||
      data.topRecommendation ||
      data.topInsight ||
      (data.metrics?.topChannel && `Top channel: ${data.metrics.topChannel}`) ||
      "Analysis complete"
    );
  } catch {
    return "Analysis complete";
  }
}

export default function TenantPage() {
  const params = useParams();
  const tenantSlug = params.tenant as string;
  const [agents, setAgents] = useState<any[]>([]);
  const [tenants, setTenants] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [runningAgents, setRunningAgents] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [showBanner, setShowBanner] = useState(true);

  // Fetch agents on mount
  useEffect(() => {
    setLoading(true);
    fetch(`/api/${tenantSlug}/agents`)
      .then((res) => res.json())
      .then((data) => {
        if (data.agents) {
          setAgents(data.agents);
        } else {
          setError("Failed to load agents");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load agents");
        setLoading(false);
      });
  }, [tenantSlug]);

  // Fetch tenants for switcher
  useEffect(() => {
    fetch("/api/tenants")
      .then((res) => res.json())
      .then((data) => {
        setTenants(Array.isArray(data) ? data : data.tenants ?? []);
      })
      .catch(() => setTenants([]));
  }, []);

  const handleAgentToggle = (agentType: string) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.type === agentType
          ? { ...agent, enabled: !agent.enabled }
          : agent
      )
    );
  };

  const handleAttributeToggle = (agentType: string, attrKey: string) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.type === agentType
          ? {
              ...agent,
              attributes: agent.attributes.map((attr: any) =>
                attr.key === attrKey ? { ...attr, enabled: !attr.enabled } : attr
              ),
            }
          : agent
      )
    );
  };

  const handleRunAgent = async (agentType: string) => {
    setRunningAgents((prev) => new Set([...prev, agentType]));
    const id = toast.loading(`Analyzing ${agentType}...`);

    try {
      const res = await fetch(`/api/${tenantSlug}/agents/${agentType.toLowerCase()}/run`, {
        method: "POST",
      });
      toast.dismiss(id);
      if (!res.ok) {
        toast.error(`${agentType} failed`);
        return;
      }
      toast.success(`${agentType} analysis complete`);
      const updated = await fetch(`/api/${tenantSlug}/agents`).then((r) => r.json());
      setAgents(updated.agents ?? []);
    } catch (e) {
      toast.dismiss(id);
      toast.error(`${agentType} failed`);
    } finally {
      setRunningAgents((prev) => {
        const next = new Set(prev);
        next.delete(agentType);
        return next;
      });
    }
  };

  const handleRunAllEnabled = async () => {
    const enabledAgents = agents.filter((a) => a.enabled);
    setLoading(true);
    setCompletedCount(0);
    setRunningAgent(null);
    const id = toast.loading("Starting content plan analysis...");

    try {
      for (let i = 0; i < enabledAgents.length; i++) {
        const agent = enabledAgents[i];
        setRunningAgent(agent.name);
        setCompletedCount(i + 1);
        setRunningAgents((prev) => new Set([...prev, agent.type]));
        try {
          await fetch(`/api/${tenantSlug}/agents/${agent.type.toLowerCase()}/run`, {
            method: "POST",
          });
          const updated = await fetch(`/api/${tenantSlug}/agents`).then((r) => r.json());
          setAgents(updated.agents ?? []);
        } catch (e) {
          toast.error(`${agent.name} failed`);
        } finally {
          setRunningAgents((prev) => {
            const next = new Set(prev);
            next.delete(agent.type);
            return next;
          });
        }
      }
      setCompletedCount(enabledAgents.length);
      setRunningAgent(null);
      setLoading(false);
      toast.dismiss(id);
      toast.success("Content plan ready");
    } catch (error) {
      console.error("Error running all agents:", error);
      toast.dismiss(id);
      toast.error("Failed to complete all analyses");
      setLoading(false);
      setRunningAgent(null);
    }
  };

  const enabledAgentCount = agents.filter((a) => a.enabled).length;
  const allComplete =
    enabledAgentCount > 0 &&
    agents.filter((a) => a.enabled).every((a) => a.latestRun?.status === "COMPLETED");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Top Bar */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container-page flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-white transition text-sm">
              Home
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-white font-medium">{tenantSlug}</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <Link href={`/${tenantSlug}`} className="text-slate-300 hover:text-indigo-400 transition">Dashboard</Link>
            <Link href={`/${tenantSlug}/report`} className="text-slate-300 hover:text-indigo-400 transition">Content Plan</Link>
            <Link href={`/${tenantSlug}/connect`} className="text-slate-300 hover:text-indigo-400 transition">Connect Data</Link>
          </nav>
          <TenantSwitcher tenants={tenants} currentSlug={tenantSlug} />
        </div>
      </div>

      {/* Main Content */}
      <div className="container-page py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-4xl font-bold text-white">Content Intelligence Hub</h2>
            {agents.length > 0 && agents[0].latestRun?.completedAt && (
              <div className="text-sm text-slate-400">
                Last updated: {new Date(agents[0].latestRun.completedAt).toLocaleString()}
              </div>
            )}
          </div>
          <p className="text-slate-400">
            Select what to analyze, then run it in one click.
          </p>
        </div>

        {/* Onboarding Banner */}
        {showBanner && (
          <div className="mb-6 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-lg flex items-start justify-between">
            <p className="text-indigo-100">
              This is a demo tenant. Click <strong>Generate Content Plan</strong> to run the AI agents on demo data.
            </p>
            <button
              onClick={() => setShowBanner(false)}
              className="text-indigo-300 hover:text-white ml-4"
              aria-label="Close banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Run All Button */}
        <div className="mb-8">
          {!loading && allComplete ? (
            <Link
              href={`/${tenantSlug}/report`}
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              View Content Plan
            </Link>
          ) : (
            <div className="space-y-4">
              <button
                onClick={handleRunAllEnabled}
                disabled={loading || agents.length === 0}
                className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {runningAgent ? `Analyzing ${runningAgent}... (${completedCount}/${enabledAgentCount})` : "Starting analysis..."}
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Generate Content Plan
                  </>
                )}
              </button>
              {loading && (
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-indigo-600 to-violet-600 h-full transition-all duration-300 ease-out"
                    style={{ width: `${(completedCount / enabledAgentCount) * 100}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {loading ? (
            // Skeleton loaders
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-6 space-y-4">
                <div className="h-6 bg-slate-700 rounded animate-pulse" />
                <div className="h-4 bg-slate-700 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-slate-700 rounded animate-pulse w-1/2" />
                <div className="h-8 bg-slate-700 rounded animate-pulse mt-4" />
              </div>
            ))
          ) : agents.length === 0 ? (
            // Empty state
            <div className="col-span-full card p-12 text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Data Yet</h3>
              <p className="text-slate-400 mb-6">
                Upload your content data to get started with AI-powered insights.
              </p>
              <Link
                href={`/${tenantSlug}/connect`}
                className="btn-primary inline-flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Data
              </Link>
            </div>
          ) : (
            agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agentType={agent.type}
                name={agent.name}
                description={agent.description}
                enabled={agent.enabled}
                status={agent.latestRun?.status ?? "IDLE"}
                attributes={agent.attributes.map((attr: any) => ({
                  key: attr.key,
                  label: attr.label,
                  enabled: attr.enabled,
                }))}
                lastRun={agent.latestRun?.completedAt ? new Date(agent.latestRun.completedAt).toLocaleString() : null}
                resultPreview={extractSummary(agent.latestRun?.resultJson)}
                detailHref={`/${tenantSlug}/agents/${agent.type.toLowerCase()}`}
                onToggle={() => handleAgentToggle(agent.type)}
                onAttributeToggle={(key) => handleAttributeToggle(agent.type, key)}
                onRun={() => handleRunAgent(agent.type)}
                isRunningAll={loading}
              />
            ))
          )}
        </div>

        {/* Bottom Links */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm mb-8">
          <Link href={`/${tenantSlug}/connect`} className="text-indigo-400 hover:text-indigo-300">
            → Import Your Content Data
          </Link>
          <span className="text-slate-700">•</span>
          <Link href={`/${tenantSlug}/report`} className="text-indigo-400 hover:text-indigo-300">
            → View Content Plan
          </Link>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
          <p>&copy; 2026 ContentPulse. Content intelligence for editorial teams.</p>
        </footer>
      </div>
    </div>
  );
}
