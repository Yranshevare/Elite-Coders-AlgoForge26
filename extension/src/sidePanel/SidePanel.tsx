import { useEffect, useState, useRef } from "react";
import { fetchSession, sendOtp, verifyOtp } from "../utils/auth";

type EmailData = {
  senderEmail: string;
  subject: string;
  body: string;
  links: string[];
} | null;

type AnalysisStep = {
  id: string;
  title: string;
  status: "pending" | "running" | "completed" | "error";
  details?: string;
  data?: Record<string, unknown>;
};

type AiVerdict = {
  verdict: "SAFE" | "SUSPICIOUS" | "PHISHING";
  confidence: number;
  reasons: string[];
  recommendation: string;
};

type UrlAnalysisResult = {
  url: string;
  domain: string;
  steps: AnalysisStep[];
  verdict: AiVerdict | null;
  status: "pending" | "analyzing" | "completed" | "error";
};

const C = {
  bg: "#f8f9fb",
  surface: "#ffffff",
  border: "#e2e8f0",
  borderFaint: "#edf2f7",
  violet: "#7c3aed",
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
  textDim: "#cbd5e1",
  green: "#059669",
  greenFaint: "rgba(5,150,105,0.08)",
  greenBorder: "rgba(5,150,105,0.2)",
  greenText: "#047857",
  amber: "#d97706",
  amberFaint: "rgba(217,119,6,0.08)",
  amberBorder: "rgba(217,119,6,0.2)",
  amberText: "#b45309",
  red: "#dc2626",
  redFaint: "rgba(220,38,38,0.06)",
  redBorder: "rgba(220,38,38,0.2)",
  redText: "#b91c1c",
  runningColor: "#7c3aed",
};

const verdictCfg = {
  SAFE: {
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.25)",
    badge: "#10b981",
    text: "#34d399",
    dot: "#10b981",
  },
  SUSPICIOUS: {
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.25)",
    badge: "#f59e0b",
    text: "#fbbf24",
    dot: "#f59e0b",
  },
  PHISHING: {
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.25)",
    badge: "#ef4444",
    text: "#f87171",
    dot: "#ef4444",
  },
};

function IconShield() {
  return (
    <svg width="16" height="16" fill="none" stroke="#fff" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

function Spinner({
  color = "#fff",
  size = 14,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `2px solid ${color}40`,
        borderTopColor: color,
        animation: "ti-spin 0.75s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}

function StepIcon({ status }: { status: AnalysisStep["status"] }) {
  const base: React.CSSProperties = {
    width: 16,
    height: 16,
    borderRadius: "50%",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  if (status === "completed")
    return (
      <div style={{ ...base, background: C.green }}>
        <svg width="9" height="9" fill="none" stroke="#fff" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3.5}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
    );
  if (status === "running") return <Spinner color={C.violet} size={16} />;
  if (status === "error")
    return (
      <div style={{ ...base, background: C.red }}>
        <svg width="9" height="9" fill="none" stroke="#fff" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
    );
  return <div style={{ ...base, border: "1px solid #334155" }} />;
}

export default function SidePanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [authStatus, setAuthStatus] = useState<
    "unknown" | "logged-out" | "otp-sent" | "logged-in"
  >("unknown");
  const [message, setMessage] = useState("");
  const [emailData, setEmailData] = useState<EmailData>(null);
  const [userId, setUserId] = useState("");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analyzingDomain, setAnalyzingDomain] = useState<string | null>(null);
  const [urlResults, setUrlResults] = useState<UrlAnalysisResult[]>([]);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const analysisRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const session = await fetchSession();
        if (session?.user?.email) {
          setAuthStatus("logged-in");
          setUserId(session.user.id || session.user.email);
        } else setAuthStatus("logged-out");
      } catch {
        setAuthStatus("logged-out");
      }
    })();
  }, []);

  useEffect(() => {
    if (authStatus === "logged-in" && !emailData && !isLoading) extractEmail();
  }, [authStatus]);

  // Auto-start analysis when email data is loaded
  useEffect(() => {
    if (
      authStatus === "logged-in" &&
      emailData &&
      emailData.links?.length > 0 &&
      !showAnalysis &&
      !analyzingDomain
    ) {
      handleAnalyseEmail();
    }
  }, [authStatus, emailData]);

  const extractDomain = (url: string): string | null => {
    try {
      return new URL(url).hostname;
    } catch {
      return url.match(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] ?? null;
    }
  };

  const extractEmail = async () => {
    setIsLoading(true);
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab.id) {
        setIsLoading(false);
        return;
      }
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "extractEmailDetails",
      });
      if (response.success && response.data) setEmailData(response.data);
    } catch {
      /* no email open */
    }
    setIsLoading(false);
  };

  const handleSendOtp = async () => {
    if (!email) {
      setMessage("Please provide email address");
      return;
    }
    setIsLoading(true);
    setMessage("Sending…");
    try {
      await sendOtp(email);
      setAuthStatus("otp-sent");
      setMessage("Code sent — check your email.");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!email || !otp) {
      setMessage("Email and OTP are required.");
      return;
    }
    setIsLoading(true);
    setMessage("Verifying…");
    try {
      const result = await verifyOtp(email, otp);
      if (result?.success) {
        setAuthStatus("logged-in");
        setUserId(email);
        setMessage("Verified!");
      } else setMessage("Verification failed.");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeSingleUrl = async (url: string, index: number) => {
    const domain = extractDomain(url);
    if (!domain) {
      setUrlResults((prev) =>
        prev.map((r, i) =>
          i === index ? { ...r, status: "error", steps: [] } : r,
        ),
      );
      return;
    }

    setUrlResults((prev) =>
      prev.map((r, i) =>
        i === index
          ? {
              ...r,
              domain,
              status: "analyzing",
              steps: [
                { id: "dns", title: "DNS Analysis", status: "running" },
                { id: "safebrowsing", title: "Safe Browsing", status: "pending" },
                { id: "ml", title: "ML Prediction", status: "pending" },
                { id: "ai", title: "Final Verdict", status: "pending" },
              ],
            }
          : r,
      ),
    );
    setAnalyzingDomain(domain);

    try {
      const response = await fetch("http://localhost:3000/api/ai-verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          userId,
          senderEmail: emailData?.senderEmail,
          emailSubject: emailData?.subject,
          emailBody: emailData?.body,
          links: emailData?.links,
        }),
      });
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";
        for (const block of events) {
          try {
            const eType = block.match(/event:\s*(\S+)/)?.[1];
            const raw = block.match(/data:\s*(\{.*\})/s)?.[1]?.trim();
            if (!eType || !raw || raw === "[DONE]") continue;
            const data = JSON.parse(raw);

            if (eType === "dns") {
              setUrlResults((prev) =>
                prev.map((r, i) =>
                  i === index
                    ? {
                        ...r,
                        steps: r.steps.map((s) =>
                          s.id === "dns"
                            ? {
                                ...s,
                                status: "completed",
                                data: { ...data.result, domain: data.domain },
                              }
                            : s.id === "safebrowsing"
                              ? { ...s, status: "running" }
                              : s,
                        ),
                      }
                    : r,
                ),
              );
            } else if (eType === "safebrowsing") {
              setUrlResults((prev) =>
                prev.map((r, i) =>
                  i === index
                    ? {
                        ...r,
                        steps: r.steps.map((s) =>
                          s.id === "safebrowsing"
                            ? { ...s, status: "completed", data }
                            : s.id === "ml"
                              ? { ...s, status: "running" }
                              : s,
                        ),
                      }
                    : r,
                ),
              );
            } else if (eType === "ml") {
              setUrlResults((prev) =>
                prev.map((r, i) =>
                  i === index
                    ? {
                        ...r,
                        steps: r.steps.map((s) =>
                          s.id === "ml"
                            ? { ...s, status: "completed", data }
                            : s.id === "ai"
                              ? { ...s, status: "running" }
                              : s,
                        ),
                      }
                    : r,
                ),
              );
            } else if (eType === "ai_final") {
              setUrlResults((prev) =>
                prev.map((r, i) =>
                  i === index
                    ? {
                        ...r,
                        verdict: data,
                        steps: r.steps.map((s) =>
                          s.id === "ai" ? { ...s, status: "completed", data } : s,
                        ),
                        status: "completed",
                      }
                    : r,
                ),
              );
              setAnalyzingDomain(null);
            } else if (eType === "error") {
              setUrlResults((prev) =>
                prev.map((r, i) =>
                  i === index
                    ? {
                        ...r,
                        status: "error",
                        steps: r.steps.map((s) =>
                          s.status === "running"
                            ? {
                                ...s,
                                status: "error",
                                details: data?.error || "Unknown error",
                              }
                            : s,
                        ),
                      }
                    : r,
                ),
              );
              setAnalyzingDomain(null);
            } else if (eType === "done") {
              setAnalyzingDomain(null);
            }
          } catch {
            /* continue */
          }
        }
      }
    } catch (error) {
      setUrlResults((prev) =>
        prev.map((r, i) =>
          i === index
            ? {
                ...r,
                status: "error",
                steps: r.steps.map((s) =>
                  s.status === "running"
                    ? { ...s, status: "error", details: (error as Error).message }
                    : s,
                ),
              }
            : r,
        ),
      );
      setAnalyzingDomain(null);
    }
  };

  const handleAnalyseEmail = async () => {
    if (!emailData || !emailData.links?.length || !userId) return;

    const initialResults: UrlAnalysisResult[] = emailData.links.map((link) => ({
      url: link,
      domain: extractDomain(link) || "",
      steps: [],
      verdict: null,
      status: "pending" as const,
    }));

    setUrlResults(initialResults);
    setCurrentUrlIndex(0);
    setShowAnalysis(true);
    setAnalyzingDomain(null);

    setTimeout(
      () => analysisRef.current?.scrollIntoView({ behavior: "smooth" }),
      100,
    );

    for (let i = 0; i < emailData.links.length; i++) {
      setCurrentUrlIndex(i);
      await analyzeSingleUrl(emailData.links[i], i);
    }
  };

  // ─── shared style helpers ───────────────────────────────────────────────────

  const card: React.CSSProperties = {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    overflow: "hidden",
  };

  const cardHead: React.CSSProperties = {
    padding: "7px 12px",
    borderBottom: `1px solid ${C.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const label10: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 500,
    color: C.textMuted,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 11px",
    background: "#f1f5f9",
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    color: C.textPrimary,
    fontSize: 12,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  };

  const primaryBtn: React.CSSProperties = {
    width: "100%",
    padding: "11px 0",
    background: C.violet,
    border: "none",
    borderRadius: 11,
    color: C.textPrimary,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const disabledBtn: React.CSSProperties = {
    background: "#1e2630",
    color: "#334155",
    cursor: "not-allowed",
  };

  // ─── render ─────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        height: "100vh",
        width: "100v%",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minHeight: 500,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: 13,
        color: C.textPrimary,
        boxSizing: "border-box",
      }}
    >
      <style>{`@keyframes ti-spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Header ── */}
      <div
        style={{
          padding: "16px 14px 13px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            background: C.violet,
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <IconShield />
        </div>
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: C.textPrimary,
              lineHeight: 1,
            }}
          >
            TrustInbox
          </div>
          <div
            style={{
              fontSize: 10,
              color: C.textMuted,
              marginTop: 3,
              letterSpacing: "0.05em",
              lineHeight: 1,
            }}
          >
            Phishing Detection
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px 10px 0",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {/* Auth panel */}
        {authStatus !== "logged-in" && (
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 14,
            }}
          >
            <div style={{ ...label10, marginBottom: 10 }}>Sign in</div>
            <input
              style={inputStyle}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isLoading}
            />
            <button
              style={{
                ...primaryBtn,
                marginTop: 8,
                ...(isLoading || authStatus === "otp-sent"
                  ? {
                      background: "#1e2630",
                      color: "#fff",
                      cursor: "not-allowed",
                    }
                  : {}),
              }}
              onClick={handleSendOtp}
              disabled={isLoading || authStatus === "otp-sent"}
            >
              {isLoading && authStatus === "logged-out"
                ? "Sending…"
                : "Send code"}
            </button>
            {authStatus === "otp-sent" && (
              <div
                style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: `1px solid ${C.border}`,
                }}
              >
                <input
                  style={{
                    ...inputStyle,
                    textAlign: "center",
                    letterSpacing: "0.3em",
                  }}
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="· · · · · ·"
                  disabled={isLoading}
                />
                <button
                  style={{
                    ...primaryBtn,
                    marginTop: 8,
                    background: "#1e2630",
                    color: "#fff",
                  }}
                  onClick={handleVerifyOtp}
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying…" : "Verify"}
                </button>
              </div>
            )}
            {message && (
              <p
                style={{
                  fontSize: 11,
                  marginTop: 8,
                  color:
                    message.includes("Error") || message.includes("fail")
                      ? C.redText
                      : C.greenText,
                }}
              >
                {message}
              </p>
            )}
          </div>
        )}

        {/* Logged-in states */}
        {authStatus === "logged-in" && (
          <>
            {/* No email */}
            {!emailData && (
              <div
                style={{
                  border: `1px dashed ${C.border}`,
                  borderRadius: 12,
                  padding: "24px 16px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: C.border,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 10px",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke={C.textMuted}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p style={{ fontSize: 12, color: C.textMuted }}>
                  No email open
                </p>
                <p style={{ fontSize: 10, color: C.textDim, marginTop: 3 }}>
                  Open a Gmail message to begin
                </p>
              </div>
            )}

            {/* Links */}
            {emailData && emailData.links?.length > 0 && (
              <div style={{ ...card, height: "50%" }}>
                <div style={cardHead}>
                  <span style={label10}>Links found</span>
                  <span
                    style={{
                      fontSize: 10,
                      color: C.textMuted,
                      background: C.border,
                      padding: "2px 6px",
                      borderRadius: 5,
                    }}
                  >
                    {emailData.links?.length}
                  </span>
                </div>
                <div style={{ overflowY: "auto" }}>
                  {emailData.links.map((link, i) => (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "7px 12px",
                        borderTop:
                          i === 0 ? "none" : `1px solid ${C.borderFaint}`,
                        textDecoration: "none",
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: C.violet,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 11,
                          color: C.textMuted,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {extractDomain(link) || link}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {emailData && emailData.links?.length === 0 && (
              <div
                style={{
                  border: `1px dashed ${C.border}`,
                  borderRadius: 12,
                  padding: "16px",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: 12, color: C.textMuted }}>
                  No links found in this email
                </p>
              </div>
            )}

            {/* Analysis */}
            {showAnalysis && urlResults.length > 0 && (
              <div
                ref={analysisRef}
                style={{ ...card, maxHeight: "70%", overflowY: "auto" }}
              >
                <div style={cardHead}>
                  <span style={label10}>
                    Analysis ({currentUrlIndex + 1}/{urlResults.length})
                  </span>
                  {analyzingDomain && (
                    <span
                      style={{
                        fontSize: 10,
                        color: C.runningColor,
                        maxWidth: 120,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {analyzingDomain}
                    </span>
                  )}
                </div>

                <div style={{ overflowY: "auto" }}>
                  {urlResults.map((result, rIdx) => (
                    <div key={rIdx}>
                      <div
                        style={{
                          padding: "8px 12px",
                          background:
                            rIdx === currentUrlIndex && result.status === "analyzing"
                              ? "rgba(99,102,241,0.08)"
                              : "transparent",
                          borderBottom: `1px solid ${C.borderFaint}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {result.status === "completed" && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          )}
                          {result.status === "analyzing" && <Spinner size={14} />}
                          {result.status === "error" && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M15 9l-6 6M9 9l6 6" />
                            </svg>
                          )}
                          {result.status === "pending" && (
                            <div style={{ width: 14, height: 14, borderRadius: "50%", background: C.border }} />
                          )}
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 500,
                              color: C.textPrimary,
                              maxWidth: 180,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {result.domain || result.url}
                          </span>
                        </div>
                        {result.verdict && (
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 600,
                              padding: "2px 6px",
                              borderRadius: 4,
                              background:
                                result.verdict.verdict === "SAFE"
                                  ? "rgba(16,185,129,0.15)"
                                  : result.verdict.verdict === "SUSPICIOUS"
                                    ? "rgba(245,158,11,0.15)"
                                    : "rgba(239,68,68,0.15)",
                              color:
                                result.verdict.verdict === "SAFE"
                                  ? C.greenText
                                  : result.verdict.verdict === "SUSPICIOUS"
                                    ? C.amberText
                                    : C.redText,
                            }}
                          >
                            {result.verdict.verdict}
                          </span>
                        )}
                      </div>

                      {result.status !== "pending" && result.steps.length > 0 && (
                        <div style={{ padding: "8px 12px", background: "rgba(0,0,0,0.02)" }}>
                          {result.steps.map((step, idx) => (
                            <div
                              key={step.id}
                              style={{
                                padding: "6px 0",
                                borderTop: idx === 0 ? "none" : `1px solid ${C.borderFaint}`,
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <StepIcon status={step.status} />
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 500,
                                    color: step.status === "completed" ? C.textPrimary : step.status === "running" ? C.runningColor : step.status === "error" ? C.redText : "#334155",
                                  }}
                                >
                                  {step.title}
                                </span>
                              </div>

                              {step.data && step.id === "dns" && (
                                <div style={{ marginTop: 4, marginLeft: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 8px" }}>
                                  {([
                                    { k: "Domain", v: (step.data as any).domain, c: C.textSecondary },
                                    { k: "Age", v: `${(step.data as any).age_days}d`, c: C.textSecondary },
                                    { k: "DNSSEC", v: (step.data as any).dnssec_valid ? "Valid" : "Unsigned", c: (step.data as any).dnssec_valid ? C.greenText : C.amberText },
                                    { k: "Flux", v: (step.data as any).flux_score, c: C.textSecondary },
                                    { k: "VT", v: (step.data as any).vt_malicious, c: (step.data as any).vt_malicious > 0 ? C.redText : C.greenText },
                                    { k: "Rep", v: (step.data as any).vt_reputation, c: C.textSecondary },
                                  ] as { k: string; v: unknown; c: string }[]).map(({ k, v, c }) => (
                                    <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                                      <span style={{ fontSize: 9, color: "#334155" }}>{k}</span>
                                      <span style={{ fontSize: 9, fontWeight: 500, color: c }}>{String(v)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {step.data && step.id === "safebrowsing" && (
                                <div style={{ marginTop: 4, marginLeft: 24 }}>
                                  <span style={{ fontSize: 9, fontWeight: 500, padding: "2px 6px", borderRadius: 4, background: (step.data as any).isSafe ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)", color: (step.data as any).isSafe ? C.greenText : C.redText }}>
                                    {(step.data as any).isSafe ? "Safe" : "Threats"}
                                  </span>
                                </div>
                              )}

                              {step.data && step.id === "ml" && (
                                <div style={{ marginTop: 4, marginLeft: 24, display: "flex", gap: 8 }}>
                                  <span style={{ fontSize: 9, fontWeight: 500, padding: "2px 6px", borderRadius: 4, background: (step.data as any).prediction === "good" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)", color: (step.data as any).prediction === "good" ? C.greenText : C.redText }}>
                                    {(step.data as any).prediction === "good" ? "Legitimate" : "Malicious"}
                                  </span>
                                  <span style={{ fontSize: 9, color: C.textMuted }}>{Math.round((step.data as any).raw?.good * 100)}%</span>
                                </div>
                              )}

                              {step.details && <p style={{ marginTop: 2, marginLeft: 24, fontSize: 9, color: C.redText }}>{step.details}</p>}
                            </div>
                          ))}

                          {result.verdict && (() => {
                            const cfg = verdictCfg[result.verdict.verdict] ?? verdictCfg.SUSPICIOUS;
                            return (
                              <div style={{ margin: "8px 0", borderRadius: 8, padding: "8px 10px", border: `1px solid ${cfg.border}`, background: cfg.bg }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                  <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", background: cfg.badge, padding: "2px 6px", borderRadius: 4 }}>{result.verdict.verdict}</span>
                                  <span style={{ fontSize: 9, color: C.textMuted }}>{Math.round(result.verdict.confidence * 100)}%</span>
                                </div>
                                <p style={{ fontSize: 10, color: cfg.text, marginBottom: 4, lineHeight: 1.4 }}>{result.verdict.recommendation}</p>
                                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                  {result.verdict.reasons.map((r, i) => (
                                    <div key={i} style={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
                                      <div style={{ width: 3, height: 3, borderRadius: "50%", background: cfg.dot, marginTop: 4, flexShrink: 0 }} />
                                      <span style={{ fontSize: 9, color: C.textMuted, lineHeight: 1.4 }}>{r}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div style={{ height: 4, flexShrink: 0 }} />
      </div>

      {/* ── Footer ── */}
      {authStatus === "logged-in" && (
        <div
          style={{
            padding: "10px 10px 14px",
            borderTop: `1px solid ${C.border}`,
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            style={{
              ...primaryBtn,
              ...(!emailData ||
              !emailData.links?.length ||
              analyzingDomain !== null
                ? disabledBtn
                : {}),
            }}
            onClick={handleAnalyseEmail}
            disabled={
              !emailData || !emailData.links?.length || analyzingDomain !== null
            }
          >
            {analyzingDomain ? (
              <>
                <Spinner />
                <span>Analysing…</span>
              </>
            ) : (
              <>
                <svg
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <span>Analyse email</span>
              </>
            )}
          </button>
          <p
            style={{
              fontSize: 10,
              color: C.textDim,
              textAlign: "center",
              marginTop: 6,
            }}
          >
            TrustInbox © 2026
          </p>
        </div>
      )}
    </div>
  );
}
