"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth/context";
import { useRouter } from "next/navigation";

interface HistoryItem {
  id: string;
  userId: string;
  senderEmail: string | null;
  emailSubject: string | null;
  emailBody: string | null;
  links: string | null;
  createdAt: number | null;
  llmPrediction: string;
  dnsLookupResult: string | null;
  googleSafeBrowsingResult: string | null;
  mlResponse: string | null;
  finalAiVerdict: string | null;
  attachmentCount: number;
}

function HistorySidebar({
  item,
  onClose,
}: {
  item: HistoryItem;
  onClose: () => void;
}) {
  const verdict = item.finalAiVerdict ? JSON.parse(item.finalAiVerdict) : null;
  const links = item.links ? JSON.parse(item.links) : [];
  const dns = item.dnsLookupResult ? JSON.parse(item.dnsLookupResult) : null;
  const safeBrowsing = item.googleSafeBrowsingResult
    ? JSON.parse(item.googleSafeBrowsingResult)
    : null;
  const ml = item.mlResponse ? JSON.parse(item.mlResponse) : null;

  const getVerdictColor = (v: string) => {
    if (v === "SAFE") return "bg-green-500";
    if (v === "SUSPICIOUS") return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-background shadow-xl overflow-y-auto border-l">
        <div className="sticky top-0 bg-background/95 backdrop-blot border-b p-4 flex items-center justify-between">
          <h3 className="font-semibold text-lg">Analysis Details</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {verdict && (
            <div
              className={`p-4 rounded-lg border ${getVerdictColor(verdict.verdict)}/10`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-bold text-white ${getVerdictColor(verdict.verdict)}`}
                >
                  {verdict.verdict}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(verdict.confidence * 100)}% confidence
                </span>
              </div>
              <p className="text-sm">{verdict.recommendation}</p>
              {verdict.reasons.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {verdict.reasons.map((r: string, i: number) => (
                    <li
                      key={i}
                      className="text-xs text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-muted-foreground mt-0.5">•</span>{" "}
                      {r}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Email Info</h4>
            <div className="text-sm space-y-2">
              <p>
                <span className="text-muted-foreground">From:</span>{" "}
                {item.senderEmail || "Unknown"}
              </p>
              <p>
                <span className="text-muted-foreground">Subject:</span>{" "}
                {item.emailSubject || "N/A"}
              </p>
              {item.emailBody && (
                <p className="text-muted-foreground text-xs line-clamp-3">
                  {item.emailBody.slice(0, 200)}...
                </p>
              )}
            </div>
          </div>

          {links.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Links ({links.length})</h4>
              <div className="space-y-1">
                {links.map((link: string, i: number) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-blue-500 hover:underline truncate"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          )}

          {dns && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">DNS Analysis</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <p>
                  <span className="text-muted-foreground">Domain:</span>{" "}
                  {dns.domain}
                </p>
                <p>
                  <span className="text-muted-foreground">Age:</span>{" "}
                  {dns.age_days}d
                </p>
                <p>
                  <span className="text-muted-foreground">DNSSEC:</span>{" "}
                  {dns.dnssec_valid ? "Valid" : "Unsigned"}
                </p>
                <p>
                  <span className="text-muted-foreground">Flux Score:</span>{" "}
                  {dns.flux_score}
                </p>
                <p>
                  <span className="text-muted-foreground">VT Malicious:</span>{" "}
                  {dns.vt_malicious}
                </p>
                <p>
                  <span className="text-muted-foreground">Reputation:</span>{" "}
                  {dns.vt_reputation}
                </p>
              </div>
            </div>
          )}

          {safeBrowsing && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Safe Browsing</h4>
              <p
                className={`text-xs ${safeBrowsing.isSafe ? "text-green-500" : "text-red-500"}`}
              >
                {safeBrowsing.isSafe ? "No threats detected" : "Threats found"}
              </p>
            </div>
          )}

          {ml && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">ML Prediction</h4>
              <p
                className={`text-xs ${ml.prediction === "good" ? "text-green-500" : "text-red-500"}`}
              >
                {ml.prediction === "good"
                  ? "Looks legitimate"
                  : "Likely malicious"}{" "}
                ({Math.round(ml.raw?.good * 100)}% good)
              </p>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Analyzed:{" "}
            {item.createdAt
              ? new Date(item.createdAt).toLocaleString()
              : "Unknown"}
          </p>
        </div>
      </div>
    </>
  );
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const { user } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;

      try {
        const res = await fetch(`/api/history?userId=${user.id}`);
        const data = await res.json();
        if (res.ok) {
          setHistory(data.history || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading history...</p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="space-y-6 p-8">
        <div className="space-y-1 flex gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-start flex-col">
            <h2 className="text-xl font-semibold">Analysis History</h2>
            <p className="text-sm text-muted-foreground ">
              Your analyzed emails and domains
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-muted-foreground/50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium text-muted-foreground mb-2">
            No history yet
          </p>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Run a simulation first to start building your analysis history
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Analysis History</h2>
        </div>
        <p className="text-sm text-muted-foreground ml-10">
          Your analyzed emails and domains
        </p>
      </div>

      <div className="grid gap-3">
        {history.map((item, index) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            onKeyDown={(e) => e.key === "Enter" && setSelectedItem(item)}
            role="button"
            tabIndex={0}
            className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-all duration-200 ease-out active:scale-[0.98] cursor-pointer"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(8px)",
              transitionDelay: mounted ? `${index * 50}ms` : "0ms",
              transitionDuration: "300ms",
              transitionProperty: "opacity, transform, background-color",
            }}
          >
            <div className="min-w-0 flex-1 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {item.senderEmail || `Report - ${index}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Unknown Date"}
                </p>
              </div>
            </div>
            <svg
              className="w-4 h-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        ))}
      </div>

      {selectedItem && (
        <HistorySidebar
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
