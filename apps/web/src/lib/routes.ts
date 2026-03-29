export type AppRoute =
  | { name: "landing" }
  | { name: "console-runs" }
  | { name: "console-sessions" }
  | { name: "console-session"; sessionId: string };

export function parseRouteFromHash(hash: string): AppRoute {
  const normalized = hash.replace(/^#/, "").replace(/\/+$/, "");
  if (!normalized || normalized === "/") {
    return { name: "landing" };
  }

  if (normalized === "/app" || normalized === "/console" || normalized === "/console/runs") {
    return { name: "console-runs" };
  }

  if (normalized === "/console/sessions") {
    return { name: "console-sessions" };
  }

  const savedSessionMatch = normalized.match(/^\/(?:console\/session|sessions)\/([^/]+)$/);
  if (savedSessionMatch?.[1]) {
    return {
      name: "console-session",
      sessionId: decodeURIComponent(savedSessionMatch[1]),
    };
  }

  return { name: "landing" };
}

export function navigateToLauncher(): void {
  window.location.hash = "/";
}

export function navigateToConsoleRuns(): void {
  window.location.hash = "/console/runs";
}

export function navigateToConsoleSessions(): void {
  window.location.hash = "/console/sessions";
}

export function navigateToSavedSession(sessionId: string): void {
  window.location.hash = `/console/session/${encodeURIComponent(sessionId)}`;
}
