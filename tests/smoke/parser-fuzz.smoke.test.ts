import { describe, expect, it } from "vitest";
import {
  parseDirectoryCandidates,
  parseWebsiteInspection,
} from "../../apps/api/src/integrations/tinyfish/parseResults";
import {
  directoryReplayRaw,
  websiteReplayFailedRaw,
  websiteReplayPartialRaw,
} from "./fixtures/sourceFixtures";

describe("json parser fuzz smoke", () => {
  it("repairs fenced directory JSON and normalizes bare domains", () => {
    const result = parseDirectoryCandidates(directoryReplayRaw);

    expect(result.candidates).toHaveLength(2);
    expect(result.candidates[1]?.websiteUrl).toBe("https://harborloop.io/");
    expect(result.warnings.join(" ")).toMatch(/repair/i);
  });

  it("marks partial website inspections when wrapped JSON is incomplete", () => {
    const inspection = parseWebsiteInspection(websiteReplayPartialRaw, "https://harborloop.io");

    expect(inspection.inspectionStatus).toBe("partial");
    expect(inspection.missingFields).toContain("emails");
    expect(inspection.team).toHaveLength(1);
  });

  it("marks failed website inspections when JSON is not recoverable", () => {
    const inspection = parseWebsiteInspection(websiteReplayFailedRaw, "https://failed.example");

    expect(inspection.inspectionStatus).toBe("failed");
    expect(inspection.qualityNotes.join(" ")).toMatch(/no parseable|could not be repaired/i);
  });

  it("warns when invalid directory items are dropped", () => {
    const result = parseDirectoryCandidates([
      {
        company_name: "Valid Co",
        website_url: "validco.com",
      },
      {
        company_name: "Broken Co",
        website_url: null,
      },
    ]);

    expect(result.candidates).toHaveLength(1);
    expect(result.warnings.join(" ")).toMatch(/dropped/i);
  });
});
