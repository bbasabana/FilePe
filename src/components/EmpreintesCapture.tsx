"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Fingerprint,
  Loader2,
  CheckCircle2,
  MousePointerClick,
  Usb,
} from "lucide-react";
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

function demoSample(fingerId: FingerId, hand: HandId, index: number) {
  const token = `demo:${hand}:${fingerId}:${index}:${Date.now()}`;
  return {
    imageBase64: "",
    templateBase64: btoa(token),
    capturedAt: new Date().toISOString(),
  };
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

  const hardwareReady = Boolean(agentOpen && status?.connected);

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

  function applySample(
    fingerId: FingerId,
    sample: { imageBase64: string; templateBase64: string; capturedAt: string },
    mode: "hardware" | "mock" | "demo",
    device: string,
    merged?: string | null
  ) {
    setData((prev) => {
      const finger = prev.fingers.find((f) => f.fingerId === fingerId);
      if (!finger || finger.samples.length >= SAMPLES_PER_FINGER) return prev;

      const samples = [...finger.samples, sample];
      const completed = samples.length >= SAMPLES_PER_FINGER;
      const templateMergedBase64 = completed
        ? merged ?? samples.map((s) => s.templateBase64).join("|")
        : finger.templateMergedBase64 ?? null;

      if (completed) {
        const idx = FINGER_IDS.indexOf(fingerId);
        if (idx < FINGER_IDS.length - 1) {
          queueMicrotask(() => setActiveFinger(FINGER_IDS[idx + 1]));
        }
      }

      return {
        ...prev,
        hand,
        mode,
        device,
        fingers: prev.fingers.map((f) =>
          f.fingerId === fingerId
            ? { ...f, hand, samples, completed, templateMergedBase64 }
            : f
        ),
      };
    });
  }

  /** Capture réelle via agent local Live20R */
  async function captureHardware(fingerId: FingerId = activeFinger) {
    const client = clientRef.current;
    if (!client || !hardwareReady) {
      setError("Agent / lecteur hors ligne. Lancez Demarrer-Agent.bat sur ce PC.");
      return;
    }
    setError(null);
    setActiveFinger(fingerId);
    setCapturing(true);
    try {
      const result = await client.capture();
      const image = result.imageBase64.startsWith("data:")
        ? result.imageBase64
        : `data:image/png;base64,${result.imageBase64}`;
      setLastPreview(image);

      const prevFinger = data.fingers.find((f) => f.fingerId === fingerId)!;
      if (prevFinger.samples.length >= SAMPLES_PER_FINGER) return;

      const sample = {
        imageBase64: image,
        templateBase64: result.templateBase64,
        capturedAt: new Date().toISOString(),
      };

      let merged: string | null = null;
      const nextSamples = [...prevFinger.samples, sample];
      if (nextSamples.length >= SAMPLES_PER_FINGER) {
        try {
          merged = await client.merge(nextSamples.map((s) => s.templateBase64));
        } catch {
          merged = sample.templateBase64;
        }
      }

      applySample(
        fingerId,
        sample,
        status?.mode === "mock" ? "mock" : "hardware",
        status?.device || "Live20R",
        merged
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de capture");
    } finally {
      setCapturing(false);
    }
  }

  /** Démo clic (sans lecteur) */
  function pointageDemo(fingerId: FingerId = activeFinger) {
    setError(null);
    setActiveFinger(fingerId);
    const finger = data.fingers.find((f) => f.fingerId === fingerId);
    if (!finger || finger.samples.length >= SAMPLES_PER_FINGER) return;
    applySample(
      fingerId,
      demoSample(fingerId, hand, finger.samples.length),
      "demo",
      "Démo (clic)"
    );
  }

  function onFingerClick(fingerId: FingerId) {
    const finger = data.fingers.find((f) => f.fingerId === fingerId);
    if (finger?.completed) {
      setActiveFinger(fingerId);
      return;
    }
    if (hardwareReady) void captureHardware(fingerId);
    else pointageDemo(fingerId);
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

  function fillAllDemo() {
    setError(null);
    const fingers = FINGER_IDS.map((fingerId) => {
      const samples = Array.from({ length: SAMPLES_PER_FINGER }, (_, i) =>
        demoSample(fingerId, hand, i)
      );
      return {
        fingerId,
        hand,
        samples,
        completed: true,
        templateMergedBase64: samples.map((s) => s.templateBase64).join("|"),
      };
    });
    setData({
      version: 2,
      hand,
      device: "Démo (clic)",
      mode: "demo",
      enrolledAt: null,
      fingers,
    });
    setActiveFinger("auriculaire");
  }

  function handleSave() {
    if (!doneAll) {
      setError("Terminez les 5 doigts (3 prises chacun) avant d’enregistrer.");
      return;
    }
    onSave(
      JSON.stringify({
        ...data,
        hand,
        device: data.device ?? (hardwareReady ? status?.device : "Démo (clic)"),
        mode: data.mode ?? (hardwareReady ? "hardware" : "demo"),
        enrolledAt: new Date().toISOString(),
        version: 2,
      } satisfies EmpreintesData)
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
      <h3 className="mb-1 flex items-center gap-2 text-[13px] font-semibold text-slate-900">
        <Fingerprint className="h-4 w-4 text-[#0b1f4a]" />
        Empreintes digitales
      </h3>
      <p className="mb-3 text-[11px] text-slate-500">
        5 doigts × 3 prises — Live20R si l’agent tourne, sinon mode démo clic.
      </p>

      <div
        className={`mb-4 flex items-start gap-2 rounded-lg border px-3 py-2 text-[11px] ${
          hardwareReady
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-amber-200 bg-amber-50 text-amber-950"
        }`}
      >
        {hardwareReady ? (
          <Usb className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        ) : (
          <MousePointerClick className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        )}
        <div>
          {hardwareReady ? (
            <>
              <p className="font-medium">
                Lecteur OK — {status?.device || "Live20R"}
                {status?.mode === "mock" ? " (simulation agent)" : ""}
              </p>
              <p className="mt-0.5 opacity-80">Posez le doigt, puis cliquez le doigt ou Capturer.</p>
            </>
          ) : (
            <>
              <p className="font-medium">Mode démo (agent hors ligne)</p>
              <p className="mt-0.5 opacity-80">
                Sur Windows : double-clic <code className="rounded bg-white/70 px-1">Demarrer-Agent.bat</code>{" "}
                puis rechargez cette page.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["droite", "gauche"] as HandId[]).map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => switchHand(h)}
            className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition ${
              hand === h ? "bg-[#0b1f4a] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Main {h}
          </button>
        ))}
        {!hardwareReady && (
          <button
            type="button"
            onClick={fillAllDemo}
            className="ml-auto rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[12px] font-medium text-amber-900 hover:bg-amber-100"
          >
            Remplir les 5 doigts (démo)
          </button>
        )}
      </div>

      <div className="mb-4 grid grid-cols-5 gap-2">
        {data.fingers.map((f) => {
          const active = f.fingerId === activeFinger;
          const progress = f.samples.length;
          return (
            <button
              key={f.fingerId}
              type="button"
              disabled={capturing}
              onClick={() => onFingerClick(f.fingerId)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 transition disabled:opacity-60 ${
                f.completed
                  ? "border-emerald-300 bg-emerald-50"
                  : active
                    ? "border-[#0b1f4a] bg-[#0b1f4a]/5 ring-2 ring-[#0b1f4a]/15"
                    : "border-slate-200 bg-slate-50 hover:border-[#0b1f4a]/40 hover:bg-white"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  f.completed
                    ? "border-emerald-500 bg-white text-emerald-600"
                    : active
                      ? "border-[#0b1f4a] bg-white text-[#0b1f4a]"
                      : "border-slate-300 bg-white text-slate-400"
                }`}
              >
                {f.completed ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Fingerprint className="h-5 w-5" />
                )}
              </span>
              <span className="text-[10px] font-medium text-slate-700">
                {FINGER_LABELS[f.fingerId]}
              </span>
              <span className="tabular-nums text-[10px] text-slate-400">
                {progress}/{SAMPLES_PER_FINGER}
              </span>
              <div className="flex gap-0.5">
                {Array.from({ length: SAMPLES_PER_FINGER }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full ${
                      i < progress ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
        <div>
          <p className="text-[12px] font-medium text-slate-800">
            {FINGER_LABELS[activeFinger]} — prise{" "}
            {Math.min(sampleCount + (current.completed ? 0 : 1), SAMPLES_PER_FINGER)} /{" "}
            {SAMPLES_PER_FINGER}
          </p>
          <p className="text-[10px] text-slate-500">
            {current.completed
              ? "Doigt terminé."
              : hardwareReady
                ? "Posez le doigt sur le Live20R, puis Capturer."
                : "Cliquez pour pointer (démo)."}
          </p>
        </div>
        <div className="flex gap-2">
          {sampleCount > 0 && (
            <button
              type="button"
              onClick={() => resetFinger(activeFinger)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-600 hover:bg-slate-50"
            >
              Reprendre
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              hardwareReady ? void captureHardware(activeFinger) : pointageDemo(activeFinger)
            }
            disabled={capturing || current.completed}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0b1f4a] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#123a7a] disabled:opacity-40"
          >
            {capturing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Fingerprint className="h-3.5 w-3.5" />
            )}
            {hardwareReady ? "Capturer" : "Pointer"}
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
        className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-[13px] font-semibold text-slate-900 transition hover:bg-amber-300 disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        Enregistrer les empreintes
      </button>
      {saved && (
        <p className="mt-2 text-[10px] text-slate-500">
          Empreintes enregistrées
          {saved.enrolledAt ? ` le ${new Date(saved.enrolledAt).toLocaleString("fr-FR")}` : ""}
          {saved.mode ? ` (${saved.mode})` : ""}.
        </p>
      )}
    </div>
  );
}
