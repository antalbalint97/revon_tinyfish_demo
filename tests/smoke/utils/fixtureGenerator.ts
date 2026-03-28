import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { smokeFixtureMap } from "../fixtures/sourceFixtures";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const generatedDir = path.resolve(__dirname, "../fixtures/generated");

export async function generateSmokeFixtures(): Promise<string[]> {
  await mkdir(generatedDir, { recursive: true });

  const written: string[] = [];
  for (const [filename, payload] of Object.entries(smokeFixtureMap)) {
    const target = path.join(generatedDir, filename);
    await writeFile(target, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    written.push(target);
  }

  return written;
}
