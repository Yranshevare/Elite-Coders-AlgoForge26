"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth/context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const chartConfig = {
  safe: { label: "Safe", color: "hsl(142, 76%, 36%)" },
  suspicious: { label: "Suspicious", color: "hsl(45, 93%, 47%)" },
  malicious: { label: "Malicious", color: "hsl(0, 84%, 60%)" },
  total: { label: "Total Analyzed", color: "hsl(221, 83%, 53%)" },
  daily: { label: "Daily", color: "hsl(221, 83%, 53%)" },
};

const weeklyData = [
  { day: "Mon", safe: 12, suspicious: 3, malicious: 1 },
  { day: "Tue", safe: 19, suspicious: 5, malicious: 2 },
  { day: "Wed", safe: 15, suspicious: 2, malicious: 0 },
  { day: "Thu", safe: 22, suspicious: 4, malicious: 3 },
  { day: "Fri", safe: 18, suspicious: 6, malicious: 1 },
  { day: "Sat", safe: 8, suspicious: 1, malicious: 0 },
  { day: "Sun", safe: 5, suspicious: 2, malicious: 1 },
];

const monthlyData = [
  { month: "Jan", total: 45 },
  { month: "Feb", total: 52 },
  { month: "Mar", total: 38 },
  { month: "Apr", total: 65 },
  { month: "May", total: 48 },
  { month: "Jun", total: 72 },
];

const verdictData = [
  { name: "Safe", value: 65, color: "hsl(142, 76%, 36%)" },
  { name: "Suspicious", value: 25, color: "hsl(45, 93%, 47%)" },
  { name: "Malicious", value: 10, color: "hsl(0, 84%, 60%)" },
];

const topThreats = [
  { name: "Fake Login Page", count: 23 },
  { name: "Credential Harvesting", count: 18 },
  { name: "Malware Attachment", count: 12 },
  { name: "Fake Invoice", count: 9 },
  { name: "CEO Fraud", count: 6 },
];

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}

function StatsCard({ title, value, description, icon }: StatsCardProps) {
  return (
    <Card className="bg-gradient-to-br from-card to-card/50">
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

export default function AnalyticsPage() {
  const { user, loading } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border bg-card">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <svg
              className="w-6 h-6 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <p className="text-muted-foreground">
            Please log in to view this page.
          </p>
        </div>
      </div>
    );
  }

  const totalAnalyzed = weeklyData.reduce(
    (sum, d) => sum + d.safe + d.suspicious + d.malicious,
    0
  );
  const threatRate = Math.round(
    (weeklyData.reduce((sum, d) => sum + d.malicious, 0) / totalAnalyzed) * 100
  );

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
          value={totalAnalyzed}
          description="Emails analyzed this week"
          icon={
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
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
          value={weeklyData.reduce((sum, d) => sum + d.safe, 0)}
          description="Legitimate emails detected"
          icon={
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-green-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
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
          value={`${threatRate}%`}
          description="Malicious emails detected"
          icon={
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-red-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
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
          value={weeklyData.reduce((sum, d) => sum + d.suspicious, 0)}
          description="Requires attention"
          icon={
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-yellow-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
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
                  {verdictData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`${value}%`, "Percentage"]}
                />
              </PieChart>
            </ChartContainer>
            <div className="flex justify-center gap-4 mt-4">
              {verdictData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {entry.name} ({entry.value}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Threat Types</CardTitle>
            <CardDescription>Most common phishing techniques detected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topThreats.map((threat, index) => {
                const percentage = Math.round(
                  (threat.count / topThreats[0].count) * 100
                );
                return (
                  <div key={threat.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{threat.name}</span>
                      <span className="text-muted-foreground">
                        {threat.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          transitionDelay: `${index * 100}ms`,
                        }}
                      />
                    </div>
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
