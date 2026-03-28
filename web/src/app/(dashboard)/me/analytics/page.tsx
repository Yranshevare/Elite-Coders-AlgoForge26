"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "@/lib/auth/context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const chartConfig = {
  safe: { label: "Safe", color: "hsl(142, 76%, 36%)" },
  suspicious: { label: "Suspicious", color: "hsl(45, 93%, 47%)" },
  malicious: { label: "Malicious", color: "hsl(0, 84%, 60%)" },
  total: { label: "Total Analyzed", color: "hsl(221, 83%, 53%)" },
};

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

interface Verdict {
  verdict: string;
  confidence: number;
  recommendation: string;
  reasons: string[];
}

function parseVerdict(verdictJson: string | null): Verdict | null {
  if (!verdictJson) return null;
  try {
    return JSON.parse(verdictJson);
  } catch {
    return null;
  }
}

function getDayName(timestamp: number): string {
  const date = new Date(timestamp);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getDay()];
}

function getMonthName(timestamp: number): string {
  const date = new Date(timestamp);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[date.getMonth()];
}

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}

function StatsCard({ title, value, description, icon }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6 p-8">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[250px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="space-y-6 p-8">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Overview of your email security analysis
        </p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-muted-foreground/50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium text-muted-foreground mb-2">
            No data yet
          </p>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Run some simulations to see your analytics data
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AnalyticsPage() {
  const { user, loading: sessionLoading } = useSession();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  const stats = useMemo(() => {
    const items = history;
    
    let safe = 0;
    let suspicious = 0;
    let malicious = 0;

    items.forEach((item) => {
      const verdict = parseVerdict(item.finalAiVerdict);
      if (verdict) {
        if (verdict.verdict === "SAFE") safe++;
        else if (verdict.verdict === "SUSPICIOUS") suspicious++;
        else malicious++;
      }
    });

    const total = safe + suspicious + malicious;
    const threatRate = total > 0 ? Math.round((malicious / total) * 100) : 0;

    return { safe, suspicious, malicious, total, threatRate };
  }, [history]);

  const weeklyData = useMemo(() => {
    const now = Date.now();
    const days: Record<string, { safe: number; suspicious: number; malicious: number }> = {};
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dayKey = date.toDateString();
      days[dayKey] = { safe: 0, suspicious: 0, malicious: 0 };
    }

    history.forEach((item) => {
      if (!item.createdAt) return;
      const itemDate = new Date(item.createdAt).toDateString();
      if (days[itemDate]) {
        const verdict = parseVerdict(item.finalAiVerdict);
        if (verdict) {
          if (verdict.verdict === "SAFE") days[itemDate].safe++;
          else if (verdict.verdict === "SUSPICIOUS") days[itemDate].suspicious++;
          else days[itemDate].malicious++;
        }
      }
    });

    return Object.entries(days).map(([date, data]) => ({
      day: getDayName(new Date(date).getTime()),
      ...data,
    }));
  }, [history]);

  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    
    history.forEach((item) => {
      if (!item.createdAt) return;
      const monthKey = getMonthName(item.createdAt);
      months[monthKey] = (months[monthKey] || 0) + 1;
    });

    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const currentMonth = now.getMonth();
    
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthName = monthOrder[monthIndex];
      last6Months.push({
        month: monthName,
        total: months[monthName] || 0,
      });
    }

    return last6Months;
  }, [history]);

  const verdictData = useMemo(() => {
    const total = stats.safe + stats.suspicious + stats.malicious;
    if (total === 0) return [];
    
    return [
      { name: "Safe", value: stats.safe, color: "hsl(142, 76%, 36%)" },
      { name: "Suspicious", value: stats.suspicious, color: "hsl(45, 93%, 47%)" },
      { name: "Malicious", value: stats.malicious, color: "hsl(0, 84%, 60%)" },
    ];
  }, [stats]);

  if (sessionLoading || loading) {
    return <LoadingState />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-[350px]">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <p className="text-muted-foreground text-center">
                Please log in to view this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (history.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6 p-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Overview of your email security analysis
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Analyzed"
          value={stats.total}
          description="Emails analyzed"
          icon={
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-500"
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
          }
        />
        <StatsCard
          title="Safe Emails"
          value={stats.safe}
          description="Legitimate emails detected"
          icon={
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-green-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          }
        />
        <StatsCard
          title="Threat Rate"
          value={`${stats.threatRate}%`}
          description="Malicious emails detected"
          icon={
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-red-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          }
        />
        <StatsCard
          title="Suspicious"
          value={stats.suspicious}
          description="Requires attention"
          icon={
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-yellow-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Analysis</CardTitle>
            <CardDescription>
              Breakdown of analyzed emails by verdict
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ fill: "hsl(var(--muted))" }}
                />
                <Bar dataKey="safe" stackId="a" fill="var(--color-safe)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="suspicious" stackId="a" fill="var(--color-suspicious)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="malicious" stackId="a" fill="var(--color-malicious)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
            <CardDescription>Total emails analyzed per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1 }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="var(--color-total)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-total)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verdict Distribution</CardTitle>
            <CardDescription>Overall breakdown of analysis results</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <PieChart>
                <Pie
                  data={verdictData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {verdictData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`${value}`, "Count"]}
                />
              </PieChart>
            </ChartContainer>
            <div className="flex justify-center gap-4 mt-4">
              {verdictData.map((entry) => {
                const percentage = stats.total > 0 ? Math.round((entry.value / stats.total) * 100) : 0;
                return (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {entry.name} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest email analyses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.slice(0, 5).map((item) => {
                const verdict = parseVerdict(item.finalAiVerdict);
                return (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {item.senderEmail || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Unknown"}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        verdict?.verdict === "SAFE"
                          ? "bg-green-100 text-green-700"
                          : verdict?.verdict === "SUSPICIOUS"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {verdict?.verdict || "UNKNOWN"}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
