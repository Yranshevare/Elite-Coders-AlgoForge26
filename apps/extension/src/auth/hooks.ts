import { useSession, signIn, signOut } from "./client";
import type { Session } from "better-auth";

export { useSession, signIn, signOut };

export function useAuth() {
  const { data: session, isPending, error } = useSession();

  return {
    session: session as Session | null,
    isAuthenticated: !!session,
    isLoading: isPending,
    error,
    user: session?.user ?? null,
  };
}
