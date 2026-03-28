"use client";

import { useEffect, useRef, useState } from "react";

interface HackAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  link?: { text: string; url: string };
  mode: "extension" | "link";
}

export function HackAlertModal({
  isOpen,
  onClose,
  link,
  mode,
}: HackAlertModalProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [stage, setStage] = useState<"scanning" | "alert">("scanning");

  useEffect(() => {
    if (isOpen) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      if (mode === "link") {
        setStage("alert");
      } else {
        setStage("scanning");
        const scanTimeout = setTimeout(() => {
          setStage("alert");
        }, 2000);
        return () => clearTimeout(scanTimeout);
      }
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src="https://www.soundjay.com/buttons/sounds/beep-07a.mp3"
        preload="auto"
      >
        <track kind="captions" />
      </audio>

      <div className="fixed inset-0 z-50 flex">
        <button
          type="button"
          aria-label="Close"
          className="absolute inset-0 bg-black/40 cursor-default"
          onClick={onClose}
        />

        <div
          className="relative z-10 ml-auto w-full max-w-[360px] h-full shadow-2xl flex flex-col"
          style={{
            transform: isOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 250ms ease-out",
          }}
        >
          {mode === "link" ? (
            <HackDialog link={link} onClose={onClose} />
          ) : stage === "scanning" ? (
            <ScanningView url={link?.url || ""} />
          ) : (
            <ThreatDialog url={link?.url} onClose={onClose} />
          )}
        </div>
      </div>
    </>
  );
}

function ScanningView({ url }: { url: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#111]">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-orange-500/20 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-orange-500 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              strokeDasharray="60"
              strokeDashoffset="20"
            />
          </svg>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-white mb-1">Analyzing</h2>
      <p className="text-white/40 text-xs font-mono text-center mb-6 break-all max-w-[240px]">
        {url || "Scanning email..."}
      </p>

      <div className="w-full space-y-1">
        <ScanStep text="Checking domain..." delay={0} />
        <ScanStep text="Verifying certificate..." delay={400} />
        <ScanStep text="Scanning for threats..." delay={800} />
        <ScanStep text="Final analysis..." delay={1200} />
      </div>
    </div>
  );
}

function ScanStep({ text, delay }: { text: string; delay: number }) {
  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), delay);
    const t2 = setTimeout(() => setDone(true), delay + 200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [delay]);

  return (
    <div
      className="flex items-center gap-2 p-2 rounded-lg transition-colors"
      style={{
        opacity: visible ? 1 : 0,
        backgroundColor: done ? "rgba(249, 115, 22, 0.1)" : "transparent",
      }}
    >
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${done ? "bg-orange-500" : "bg-white/20"}`}
      >
        {done && (
          <svg
            className="w-2 h-2 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <span
        className={`text-xs transition-colors ${done ? "text-white/80" : "text-white/40"}`}
      >
        {text}
      </span>
    </div>
  );
}

function HackDialog({
  link,
  onClose,
}: {
  link?: { text: string; url: string };
  onClose: () => void;
}) {
  const url = link?.url || "unknown";

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-red-950 via-red-900 to-black">
      <button
        type="button"
        aria-label="Close alert"
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/60 transition-colors z-10"
        onClick={onClose}
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-6">
          <svg
            className="w-24 h-24 text-red-500 mx-auto"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">DANGER</h1>
        <h2 className="text-xl text-red-400 font-semibold mb-4">
          SYSTEM COMPROMISED
        </h2>

        <div className="bg-black/50 rounded-lg p-3 mb-4 border border-red-500/30 max-w-xs w-full">
          <p className="text-red-400 text-[10px] font-mono mb-1">
            SUSPICIOUS URL
          </p>
          <p className="text-red-200 text-xs font-mono break-all">{url}</p>
        </div>

        <div className="bg-black/50 rounded-lg p-4 mb-6 border border-red-500/30 max-w-xs">
          <p className="text-red-300 text-sm font-mono mb-1">
            MALWARE DETECTED
          </p>
          <p className="text-red-200 text-xs">
            Your system has been infected with a remote access trojan (RAT)
          </p>
        </div>

        <div className="space-y-2 text-left w-full max-w-xs">
          <div className="flex items-center gap-2 text-red-300 text-xs">
            <svg
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
            </svg>
            <span>Scanning for vulnerabilities...</span>
          </div>
          <div className="flex items-center gap-2 text-red-300 text-xs">
            <svg
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
            </svg>
            <span>Data breach in progress...</span>
          </div>
          <div className="flex items-center gap-2 text-red-300 text-xs">
            <svg
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
            </svg>
            <span>Credentials being exfiltrated...</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors"
        >
          DISCONNECT IMMEDIATELY
        </button>
      </div>
    </div>
  );
}

function ThreatDialog({ url, onClose }: { url?: string; onClose: () => void }) {
  const getHarmfulReason = (url: string) => {
    const urlLower = url.toLowerCase();
    if (
      urlLower.includes("verify") ||
      urlLower.includes("secure") ||
      urlLower.includes("account")
    ) {
      return "This link attempts to steal your login credentials by mimicking a legitimate security page.";
    }
    if (urlLower.includes("payment") || urlLower.includes("billing")) {
      return "This link targets your payment information and credit card details.";
    }
    if (urlLower.includes("confirm") || urlLower.includes("identity")) {
      return "This link is designed to harvest your personal identity information.";
    }
    if (urlLower.includes("bank") || urlLower.includes("financial")) {
      return "This link is a banking scam attempting to access your financial accounts.";
    }
    return "This link contains malicious code designed to compromise your device and steal your data.";
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#111]">
      <button
        type="button"
        aria-label="Close alert"
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/60 transition-colors z-10"
        onClick={onClose}
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="h-24 bg-gradient-to-b from-orange-500/20 to-transparent flex items-center justify-center">
        <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center">
          <svg
            className="w-7 h-7 text-orange-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"
            />
          </svg>
        </div>
      </div>

      <div className="flex-1 p-5 -mt-6 overflow-auto">
        <div className="mb-5">
          <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-orange-500/10 border border-orange-500/20 mb-3">
            <span className="text-[10px] font-medium text-orange-400 uppercase">
              Device Compromised
            </span>
          </div>

          <h1 className="text-lg font-semibold text-white mb-1">
            Threat Detected
          </h1>
          <p className="text-white/50 text-sm">
            {url
              ? getHarmfulReason(url)
              : "This link contains malicious content."}
          </p>
        </div>

        {url && (
          <div className="mb-5 p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">
              URL
            </p>
            <p className="text-white/70 text-xs font-mono break-all">{url}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <ThreatRow label="Phishing" />
          <ThreatRow label="Credential Theft" />
          <ThreatRow label="Malicious Domain" />
        </div>
      </div>

      <div className="p-4 border-t border-white/10">
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

function ThreatRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-md bg-orange-500/5 border border-orange-500/10">
      <span className="text-xs text-orange-300">{label}</span>
      <span className="text-[10px] text-orange-400">Detected</span>
    </div>
  );
}
