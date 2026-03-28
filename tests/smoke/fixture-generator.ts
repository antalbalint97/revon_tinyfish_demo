import { generateSmokeFixtures } from "./utils/fixtureGenerator";

const written = await generateSmokeFixtures();
console.log(`[smoke-fixtures] wrote ${written.length} fixture file(s)`);
