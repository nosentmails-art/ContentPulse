/**
 * AgentCard Component
 * @author sanat.k.mahapatra
 * 
 * Displays individual agent with status, toggles, run controls, and navigation to detail page
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BarChart3,
  Users,
  Layers,
  MessageCircle,
  TrendingUp,
  Swords,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";

interface Attribute {
  key: string;
  label: string;
  enabled: boolean;
}

interface AgentCardProps {
  agentType: string;
  name: string;
  description: string;
  status: "IDLE" | "RUNNING" | "COMPLETED" | "ERROR";
  enabled: boolean;
  attributes: Attribute[];
  lastRun: string | null;
  resultPreview: string | null;
  isRunningAll?: boolean;
  onToggle: () => void;
  onAttributeToggle: (key: string) => void;
  onRun: () => void;
  detailHref: string;
}

const AGENT_ICONS: Record<string, React.ReactNode> = {
  CONTENT_ANALYTICS: <BarChart3 className="w-5 h-5" />,
  AUDIENCE_INTELLIGENCE: <Users className="w-5 h-5" />,
  CHANNEL_CONTENT_INTELLIGENCE: <Layers className="w-5 h-5" />,
  SENTIMENT_ANALYSIS: <MessageCircle className="w-5 h-5" />,
  GAP_ANALYSIS: <TrendingUp className="w-5 h-5" />,
  COMPETITOR_ANALYSIS: <Swords className="w-5 h-5" />,
  OPPORTUNITY_IDENTIFICATION: <Lightbulb className="w-5 h-5" />,
};

export function AgentCard({
  agentType,
  name,
  description,
  status,
  enabled,
  attributes,
  lastRun,
  resultPreview,
  isRunningAll,
  onToggle,
  onAttributeToggle,
  onRun,
  detailHref,
}: AgentCardProps) {
  const [showAttributes, setShowAttributes] = useState(false);

  return (
    <div className="card group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="text-indigo-500">{AGENT_ICONS[agentType]}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">{name}</h3>
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Master Toggle */}
        <label className="flex items-center gap-2 cursor-pointer ml-2">
          <input
            type="checkbox"
            checked={enabled}
            onChange={onToggle}
            className="w-4 h-4 rounded bg-slate-800 border-slate-700 cursor-pointer"
          />
        </label>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-400 mb-4">{description}</p>

      {/* Attributes Section */}
      {attributes.length > 0 && (
        <div className="mb-4 border-t border-slate-800 pt-4">
          <button
            onClick={() => setShowAttributes(!showAttributes)}
            className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition"
          >
            {showAttributes ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            {showAttributes ? "Hide" : "Show"} Attributes
          </button>

          {showAttributes && (
            <div className="mt-3 space-y-2">
              {attributes.map((attr) => (
                <label
                  key={attr.key}
                  className="flex items-center gap-3 p-2 rounded hover:bg-slate-800/50 transition cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={attr.enabled}
                    onChange={() => onAttributeToggle(attr.key)}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 cursor-pointer"
                    disabled={!enabled}
                  />
                  <span className="text-sm text-slate-300">{attr.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Result Preview */}
      {resultPreview && (
        <div className="mb-4 p-3 bg-slate-800 rounded text-sm text-slate-300 line-clamp-2">
          {resultPreview}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mb-3">
        {/* Run Agent Button */}
        <button
          onClick={onRun}
          disabled={!enabled || status === "RUNNING" || isRunningAll}
          className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "RUNNING" ? "Analyzing..." : "Analyze"}
        </button>

        {/* View Details Link */}
        <Link
          href={detailHref}
          className="flex items-center justify-center px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition text-slate-300 hover:text-indigo-400 border border-slate-700 hover:border-indigo-500"
          title="View details and run history"
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Last Run Info */}
      <div className="text-xs text-slate-500">
        {lastRun ? `Last run: ${lastRun}` : "Never run"}
      </div>
    </div>
  );
}
