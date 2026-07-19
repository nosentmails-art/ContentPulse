/**
 * OpportunityCard Component
 * @author sanat.k.mahapatra
 * 
 * Displays content opportunity with urgency badge and metadata
 */

interface OpportunityCardProps {
  topic: string;
  format: string;
  channel: string;
  urgency: string;
  reason: string;
  suggestedTitle: string;
}

const urgencyConfig = {
  HOT: { class: "bg-red-500/20 text-red-400", label: "🔥 Hot" },
  WARM: { class: "bg-orange-500/20 text-orange-400", label: "🌡️ Warm" },
  EVERGREEN: { class: "bg-blue-500/20 text-blue-400", label: "📌 Evergreen" },
};

export function OpportunityCard({
  topic,
  format,
  channel,
  urgency,
  reason,
  suggestedTitle,
}: OpportunityCardProps) {
  const config = urgencyConfig[urgency?.toUpperCase() as keyof typeof urgencyConfig] || urgencyConfig.EVERGREEN;

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex-1 pr-4">{suggestedTitle}</h3>
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${config.class}`}>
          {config.label}
        </span>
      </div>

      <p className="text-slate-400 text-sm mb-4">{reason}</p>

      <div className="flex flex-wrap gap-2">
        <span className="inline-block px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-full">
          {topic}
        </span>
        <span className="inline-block px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-full">
          {format}
        </span>
        <span className="inline-block px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-full">
          {channel}
        </span>
      </div>
    </div>
  );
}
