import { useEffect, useState } from "react";
import type { PersistedSessionSummary } from "@revon-tinyfish/contracts";
import { SavedSessionList } from "../components/SavedSessionList";
import { listSavedSessions } from "../lib/api";
import { navigateToConsoleRuns, navigateToConsoleSessions } from "../lib/routes";

interface TinyFishDemoPageProps {
  onOpenSavedSession: (sessionId: string) => void;
}

export function TinyFishDemoPage({ onOpenSavedSession }: TinyFishDemoPageProps) {
  const [savedSessions, setSavedSessions] = useState<PersistedSessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSessions() {
      setIsLoading(true);
      try {
        const sessions = await listSavedSessions();
        if (!cancelled) {
          setSavedSessions(sessions);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load workflow history.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadSessions();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="page-shell">
      <section className="hero landing-hero">
        <div>
          <p className="eyebrow">Revon × TinyFish</p>
          <h1>Autonomous outbound prospect sourcing powered by TinyFish web agents</h1>
          <p className="hero-copy landing-copy">
            Replace manual SDR research with an agent workflow that navigates live websites,
            evaluates company fit, extracts contact signals, and delivers CRM-ready shortlists.
          </p>
          <div className="button-row landing-actions">
            <button className="primary-button" onClick={navigateToConsoleRuns} type="button">
              Launch sourcing workflow
            </button>
            <button className="secondary-button" onClick={navigateToConsoleSessions} type="button">
              View workflow history
            </button>
          </div>
        </div>

        <section className="panel landing-panel">
          <div className="panel-header compact">
            <p className="eyebrow">What the workflow does</p>
            <h2>Automated prospect sourcing</h2>
          </div>
          <ul className="stack-list compact-list">
            <li>Navigates live company directories and public websites autonomously</li>
            <li>Evaluates each prospect against your ICP criteria and scores fit</li>
            <li>Extracts contact signals, decision-maker roles, and qualification evidence</li>
            <li>Delivers a ranked, CRM-ready shortlist with one-click Revon sync</li>
          </ul>
        </section>
      </section>

      <div className="persona-strip">
        <span className="persona-strip-label">Built for</span>
        <div className="persona-chips">
          {(["SDR teams", "RevOps teams", "Lead generation agencies", "Founders doing outbound"] as const).map((p) => (
            <span className="persona-chip" key={p}>{p}</span>
          ))}
        </div>
      </div>

      <section className="why-matters">
        <article>
          <h4>The SDR research bottleneck</h4>
          <p>
            Building a targeted prospect list means browsing directories, inspecting company
            websites, assessing ICP fit, finding contacts, and copying everything into a
            spreadsheet — then the CRM. It takes hours per campaign. The output is inconsistent.
          </p>
        </article>
        <article>
          <h4>Why a database cannot solve this</h4>
          <p>
            Static data providers go stale within weeks. ICP signals — team size signals,
            service fit, hiring intent, decision-maker presence — live on real websites
            that require live browsing to read. This workflow cannot be replaced by a
            database query or a simple RAG application.
          </p>
        </article>
        <article>
          <h4>The business case</h4>
          <p>
            Faster list building, consistent ICP scoring, and a reviewable evidence trail for
            every prospect. Qualified shortlists go directly into Revon for sequencing —
            no manual CRM handoff. SDR hours shift from research to conversations.
          </p>
        </article>
      </section>

      <section className="tf-rationale">
        <div className="tf-rationale-header">
          <p className="eyebrow">Why TinyFish</p>
          <h3>This workflow depends on real browser automation</h3>
          <p className="tf-rationale-sub">LLMs can qualify and reason. They cannot navigate. TinyFish bridges that gap.</p>
        </div>
        <div className="tf-rationale-grid">
          <div className="tf-rationale-card">
            <strong>Live websites, not cached snapshots</strong>
            <p>Company fit signals update continuously. Hiring pages, service descriptions, and team bios change weekly. Only a live browser sees current state.</p>
          </div>
          <div className="tf-rationale-card">
            <strong>Dynamic page interaction required</strong>
            <p>Reaching the right content requires scrolling, clicking through navigation, and waiting for page loads — interactions a static API call cannot perform.</p>
          </div>
          <div className="tf-rationale-card">
            <strong>Stateful multi-step browsing</strong>
            <p>Directory discovery, site inspection, and contact extraction span multiple coordinated agent runs with shared state — not a single HTTP request.</p>
          </div>
          <div className="tf-rationale-card">
            <strong>Practical inside business software</strong>
            <p>TinyFish makes autonomous web work reliable and observable. Every agent run is tracked, timed, and surfaced in the operator console with a full evidence trail.</p>
          </div>
        </div>
      </section>

      <section className="top-grid landing-grid">
        <SavedSessionList
          error={error}
          isLoading={isLoading}
          onOpenSession={onOpenSavedSession}
          sessions={savedSessions}
        />
        <section className="panel">
          <div className="panel-header compact">
            <p className="eyebrow">Manual workflow replaced</p>
            <h2>What this automates</h2>
          </div>
          <div className="workflow-compare">
            <div className="workflow-col-before">
              <span className="workflow-col-label">Before</span>
              <ul>
                <li>Browse company directories by hand</li>
                <li>Open each website and check fit manually</li>
                <li>Search LinkedIn for contact clues</li>
                <li>Assess ICP signals page by page</li>
                <li>Build a shortlist in a spreadsheet</li>
                <li>Copy contacts into the CRM</li>
              </ul>
            </div>
            <div className="workflow-arrow">→</div>
            <div className="workflow-col-after">
              <span className="workflow-col-label">After</span>
              <ul>
                <li>Define ICP once, launch sourcing workflow</li>
                <li>Agent navigates live websites autonomously</li>
                <li>Prospects ranked by fit, reachability, and contact quality</li>
                <li>Review qualified shortlist in seconds</li>
                <li>Sync to Revon for outbound sequencing</li>
              </ul>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
