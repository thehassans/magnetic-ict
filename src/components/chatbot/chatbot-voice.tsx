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
  const code = lang === "auto" ? "en-US" : lang;
  const langPrefix = code.split("-")[0];
  return (
    voices.find((v) => v.lang === code) ||
    voices.find((v) => v.lang.startsWith(langPrefix)) ||
    voices[0] ||
    null
  );
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

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);

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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, isThinking]);

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

  const speakText = useCallback((text: string, lang: string) => {
    if (isMuted || !synthRef.current) return;
    stopSpeaking();
    const utter = new SpeechSynthesisUtterance(text);
    const targetLang = lang === "auto" ? "en-US" : lang;
    const voice = getVoiceForLang(targetLang);
    if (voice) utter.voice = voice;
    utter.lang = targetLang;
    utter.rate = 0.95;
    utter.pitch = 1.0;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    synthRef.current.speak(utter);
  }, [isMuted, stopSpeaking]);

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
      speakText(data.reply, detectedLang);
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
      if (event.error !== "no-speech" && event.error !== "aborted") {
        setError(`Microphone error: ${event.error}. Please check browser permissions.`);
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

  function toggleListening() {
    if (isListening) {
      stopListening();
    } else {
      void startListening();
    }
  }

  function clearConversation() {
    stopListening();
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

      {/* Microphone orb */}
      <div className="flex flex-col items-center justify-center gap-6 py-6">
        <div className="relative flex items-center justify-center">
          {isListening && (
            <>
              <div
                className="absolute rounded-full border border-violet-500/20 bg-violet-500/5 transition-all duration-100"
                style={{ width: ringSize + 40, height: ringSize + 40 }}
              />
              <div
                className="absolute rounded-full border border-violet-500/30 bg-violet-500/8 transition-all duration-100"
                style={{ width: ringSize + 20, height: ringSize + 20 }}
              />
            </>
          )}
          {isSpeaking && (
            <>
              <div className="absolute h-36 w-36 animate-ping rounded-full border border-emerald-400/20 bg-emerald-500/5" />
              <div className="absolute h-28 w-28 animate-pulse rounded-full border border-emerald-400/30 bg-emerald-500/8" />
            </>
          )}
          <button
            type="button"
            onClick={toggleListening}
            disabled={isThinking}
            className={cn(
              "relative z-10 flex h-24 w-24 items-center justify-center rounded-full shadow-2xl transition-all duration-200 active:scale-95",
              isListening
                ? "bg-gradient-to-br from-violet-600 to-purple-700 shadow-violet-500/40 scale-110"
                : isSpeaking
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/40"
                : "bg-gradient-to-br from-gray-800 to-gray-900 dark:from-white/10 dark:to-white/5 shadow-black/30 hover:scale-105",
              isThinking && "opacity-60 cursor-not-allowed"
            )}
          >
            {isThinking ? (
              <Loader2 className="h-9 w-9 animate-spin text-white" />
            ) : isListening ? (
              <MicOff className="h-9 w-9 text-white" />
            ) : (
              <Mic className="h-9 w-9 text-white" />
            )}
          </button>
        </div>

        <div className="text-center">
          {isListening && (
            <p className="text-sm font-medium text-violet-600 dark:text-violet-400 animate-pulse">
              Listening{interimText ? "…" : " — speak now"}
            </p>
          )}
          {isSpeaking && (
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Speaking…
            </p>
          )}
          {isThinking && (
            <p className="text-sm font-medium text-gray-500 dark:text-white/40">
              Thinking…
            </p>
          )}
          {!isListening && !isSpeaking && !isThinking && (
            <p className="text-sm text-gray-400 dark:text-white/30">
              {conversation.length === 0 ? "Tap the mic to start talking" : "Tap to continue"}
            </p>
          )}
          {interimText && (
            <p className="mt-1 max-w-xs text-xs text-gray-500 dark:text-white/30 italic line-clamp-2">{interimText}</p>
          )}
        </div>

        {/* Amplitude bars */}
        {isListening && (
          <div className="flex items-end gap-0.5 h-8">
            {Array.from({ length: 20 }).map((_, i) => {
              const barAmp = Math.max(4, amplitude * (0.4 + Math.sin(i * 0.8 + Date.now() * 0.005) * 0.3));
              return (
                <div
                  key={i}
                  className="w-1.5 rounded-full bg-violet-500/60 transition-all duration-75"
                  style={{ height: `${Math.min(32, barAmp * 0.32 + 4)}px` }}
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

          <div className="max-h-80 overflow-y-auto p-4 space-y-3">
            {conversation.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  "flex gap-3",
                  entry.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {entry.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/30 to-purple-600/20 text-violet-300">
                    <Mic className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    entry.role === "user"
                      ? "bg-violet-600 text-white rounded-tr-sm"
                      : "bg-gray-100 dark:bg-white/[0.06] text-gray-800 dark:text-white/85 rounded-tl-sm"
                  )}
                >
                  {entry.text}
                  <p className={cn("mt-1 text-[10px]", entry.role === "user" ? "text-violet-200" : "text-gray-400 dark:text-white/25")}>
                    {entry.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {entry.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400">
                    <Mic className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/30 to-purple-600/20">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-gray-100 dark:bg-white/[0.06] px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 dark:bg-white/40 [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 dark:bg-white/40 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 dark:bg-white/40 [animation-delay:300ms]" />
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
        <p>• <strong className="text-gray-500 dark:text-white/40">Browser STT + Gemini AI</strong> — no extra API needed</p>
        <p>• Supports 18+ languages including Arabic, Urdu, Hindi, Bengali and more</p>
        <p>• AI automatically detects and replies in the customer&apos;s language</p>
        <p>• Uses your trained knowledge base for accurate responses</p>
      </div>
    </div>
  );
}
