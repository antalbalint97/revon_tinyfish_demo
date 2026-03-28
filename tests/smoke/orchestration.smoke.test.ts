import { beforeEach, describe, expect, it, vi } from "vitest";
import { demoRunSchema } from "@revon-tinyfish/contracts";
import { DEMO_PRESETS } from "../../apps/web/src/demoPresets";
import { createEmptyWebsiteInspection } from "../../apps/api/src/domain/leads/schemas";
import { createMockDirectoryDiscovery, createMockWebsiteInspection } from "../../apps/api/src/mocks/sampleLeads";
import { startDiscoveryRun, type DiscoveryDependencies } from "../../apps/api/src/orchestrators/discoveryRun";
import { applyEnv, resetSmokeRunStore, waitForRunCompletion } from "./utils/orchestrationHarness";

const input = DEMO_PRESETS[0]?.input ?? {
  targetMarket: "Digital marketing",
  location: "London",
  companySize: "11-50",
  keywords: "B2B, SaaS, growth",
  decisionMakerRole: "Founder",
  maxResults: 5,
};

describe("orchestration lifecycle smoke", () => {
  beforeEach(() => {
    resetSmokeRunStore();
  });

  it("completes the lifecycle in explicit mock mode when no TinyFish key exists", async () => {
    const restoreEnv = applyEnv({
      TINYFISH_API_KEY: undefined,
      TINYFISH_FORCE_MOCK: "false",
      TINYFISH_ENABLE_MOCK_FALLBACK: "true",
    });

    try {
      const run = startDiscoveryRun(input);
      const completed = await waitForRunCompletion(run.id);

      expect(() => demoRunSchema.parse(completed)).not.toThrow();
      expect(completed.mode).toBe("mock");
      expect(completed.status).toBe("completed");
      expect(completed.quality).toBe("healthy");
      expect(completed.steps.every((step) => step.status === "completed")).toBe(true);
      expect(completed.leads.length).toBeGreaterThan(0);
    } finally {
      restoreEnv();
    }
  });

  it("marks live runs as partial and degraded when one website inspection fails", async () => {
    const restoreEnv = applyEnv({
      TINYFISH_API_KEY: "demo-key",
      TINYFISH_FORCE_MOCK: "false",
      TINYFISH_ENABLE_MOCK_FALLBACK: "false",
    });

    try {
      const discovery = createMockDirectoryDiscovery({ ...input, maxResults: 2 });
      const dependencies: DiscoveryDependencies = {
        discoverCompanies: vi.fn().mockResolvedValue(discovery),
        inspectWebsite: vi
          .fn()
          .mockResolvedValueOnce(createMockWebsiteInspection(discovery.candidates[0]!, input, 0))
          .mockResolvedValueOnce(
            createEmptyWebsiteInspection(discovery.candidates[1]!.websiteUrl, {
              inspectionStatus: "failed",
              qualityNotes: ["Simulated website timeout."],
              missingFields: ["summary", "emails", "team", "signals"],
            }),
          ),
        createMockDirectoryDiscovery,
        createMockWebsiteInspection,
      };

      const run = startDiscoveryRun({ ...input, maxResults: 2 }, dependencies);
      const completed = await waitForRunCompletion(run.id);

      expect(completed.mode).toBe("live");
      expect(completed.status).toBe("partial");
      expect(completed.quality).toBe("degraded");
      expect(completed.summary.websiteFailures).toBe(1);
      expect(completed.summary.partialLeadCount).toBeGreaterThanOrEqual(1);
      expect(completed.steps.find((step) => step.key === "visiting_websites")?.status).toBe("partial");
    } finally {
      restoreEnv();
    }
  });

  it("degrades into explicit mock fallback when live discovery throws", async () => {
    const restoreEnv = applyEnv({
      TINYFISH_API_KEY: "demo-key",
      TINYFISH_FORCE_MOCK: "false",
      TINYFISH_ENABLE_MOCK_FALLBACK: "true",
    });

    try {
      const dependencies: DiscoveryDependencies = {
        discoverCompanies: vi.fn().mockRejectedValue(new Error("Simulated TinyFish outage")),
        inspectWebsite: vi.fn(),
        createMockDirectoryDiscovery,
        createMockWebsiteInspection,
      };

      const run = startDiscoveryRun(input, dependencies);
      const completed = await waitForRunCompletion(run.id);

      expect(completed.mode).toBe("mock");
      expect(completed.status).toBe("partial");
      expect(completed.quality).toBe("degraded");
      expect(completed.notes.join(" ")).toMatch(/mock fallback/i);
    } finally {
      restoreEnv();
    }
  });
});
