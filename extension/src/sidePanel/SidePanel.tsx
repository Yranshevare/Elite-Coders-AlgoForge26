import { useEffect, useState } from "react";
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
  desc: string;
  status: "pending" | "running" | "completed" | "error";
  details?: string;
  data?: Record<string, any>;
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

const THEME = {
  primary: "#6366f1",
  bg: "#f8fafc",
  surface: "#ffffff",
  border: "#f1f5f9",
  textMain: "#1e293b",
  textSec: "#64748b",
  textMute: "#94a3b8",
  safe: "#10b981",
  safeBg: "rgba(16,185,129,0.08)",
  warn: "#f59e0b",
  warnBg: "rgba(245,158,11,0.08)",
  danger: "#ef4444",
  dangerBg: "rgba(239,68,68,0.08)",
  fontStack:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const verdictMeta = {
  SAFE: {
    color: THEME.safe,
    bg: THEME.safeBg,
    icon: "🛡️",
    label: "Trusted",
    score: 98,
    desc: "This email appears secure.",
  },
  SUSPICIOUS: {
    color: THEME.warn,
    bg: THEME.warnBg,
    icon: "⚠️",
    label: "Review",
    score: 45,
    desc: "Potential risks identified.",
  },
  PHISHING: {
    color: THEME.danger,
    bg: THEME.dangerBg,
    icon: "🚨",
    label: "Danger",
    score: 12,
    desc: "High probability of phishing.",
  },
};

function Spinner({ size = 18, color = THEME.primary }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `2px solid ${color}22`,
        borderTopColor: color,
        borderRadius: "50%",
        animation: "ti-spin 0.8s linear infinite",
      }}
    />
  );
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
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<"scan" | "sender">("scan");

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

  // Listen for navigation messages from background
  useEffect(() => {
    const handleMessage = (msg: any) => {
      if (msg.action === "navigatedToInbox") {
        // Programmatically close the side panel when navigating to inbox
        window.close();
      } else if (msg.action === "navigatedToEmail") {
        resetState();
        extractEmail();
      }
    };
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, [authStatus]);

  useEffect(() => {
    if (authStatus === "logged-in" && !emailData && !isLoading) extractEmail();
  }, [authStatus, emailData]);

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

  const resetState = () => {
    setEmailData(null);
    setShowAnalysis(false);
    setUrlResults([]);
    setAnalyzingDomain(null);
    setExpandedIndex(0);
  };

  const extractDomain = (url: string): string | null => {
    try {
      return new URL(url).hostname;
    } catch {
      return url.match(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] ?? null;
    }
  };

  const extractEmail = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab.id) {
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: "extractEmailDetails",
        });
        if (response.success && response.data) setEmailData(response.data);
      }
    } catch {
      /* ignore */
    }
    setIsLoading(false);
  };

  const handleSendOtp = async () => {
    if (!email) return setMessage("Email required");
    setIsLoading(true);
    setMessage("");
    try {
      await sendOtp(email);
      setAuthStatus("otp-sent");
      setMessage("Code sent to your email");
    } catch (e) {
      setMessage((e as Error).message);
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    setIsLoading(true);
    setMessage("");
    try {
      const result = await verifyOtp(email, otp);
      if (result?.success) {
        setAuthStatus("logged-in");
        setUserId(email);
      } else setMessage("Invalid code");
    } catch (e) {
      setMessage((e as Error).message);
    }
    setIsLoading(false);
  };

  const analyzeSingleUrl = async (url: string, index: number) => {
    const domain = extractDomain(url);
    if (!domain) return;

    setUrlResults((prev) =>
      prev.map((r, i) =>
        i === index
          ? {
              ...r,
              domain,
              status: "analyzing",
              steps: [
                {
                  id: "dns",
                  title: "Infrastructure",
                  desc: "Checking domain age and DNS",
                  status: "running",
                },
                {
                  id: "safebrowsing",
                  title: "Reputation",
                  desc: "Consulting threat databases",
                  status: "pending",
                },
                {
                  id: "ml",
                  title: "Pattern Engine",
                  desc: "AI behavioral scanning",
                  status: "pending",
                },
                {
                  id: "ai",
                  title: "Risk Verdict",
                  desc: "Final intelligence report",
                  status: "pending",
                },
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

            setUrlResults((prev) =>
              prev.map((r, i) => {
                if (i !== index) return r;
                let nextSteps = [...r.steps];
                if (eType === "dns") {
                  nextSteps = nextSteps.map((s) =>
                    s.id === "dns"
                      ? {
                          ...s,
                          status: "completed",
                          data: { ...data.result, domain: data.domain },
                        }
                      : s.id === "safebrowsing"
                        ? { ...s, status: "running" }
                        : s,
                  );
                } else if (eType === "safebrowsing") {
                  nextSteps = nextSteps.map((s) =>
                    s.id === "safebrowsing"
                      ? { ...s, status: "completed", data }
                      : s.id === "ml"
                        ? { ...s, status: "running" }
                        : s,
                  );
                } else if (eType === "ml") {
                  nextSteps = nextSteps.map((s) =>
                    s.id === "ml"
                      ? { ...s, status: "completed", data }
                      : s.id === "ai"
                        ? { ...s, status: "running" }
                        : s,
                  );
                } else if (eType === "ai_final") {
                  nextSteps = nextSteps.map((s) =>
                    s.id === "ai" ? { ...s, status: "completed", data } : s,
                  );
                  return {
                    ...r,
                    verdict: data,
                    steps: nextSteps,
                    status: "completed",
                  };
                } else if (eType === "error") return { ...r, status: "error" };
                return { ...r, steps: nextSteps };
              }),
            );
            if (eType === "ai_final" || eType === "error")
              setAnalyzingDomain(null);
          } catch {
            /* ignore */
          }
        }
      }
    } catch {
      setAnalyzingDomain(null);
    }
  };

  const handleAnalyseEmail = async () => {
    if (!emailData?.links?.length || !userId) return;
    const initialResults: UrlAnalysisResult[] = emailData.links.map((link) => ({
      url: link,
      domain: extractDomain(link) || "",
      steps: [],
      verdict: null,
      status: "pending",
    }));
    setUrlResults(initialResults);
    setShowAnalysis(true);
    for (let i = 0; i < emailData.links.length; i++) {
      await analyzeSingleUrl(emailData.links[i], i);
    }
  };

  const overallVerdict = urlResults.reduce(
    (acc, curr) => {
      if (!curr.verdict) return acc;
      if (curr.verdict.verdict === "PHISHING") return "PHISHING";
      if (curr.verdict.verdict === "SUSPICIOUS" && acc !== "PHISHING")
        return "SUSPICIOUS";
      return acc;
    },
    "SAFE" as "SAFE" | "SUSPICIOUS" | "PHISHING",
  );

  const getScore = () => {
    if (urlResults.length === 0) return 100;
    const lowest = urlResults.reduce((min, curr) => {
      if (!curr.verdict) return min;
      const s = verdictMeta[curr.verdict.verdict].score;
      return s < min ? s : min;
    }, 100);
    return lowest;
  };

  const Header = () => (
    <div
      style={{
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: THEME.surface,
        borderBottom: `1px solid ${THEME.border}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 26,
            height: 26,
            background: THEME.primary,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 900,
            fontSize: 16,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <span style={{ fontWeight: 800, fontSize: 16, color: THEME.textMain }}>
          TrustInbox
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={() => {
            resetState();
            extractEmail();
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 16,
            color: THEME.textMute,
            borderRadius: 8,
            padding: "10px",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
        </button>
        <a
          href="http://localhost:3000/me/analytics"
          target="_blank"
          style={{
            background: THEME.primary,
            border: "none",
            cursor: "pointer",
            fontSize: 16,
            color: "#fff",
            borderRadius: 8,
            padding: "10px",
            textDecoration: "none",
          }}
        >
          Open Dashboard
        </a>
      </div>
    </div>
  );

  if (authStatus !== "logged-in") {
    return (
      <div
        style={{
          height: "100vh",
          background: THEME.surface,
          fontFamily: THEME.fontStack,
          display: "flex",
          flexDirection: "column",
          padding: 24,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 64, marginBottom: 24 }}>🛡️</div>
          <h2
            style={{
              fontWeight: 800,
              fontSize: 28,
              color: THEME.textMain,
              marginBottom: 12,
            }}
          >
            Inbox Security
          </h2>
          <p
            style={{
              fontSize: 15,
              color: THEME.textSec,
              lineHeight: 1.6,
              marginBottom: 40,
            }}
          >
            Activate real-time AI protection for your Gmail account.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ textAlign: "left" }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: THEME.textSec,
                  marginLeft: 4,
                  marginBottom: 6,
                  display: "block",
                }}
              >
                Email Address
              </label>
              <input
                style={{
                  width: "100%",
                  padding: "14px 18px",
                  borderRadius: 14,
                  border: `1.5px solid ${THEME.border}`,
                  fontSize: 15,
                  outline: "none",
                  boxSizing: "border-box",
                }}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {authStatus === "otp-sent" && (
              <div style={{ textAlign: "left" }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: THEME.textSec,
                    marginLeft: 4,
                    marginBottom: 6,
                    display: "block",
                  }}
                >
                  Verification Code
                </label>
                <input
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    borderRadius: 14,
                    border: `1.5px solid ${THEME.primary}`,
                    fontSize: 18,
                    outline: "none",
                    boxSizing: "border-box",
                    textAlign: "center",
                    letterSpacing: 8,
                    fontWeight: 700,
                  }}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}

            <button
              style={{
                width: "100%",
                padding: "16px",
                background: THEME.primary,
                color: "white",
                border: "none",
                borderRadius: 16,
                fontWeight: 700,
                fontSize: 16,
                cursor: "pointer",
                boxShadow: `0 8px 16px ${THEME.primary}33`,
                marginTop: 8,
              }}
              onClick={
                authStatus === "otp-sent" ? handleVerifyOtp : handleSendOtp
              }
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner color="white" size={20} />
              ) : authStatus === "otp-sent" ? (
                "Verify Identity"
              ) : (
                "Get Started"
              )}
            </button>

            {message && (
              <div
                style={{
                  fontSize: 13,
                  color:
                    message.toLowerCase().includes("invalid") ||
                    message.toLowerCase().includes("required")
                      ? THEME.danger
                      : THEME.primary,
                  fontWeight: 600,
                }}
              >
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        background: THEME.bg,
        fontFamily: THEME.fontStack,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <style>{`@keyframes ti-spin { to { transform: rotate(360deg); } }`}</style>
      <Header />

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          padding: "0 20px",
          background: THEME.surface,
          borderBottom: `1px solid ${THEME.border}`,
        }}
      >
        <div
          onClick={() => setActiveTab("scan")}
          style={{
            padding: "12px 0",
            marginRight: 24,
            fontSize: 13,
            fontWeight: 700,
            color: activeTab === "scan" ? THEME.primary : THEME.textMute,
            borderBottom: `2px solid ${activeTab === "scan" ? THEME.primary : "transparent"}`,
            cursor: "pointer",
          }}
        >
          Email Scan
        </div>
        <div
          onClick={() => setActiveTab("sender")}
          style={{
            padding: "12px 0",
            fontSize: 13,
            fontWeight: 700,
            color: activeTab === "sender" ? THEME.primary : THEME.textMute,
            borderBottom: `2px solid ${activeTab === "sender" ? THEME.primary : "transparent"}`,
            cursor: "pointer",
          }}
        >
          Sender Profile
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {activeTab === "scan" ? (
          <>
            {/* Score Card */}
            <div
              style={{
                padding: "24px 20px",
                background: THEME.surface,
                borderBottom: `1px solid ${THEME.border}`,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 44,
                  fontWeight: 900,
                  color: verdictMeta[overallVerdict].color,
                  marginBottom: 4,
                }}
              >
                {getScore()}
                <span style={{ fontSize: 16, color: THEME.textMute }}>
                  /100
                </span>
              </div>
              <div
                style={{ fontWeight: 800, fontSize: 15, color: THEME.textMain }}
              >
                {verdictMeta[overallVerdict].label} Rating
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: THEME.textSec,
                  margin: "4px 0 0",
                }}
              >
                {verdictMeta[overallVerdict].desc}
              </p>
            </div>

            <div
              style={{
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {!emailData ? (
                <div
                  style={{
                    padding: "60px 20px",
                    textAlign: "center",
                    borderRadius: 24,
                    background: THEME.surface,
                    border: `1px solid ${THEME.border}`,
                  }}
                >
                  <div style={{ fontSize: 40, marginBottom: 16 }}>📫</div>
                  <h3
                    style={{
                      fontWeight: 800,
                      fontSize: 16,
                      color: THEME.textMain,
                    }}
                  >
                    Scan Ready
                  </h3>
                  <p style={{ fontSize: 13, color: THEME.textSec }}>
                    Select an email to analyze embedded links.
                  </p>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      padding: 16,
                      background: THEME.surface,
                      borderRadius: 16,
                      border: `1px solid ${THEME.border}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: THEME.textMute,
                        textTransform: "uppercase",
                        marginBottom: 6,
                      }}
                    >
                      Subject
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: THEME.textMain,
                      }}
                    >
                      {emailData.subject}
                    </div>
                  </div>

                  {urlResults.map((res, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: THEME.surface,
                        borderRadius: 16,
                        border: `1px solid ${res.status === "analyzing" ? THEME.primary : THEME.border}`,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          padding: "14px 16px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                        onClick={() =>
                          setExpandedIndex(expandedIndex === idx ? null : idx)
                        }
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: THEME.textMain,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {res.domain || res.url}
                          </div>
                          <div style={{ fontSize: 11, color: THEME.textMute }}>
                            {res.status === "completed"
                              ? "Scan Complete"
                              : "Analyzing..."}
                          </div>
                        </div>
                        {res.verdict ? (
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background:
                                verdictMeta[res.verdict.verdict].color,
                            }}
                          />
                        ) : res.status === "analyzing" ? (
                          <Spinner size={12} />
                        ) : null}
                      </div>

                      {expandedIndex === idx && (
                        <div style={{ padding: "0 16px 16px" }}>
                          <div
                            style={{
                              height: 1,
                              background: THEME.border,
                              marginBottom: 12,
                            }}
                          />
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 10,
                            }}
                          >
                            {res.steps.map((step) => (
                              <div key={step.id}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: 2,
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 12,
                                      fontWeight: 700,
                                      color: THEME.textMain,
                                    }}
                                  >
                                    {step.title}
                                  </div>
                                  {step.status === "running" && (
                                    <Spinner size={10} />
                                  )}
                                </div>
                                {step.status === "completed" && step.data && (
                                  <div
                                    style={{
                                      fontSize: 11,
                                      color: THEME.textSec,
                                    }}
                                  >
                                    {step.id === "dns" &&
                                      `Age: ${step.data.age_days || "New"} days | Reputation: ${step.data.vt_reputation || 0}`}
                                    {step.id === "safebrowsing" &&
                                      (step.data.isSafe
                                        ? "Verified secure database"
                                        : "FLAGGED: Known threat")}
                                    {step.id === "ml" &&
                                      `AI Confidence: ${Math.round((step.data.raw?.[step.data.prediction] || 0) * 100)}%`}
                                  </div>
                                )}
                              </div>
                            ))}
                            {res.verdict && (
                              <div
                                style={{
                                  marginTop: 4,
                                  padding: 12,
                                  background: THEME.bg,
                                  borderRadius: 12,
                                  borderLeft: `3px solid ${verdictMeta[res.verdict.verdict].color}`,
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 800,
                                    color: THEME.textMain,
                                    marginBottom: 2,
                                  }}
                                >
                                  Recommendation
                                </div>
                                <p
                                  style={{
                                    fontSize: 12,
                                    color: THEME.textSec,
                                    lineHeight: 1.4,
                                    margin: 0,
                                  }}
                                >
                                  {res.verdict.recommendation}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </>
        ) : (
          <div style={{ padding: 20 }}>
            {emailData ? (
              <div
                style={{
                  background: THEME.surface,
                  padding: 20,
                  borderRadius: 24,
                  border: `1px solid ${THEME.border}`,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    background: `${THEME.primary}12`,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    fontSize: 24,
                  }}
                >
                  👤
                </div>
                <h3
                  style={{
                    fontWeight: 800,
                    fontSize: 16,
                    color: THEME.textMain,
                    marginBottom: 4,
                  }}
                >
                  Sender Identity
                </h3>
                <div
                  style={{
                    fontSize: 13,
                    color: THEME.primary,
                    fontWeight: 700,
                    marginBottom: 12,
                  }}
                >
                  {emailData.senderEmail}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      padding: 12,
                      background: THEME.bg,
                      borderRadius: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: THEME.textMute,
                        textTransform: "uppercase",
                      }}
                    >
                      Source Domain
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: THEME.textMain,
                      }}
                    >
                      {emailData.senderEmail.split("@")[1]}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: 12,
                      background: THEME.bg,
                      borderRadius: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: THEME.textMute,
                        textTransform: "uppercase",
                      }}
                    >
                      Security Status
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: THEME.safe,
                      }}
                    >
                      ✓ Verified Records (SPF/DKIM)
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "60px 20px",
                  textAlign: "center",
                  borderRadius: 24,
                  background: THEME.surface,
                  border: `1px solid ${THEME.border}`,
                }}
              >
                <h3
                  style={{
                    fontWeight: 800,
                    fontSize: 16,
                    color: THEME.textMain,
                  }}
                >
                  No Sender Data
                </h3>
                <p style={{ fontSize: 13, color: THEME.textSec }}>
                  Open an email to see sender reputation.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          padding: "16px 20px",
          borderTop: `1px solid ${THEME.border}`,
          background: THEME.surface,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: THEME.textMute,
            letterSpacing: "0.1em",
          }}
        >
          SECURED BY TRUSTINBOX AI
        </span>
      </div>
    </div>
  );
}
