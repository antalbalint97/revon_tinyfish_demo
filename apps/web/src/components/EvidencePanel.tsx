import { FileSearch, Link, Users, CheckCircle, AlertTriangle, Code, Target, Mail, ExternalLink } from "lucide-react";
import type { LeadRecord } from "@revon-tinyfish/contracts";

interface EvidencePanelProps {
  lead: LeadRecord | null;
}

export function EvidencePanel({ lead }: EvidencePanelProps) {
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
          <div className="evidence-section">
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 700, marginBottom: 12 }}>
              {lead.companyName}
            </h3>
            <p style={{ fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: 12 }}>{lead.summary}</p>
            {topEvidence?.snippet ? (
              <blockquote style={{
                padding: "16px 20px",
                background: "var(--bg-muted)",
                borderRadius: 10,
                borderLeft: "4px solid var(--brand-primary)",
                fontStyle: "italic",
                color: "var(--text-secondary)",
                marginBottom: 16
              }}>
                "{topEvidence.snippet}"
              </blockquote>
            ) : null}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
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
            <div className="score-cards" data-testid="score-breakdown">
              <div className="score-card">
                <span className="score-card-label">Total</span>
                <span className="score-card-value">{lead.score.totalScore}</span>
              </div>
              <div className="score-card">
                <span className="score-card-label">Fit</span>
                <span className="score-card-value">{lead.score.fitScore}</span>
              </div>
              <div className="score-card">
                <span className="score-card-label">Contact</span>
                <span className="score-card-value">{lead.score.contactabilityScore}</span>
              </div>
              <div className="score-card">
                <span className="score-card-label">Quality</span>
                <span className="score-card-value">{lead.score.qualityScore}</span>
              </div>
            </div>
          </div>

          <div className="evidence-section">
            <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <Target size={16} />
              Ranking Rationale
            </h4>
            <ul className="stack-list">
              {lead.score.reasons.map((reason) => (
                <li key={reason} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <CheckCircle size={16} style={{ color: "var(--success)", flexShrink: 0, marginTop: 2 }} />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {lead.qualityNotes.length > 0 ? (
            <div className="evidence-section">
              <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={16} style={{ color: "var(--warning)" }} />
                Review Flags
              </h4>
              <ul className="stack-list">
                {lead.qualityNotes.map((note) => (
                  <li key={note} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <AlertTriangle size={14} style={{ color: "var(--warning)", flexShrink: 0, marginTop: 3 }} />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {lead.score.explanations && Object.keys(lead.score.explanations).length > 0 ? (
            <div className="evidence-section">
              <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, marginBottom: 12 }}>
                Fit Assessment
              </h4>
              <div className="score-cards">
                {Object.entries(lead.score.explanations).map(([category, explanation]) => (
                  <div className="score-card" key={category}>
                    <span className="score-card-label">{category}</span>
                    <span className="score-card-value">{explanation.score}</span>
                    <span className="score-card-note">{explanation.summary}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

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

          <div className="evidence-section">
            <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <Users size={16} />
              Extracted Contacts
            </h4>
            {lead.contacts.length === 0 ? (
              <p className="muted" style={{ fontSize: "0.875rem" }}>
                No named contacts were extracted from the visited pages.
              </p>
            ) : (
              <ul className="stack-list" data-testid="contacts-list">
                {lead.contacts.map((contact) => (
                  <li key={contact.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <strong style={{ display: "block", marginBottom: 4 }}>{contact.name}</strong>
                      <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>{contact.role}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {contact.email ? (
                        <a href={`mailto:${contact.email}`} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.8125rem" }}>
                          <Mail size={14} />
                          {contact.email}
                        </a>
                      ) : null}
                      {contact.isDecisionMaker ? (
                        <span className="status-pill" style={{ background: "var(--success-bg)", color: "var(--success)", padding: "2px 8px", fontSize: "0.65rem" }}>
                          Decision Maker
                        </span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="evidence-section">
            <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, marginBottom: 12 }}>
              ICP Signal Checks
            </h4>
            {lead.fieldAssessments.length === 0 ? (
              <p className="muted" style={{ fontSize: "0.875rem" }}>
                No ICP signal checks were captured for this prospect.
              </p>
            ) : (
              <ul className="stack-list">
                {lead.fieldAssessments.map((assessment) => (
                  <li key={`${assessment.field}-${assessment.status}`}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <strong>{assessment.field}</strong>
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
          </div>

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
