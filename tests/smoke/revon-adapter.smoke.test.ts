import { afterEach, describe, expect, it, vi } from "vitest";
import { DEMO_PRESETS } from "../../apps/web/src/demoPresets";
import { createMockDirectoryDiscovery, createMockWebsiteInspection } from "../../apps/api/src/mocks/sampleLeads";
import { mapCandidateToLead } from "../../apps/api/src/domain/leads/mappers";
import { rankLeads } from "../../apps/api/src/domain/leads/ranking";
import { pushQualifiedLeadsToRevon } from "../../apps/api/src/integrations/revon/client";
import { applyEnv } from "./utils/orchestrationHarness";

const input = DEMO_PRESETS[0]?.input ?? {
  targetMarket: "Digital marketing",
  location: "London",
  companySize: "11-50",
  keywords: "B2B, SaaS, growth",
  decisionMakerRole: "Founder",
  maxResults: 1,
};

function buildLead() {
  const candidate = createMockDirectoryDiscovery({ ...input, maxResults: 1 }).candidates[0]!;
  const inspection = createMockWebsiteInspection(candidate, input, 0);
  return rankLeads(input, [mapCandidateToLead(candidate, inspection, { captureMode: "mock" })])[0]!;
}

describe("revon adapter smoke", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stays in explicit dry-run mode when no Revon endpoint is configured", async () => {
    const restoreEnv = applyEnv({
      REVON_IMPORT_URL: undefined,
      REVON_DRY_RUN: "true",
      REVON_API_TOKEN: undefined,
    });

    try {
      const result = await pushQualifiedLeadsToRevon("run-dry", [buildLead()]);
      expect(result.mode).toBe("dry-run");
      expect(result.dryRun).toBe(true);
      expect(result.pushedCompanyCount).toBe(1);
    } finally {
      restoreEnv();
    }
  });

  it("posts live payloads when Revon live mode is configured", async () => {
    const restoreEnv = applyEnv({
      REVON_IMPORT_URL: "https://revon.example/import",
      REVON_DRY_RUN: "false",
      REVON_API_TOKEN: "secret",
      REVON_IMPORT_MODE: "webhook",
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Import accepted" }),
      headers: new Headers({ "x-request-id": "req-123" }),
      status: 200,
      statusText: "OK",
    });
    vi.stubGlobal("fetch", fetchMock);

    try {
      const result = await pushQualifiedLeadsToRevon("run-live", [buildLead()]);
      expect(result.mode).toBe("live");
      expect(result.dryRun).toBe(false);
      expect(result.requestId).toBe("req-123");
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(String(fetchMock.mock.calls[0]?.[0])).toBe("https://revon.example/import");
    } finally {
      restoreEnv();
      vi.unstubAllGlobals();
    }
  });
});
