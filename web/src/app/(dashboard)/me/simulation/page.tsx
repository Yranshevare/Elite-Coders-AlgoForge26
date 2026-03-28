"use client";

import { useSession } from "@/lib/auth/context";
import { SimulationView } from "@/components/SimulationView";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingState() {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="flex h-full gap-0">
        <div className="w-[380px] shrink-0 flex flex-col border-r p-4">
          <div className="space-y-2 mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-3">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="h-64 w-96 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function SimulationPage() {
  const { user, loading } = useSession();

  if (loading) {
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

  return <SimulationView />;
}
