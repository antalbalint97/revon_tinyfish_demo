import { ExternalLink, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import type { PersistedSessionSummary } from "@revon-tinyfish/contracts";

interface SavedSessionListProps {
  sessions: PersistedSessionSummary[];
  isLoading: boolean;
  error: string | null;
  onOpenSession: (sessionId: string) => void;
}

function formatRelativeTime(value: string): string {
  const ms = Date.now() - new Date(value).getTime();
  if (ms < 60_000) return "just now";
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
  if (ms < 604_800_000) return `${Math.floor(ms / 86_400_000)}d ago`;
  return new Date(value).toLocaleDateString();
}

function lifecycleLabel(status: PersistedSessionSummary["lifecycleStatus"]): string {
  if (status === "pushed_complete") return "Synced";
  if (status === "pushed_partial") return "Partial sync";
  if (status === "completed") return "Completed";
  if (status === "running") return "Running";
  if (status === "failed") return "Failed";
  return "Created";
}

function LifecycleIcon({ status }: { status: PersistedSessionSummary["lifecycleStatus"] }) {
  if (status === "completed" || status === "pushed_complete") {
    return <CheckCircle size={14} />;
  }
  if (status === "failed") {
    return <AlertCircle size={14} />;
  }
  if (status === "running") {
    return <Loader2 size={14} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />;
  }
  return <Clock size={14} />;
}

export function SavedSessionList({
  sessions,
  isLoading,
  error,
  onOpenSession,
}: SavedSessionListProps) {
  return (
    <section className="panel session-list-panel" data-testid="session-list-panel">
      <div className="panel-header compact">
        <p className="eyebrow">Recent Executions</p>
        <h2>Workflow History</h2>
      </div>

      {error ? <p className="inline-error">{error}</p> : null}

      {isLoading ? (
        <ul className="timeline">
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i} style={{ cursor: "default" }}>
              <div className="timeline-content">
                <span className="skeleton skeleton-line medium" style={{ marginBottom: 8, display: "block" }} />
                <span className="skeleton skeleton-line short" style={{ display: "block" }} />
              </div>
            </li>
          ))}
        </ul>
      ) : sessions.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">No executions yet</p>
          <p>Completed workflows will appear here. Launch a sourcing workflow to get started.</p>
        </div>
      ) : (
        <ul className="timeline" data-testid="session-timeline">
          {sessions.map((session) => (
            <li
              key={session.id}
              onClick={() => onOpenSession(session.id)}
              data-testid={`session-item-${session.id}`}
            >
              <div className="timeline-content">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <strong style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem" }}>
                    {session.experimentLabel}
                  </strong>
                  <span className={`lifecycle-badge lifecycle-${session.lifecycleStatus}`}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <LifecycleIcon status={session.lifecycleStatus} />
                      {lifecycleLabel(session.lifecycleStatus)}
                    </span>
                  </span>
                </div>
                <p style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={12} />
                    {formatRelativeTime(session.startedAt)}
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>|</span>
                  <span>{session.mode}</span>
                  <span style={{ color: "var(--text-muted)" }}>|</span>
                  <span style={{ color: "var(--success)" }}>{session.qualifiedLeadCount} qualified</span>
                  <span style={{ color: "var(--text-muted)" }}>/</span>
                  <span>{session.leadCount} total</span>
                </p>
              </div>
              <ExternalLink size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
