interface ExportPanelProps {
  selectedCount: number;
  isExportingJson: boolean;
  isExportingCsv: boolean;
  onDownloadJson: () => Promise<void>;
  onDownloadCsv: () => void;
  includeTelemetry?: boolean;
  onToggleIncludeTelemetry?: ((nextValue: boolean) => void) | undefined;
  exportSuccess?: string | null;
}

export function ExportPanel({
  selectedCount,
  isExportingJson,
  isExportingCsv,
  onDownloadJson,
  onDownloadCsv,
  includeTelemetry = true,
  onToggleIncludeTelemetry,
  exportSuccess,
}: ExportPanelProps) {
  return (
    <section className="panel">
      <div className="panel-header compact">
        <p className="eyebrow">Campaign handoff</p>
        <h2>Prepare outreach list</h2>
      </div>

      <p className="muted">
        Export the selected prospects as a CRM-ready JSON payload or a flat CSV for campaign handoff and sequencer import.
      </p>

      {onToggleIncludeTelemetry ? (
        <label className="toggle-row">
          <input
            checked={includeTelemetry}
            onChange={(event) => onToggleIncludeTelemetry(event.target.checked)}
            type="checkbox"
          />
          <span>Include execution metadata in JSON</span>
        </label>
      ) : null}

      <div className="button-row">
        <button
          className="secondary-button"
          disabled={selectedCount === 0 || isExportingJson}
          onClick={() => void onDownloadJson()}
          type="button"
        >
          {isExportingJson ? "Preparing export..." : `Export JSON (${selectedCount} prospect${selectedCount !== 1 ? "s" : ""})`}
        </button>
        <button
          className="secondary-button"
          disabled={selectedCount === 0 || isExportingCsv}
          onClick={onDownloadCsv}
          type="button"
        >
          {isExportingCsv ? "Preparing export..." : `Export CSV (${selectedCount} prospect${selectedCount !== 1 ? "s" : ""})`}
        </button>
      </div>

      {exportSuccess ? <p className="export-success">✓ {exportSuccess}</p> : null}
    </section>
  );
}
