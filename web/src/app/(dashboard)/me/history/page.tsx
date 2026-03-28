"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "@/lib/auth/context";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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

interface ParsedVerdict {
  verdict: string;
  confidence: number;
  recommendation: string;
  reasons: string[];
}

function safeParse<T>(value: string | null): T | null {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function HistorySidebar({
  item,
  open,
  onClose,
}: {
  item: HistoryItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const parsedData = useMemo(() => {
    if (!item)
      return {
        verdict: null,
        links: [],
        dns: null,
        safeBrowsing: null,
        ml: null,
      };

    return {
      verdict: safeParse<ParsedVerdict>(item.finalAiVerdict),
      links: safeParse<string[]>(item.links) || [],
      dns: safeParse<any>(item.dnsLookupResult),
      safeBrowsing: safeParse<any>(item.googleSafeBrowsingResult),
      ml: safeParse<any>(item.mlResponse),
    };
  }, [item]);

  if (!item) return null;

  const { verdict, links, dns, safeBrowsing, ml } = parsedData;

  const getVerdictVariant = (
    v: string,
  ): "default" | "destructive" | "secondary" => {
    if (v === "SAFE") return "default";
    if (v === "SUSPICIOUS") return "secondary";
    return "destructive";
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetTrigger>
        <button className="text-sm text-muted-foreground hover:text-foreground">
          View Details
        </button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="mb-4">
          <SheetTitle>Analysis Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 px-6 overflow-y-auto">
          {verdict && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={getVerdictVariant(verdict.verdict)}>
                  {verdict.verdict}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {Math.round((verdict.confidence || 0) * 100)}% confidence
                </span>
              </div>
              <p className="text-sm">{verdict.recommendation}</p>
              {verdict.reasons?.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {verdict.reasons.map((r, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-muted-foreground flex items-start gap-2"
                    >
                      <span className="mt-0.5">•</span> {r}
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
                {links.map((link, idx) => (
                  <a
                    key={idx}
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
                  <span className="text-muted-foreground">Flux:</span>{" "}
                  {dns.flux_score}
                </p>
                <p>
                  <span className="text-muted-foreground">VT Mal:</span>{" "}
                  {dns.vt_malicious}
                </p>
                <p>
                  <span className="text-muted-foreground">Rep:</span>{" "}
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
                ({Math.round((ml.raw?.good ?? 0) * 100)}% good)
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
      </SheetContent>
    </Sheet>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6 p-8">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const { user } = useSession();

  useEffect(() => {
    async function fetchHistory() {
      if (!user) {
        setLoading(false);
        return;
      }

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

  if (loading) return <LoadingState />;

  if (history.length === 0) {
    return <div className="p-8">No history yet</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <div className="grid gap-3">
        {history.map((item) => (
          <Card
            key={item.id}
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setSelectedItem(item)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {item.senderEmail || "Unknown"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : "Unknown Date"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <HistorySidebar
        item={selectedItem}
        open={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
