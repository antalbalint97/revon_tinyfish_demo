import { afterEach, describe, expect, it, vi } from "vitest";
import { runTinyFishAutomation } from "../../apps/api/src/integrations/tinyfish/client";

function createSseResponse(chunks: string[], status = 200, statusText = "OK"): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    status,
    statusText,
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}

describe("tinyfish client smoke", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns the final payload from COMPLETE.result and preserves the documented request body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createSseResponse([
        'data: {"type":"STARTED","run_id":"run-123"}\n\n',
        'data: {"type":"STREAMING_URL","run_id":"run-123","streaming_url":"https://stream.example/run-123"}\n\n',
        'data: {"type":"PROGRESS","run_id":"run-123","purpose":"Inspecting the target page"}\n\n',
        'data: {"type":"COMP',
        'LETE","run_id":"run-123","status":"COMPLETED","result":{"companies":[{"company_name":"Acme Studio","website_url":"acmestudio.example"}]}}\n\n',
      ]),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await runTinyFishAutomation({
      apiKey: "tinyfish-key",
      url: "https://example.com/directory",
      goal: "Extract matching agencies.",
    });

    expect(result).toEqual({
      companies: [{ company_name: "Acme Studio", website_url: "acmestudio.example" }],
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      url: "https://example.com/directory",
      goal: "Extract matching agencies.",
    });
  });

  it("rejects honestly if the stream ends before a usable COMPLETE event arrives", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createSseResponse([
        'data: {"type":"STARTED","run_id":"run-456"}\n\n',
        'data: {"type":"PROGRESS","run_id":"run-456","purpose":"Still browsing"}\n\n',
      ]),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      runTinyFishAutomation({
        apiKey: "tinyfish-key",
        url: "https://example.com/company",
        goal: "Inspect the website.",
      }),
    ).rejects.toThrow(/usable COMPLETE event/i);
  });
});
