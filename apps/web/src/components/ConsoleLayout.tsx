import type { ReactNode } from "react";
import { navigateToConsoleRuns, navigateToConsoleSessions } from "../lib/routes";

interface ConsoleLayoutProps {
  title: string;
  subtitle?: string;
  activeNav: "runs" | "sessions";
  children: ReactNode;
  sectionLinks?: Array<{
    id: string;
    label: string;
  }>;
}

export function ConsoleLayout({
  title,
  subtitle,
  activeNav,
  children,
  sectionLinks = [],
}: ConsoleLayoutProps) {
  function scrollToSection(id: string) {
    const target = document.getElementById(id);
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="console-shell">
      <aside className="console-sidebar">
        <div className="console-brand">
          <p className="eyebrow">Revon outbound</p>
          <h1>Prospect sourcing</h1>
          <p className="muted">
            Autonomous web-agent workflow for prospect discovery, review, export, and CRM sync.
          </p>
        </div>

        <nav className="console-nav">
          <button
            className={`console-nav-item ${activeNav === "runs" ? "active" : ""}`}
            onClick={navigateToConsoleRuns}
            type="button"
          >
            Workflows
          </button>
          <button
            className={`console-nav-item ${activeNav === "sessions" ? "active" : ""}`}
            onClick={navigateToConsoleSessions}
            type="button"
          >
            History
          </button>
          {sectionLinks.map((item) => (
            <button
              className="console-nav-item subtle"
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="console-main">
        <header className="console-header">
          <div>
            <p className="eyebrow">Outbound operator console</p>
            <h2>{title}</h2>
          </div>
          {subtitle ? <p className="console-subtitle">{subtitle}</p> : null}
        </header>

        <div className="console-content">{children}</div>
      </section>
    </main>
  );
}
