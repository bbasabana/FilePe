/** Client WebSocket vers l’agent local Live20R (ws://127.0.0.1:8765) */

export const FINGERPRINT_AGENT_URL =
  process.env.NEXT_PUBLIC_FINGERPRINT_AGENT_URL ?? "ws://127.0.0.1:8765";

export type AgentStatus = {
  connected: boolean;
  device: string | null;
  mode: "hardware" | "mock" | null;
  version?: string;
};

export type CaptureResult = {
  imageBase64: string;
  templateBase64: string;
};

type Pending = {
  resolve: (v: unknown) => void;
  reject: (e: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export class FingerprintAgentClient {
  private ws: WebSocket | null = null;
  private pending = new Map<string, Pending>();
  private statusListeners = new Set<(s: AgentStatus | null) => void>();
  private openListeners = new Set<(open: boolean) => void>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private closed = false;

  constructor(private url: string = FINGERPRINT_AGENT_URL) {}

  onStatus(cb: (s: AgentStatus | null) => void) {
    this.statusListeners.add(cb);
    return () => this.statusListeners.delete(cb);
  }

  onOpenChange(cb: (open: boolean) => void) {
    this.openListeners.add(cb);
    return () => this.openListeners.delete(cb);
  }

  connect() {
    this.closed = false;
    this.openSocket();
  }

  disconnect() {
    this.closed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
    for (const [, p] of this.pending) {
      clearTimeout(p.timer);
      p.reject(new Error("Agent déconnecté"));
    }
    this.pending.clear();
    this.emitOpen(false);
  }

  async getStatus(): Promise<AgentStatus> {
    const res = (await this.request({ type: "status" })) as AgentStatus & { type?: string };
    return {
      connected: Boolean(res.connected),
      device: res.device ?? null,
      mode: res.mode ?? null,
      version: res.version,
    };
  }

  async capture(timeoutMs = 20000): Promise<CaptureResult> {
    const res = (await this.request({ type: "capture" }, timeoutMs)) as CaptureResult & {
      type?: string;
      error?: string;
    };
    if (!res.imageBase64 || !res.templateBase64) {
      throw new Error(res.error || "Capture invalide");
    }
    return { imageBase64: res.imageBase64, templateBase64: res.templateBase64 };
  }

  async merge(templates: string[], timeoutMs = 15000): Promise<string> {
    const res = (await this.request({ type: "merge", templates }, timeoutMs)) as {
      templateBase64?: string;
      error?: string;
    };
    if (!res.templateBase64) throw new Error(res.error || "Fusion impossible");
    return res.templateBase64;
  }

  private openSocket() {
    if (this.closed || typeof window === "undefined") return;
    try {
      const ws = new WebSocket(this.url);
      this.ws = ws;
      ws.onopen = () => {
        this.emitOpen(true);
        this.getStatus()
          .then((s) => this.emitStatus(s))
          .catch(() => this.emitStatus(null));
      };
      ws.onclose = () => {
        this.emitOpen(false);
        this.emitStatus(null);
        this.scheduleReconnect();
      };
      ws.onerror = () => {
        // onclose suivra
      };
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(String(ev.data)) as Record<string, unknown>;
          const requestId = typeof msg.requestId === "string" ? msg.requestId : null;
          if (requestId && this.pending.has(requestId)) {
            const p = this.pending.get(requestId)!;
            this.pending.delete(requestId);
            clearTimeout(p.timer);
            if (String(msg.type).endsWith("_error") || msg.error) {
              p.reject(new Error(String(msg.error || "Erreur agent")));
            } else {
              p.resolve(msg);
            }
            return;
          }
          if (msg.type === "status") {
            this.emitStatus({
              connected: Boolean(msg.connected),
              device: (msg.device as string) ?? null,
              mode: (msg.mode as AgentStatus["mode"]) ?? null,
              version: msg.version as string | undefined,
            });
          }
        } catch {
          /* ignore */
        }
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.closed) return;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => this.openSocket(), 2500);
  }

  private request(payload: Record<string, unknown>, timeoutMs = 10000): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error("Lecteur non connecté. Lancez l’agent local FilePe Fingerprint."));
        return;
      }
      const requestId = uid();
      const timer = setTimeout(() => {
        this.pending.delete(requestId);
        reject(new Error("Délai dépassé — reposez le doigt sur le lecteur."));
      }, timeoutMs);
      this.pending.set(requestId, { resolve, reject, timer });
      this.ws.send(JSON.stringify({ ...payload, requestId }));
    });
  }

  private emitStatus(s: AgentStatus | null) {
    this.statusListeners.forEach((cb) => cb(s));
  }

  private emitOpen(open: boolean) {
    this.openListeners.forEach((cb) => cb(open));
  }
}
