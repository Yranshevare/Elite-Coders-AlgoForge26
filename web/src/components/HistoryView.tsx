"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth/context";

interface HistoryItem {
    id: string;
    senderEmail: string;
    finalAiVerdict: string;
}

export function HistoryView() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
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
            <div className="space-y-6 p-5 ">
                <div className="space-y-1 flex gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <svg
                                className="w-4 h-4 text-primary"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className=" flex items-start flex-col ">
                        <h2 className="text-xl font-semibold">Analysis History</h2>
                        <p className="text-sm text-muted-foreground ">Your analyzed emails and domains</p>
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
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-lg font-medium text-muted-foreground mb-2">No history yet</p>
                    <p className="text-sm text-muted-foreground text-center max-w-xs">
                        Run a simulation first to start building your analysis history
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <svg
                            className="w-4 h-4 text-primary"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold">Analysis History</h2>
                </div>
                <p className="text-sm text-muted-foreground ml-10">Your analyzed emails and domains</p>
            </div>

            <div className="grid gap-3">
                {history.map((item, index) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-all duration-200 ease-out active:scale-[0.98]"
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
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                                    />
                                </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{item.senderEmail || "Unknown Sender"}</p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(item.id).toLocaleDateString(undefined, {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
