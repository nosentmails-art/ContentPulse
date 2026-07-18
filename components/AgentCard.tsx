/**
 * AgentCard Component
 * @author sanat.k.mahapatra
 * 
 * Displays individual agent with status, toggles, and run controls
 */

"use client";

import { useState } from "react";
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
  onToggle: () => void;
  onAttributeToggle: (key: string) => void;
  onRun: () => void;
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
  onToggle,
  onAttributeToggle,
  onRun,
}: AgentCardProps) {
  const [showAttributes, setShowAttributes] = useState(false);

  return (
    <div className="card group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-indigo-500">{AGENT_ICONS[agentType]}</div>
          <div>
            <h3 className="font-semibold text-white">{name}</h3>
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Master Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
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

      {/* Run Button */}
      <button
        onClick={onRun}
        disabled={!enabled || status === "RUNNING"}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed mb-3"
      >
        {status === "RUNNING" ? "Running..." : "Run Agent"}
      </button>

      {/* Last Run Info */}
      <div className="text-xs text-slate-500">
        {lastRun ? `Last run: ${lastRun}` : "Never run"}
      </div>
    </div>
  );
}
