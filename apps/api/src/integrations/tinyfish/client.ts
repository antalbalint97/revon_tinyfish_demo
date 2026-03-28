const DEFAULT_TINYFISH_URL = "https://agent.tinyfish.ai/v1/automation/run-sse";
const DEFAULT_TINYFISH_TIMEOUT_MS = 180_000;

interface TinyFishStreamEvent {
  type: string;
  run_id?: string;
  streaming_url?: string;
  purpose?: string;
  status?: string;
  result?: unknown;
  resultJson?: unknown;
  error?: string | null;
}

export interface RunTinyFishAutomationInput {
  apiKey: string;
  url: string;
  goal: string;
  timeoutMs?: number;
}

function extractEventPayload(eventBlock: string): string | null {
  const dataLines = eventBlock
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart());

  if (dataLines.length === 0) {
    return null;
  }

  return dataLines.join("\n").trim();
}

function summarizeTinyFishError(event: TinyFishStreamEvent): string {
  if (typeof event.error === "string" && event.error.trim()) {
    return event.error.trim();
  }

  return `TinyFish failed with status ${event.status ?? event.type ?? "UNKNOWN"}.`;
}

async function readTinyFishStream(response: Response, timeoutMs: number): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = response.body?.getReader();
    if (!reader) {
      reject(new Error("TinyFish response body is not readable."));
      return;
    }

    let settled = false;
    let buffer = "";
    let runId: string | undefined;
    let streamingUrl: string | undefined;
    let hasLoggedFirstEvent = false;
    let lastProgressPurpose: string | undefined;

    const decoder = new TextDecoder();

    const settle = (callback: () => void): void => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timer);
      void reader.cancel().catch(() => undefined);
      callback();
    };

    const fail = (message: string): void => {
      console.warn(
        `[tinyfish-demo] TinyFish stream failed${runId ? ` run_id=${runId}` : ""} :: ${message}`,
      );
      settle(() => reject(new Error(message)));
    };

    const timer = setTimeout(() => {
      fail(`TinyFish timed out after ${timeoutMs}ms.`);
    }, timeoutMs);

    const handleEvent = (event: TinyFishStreamEvent): void => {
      if (!hasLoggedFirstEvent) {
        hasLoggedFirstEvent = true;
        console.log(`[tinyfish-demo] TinyFish first event <- ${event.type}`);
      }

      if (event.run_id && event.run_id !== runId) {
        runId = event.run_id;
        console.log(`[tinyfish-demo] TinyFish run_id=${runId}`);
      }

      if (event.streaming_url && event.streaming_url !== streamingUrl) {
        streamingUrl = event.streaming_url;
        console.log(`[tinyfish-demo] TinyFish streaming_url=${streamingUrl}`);
      }

      if (event.type === "PROGRESS" && event.purpose && event.purpose !== lastProgressPurpose) {
        lastProgressPurpose = event.purpose;
        console.log(`[tinyfish-demo] TinyFish progress -> ${event.purpose}`);
      }

      if (event.type === "COMPLETE") {
        console.log(
          `[tinyfish-demo] TinyFish complete <- status=${event.status ?? "UNKNOWN"}${runId ? ` run_id=${runId}` : ""}`,
        );

        if (event.status !== "COMPLETED") {
          fail(summarizeTinyFishError(event));
          return;
        }

        const finalResult = event.result ?? event.resultJson;
        if (typeof finalResult === "undefined") {
          fail("TinyFish COMPLETE event did not include a result payload.");
          return;
        }

        settle(() => resolve(finalResult));
        return;
      }

      if (event.type === "ERROR" || event.type === "FAILED" || event.status === "FAILED") {
        fail(summarizeTinyFishError(event));
      }
    };

    const processEventBlock = (eventBlock: string): void => {
      if (settled) {
        return;
      }

      const rawPayload = extractEventPayload(eventBlock);
      if (!rawPayload || rawPayload === "[DONE]") {
        return;
      }

      try {
        handleEvent(JSON.parse(rawPayload) as TinyFishStreamEvent);
      } catch {
        // Ignore incomplete or non-JSON fragments until a complete event arrives.
      }
    };

    const pump = async (): Promise<void> => {
      try {
        while (!settled) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const eventBlocks = buffer.split(/\r?\n\r?\n/);
          buffer = eventBlocks.pop() ?? "";

          for (const eventBlock of eventBlocks) {
            processEventBlock(eventBlock);
            if (settled) {
              return;
            }
          }
        }

        if (!settled && buffer.trim()) {
          processEventBlock(buffer);
        }

        if (!settled) {
          fail("TinyFish stream ended before a usable COMPLETE event was received.");
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "TinyFish stream failed unexpectedly.";
        fail(message);
      }
    };

    void pump();
  });
}

export async function runTinyFishAutomation({
  apiKey,
  url,
  goal,
  timeoutMs = DEFAULT_TINYFISH_TIMEOUT_MS,
}: RunTinyFishAutomationInput): Promise<unknown> {
  const endpoint = process.env.TINYFISH_BASE_URL?.trim() || DEFAULT_TINYFISH_URL;
  console.log(
    `[tinyfish-demo] TinyFish request start -> endpoint=${endpoint} target=${url} timeoutMs=${timeoutMs}`,
  );

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({
      url,
      goal,
    }),
  });

  console.log(`[tinyfish-demo] TinyFish response <- ${response.status} ${response.statusText}`);

  if (!response.ok) {
    throw new Error(`TinyFish returned HTTP ${response.status} ${response.statusText}.`);
  }

  return readTinyFishStream(response, timeoutMs);
}
