import { BarChart3, Clock, Users, Mail, TrendingUp, Activity, Zap, AlertTriangle } from "lucide-react";
import type { DemoRun, ExperimentVariantSummary, SessionTelemetry } from "@revon-tinyfish/contracts";

interface TelemetryPanelProps {
  run: DemoRun | null;
  telemetry: SessionTelemetry | null;
  variantSummary: ExperimentVariantSummary | null;
  isRefreshing: boolean;
  error: string | null;
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

function formatNullableMetric(value: number | null, suffix = ""): string {
  if (value === null) {
    return "n/a";
  }

  return `${value}${suffix}`;
}

function runLabel(status: SessionTelemetry["runStatus"]): string {
  if (status === "completed") {
    return "Completed";
  }
  if (status === "partial") {
    return "Partial";
  }
  if (status === "failed") {
    return "Failed";
  }
  return "Running";
}

function tinyFishRunLabel(status: SessionTelemetry["tinyfishRuns"][number]["finalStatus"]): string {
  if (status === "timed_out") {
    return "Timed out";
  }

  return status.replace(/_/g, " ");
}

export function TelemetryPanel({
  run,
  telemetry,
  variantSummary,
  isRefreshing,
  error,
}: TelemetryPanelProps) {
  return (
    <section className="panel" data-testid="telemetry-panel">
      <div className="panel-header compact">
        <p className="eyebrow">Workflow Metrics</p>
        <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.125rem", marginTop: 8 }}>
          Sourcing Performance
        </h2>
      </div>

      {!run ? (
        <p className="muted" style={{ fontSize: "0.875rem" }}>
          <BarChart3 size={16} style={{ verticalAlign: "middle", marginRight: 8 }} />
          Launch a sourcing workflow to capture performance metrics, agent timings, and sourcing quality data.
        </p>
      ) : (
        <>
          <div className="badge-row" data-testid="telemetry-badges">
            <span className={`status-pill status-${telemetry?.runStatus ?? run.status}`}>
              {runLabel(telemetry?.runStatus ?? run.status)}
            </span>
            <span className={`status-pill mode-${telemetry?.captureMode ?? run.mode}`}>
              {telemetry?.captureMode === "mock" || run.mode === "mock" ? "Mock Path" : "Live Path"}
            </span>
            <span className={`status-pill quality-${telemetry?.runQuality ?? run.quality}`}>
              {telemetry?.runQuality === "degraded" || run.quality === "degraded" ? "Degraded" : "Healthy"}
            </span>
            {telemetry?.creditsAvailable ? (
              <span className="status-pill" style={{ background: "var(--success-bg)", color: "var(--success)" }}>
                <Zap size={12} style={{ marginRight: 4 }} />
                Credits Attached
              </span>
            ) : null}
            {isRefreshing ? <span className="status-pill status-running">Refreshing</span> : null}
          </div>

          <div className="telemetry-meta" style={{ marginTop: 16 }}>
            <span>Session {run.id.slice(0, 12)}...</span>
            {telemetry?.correlationId ? <span>Correlation {telemetry.correlationId.slice(0, 12)}...</span> : null}
            <span>Experiment: {run.experimentLabel}</span>
          </div>

          {error ? <p className="inline-error" style={{ marginTop: 12 }}>{error}</p> : null}

          {telemetry ? (
            <>
              <div className="summary-grid telemetry-grid" style={{ marginTop: 20 }} data-testid="telemetry-metrics">
                <article>
                  <span><Clock size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Wall Clock</span>
                  <strong>{formatWallTime(telemetry.totalWallClockMs)}</strong>
                </article>
                <article>
                  <span style={{ color: "var(--success)" }}>Qualified</span>
                  <strong style={{ color: "var(--success)" }}>{telemetry.totalQualifiedLeads}</strong>
                </article>
                <article>
                  <span>Usable</span>
                  <strong>{telemetry.qualityMetrics.usableLeadCount}</strong>
                </article>
                <article>
                  <span><AlertTriangle size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Partial/Failed</span>
                  <strong>{telemetry.qualityMetrics.percentagePartialOrFailed}%</strong>
                </article>
                <article>
                  <span><Users size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Decision Makers</span>
                  <strong>{telemetry.totalDecisionMakersFound}</strong>
                </article>
                <article>
                  <span><Mail size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Public Emails</span>
                  <strong>{telemetry.totalPublicEmailsFound}</strong>
                </article>
                <article>
                  <span><Activity size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Runs/Session</span>
                  <strong>{telemetry.costMetrics.runsPerSession}</strong>
                </article>
                <article>
                  <span><TrendingUp size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Sec/Qualified</span>
                  <strong>{formatNullableMetric(telemetry.costMetrics.secondsPerQualifiedLead, "s")}</strong>
                </article>
              </div>

              <div className="telemetry-sections" style={{ marginTop: 24 }}>
                <section className="telemetry-section">
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, marginBottom: 12 }}>
                    Benchmark Comparison
                  </h3>
                  {variantSummary ? (
                    <div className="summary-grid telemetry-grid compact-grid">
                      <article>
                        <span>Sessions</span>
                        <strong>{variantSummary.sessionCount}</strong>
                      </article>
                      <article>
                        <span>Avg Wall Clock</span>
                        <strong>{formatWallTime(variantSummary.averageWallClockMs)}</strong>
                      </article>
                      <article>
                        <span>Avg Qualified</span>
                        <strong>{variantSummary.averageQualifiedLeadCount}</strong>
                      </article>
                      <article>
                        <span>Avg Partial/Failed</span>
                        <strong>{variantSummary.averagePartialOrFailedPercentage}%</strong>
                      </article>
                    </div>
                  ) : (
                    <p className="muted" style={{ fontSize: "0.875rem" }}>
                      No benchmark data yet. Complete one or more workflows with this experiment label to compare them.
                    </p>
                  )}
                </section>

                <section className="telemetry-section" style={{ marginTop: 20 }}>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, marginBottom: 12 }}>
                    Agent Activity
                  </h3>
                  {telemetry.tinyfishRuns.length === 0 ? (
                    <p className="muted" style={{ fontSize: "0.875rem" }}>
                      Agent activity will appear here as the workflow progresses.
                    </p>
                  ) : (
                    <ul className="stack-list compact-list telemetry-run-list" data-testid="agent-activity-list">
                      {telemetry.tinyfishRuns.map((tinyfishRun) => (
                        <li key={tinyfishRun.tinyfishRunId}>
                          <div className="telemetry-run-top">
                            <strong style={{ fontFamily: "var(--font-heading)", fontSize: "0.9375rem" }}>
                              {tinyfishRun.stage === "directory_discovery"
                                ? "Directory Discovery"
                                : tinyfishRun.companyName || "Website Inspection"}
                            </strong>
                            <span className={`status-pill status-${tinyfishRun.finalStatus}`}>
                              {tinyFishRunLabel(tinyfishRun.finalStatus)}
                            </span>
                          </div>
                          <p className="muted telemetry-run-copy" style={{ fontSize: "0.8125rem", marginTop: 6 }}>
                            {tinyfishRun.targetUrl}
                          </p>
                          <div className="meta-row" style={{ marginTop: 8 }}>
                            <span>Run {tinyfishRun.tinyfishRunId.slice(0, 8)}...</span>
                            {tinyfishRun.inspectionStatus ? <span>{tinyfishRun.inspectionStatus}</span> : null}
                            <span>{formatNullableMetric(tinyfishRun.durationMs, "ms")}</span>
                            <span>
                              Credits: {tinyfishRun.creditUsage === null ? "n/a" : tinyfishRun.creditUsage}
                            </span>
                            {tinyfishRun.timeoutFlag ? (
                              <span style={{ color: "var(--warning)" }}>Timeout</span>
                            ) : null}
                            {tinyfishRun.degradedFlag ? (
                              <span style={{ color: "var(--error)" }}>Degraded</span>
                            ) : null}
                          </div>
                          {tinyfishRun.errorMessage ? (
                            <p className="inline-error telemetry-inline-error" style={{ marginTop: 8 }}>
                              {tinyfishRun.errorMessage}
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </>
          ) : (
            <p className="muted" style={{ marginTop: 16, fontSize: "0.875rem" }}>
              Telemetry snapshot not loaded yet.
            </p>
          )}
        </>
      )}
    </section>
  );
}
