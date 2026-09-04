/**
 * Agent local FilePe ↔ ZKTeco Live20R
 *
 * Protocole WebSocket JSON sur ws://127.0.0.1:8765
 * Modes :
 *   FILEPE_FP_MODE=mock      → simulation (défaut hors Windows / sans SDK)
 *   FILEPE_FP_MODE=hardware  → appelle fingerprint-agent/hardware.py (pyzkfp)
 *
 * Messages client → agent :
 *   { type: "status"|"capture"|"merge"|"ping", requestId, templates? }
 * Réponses :
 *   { type: "status"|"capture_ok"|"merge_ok"|"pong"|..._error, requestId?, ... }
 */

import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { WebSocketServer } from "ws";
import { createHash, randomBytes } from "node:crypto";

const PORT = Number(process.env.FILEPE_FP_PORT || 8765);
const HOST = process.env.FILEPE_FP_HOST || "127.0.0.1";
const MODE = (process.env.FILEPE_FP_MODE || "mock").toLowerCase();
const __dirname = dirname(fileURLToPath(import.meta.url));

function send(ws, payload) {
  if (ws.readyState === 1) ws.send(JSON.stringify(payload));
}

/** Image PNG factice (empreinte simulée) */
function mockImageBase64() {
  return (
    "data:image/png;base64," +
    "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAAAAACPAi4CAAABFElEQVR4nMXLQSsDYACA4XczRiOtyEqSWpKilHCQlANSDhyUxAElB5Jy4CCJw5JSU0pREmqSSFoyxuz7W37Ee9hzf1jJ5IqhcH+0OJiKkUhPbJ6/lsr5q92ZnmQkmuyd3bvOh9JLdmM8naA6NbR0/PAVvnOZ5eHWGuo6xtaR/wz5n5H/F/kD8n8g/w3y7yP/HPL3IX8T8keRP2J/I/J3I/808u8g/yXyvyN/Gfn/kP8N+S+Qfxv5p5C/C/kbsB/5q5C/Gfn7kX8e+Q+Q/xb5P5E/IP8P8j8h/ynyryH/KPK3I38tlf5x5G9D/hHkX0X+E+R/RP4i8gfkLyD/HfIfIv8C8g8gfwvyx6j0r0f+TuSfRP6tfwl/OUahCQCQAAAAAElFTkSuQmCC"
  );
}

function mockTemplate() {
  return randomBytes(256).toString("base64");
}

function mockMerge(templates) {
  const h = createHash("sha256");
  for (const t of templates) h.update(String(t));
  return h.digest("base64");
}

function runPython(args, input) {
  return new Promise((resolve, reject) => {
    const script = join(__dirname, "hardware.py");
    const child = spawn("python", [script, ...args], {
      stdio: ["pipe", "pipe", "pipe"],
      env: process.env,
    });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(err.trim() || `hardware.py exit ${code}`));
        return;
      }
      try {
        resolve(JSON.parse(out.trim()));
      } catch {
        reject(new Error("Réponse hardware invalide"));
      }
    });
    if (input) child.stdin.write(input);
    child.stdin.end();
  });
}

async function handleStatus() {
  if (MODE === "hardware") {
    try {
      const res = await runPython(["status"]);
      return {
        type: "status",
        connected: Boolean(res.connected),
        device: res.device || "Live20R",
        mode: "hardware",
        version: "1.0.0",
      };
    } catch (e) {
      return {
        type: "status",
        connected: false,
        device: null,
        mode: "hardware",
        version: "1.0.0",
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }
  return {
    type: "status",
    connected: true,
    device: "Live20R (mock)",
    mode: "mock",
    version: "1.0.0",
  };
}

async function handleCapture() {
  if (MODE === "hardware") {
    const res = await runPython(["capture"]);
    if (!res.ok) throw new Error(res.error || "Capture échouée");
    return {
      type: "capture_ok",
      imageBase64: res.imageBase64,
      templateBase64: res.templateBase64,
    };
  }
  // Simule le délai de pose du doigt
  await new Promise((r) => setTimeout(r, 600));
  return {
    type: "capture_ok",
    imageBase64: mockImageBase64(),
    templateBase64: mockTemplate(),
  };
}

async function handleMerge(templates) {
  if (!Array.isArray(templates) || templates.length < 1) {
    throw new Error("Au moins un template requis");
  }
  if (MODE === "hardware") {
    const res = await runPython(["merge"], JSON.stringify({ templates }));
    if (!res.ok) throw new Error(res.error || "Fusion échouée");
    return { type: "merge_ok", templateBase64: res.templateBase64 };
  }
  return { type: "merge_ok", templateBase64: mockMerge(templates) };
}

const httpServer = createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ service: "filepe-fingerprint-agent", port: PORT, mode: MODE }));
});

const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (ws) => {
  console.log("[agent] client connecté");
  handleStatus().then((s) => send(ws, s));

  ws.on("message", async (raw) => {
    let msg;
    try {
      msg = JSON.parse(String(raw));
    } catch {
      send(ws, { type: "error", error: "JSON invalide" });
      return;
    }
    const requestId = msg.requestId;
    try {
      if (msg.type === "ping") {
        send(ws, { type: "pong", requestId, version: "1.0.0" });
        return;
      }
      if (msg.type === "status") {
        send(ws, { ...(await handleStatus()), requestId });
        return;
      }
      if (msg.type === "capture") {
        send(ws, { ...(await handleCapture()), requestId });
        return;
      }
      if (msg.type === "merge") {
        send(ws, { ...(await handleMerge(msg.templates)), requestId });
        return;
      }
      send(ws, { type: "error", requestId, error: `Type inconnu: ${msg.type}` });
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      const failType =
        msg.type === "capture" ? "capture_error" : msg.type === "merge" ? "merge_error" : "error";
      send(ws, { type: failType, requestId, error });
    }
  });

  ws.on("close", () => console.log("[agent] client déconnecté"));
});

httpServer.listen(PORT, HOST, () => {
  console.log(`FilePe Fingerprint Agent — ws://${HOST}:${PORT}  mode=${MODE}`);
  console.log("Branchez le Live20R puis ouvrez FilePe dans Chrome/Edge.");
});
