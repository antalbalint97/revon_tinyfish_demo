import { Users, ExternalLink } from "lucide-react";
import type { LeadRecord } from "@revon-tinyfish/contracts";
import { getEffectiveQualificationState } from "../lib/leadQualification";

interface LeadTableProps {
  leads: Array<LeadRecord & { revonStatusLabel?: string }>;
  selectedLeadId: string | null;
  onSelect: (leadId: string) => void;
  selectedLeadIds?: string[] | undefined;
  onToggleLeadSelection?: ((leadId: string) => void) | undefined;
}

export function LeadTable({
  leads,
  selectedLeadId,
  onSelect,
  selectedLeadIds,
  onToggleLeadSelection,
}: LeadTableProps) {
  if (leads.length === 0) {
    return (
      <section className="panel" data-testid="lead-table-panel">
        <div className="panel-header compact">
          <p className="eyebrow">Prospects</p>
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.125rem", marginTop: 8 }}>
            Qualified Prospect Shortlist
          </h2>
        </div>
        <div className="empty-state">
          <Users size={32} style={{ color: "var(--text-muted)", marginBottom: 8 }} />
          <p className="empty-state-title">Waiting for Results</p>
          <p>Prospects appear here as the workflow completes each inspection and ranks the shortlist.</p>
        </div>
      </section>
    );
  }

  const qualifiedCount = leads.filter((l) => getEffectiveQualificationState(l) === "qualified").length;
  const selectedCount = selectedLeadIds?.length ?? 0;

  return (
    <section className="panel" data-testid="lead-table-panel">
      <div className="panel-header compact">
        <p className="eyebrow">Prospects</p>
        <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.125rem", marginTop: 8 }}>
          Qualified Prospect Shortlist
        </h2>
      </div>

      <div className="table-header-bar">
        <div className="count-chips">
          <span className="count-chip count-chip-total">{leads.length} total</span>
          <span className="count-chip count-chip-qualified">{qualifiedCount} qualified</span>
          {selectedLeadIds ? (
            <span className="count-chip count-chip-selected">{selectedCount} selected</span>
          ) : null}
        </div>
      </div>

      <div className="lead-list" data-testid="lead-list">
        {leads.map((lead) => {
          const isSelected = selectedLeadId === lead.id;
          const isChecked = selectedLeadIds?.includes(lead.id) ?? false;
          const qualState = getEffectiveQualificationState(lead);

          return (
            <button
              className={`lead-card ${isSelected ? "selected" : ""}`}
              key={lead.id}
              onClick={() => onSelect(lead.id)}
              type="button"
              data-testid={`lead-card-${lead.id}`}
            >
              <div className="lead-card-top">
                <div style={{ flex: 1, minWidth: 0 }}>
                  {onToggleLeadSelection ? (
                    <label
                      className="lead-checkbox"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <input
                        checked={isChecked}
                        onChange={() => onToggleLeadSelection(lead.id)}
                        type="checkbox"
                        data-testid={`lead-checkbox-${lead.id}`}
                      />
                      <span>Select for export</span>
                    </label>
                  ) : null}
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, marginBottom: 4 }}>
                    {lead.companyName}
                  </h3>
                  <p style={{ fontSize: "0.8125rem", color: "var(--brand-primary)", display: "flex", alignItems: "center", gap: 4 }}>
                    {lead.companyDomain}
                    <ExternalLink size={12} />
                  </p>
                </div>
                <span className={`priority-badge priority-${lead.score.priority}`}>
                  {lead.score.priority}
                </span>
              </div>

              <p className="lead-summary">
                {lead.summary || "No website summary captured."}
              </p>

              <div className="meta-row" style={{ marginTop: 14 }}>
                <span className={`status-pill mode-${lead.captureMode}`} style={{ padding: "2px 8px", fontSize: "0.7rem" }}>
                  {lead.captureMode === "live" ? "Live" : "Mock"}
                </span>
                <span className="status-pill" style={{ background: "var(--bg-muted)", color: "var(--text-secondary)", padding: "2px 8px", fontSize: "0.7rem" }}>
                  {lead.inspectionStatus}
                </span>
                <span
                  className={`qual-badge ${
                    qualState === "qualified"
                      ? "qual-qualified"
                      : qualState === "review"
                        ? "qual-review"
                        : "qual-unqualified"
                  }`}
                >
                  {qualState === "qualified"
                    ? "Qualified"
                    : qualState === "review"
                      ? "Review"
                      : "Not Qualified"}
                </span>
                <span className={`confidence-pill confidence-${lead.score.confidence}`}>
                  {lead.score.confidence}
                </span>
              </div>

              <div className="score-row">
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <strong style={{ color: "var(--text-primary)" }}>{lead.score.fitScore}</strong> Fit
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <strong style={{ color: "var(--text-primary)" }}>{lead.score.contactabilityScore}</strong> Contact
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <strong style={{ color: "var(--text-primary)" }}>{lead.score.qualityScore}</strong> Quality
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--brand-primary)" }}>
                  <Users size={14} />
                  <strong>{lead.contacts.length}</strong> contacts
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
