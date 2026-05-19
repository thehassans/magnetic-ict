"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Volume2, VolumeX, RotateCcw, Globe, Loader2, AlertCircle, MessageSquare, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ConversationEntry = {
  id: string;
  role: "user" | "assistant";
  text: string;
  language?: string;
  timestamp: Date;
};

type SpeechRecognitionEvent = {
  results: SpeechRecognitionResultList;
  resultIndex: number;
};

type SpeechRecognitionErrorEvent = {
  error: string;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};

const SUPPORTED_LANGUAGES = [
  { code: "auto", label: "Auto-detect" },
  { code: "en-US", label: "English" },
  { code: "ar-SA", label: "Arabic (العربية)" },
  { code: "ur-PK", label: "Urdu (اردو)" },
  { code: "hi-IN", label: "Hindi (हिंदी)" },
  { code: "bn-BD", label: "Bengali (বাংলা)" },
  { code: "fr-FR", label: "French" },
  { code: "es-ES", label: "Spanish" },
  { code: "de-DE", label: "German" },
  { code: "zh-CN", label: "Chinese (Mandarin)" },
  { code: "ja-JP", label: "Japanese" },
  { code: "ko-KR", label: "Korean" },
  { code: "pt-BR", label: "Portuguese" },
  { code: "ru-RU", label: "Russian" },
  { code: "tr-TR", label: "Turkish" },
  { code: "id-ID", label: "Indonesian" },
  { code: "ms-MY", label: "Malay" },
  { code: "th-TH", label: "Thai" }
];

function getVoiceForLang(lang: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined") return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const code = (lang === "auto" ? "en-US" : lang).toLowerCase();
  const langPrefix = code.split("-")[0];
  // Exact match first
  const exact = voices.find((v) => v.lang.toLowerCase() === code);
  if (exact) return exact;
  // Prefix match (e.g. "ur" matches "ur-PK")
  const prefix = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix + "-") || v.lang.toLowerCase() === langPrefix);
  if (prefix) return prefix;
  // Language-specific fallbacks (e.g. Urdu -> Hindi as last resort for TTS only)
  const ttsFamily: Record<string, string[]> = {
    ur: ["hi", "hi-IN"],
    bn: ["hi", "hi-IN"],
    pa: ["hi", "hi-IN"],
    ms: ["id", "id-ID"]
  };
  const fallbacks = ttsFamily[langPrefix];
  if (fallbacks) {
    for (const fb of fallbacks) {
      const fbPrefix = fb.split("-")[0];
      const fbVoice = voices.find((v) => v.lang.toLowerCase() === fb.toLowerCase())
        || voices.find((v) => v.lang.toLowerCase().startsWith(fbPrefix + "-"));
      if (fbVoice) return fbVoice;
    }
  }
  // Return null — do NOT fall back to voices[0] which would speak wrong language
  return null;
}

export function ChatbotVoice() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [selectedLang, setSelectedLang] = useState("auto");
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [amplitude, setAmplitude] = useState(0);
  const [voiceboxStatus, setVoiceboxStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [voiceboxProfiles, setVoiceboxProfiles] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [useVoiceboxSTT, setUseVoiceboxSTT] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const apiAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const apiAudioCtxRef = useRef<AudioContext | null>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const vbMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const vbChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }
    synthRef.current = window.speechSynthesis;

    const loadVoices = () => setVoicesLoaded(true);
    speechSynthesis.addEventListener("voiceschanged", loadVoices);
    if (speechSynthesis.getVoices().length > 0) setVoicesLoaded(true);

    return () => {
      speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      stopListening();
      stopSpeaking();
      if (vbMediaRecorderRef.current?.state === "recording") vbMediaRecorderRef.current.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, isThinking]);

  useEffect(() => {
    fetch("/api/social-bot/tts/profiles")
      .then((r) => r.json())
      .then((d: { profiles?: Array<{ id: string; name: string }>; connected?: boolean }) => {
        if (d.connected && d.profiles && d.profiles.length > 0) {
          setVoiceboxProfiles(d.profiles);
          setSelectedProfileId(d.profiles[0]?.id ?? "");
          setVoiceboxStatus("connected");
        } else {
          setVoiceboxStatus("disconnected");
        }
      })
      .catch(() => setVoiceboxStatus("disconnected"));
  }, []);

  const startAmplitudeTracking = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      function tick() {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAmplitude(Math.min(100, avg * 1.5));
        animFrameRef.current = requestAnimationFrame(tick);
      }
      tick();
    } catch { /* microphone access denied */ }
  }, []);

  const stopAmplitudeTracking = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setAmplitude(0);
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;
    audioContextRef.current?.close().catch(() => null);
    audioContextRef.current = null;
    analyserRef.current = null;
  }, []);

  const stopSpeaking = useCallback(() => {
    // Stop API TTS audio
    if (apiAudioSourceRef.current) {
      try { apiAudioSourceRef.current.stop(); } catch { /* already stopped */ }
      apiAudioSourceRef.current = null;
    }
    if (apiAudioCtxRef.current) {
      apiAudioCtxRef.current.close().catch(() => null);
      apiAudioCtxRef.current = null;
    }
    // Stop browser TTS
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setIsListening(false);
    setInterimText("");
    stopAmplitudeTracking();
  }, [stopAmplitudeTracking]);

  const speakText = useCallback(async (text: string, lang: string) => {
    if (isMuted) return;
    stopSpeaking();
    const targetLang = lang === "auto" ? "en-US" : lang;

    // ── 1. Try API TTS (ElevenLabs or OpenAI) ────────────────────────────────
    try {
      const res = await fetch("/api/social-bot/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: targetLang, voiceId: selectedProfileId || undefined })
      });
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        const decoded = await ctx.decodeAudioData(arrayBuf);
        const source = ctx.createBufferSource();
        source.buffer = decoded;
        source.connect(ctx.destination);
        apiAudioCtxRef.current = ctx;
        apiAudioSourceRef.current = source;
        setIsSpeaking(true);
        source.onended = () => {
          setIsSpeaking(false);
          apiAudioSourceRef.current = null;
          ctx.close().catch(() => null);
          apiAudioCtxRef.current = null;
        };
        source.start(0);
        return;
      }
    } catch { /* API unavailable — fall through to browser TTS */ }

    // ── 2. Browser TTS fallback ───────────────────────────────────────────────
    if (!synthRef.current) return;
    const utter = new SpeechSynthesisUtterance(text);
    const voice = getVoiceForLang(targetLang);
    if (voice) utter.voice = voice;
    utter.lang = targetLang;
    utter.rate = 0.95;
    utter.pitch = 1.0;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    synthRef.current.speak(utter);
  }, [isMuted, stopSpeaking, selectedProfileId]);

  const sendToAI = useCallback(async (text: string, detectedLang: string) => {
    setIsThinking(true);
    setError(null);

    const historyForApi = conversation.slice(-10).map((e) => ({
      role: e.role,
      text: e.text
    }));

    try {
      const res = await fetch("/api/social-bot/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyForApi,
          language: detectedLang !== "auto" ? SUPPORTED_LANGUAGES.find((l) => l.code === detectedLang)?.label : undefined
        })
      });

      const data = (await res.json()) as { reply?: string; error?: string };

      if (!res.ok || !data.reply) {
        throw new Error(data.error ?? "Voice agent failed to respond.");
      }

      const assistantEntry: ConversationEntry = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: data.reply,
        language: detectedLang,
        timestamp: new Date()
      };

      setConversation((prev) => [...prev, assistantEntry]);
      void speakText(data.reply, detectedLang);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Voice agent error.");
    } finally {
      setIsThinking(false);
    }
  }, [conversation, speakText]);

  const startListening = useCallback(async () => {
    setError(null);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    stopSpeaking();

    const recognition = new SpeechRecognition();
    recognition.lang = selectedLang === "auto" ? "" : selectedLang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      void startAmplitudeTracking();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = Array.from({ length: event.results.length }, (_, i) => event.results[i]);
      const transcript = results.map((r) => r[0].transcript).join("");
      const isFinal = results.some((r) => r.isFinal);

      if (isFinal) {
        setInterimText("");
      } else {
        setInterimText(transcript);
      }

      if (isFinal && transcript.trim()) {
        const userEntry: ConversationEntry = {
          id: `u-${Date.now()}`,
          role: "user",
          text: transcript.trim(),
          language: selectedLang,
          timestamp: new Date()
        };
        setConversation((prev) => [...prev, userEntry]);
        void sendToAI(transcript.trim(), selectedLang);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "language-not-supported") {
        // Language not available for recognition — switch to auto-detect and retry
        setSelectedLang("auto");
        setError(`"${SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang)?.label ?? selectedLang}" is not supported for voice recognition in this browser. Switched to auto-detect.`);
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        setError(`Microphone error: ${event.error}. Please check browser permissions and language settings.`);
      }
      setIsListening(false);
      stopAmplitudeTracking();
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText("");
      stopAmplitudeTracking();
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setError("Could not start microphone. Please check browser permissions.");
      setIsListening(false);
    }
  }, [selectedLang, stopSpeaking, startAmplitudeTracking, stopAmplitudeTracking, sendToAI]);

  async function startVoiceboxListening() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      vbChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => { if (e.data.size > 0) vbChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        stopAmplitudeTracking();
        const blob = new Blob(vbChunksRef.current, { type: "audio/webm" });
        const fd = new FormData();
        fd.append("audio", blob, "recording.webm");
        setIsListening(false);
        setIsThinking(true);
        try {
          const res = await fetch("/api/social-bot/transcribe", { method: "POST", body: fd });
          const d = await res.json() as { transcript?: string; error?: string };
          if (d.transcript?.trim()) {
            const entry: ConversationEntry = {
              id: `u-${Date.now()}`, role: "user",
              text: d.transcript.trim(), language: selectedLang, timestamp: new Date()
            };
            setConversation((prev) => [...prev, entry]);
            void sendToAI(d.transcript.trim(), selectedLang);
          } else {
            setIsThinking(false);
            setError(d.error ?? "No speech detected — try again.");
          }
        } catch {
          setIsThinking(false);
          setError("Transcription failed. Make sure Voicebox is running.");
        }
      };
      mr.start();
      vbMediaRecorderRef.current = mr;
      setIsListening(true);
      void startAmplitudeTracking();
    } catch {
      setError("Could not access microphone.");
    }
  }

  function stopVoiceboxListening() {
    if (vbMediaRecorderRef.current?.state === "recording") vbMediaRecorderRef.current.stop();
    vbMediaRecorderRef.current = null;
  }

  function toggleListening() {
    if (isListening) {
      if (useVoiceboxSTT) stopVoiceboxListening(); else stopListening();
    } else {
      if (useVoiceboxSTT) void startVoiceboxListening(); else void startListening();
    }
  }

  function clearConversation() {
    if (useVoiceboxSTT) stopVoiceboxListening(); else stopListening();
    stopSpeaking();
    setConversation([]);
    setInterimText("");
    setError(null);
  }

  const ringSize = 80 + amplitude * 0.6;

  if (!speechSupported) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-10 text-center">
        <AlertCircle className="h-10 w-10 text-amber-400" />
        <div>
          <p className="text-base font-semibold text-gray-800 dark:text-white">Browser not supported</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/40">Voice Agent requires Chrome or Edge for Web Speech API support.</p>
        </div>
      </div>
    );
  }

  void voicesLoaded;

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Voice Agent</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-white/40">Speak to your AI assistant — it understands and replies in your language</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] px-3 py-1.5">
            <Globe className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              disabled={isListening || isThinking}
              className="bg-transparent text-xs font-medium text-gray-700 dark:text-white/70 outline-none disabled:opacity-50"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => { stopSpeaking(); setIsMuted((m) => !m); }}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-xl border transition",
              isMuted
                ? "border-rose-400/30 bg-rose-500/10 text-rose-400"
                : "border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70"
            )}
            title={isMuted ? "Unmute voice" : "Mute voice"}
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
          {conversation.length > 0 && (
            <button
              type="button"
              onClick={clearConversation}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-gray-400 dark:text-white/40 transition hover:text-rose-500 dark:hover:text-rose-400"
              title="Clear conversation"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Voice Engine panel */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02] px-4 py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className={cn(
              "h-2 w-2 shrink-0 rounded-full",
              voiceboxStatus === "connected" ? "bg-emerald-500" :
              voiceboxStatus === "checking" ? "bg-amber-400 animate-pulse" :
              "bg-gray-300 dark:bg-white/20"
            )} />
            <span className="text-[12px] font-semibold text-gray-700 dark:text-white/70">
              Voicebox{" "}
              {voiceboxStatus === "connected" ? "· connected" : voiceboxStatus === "checking" ? "· connecting…" : "· offline"}
            </span>
            {voiceboxStatus === "connected" && voiceboxProfiles.length > 0 && (
              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="rounded-lg border border-gray-200 dark:border-white/[0.07] bg-gray-50 dark:bg-white/[0.04] px-2 py-0.5 text-[11px] text-gray-700 dark:text-white/60 outline-none"
              >
                {voiceboxProfiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            )}
          </div>
          <div className="flex items-center gap-4">
            {voiceboxStatus === "connected" && (
              <label className="flex cursor-pointer items-center gap-1.5">
                <span className="text-[11px] text-gray-400 dark:text-white/30">Whisper STT</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={useVoiceboxSTT}
                  onClick={() => setUseVoiceboxSTT((v) => !v)}
                  className={cn(
                    "relative h-5 w-9 rounded-full transition-colors",
                    useVoiceboxSTT ? "bg-violet-500" : "bg-gray-200 dark:bg-white/10"
                  )}
                >
                  <span className={cn(
                    "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200",
                    useVoiceboxSTT ? "left-[18px]" : "left-0.5"
                  )} />
                </button>
              </label>
            )}
            <a
              href="http://127.0.0.1:7860"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-medium text-violet-500 dark:text-violet-400/70 hover:underline"
            >
              Clone Studio ↗
            </a>
          </div>
        </div>
        {voiceboxStatus === "disconnected" && (
          <p className="mt-2 text-[11px] leading-relaxed text-gray-400 dark:text-white/25">
            Install{" "}
            <a href="https://voicebox.sh" target="_blank" rel="noopener noreferrer" className="text-violet-500 dark:text-violet-400 underline">Voicebox</a>
            {" "}for cloned-voice TTS + Whisper STT. Use{" "}
            <a href="https://github.com/FranckyB/Voice-Clone-Studio" target="_blank" rel="noopener noreferrer" className="text-violet-500 dark:text-violet-400 underline">Voice Clone Studio</a>
            {" "}to create voice profiles from any audio sample.
          </p>
        )}
      </div>

      {/* Microphone orb */}
      <div className="flex flex-col items-center justify-center gap-8 py-8">
        <div className="relative flex items-center justify-center">
          {/* Outer ambient glow rings */}
          {isListening && (
            <>
              <div
                className="absolute rounded-full bg-violet-500/[0.06] transition-all duration-150"
                style={{ width: ringSize + 64, height: ringSize + 64, boxShadow: `0 0 ${40 + amplitude * 0.4}px rgba(139,92,246,0.18)` }}
              />
              <div
                className="absolute rounded-full border border-violet-400/25 bg-violet-500/[0.04] transition-all duration-100"
                style={{ width: ringSize + 36, height: ringSize + 36 }}
              />
              <div
                className="absolute rounded-full border border-violet-500/40 transition-all duration-75"
                style={{ width: ringSize + 12, height: ringSize + 12 }}
              />
            </>
          )}
          {isSpeaking && (
            <>
              <div className="absolute h-44 w-44 animate-ping rounded-full bg-emerald-500/[0.07]" style={{ animationDuration: "1.4s" }} />
              <div className="absolute h-36 w-36 animate-ping rounded-full border border-emerald-400/20" style={{ animationDuration: "1s" }} />
              <div className="absolute h-28 w-28 animate-pulse rounded-full border border-emerald-400/35 bg-emerald-500/[0.05]" />
            </>
          )}
          {isThinking && (
            <div className="absolute h-32 w-32 animate-pulse rounded-full bg-amber-500/[0.06] blur-sm" />
          )}

          <button
            type="button"
            onClick={toggleListening}
            disabled={isThinking}
            className={cn(
              "relative z-10 flex h-28 w-28 items-center justify-center rounded-full transition-all duration-300 active:scale-95",
              isListening
                ? "scale-110 bg-gradient-to-br from-violet-500 to-purple-700 shadow-[0_0_48px_rgba(139,92,246,0.55),0_12px_40px_rgba(0,0,0,0.35)]"
                : isSpeaking
                ? "bg-gradient-to-br from-emerald-400 to-teal-600 shadow-[0_0_40px_rgba(52,211,153,0.45),0_12px_36px_rgba(0,0,0,0.3)]"
                : "bg-gradient-to-br from-[#1e1e3a] to-[#0f0f20] dark:from-white/[0.1] dark:to-white/[0.04] shadow-[0_8px_40px_rgba(0,0,0,0.45)] hover:scale-105 hover:shadow-[0_8px_56px_rgba(139,92,246,0.25)]",
              isThinking && "opacity-50 cursor-not-allowed scale-100"
            )}
          >
            {/* Inner ring accent */}
            <span className={cn(
              "absolute inset-2 rounded-full opacity-20",
              isListening ? "bg-white" : isSpeaking ? "bg-white" : "bg-transparent"
            )} />
            {isThinking ? (
              <Loader2 className="relative h-10 w-10 animate-spin text-white/80" />
            ) : isListening ? (
              <MicOff className="relative h-10 w-10 text-white" />
            ) : (
              <Mic className="relative h-10 w-10 text-white/90" />
            )}
          </button>
        </div>

        {/* Status label */}
        <div className="text-center space-y-1.5">
          {isListening && (
            <p className="text-[13px] font-semibold text-violet-500 dark:text-violet-400 tracking-wide">
              {interimText ? "Listening…" : "Listening — speak now"}
            </p>
          )}
          {isSpeaking && (
            <p className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide">Speaking…</p>
          )}
          {isThinking && (
            <p className="text-[13px] font-semibold text-amber-500 dark:text-amber-400/80 tracking-wide">Thinking…</p>
          )}
          {!isListening && !isSpeaking && !isThinking && (
            <p className="text-[13px] text-gray-400 dark:text-white/30">
              {conversation.length === 0 ? "Tap the mic to start" : "Tap to continue"}
            </p>
          )}
          {interimText && (
            <p className="max-w-xs text-[11px] text-gray-500 dark:text-white/30 italic line-clamp-2">{interimText}</p>
          )}
        </div>

        {/* Waveform — only while listening */}
        {isListening && (
          <div className="flex items-center gap-[3px] h-10">
            {Array.from({ length: 28 }).map((_, i) => {
              const phase = (i / 28) * Math.PI * 2;
              const wave = Math.sin(phase + Date.now() * 0.006) * 0.35 + 0.65;
              const barH = Math.max(4, amplitude * wave * 0.38 + 4);
              const opacity = 0.45 + (i % 3 === 0 ? 0.3 : 0);
              return (
                <div
                  key={i}
                  className="w-[3px] rounded-full bg-violet-500 transition-all duration-75"
                  style={{ height: `${Math.min(40, barH)}px`, opacity }}
                />
              );
            })}
          </div>
        )}
        {isSpeaking && (
          <div className="flex items-center gap-[3px] h-10">
            {Array.from({ length: 28 }).map((_, i) => {
              const phase = (i / 28) * Math.PI * 2;
              const barH = Math.max(4, 16 + Math.sin(phase + Date.now() * 0.008) * 14);
              return (
                <div
                  key={i}
                  className="w-[3px] rounded-full bg-emerald-500 transition-all duration-100"
                  style={{ height: `${barH}px`, opacity: 0.6 }}
                />
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="ml-auto text-rose-400/60 hover:text-rose-400">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Conversation transcript */}
      {(conversation.length > 0 || isThinking) && (
        <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02]">
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-white/[0.06] px-5 py-3.5">
            <MessageSquare className="h-4 w-4 text-violet-500 dark:text-violet-400" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Transcript</span>
            <span className="ml-auto rounded-full bg-violet-500/10 px-2 py-0.5 text-[11px] font-semibold text-violet-600 dark:text-violet-400">
              {conversation.length} turns
            </span>
          </div>

          <div className="max-h-96 overflow-y-auto p-5 space-y-4 scrollbar-thin">
            {conversation.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  "flex gap-2.5 items-end",
                  entry.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {entry.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/40 to-purple-700/30 ring-1 ring-violet-500/20">
                    <Mic className="h-3 w-3 text-violet-300" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[76%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm",
                    entry.role === "user"
                      ? "bg-gradient-to-br from-violet-600 to-purple-700 text-white rounded-br-sm shadow-violet-900/20"
                      : "bg-white dark:bg-white/[0.07] border border-gray-100 dark:border-white/[0.06] text-gray-800 dark:text-white/85 rounded-bl-sm"
                  )}
                >
                  {entry.text}
                  <p className={cn("mt-1.5 text-[10px] font-medium", entry.role === "user" ? "text-violet-200/70" : "text-gray-400 dark:text-white/20")}>
                    {entry.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {entry.role === "user" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-violet-600/15 ring-1 ring-violet-500/20">
                    <Mic className="h-3 w-3 text-violet-400" />
                  </div>
                )}
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start gap-2.5 items-end">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/40 to-purple-700/30 ring-1 ring-violet-500/20">
                  <Loader2 className="h-3 w-3 animate-spin text-violet-300" />
                </div>
                <div className="rounded-2xl rounded-bl-sm bg-white dark:bg-white/[0.07] border border-gray-100 dark:border-white/[0.06] px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400/60 [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400/60 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400/60 [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={conversationEndRef} />
          </div>
        </div>
      )}

      {/* Info strip */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.02] px-4 py-3 text-xs text-gray-400 dark:text-white/25 space-y-1">
        <p>• <strong className="text-gray-500 dark:text-white/40">Voicebox</strong> — 7 TTS engines (Qwen3-TTS, Chatterbox, Kokoro, LuxTTS…) + Whisper STT ·{" "}<a href="https://voicebox.sh" target="_blank" rel="noopener noreferrer" className="text-violet-500 dark:text-violet-400 underline">voicebox.sh</a></p>
        <p>• <strong className="text-gray-500 dark:text-white/40">Voice Clone Studio</strong> — zero-shot voice cloning from any audio sample ·{" "}<a href="https://github.com/FranckyB/Voice-Clone-Studio" target="_blank" rel="noopener noreferrer" className="text-violet-500 dark:text-violet-400 underline">github.com/FranckyB/Voice-Clone-Studio</a></p>
        <p>• Falls back to browser TTS / browser STT when Voicebox is offline</p>
        <p>• Supports 18+ languages · AI replies in the customer&apos;s language using your knowledge base</p>
      </div>
    </div>
  );
}
