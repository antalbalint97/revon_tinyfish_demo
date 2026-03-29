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

export function SavedSessionList({
  sessions,
  isLoading,
  error,
  onOpenSession,
}: SavedSessionListProps) {
  return (
    <section className="panel">
      <div className="panel-header compact">
        <p className="eyebrow">Recent executions</p>
        <h2>Workflow history</h2>
      </div>

      {error ? <p className="inline-error">{error}</p> : null}

      {isLoading ? (
        <div className="stack-list compact-list">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} style={{ padding: "12px 14px" }}>
              <span className="skeleton skeleton-line medium" style={{ marginBottom: 8 }} />
              <span className="skeleton skeleton-line short" />
            </div>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">No executions yet</p>
          <p>Completed workflows will appear here. Launch a sourcing workflow to get started.</p>
        </div>
      ) : (
        <ul className="stack-list compact-list">
          {sessions.map((session) => (
            <li key={session.id}>
              <div className="saved-session-top">
                <div>
                  <strong>{session.experimentLabel}</strong>
                  <p className="muted" title={new Date(session.startedAt).toLocaleString()}>
                    {formatRelativeTime(session.startedAt)}
                  </p>
                </div>
                <span className={`lifecycle-badge lifecycle-${session.lifecycleStatus}`}>
                  {lifecycleLabel(session.lifecycleStatus)}
                </span>
              </div>
              <div className="meta-row">
                <span>{session.mode}</span>
                <span>{session.quality}</span>
                <span>{session.qualifiedLeadCount} qualified</span>
                <span>{session.leadCount} total</span>
              </div>
              <button
                className="secondary-button"
                onClick={() => onOpenSession(session.id)}
                type="button"
              >
                Open execution
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
