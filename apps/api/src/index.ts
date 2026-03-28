import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import revonRouter from "./routes/revon.js";
import runsRouter from "./routes/runs.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

console.log("TINYFISH_API_KEY loaded:", Boolean(process.env.TINYFISH_API_KEY));
console.log("TINYFISH_FORCE_MOCK:", process.env.TINYFISH_FORCE_MOCK);

const app = express();
const port = Number.parseInt(process.env.PORT ?? "8787", 10);
const configuredOrigins = (process.env.WEB_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors(
    configuredOrigins.length > 0
      ? {
          origin: configuredOrigins,
        }
      : undefined,
  ),
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    service: "revon-tinyfish-demo-api",
    now: new Date().toISOString(),
  });
});

app.use("/api/runs", runsRouter);
app.use("/api/revon", revonRouter);

app.listen(port, () => {
  console.log(`revon-tinyfish-demo api listening on http://localhost:${port}`);
});