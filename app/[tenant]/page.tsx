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
import { Play, Loader2 } from "lucide-react";
import { AgentCard } from "@/components/AgentCard";
import { TenantSwitcher } from "@/components/TenantSwitcher";
import { toast } from "sonner";

type AgentStatus = "IDLE" | "RUNNING" | "COMPLETED" | "ERROR";

export default function TenantPage() {
  const params = useParams();
  const tenantSlug = params.tenant as string;
  const [agents, setAgents] = useState<any[]>([]);
  const [tenants, setTenants] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [runningAgents, setRunningAgents] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

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
    const id = toast.loading(`Analyzing ${enabledAgents.length} items...`);

    try {
      for (const agent of enabledAgents) {
        setRunningAgents((prev) => new Set([...prev, agent.type]));
        try {
          await fetch(`/api/${tenantSlug}/agents/${agent.type.toLowerCase()}/run`, {
            method: "POST",
          });
          const updated = await fetch(`/api/${tenantSlug}/agents`).then((r) => r.json());
          setAgents(updated.agents ?? []);
        } catch (e) {
          toast.error(`${agent.type} failed`);
        } finally {
          setRunningAgents((prev) => {
            const next = new Set(prev);
            next.delete(agent.type);
            return next;
          });
        }
      }
      setLoading(false);
      toast.dismiss(id);
      toast.success("All analyses complete");
    } catch (error) {
      console.error("Error running all agents:", error);
      toast.dismiss(id);
      toast.error("Failed to complete all analyses");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Top Bar */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container-page flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">ContentPulse</h1>
          <TenantSwitcher tenants={tenants} currentSlug={tenantSlug} />
        </div>
      </div>

      {/* Main Content */}
      <div className="container-page py-12">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Your Content Command Center</h2>
          <p className="text-slate-400">
            Select what to analyze, then run it in one click.
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
                Analyzing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Analyze Now
              </>
            )}
          </button>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {agents.map((agent) => (
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
              resultPreview={agent.latestRun?.resultJson ? "Analysis complete" : null}
              detailHref={`/${tenantSlug}/agents/${agent.type.toLowerCase()}`}
              onToggle={() => handleAgentToggle(agent.type)}
              onAttributeToggle={(key) => handleAttributeToggle(agent.type, key)}
              onRun={() => handleRunAgent(agent.type)}
            />
          ))}
        </div>

        {/* Bottom Links */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
          <Link href={`/${tenantSlug}/connect`} className="text-indigo-400 hover:text-indigo-300">
            → Import Your Content Data
          </Link>
          <span className="text-slate-700">•</span>
          <Link href={`/${tenantSlug}/report`} className="text-indigo-400 hover:text-indigo-300">
            → View Content Plan
          </Link>
        </div>
      </div>
    </div>
  );
}
