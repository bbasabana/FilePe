"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState, useEffect, useCallback } from "react";
import { Camera, Loader2, Video, X } from "lucide-react";

interface PhotoCaptureProps {
  currentPhotoUrl: string | null;
  onCapture: (dataUrl: string) => void;
  onSave: () => void;
  saving?: boolean;
}

export default function PhotoCapture({ currentPhotoUrl, onCapture, onSave, saving }: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    const play = () => video.play().catch(() => {});
    const onCanPlay = () => play();
    video.addEventListener("loadeddata", onCanPlay, { once: true });
    video.addEventListener("canplay", onCanPlay, { once: true });
    if (video.readyState >= 2) play();
    return () => {
      video.removeEventListener("loadeddata", onCanPlay);
      video.removeEventListener("canplay", onCanPlay);
      video.srcObject = null;
    };
  }, [stream]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
    setCaptured(null);
  }, []);

  async function startCamera() {
    setError(null);
    setLoading(true);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = s;
      setStream(s);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg.includes("Permission") || msg.includes("NotAllowed")
        ? "Accès à la caméra refusé. Autorisez l'accès dans les paramètres du navigateur."
        : "Caméra indisponible ou déjà utilisée.");
    } finally {
      setLoading(false);
    }
  }

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !streamRef.current || video.readyState < 2) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (w === 0 || h === 0) return;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
    setCaptured(dataUrl);
    onCapture(dataUrl);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <h3 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Camera className="h-4 w-4 text-primary" />
          Photo d&apos;identité
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {currentPhotoUrl && !stream && !captured && (
          <div className="flex flex-col items-center">
            <div className="relative rounded-xl overflow-hidden bg-slate-100 w-full max-w-[280px] aspect-[3/4] border border-slate-200">
              <img src={currentPhotoUrl} alt="Photo enregistrée" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Photo enregistrée</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-[13px] text-red-600">
            {error}
          </div>
        )}

        {stream ? (
          <div className="space-y-4">
            <div className="relative w-full max-w-md mx-auto rounded-xl overflow-hidden bg-black border border-slate-200 shadow-sm">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="block w-full aspect-video min-h-[200px] object-cover"
                style={{ minHeight: "200px" }}
              />
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-center pb-2">
                <span className="text-[11px] text-white/90 font-medium">Prévisualisation en direct</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={capture}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-medium text-white hover:bg-primary-dim transition"
              >
                <Camera className="h-4 w-4" />
                Prendre la photo
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                <X className="h-4 w-4" />
                Fermer la caméra
              </button>
            </div>

            {captured && (
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Aperçu capturé</p>
                <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200 w-full max-w-[240px] aspect-[3/4]">
                  <img src={captured} alt="Capture" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-medium text-white hover:bg-primary-dim disabled:opacity-50 transition"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  {saving ? "Enregistrement…" : "Enregistrer la photo"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
              <Video className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-[13px] text-slate-500 text-center max-w-[260px]">
              {loading ? "Activation de la caméra…" : "Ouvrez la caméra pour prendre une photo d\u2019identité."}
            </p>
            <button
              type="button"
              onClick={startCamera}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-medium text-white hover:bg-primary-dim disabled:opacity-50 transition"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              {loading ? "Ouverture…" : "Ouvrir la webcam"}
            </button>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="absolute opacity-0 pointer-events-none w-0 h-0" aria-hidden />
    </div>
  );
}
