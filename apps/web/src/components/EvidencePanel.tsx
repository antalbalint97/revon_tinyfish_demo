import { FileSearch, Link, Users, CheckCircle, AlertTriangle, Code, Target, Mail, ExternalLink, Info } from "lucide-react";
import { useState } from "react";
import type { LeadRecord } from "@revon-tinyfish/contracts";

interface EvidencePanelProps {
  lead: LeadRecord | null;
}

const SCORE_METHODOLOGY = [
  { key: "fit", label: "ICP Fit", weight: "38%", color: "var(--brand-primary)", description: "How well the company matches the target market, location, company size, and keywords." },
  { key: "contactability", label: "Contactability", weight: "24%", color: "var(--success)", description: "Whether a public email, contact page, or named person with contact info was found." },
  { key: "quality", label: "Data Quality", weight: "23%", color: "var(--warning)", description: "How complete and structured the extracted website data is (summary, services, evidence)." },
  { key: "decisionMaker", label: "Decision Maker", weight: "15%", color: "var(--text-secondary)", description: "Whether a named decision-maker matching the target role was identified." },
];

export function EvidencePanel({ lead }: EvidencePanelProps) {
  const [showMethodology, setShowMethodology] = useState(false);
  const topEvidence = lead?.evidence[0] ?? null;

  return (
    <section className="panel evidence-panel drawer-column" data-testid="evidence-panel">
      <div className="panel-header compact">
        <p className="eyebrow">Evidence</p>
        <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.125rem", marginTop: 8 }}>
          Prospect Evidence & Contacts
        </h2>
      </div>

      {!lead ? (
        <div className="empty-state" style={{ padding: "32px 16px" }}>
          <FileSearch size={32} style={{ color: "var(--text-muted)", marginBottom: 8 }} />
          <p className="empty-state-title">No Prospect Selected</p>
          <p>Select a prospect to inspect the sites visited, qualification evidence, and extracted contacts.</p>
        </div>
      ) : (
        <>
          {/* ── Company header ── */}
          <div className="evidence-section">
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 700, marginBottom: 8 }}>
              {lead.companyName}
            </h3>
            <p style={{ fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: 12 }}>{lead.summary}</p>
            {topEvidence?.snippet ? (
              <blockquote style={{
                padding: "14px 18px",
                background: "var(--bg-muted)",
                borderRadius: 8,
                borderLeft: "4px solid var(--brand-primary)",
                fontStyle: "italic",
                color: "var(--text-secondary)",
                marginBottom: 14,
                fontSize: "0.875rem",
              }}>
                "{topEvidence.snippet}"
              </blockquote>
            ) : null}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <span className={`status-pill mode-${lead.captureMode}`}>
                {lead.captureMode === "live" ? "Live" : "Mock"}
              </span>
              <span className="status-pill" style={{ background: "var(--bg-muted)", color: "var(--text-secondary)" }}>
                {lead.inspectionStatus}
              </span>
              <span className={`confidence-pill confidence-${lead.score.confidence}`}>
                {lead.score.confidence} confidence
              </span>
              <span className={`qual-badge qual-${lead.score.qualificationState}`}>
                {lead.score.qualificationState}
              </span>
            </div>
          </div>

          {/* ── Contacts — shown first, most actionable ── */}
          <div className="evidence-section" data-testid="contacts-section">
            <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <Users size={16} />
              Contacts
              {lead.contacts.length > 0 && (
                <span style={{ marginLeft: 4, background: "var(--brand-primary)", color: "#fff", borderRadius: 20, padding: "1px 9px", fontSize: "0.7rem", fontWeight: 700 }}>
                  {lead.contacts.length}
                </span>
              )}
            </h4>

            {lead.contacts.length === 0 ? (
              <div style={{ background: "var(--bg-muted)", borderRadius: 8, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                <AlertTriangle size={16} style={{ color: "var(--warning)", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontWeight: 600, marginBottom: 4, fontSize: "0.875rem" }}>No contacts found</p>
                  <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    The agent did not find a publicly visible email address or named contact on this site.
                    This lowers the contactability score.
                  </p>
                </div>
              </div>
            ) : (
              <ul className="stack-list" data-testid="contacts-list" style={{ gap: 10 }}>
                {lead.contacts.map((contact) => (
                  <li key={contact.id} style={{
                    background: "var(--bg-muted)",
                    borderRadius: 8,
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <div>
                        <strong style={{ fontSize: "0.9375rem" }}>{contact.name}</strong>
                        <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginLeft: 8 }}>{contact.role}</span>
                      </div>
                      {contact.isDecisionMaker && (
                        <span style={{ background: "var(--brand-primary)", color: "#fff", borderRadius: 20, padding: "2px 9px", fontSize: "0.65rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                          Decision Maker
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                      {contact.email ? (
                        <a
                          href={`mailto:${contact.email}`}
                          style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.8125rem", fontWeight: 600, color: "var(--brand-primary)" }}
                        >
                          <Mail size={13} />
                          {contact.email}
                        </a>
                      ) : (
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                          <Mail size={13} />
                          No email found
                        </span>
                      )}
                      {contact.linkedinUrl ? (
                        <a
                          href={contact.linkedinUrl}
                          rel="noreferrer"
                          target="_blank"
                          style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.8125rem", fontWeight: 600 }}
                        >
                          <ExternalLink size={13} />
                          LinkedIn
                        </a>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ── Ranking score with methodology ── */}
          <div className="evidence-section">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                <Target size={16} />
                Ranking Score
              </h4>
              <button
                onClick={() => setShowMethodology((v) => !v)}
                style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", padding: "2px 6px" }}
                type="button"
              >
                <Info size={13} />
                {showMethodology ? "Hide methodology" : "How is this scored?"}
              </button>
            </div>

            {showMethodology && (
              <div style={{ background: "var(--bg-muted)", borderRadius: 8, padding: "14px 16px", marginBottom: 14 }}>
                <p style={{ fontSize: "0.8125rem", fontWeight: 600, marginBottom: 10 }}>
                  Rule-based scoring — four weighted dimensions (0–100 each):
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {SCORE_METHODOLOGY.map((dim) => (
                    <li key={dim.key} style={{ display: "flex", gap: 10, fontSize: "0.8125rem" }}>
                      <span style={{ fontWeight: 700, color: dim.color, minWidth: 32 }}>{dim.weight}</span>
                      <span><strong>{dim.label}</strong> — {dim.description}</span>
                    </li>
                  ))}
                </ul>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 10 }}>
                  Qualified ≥ 68 total + Fit ≥ 55 + Quality ≥ 50 · Review ≥ 45 · Unqualified below that
                </p>
              </div>
            )}

            <div className="score-cards" data-testid="score-breakdown">
              <div className="score-card" style={{ borderTop: "3px solid var(--brand-primary)" }}>
                <span className="score-card-label">Total</span>
                <span className="score-card-value">{lead.score.totalScore}</span>
              </div>
              <div className="score-card">
                <span className="score-card-label">ICP Fit <small style={{ color: "var(--text-muted)" }}>38%</small></span>
                <span className="score-card-value">{lead.score.fitScore}</span>
              </div>
              <div className="score-card">
                <span className="score-card-label">Contact <small style={{ color: "var(--text-muted)" }}>24%</small></span>
                <span className="score-card-value"
                  style={{ color: lead.score.contactabilityScore < 30 ? "var(--warning)" : undefined }}
                >
                  {lead.score.contactabilityScore}
                </span>
              </div>
              <div className="score-card">
                <span className="score-card-label">Quality <small style={{ color: "var(--text-muted)" }}>23%</small></span>
                <span className="score-card-value">{lead.score.qualityScore}</span>
              </div>
            </div>

            {lead.score.reasons.length > 0 && (
              <ul className="stack-list" style={{ marginTop: 12 }}>
                {lead.score.reasons.map((reason) => (
                  <li key={reason} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.875rem" }}>
                    <CheckCircle size={14} style={{ color: "var(--success)", flexShrink: 0, marginTop: 2 }} />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ── Review flags ── */}
          {lead.qualityNotes.length > 0 ? (
            <div className="evidence-section">
              <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={16} style={{ color: "var(--warning)" }} />
                Review Flags
              </h4>
              <ul className="stack-list">
                {lead.qualityNotes.map((note) => (
                  <li key={note} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.875rem" }}>
                    <AlertTriangle size={14} style={{ color: "var(--warning)", flexShrink: 0, marginTop: 3 }} />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* ── Pages reviewed ── */}
          <div className="evidence-section">
            <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <Link size={16} />
              Pages Reviewed
            </h4>
            <ul className="stack-list" data-testid="pages-reviewed">
              {lead.evidence.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.sourceUrl}
                    rel="noreferrer"
                    target="_blank"
                    style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, marginBottom: 4 }}
                  >
                    {item.title}
                    <ExternalLink size={14} />
                  </a>
                  <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    {item.sourceLabel ? (
                      <span className="status-pill" style={{ background: "var(--bg-muted)", color: "var(--text-secondary)", padding: "2px 8px", fontSize: "0.7rem" }}>
                        {item.sourceLabel}
                      </span>
                    ) : null}
                    <span className={`confidence-pill confidence-${item.confidence}`} style={{ padding: "2px 8px", fontSize: "0.7rem" }}>
                      {item.confidence}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: "4px 0" }}>{item.summary}</p>
                  {item.snippet ? (
                    <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                      "{item.snippet}"
                    </p>
                  ) : null}
                  {item.qualityNote ? (
                    <p style={{ fontSize: "0.8125rem", color: "var(--warning)", marginTop: 4 }}>
                      <AlertTriangle size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
                      {item.qualityNote}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          {/* ── ICP signal checks (collapsed by default) ── */}
          <div className="evidence-section">
            <details>
              <summary style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle size={16} />
                <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, margin: 0 }}>
                  ICP Signal Checks
                </h4>
              </summary>
              {lead.fieldAssessments.length === 0 ? (
                <p className="muted" style={{ fontSize: "0.875rem", marginTop: 10 }}>
                  No ICP signal checks were captured for this prospect.
                </p>
              ) : (
                <ul className="stack-list" style={{ marginTop: 10 }}>
                  {lead.fieldAssessments.map((assessment) => (
                    <li key={`${assessment.field}-${assessment.status}`}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <strong style={{ fontSize: "0.875rem" }}>{assessment.field}</strong>
                        <div style={{ display: "flex", gap: 6 }}>
                          <span className={`status-pill status-${assessment.status === "present" ? "completed" : assessment.status === "missing" ? "failed" : "pending"}`} style={{ padding: "2px 8px", fontSize: "0.7rem" }}>
                            {assessment.status}
                          </span>
                          <span className={`confidence-pill confidence-${assessment.confidence}`} style={{ padding: "2px 8px", fontSize: "0.7rem" }}>
                            {assessment.confidence}
                          </span>
                        </div>
                      </div>
                      {assessment.notes.length > 0 ? (
                        <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                          {assessment.notes.join(" | ")}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </details>
          </div>

          {/* ── Raw data ── */}
          <div className="evidence-section">
            <details>
              <summary style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <Code size={16} />
                <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, margin: 0 }}>
                  Raw Data
                </h4>
              </summary>
              <pre className="raw-block" style={{ marginTop: 12 }}>
                {JSON.stringify(lead.rawExtraction, null, 2)}
              </pre>
            </details>
          </div>
        </>
      )}
    </section>
  );
}
