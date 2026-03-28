import { DashboardHeader } from "@/components/DashboardHeader";

export default function MeLayout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <DashboardHeader />
      {children}
    </main>
  );
}
