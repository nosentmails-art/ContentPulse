/**
 * StatusBadge Component
 * @author sanat.k.mahapatra
 * 
 * Displays agent status with color-coded styling and animations
 */

interface StatusBadgeProps {
  status: "IDLE" | "RUNNING" | "COMPLETED" | "ERROR";
}

const statusConfig = {
  IDLE: { class: "status-idle", label: "Idle" },
  RUNNING: { class: "status-running", label: "Running" },
  COMPLETED: { class: "status-completed", label: "Completed" },
  ERROR: { class: "status-error", label: "Error" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.class}`}>
      {status === "RUNNING" && (
        <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
      )}
      {config.label}
    </span>
  );
}
