import { Activity, Clock, CheckCircle, AlertTriangle, Target, Globe, Users, BarChart3 } from "lucide-react";
import type { DemoRun } from "@revon-tinyfish/contracts";

interface RunTimelineProps {
  run: DemoRun | null;
}

function formatWallTime(ms: number): string {
  if (ms <= 0) {
    return "0s";
  }

  if (ms < 1000) {
    return `${ms}ms`;
  }

  return `${(ms / 1000).toFixed(ms >= 10_000 ? 0 : 1)}s`;
}

function statusLabel(status: DemoRun["steps"][number]["status"]): string {
  if (status === "running") {
    return "Running";
  }
  if (status === "completed") {
    return "Completed";
  }
  if (status === "partial") {
    return "Partial";
  }
  if (status === "failed") {
    return "Failed";
  }
  if (status === "skipped") {
    return "Skipped";
  }
  return "Pending";
}

function runStatusLabel(status: DemoRun["status"]): string {
  if (status === "completed") {
    return "Completed";
  }
  if (status === "partial") {
    return "Completed with degradation";
  }
  if (status === "failed") {
    return "Failed";
  }
  return "Running";
}

export function RunTimeline({ run }: RunTimelineProps) {
  return (
    <section className="panel" data-testid="run-timeline-panel">
      <div className="panel-header compact">
        <p className="eyebrow">Workflow Status</p>
        <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.125rem", marginTop: 8 }}>
          Execution Trace
        </h2>
      </div>

      {!run ? (
        <div className="empty-state">
          <Activity size={32} style={{ color: "var(--text-muted)", marginBottom: 8 }} />
          <p className="empty-state-title">No Active Workflow</p>
          <p>Configure the ICP parameters above and launch a workflow. The agent trace will stream here in real time.</p>
        </div>
      ) : (
        <>
          <div className="badge-row" data-testid="run-badges">
            <span className={`status-pill mode-${run.mode}`}>
              {run.mode === "live" ? "Live TinyFish" : "Mock Backup"}
            </span>
            <span className="status-pill" style={{ background: "var(--bg-muted)", color: "var(--text-secondary)" }}>
              {run.experimentLabel}
            </span>
            <span className={`status-pill quality-${run.quality}`}>
              {run.quality === "healthy" ? "Healthy" : "Degraded"}
            </span>
            <span className={`status-pill status-${run.status}`}>{runStatusLabel(run.status)}</span>
          </div>

          {run.modeReason ? <p className="muted mode-reason">{run.modeReason}</p> : null}

          <div className="summary-grid" data-testid="run-summary-grid">
            <article>
              <span><Target size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Discovered</span>
              <strong>{run.summary.companiesFound}</strong>
            </article>
            <article>
              <span><CheckCircle size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Inspected</span>
              <strong>{run.summary.inspectionsCompleted}</strong>
            </article>
            <article>
              <span style={{ color: "var(--success)" }}>Qualified</span>
              <strong style={{ color: "var(--success)" }}>{run.summary.qualifiedLeadCount}</strong>
            </article>
            <article>
              <span>Usable</span>
              <strong>{run.summary.usableLeadCount}</strong>
            </article>
            <article>
              <span><Users size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Decision Makers</span>
              <strong>{run.summary.decisionMakersFound}</strong>
            </article>
            <article>
              <span><Globe size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Sites Visited</span>
              <strong>{run.summary.websitesVisited}</strong>
            </article>
            <article>
              <span><AlertTriangle size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Partial</span>
              <strong>{run.summary.partialLeadCount}</strong>
            </article>
            <article>
              <span><Clock size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Wall Time</span>
              <strong>{formatWallTime(run.summary.wallTimeMs)}</strong>
            </article>
          </div>

          {run.summary.directoryUrl ? (
            <p className="muted" style={{ marginTop: 16 }}>
              <Globe size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
              Directory:{" "}
              <a href={run.summary.directoryUrl} rel="noreferrer" target="_blank" style={{ wordBreak: "break-all" }}>
                {run.summary.directoryUrl}
              </a>
            </p>
          ) : null}

          <ul className="timeline" style={{ marginTop: 20 }} data-testid="run-steps-timeline">
            {run.steps.map((step) => (
              <li key={step.key} style={{ cursor: "default" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, width: "100%" }}>
                  <span className={`status-pill status-${step.status}`} style={{ flexShrink: 0 }}>
                    {statusLabel(step.status)}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ display: "block", fontSize: "0.9375rem" }}>{step.label}</strong>
                    <p style={{ marginTop: 4, fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                      {step.detail ?? "Waiting for this step to begin."}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {run.notes.length > 0 ? (
            <div className="run-notes" style={{ marginTop: 20 }}>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, marginBottom: 12 }}>
                Workflow Notes
              </h3>
              <ul className="stack-list compact-list">
                {run.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {run.error ? <p className="inline-error" style={{ marginTop: 16 }}>{run.error}</p> : null}
        </>
      )}
    </section>
  );
}
