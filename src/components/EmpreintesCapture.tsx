"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Fingerprint, Loader2, Usb, CheckCircle2, Circle } from "lucide-react";
import {
  FINGER_IDS,
  FINGER_LABELS,
  SAMPLES_PER_FINGER,
  type EmpreintesData,
  type FingerId,
  type HandId,
  allFingersComplete,
  completedCount,
  emptyEmpreintes,
  parseEmpreintes,
} from "@/lib/empreintes";
import { FingerprintAgentClient, type AgentStatus } from "@/lib/fingerprint-agent";

interface EmpreintesCaptureProps {
  currentJson: string | null;
  onSave: (json: string) => void;
  saving?: boolean;
}

export default function EmpreintesCapture({ currentJson, onSave, saving }: EmpreintesCaptureProps) {
  const saved = useMemo(() => parseEmpreintes(currentJson), [currentJson]);
  const [hand, setHand] = useState<HandId>(saved?.hand ?? "droite");
  const [data, setData] = useState<EmpreintesData>(() => saved ?? emptyEmpreintes("droite"));
  const [activeFinger, setActiveFinger] = useState<FingerId>("pouce");
  const [agentOpen, setAgentOpen] = useState(false);
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPreview, setLastPreview] = useState<string | null>(null);
  const clientRef = useRef<FingerprintAgentClient | null>(null);

  useEffect(() => {
    if (saved) {
      setData(saved);
      setHand(saved.hand);
    }
  }, [saved]);

  useEffect(() => {
    const client = new FingerprintAgentClient();
    clientRef.current = client;
    const offOpen = client.onOpenChange(setAgentOpen);
    const offStatus = client.onStatus(setStatus);
    client.connect();
    return () => {
      offOpen();
      offStatus();
      client.disconnect();
      clientRef.current = null;
    };
  }, []);

  const switchHand = useCallback((h: HandId) => {
    setHand(h);
    setData(emptyEmpreintes(h));
    setActiveFinger("pouce");
    setLastPreview(null);
    setError(null);
  }, []);

  const current = data.fingers.find((f) => f.fingerId === activeFinger)!;
  const sampleCount = current.samples.length;
  const doneAll = allFingersComplete(data);

  async function captureOnce() {
    const client = clientRef.current;
    if (!client) return;
    setError(null);
    setCapturing(true);
    try {
      const result = await client.capture();
      const image = result.imageBase64.startsWith("data:")
        ? result.imageBase64
        : `data:image/png;base64,${result.imageBase64}`;
      setLastPreview(image);

      const prevFinger = data.fingers.find((f) => f.fingerId === activeFinger)!;
      if (prevFinger.samples.length >= SAMPLES_PER_FINGER) return;

      const samples = [
        ...prevFinger.samples,
        {
          imageBase64: image,
          templateBase64: result.templateBase64,
          capturedAt: new Date().toISOString(),
        },
      ];
      const completed = samples.length >= SAMPLES_PER_FINGER;
      let templateMergedBase64 = prevFinger.templateMergedBase64 ?? null;

      if (completed) {
        try {
          templateMergedBase64 = await client.merge(samples.map((s) => s.templateBase64));
        } catch {
          templateMergedBase64 = samples[samples.length - 1]?.templateBase64 ?? null;
        }
      }

      setData((prev) => ({
        ...prev,
        hand,
        fingers: prev.fingers.map((f) =>
          f.fingerId === activeFinger
            ? { ...f, hand, samples, completed, templateMergedBase64 }
            : f
        ),
      }));

      if (completed) {
        const idx = FINGER_IDS.indexOf(activeFinger);
        if (idx < FINGER_IDS.length - 1) setActiveFinger(FINGER_IDS[idx + 1]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de capture");
    } finally {
      setCapturing(false);
    }
  }

  function resetFinger(fingerId: FingerId) {
    setData((prev) => ({
      ...prev,
      fingers: prev.fingers.map((f) =>
        f.fingerId === fingerId
          ? { ...f, samples: [], templateMergedBase64: null, completed: false }
          : f
      ),
    }));
    setActiveFinger(fingerId);
    setLastPreview(null);
  }

  function handleSave() {
    if (!doneAll) {
      setError("Terminez les 5 doigts (3 prises chacun) avant d’enregistrer.");
      return;
    }
    const payload: EmpreintesData = {
      ...data,
      hand,
      device: status?.device ?? data.device ?? "Live20R",
      mode: status?.mode ?? data.mode ?? null,
      enrolledAt: new Date().toISOString(),
      version: 2,
    };
    onSave(JSON.stringify(payload));
  }

  const agentLabel = !agentOpen
    ? "Agent local hors ligne"
    : status?.connected
      ? `Lecteur OK — ${status.device || "Live20R"}${status.mode === "mock" ? " (simulation)" : ""}`
      : "Agent connecté, lecteur USB non détecté";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
      <h3 className="text-[13px] font-semibold text-slate-900 mb-1 flex items-center gap-2">
        <Fingerprint className="h-4 w-4 text-primary" />
        Empreintes digitales
      </h3>
      <p className="text-[11px] text-slate-500 mb-3">
        5 doigts × 3 prises via le lecteur ZKTeco Live20R (prévenu ou détenu).
      </p>

      <div
        className={`mb-4 flex items-start gap-2 rounded-lg border px-3 py-2 text-[11px] ${
          agentOpen && status?.connected
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-amber-200 bg-amber-50 text-amber-900"
        }`}
      >
        <Usb className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <div>
          <p className="font-medium">{agentLabel}</p>
          {!agentOpen && (
            <p className="mt-0.5 opacity-80">
              Sur ce PC : branchez le Live20R en USB, puis lancez{" "}
              <code className="rounded bg-white/70 px-1">fingerprint-agent</code> (voir README).
            </p>
          )}
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        {(["droite", "gauche"] as HandId[]).map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => switchHand(h)}
            className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition ${
              hand === h ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Main {h}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {data.fingers.map((f) => {
          const active = f.fingerId === activeFinger;
          return (
            <button
              key={f.fingerId}
              type="button"
              onClick={() => setActiveFinger(f.fingerId)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] transition ${
                active ? "border-primary bg-primary/5 text-primary" : "border-slate-200 text-slate-600"
              }`}
            >
              {f.completed ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-slate-300" />
              )}
              {FINGER_LABELS[f.fingerId]}
              <span className="tabular-nums text-slate-400">
                {f.samples.length}/{SAMPLES_PER_FINGER}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium text-slate-800">
            {FINGER_LABELS[activeFinger]} — prise {Math.min(sampleCount + 1, SAMPLES_PER_FINGER)} /{" "}
            {SAMPLES_PER_FINGER}
          </p>
          <p className="text-[10px] text-slate-500">
            Posez le doigt sur le lecteur, puis cliquez sur Capturer.
          </p>
        </div>
        <div className="flex gap-2">
          {sampleCount > 0 && (
            <button
              type="button"
              onClick={() => resetFinger(activeFinger)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-[12px] text-slate-600 hover:bg-slate-50"
            >
              Reprendre
            </button>
          )}
          <button
            type="button"
            onClick={captureOnce}
            disabled={capturing || !agentOpen || current.completed}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-white hover:bg-primary-dim disabled:opacity-50 transition"
          >
            {capturing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Fingerprint className="h-3.5 w-3.5" />}
            Capturer
          </button>
        </div>
      </div>

      {lastPreview && (
        <div className="mb-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-2">
          <img src={lastPreview} alt="Dernière empreinte" className="mx-auto h-28 w-auto object-contain" />
        </div>
      )}

      {error && <p className="mb-3 text-[11px] text-red-600">{error}</p>}

      <div className="mb-3 text-[11px] text-slate-500">
        Progression : {completedCount(data)} / {FINGER_IDS.length} doigts
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !doneAll}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-medium text-white hover:bg-primary-dim disabled:opacity-50 transition"
      >
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        Enregistrer les empreintes
      </button>
      {saved && (
        <p className="text-[10px] text-slate-500 mt-2">
          Empreintes enregistrées
          {saved.enrolledAt ? ` le ${new Date(saved.enrolledAt).toLocaleString("fr-FR")}` : ""}.
        </p>
      )}
    </div>
  );
}
