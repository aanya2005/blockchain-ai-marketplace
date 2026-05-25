"use client";

import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { createAuthIdentity } from "@/lib/auth/roles";
import type { AuthIdentity } from "@/lib/auth/types";
import { createOptionalSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthContextValue = {
  identity: AuthIdentity | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useMemo(() => createOptionalSupabaseBrowserClient(), []);

  const refresh = useCallback(async () => {
    if (!supabase) {
      setSession(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();
    setSession(currentSession);
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    void refresh();

    if (!supabase) {
      return undefined;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [refresh, supabase]);

  const signOut = useCallback(async () => {
    if (!supabase) {
      setSession(null);
      return;
    }

    setIsLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setIsLoading(false);
  }, [supabase]);

  const identity = session?.user ? createAuthIdentity(session.user) : null;

  const value = useMemo<AuthContextValue>(
    () => ({
      identity,
      session,
      isLoading,
      isConfigured: Boolean(supabase),
      refresh,
      signOut,
    }),
    [identity, isLoading, refresh, session, signOut, supabase],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider.");
  }

  return context;
}
