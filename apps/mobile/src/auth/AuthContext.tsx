import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearToken, loadToken, saveToken } from "./tokenStorage";

type AuthState = {
  token: string | null;
  ready: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void (async () => {
      const t = await loadToken();
      setToken(t);
      setReady(true);
    })();
  }, []);

  const value = useMemo(
    () => ({
      token,
      ready,
      signIn: async (t: string) => {
        await saveToken(t);
        setToken(t);
      },
      signOut: async () => {
        await clearToken();
        setToken(null);
      },
    }),
    [token, ready],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth dentro de AuthProvider");
  return v;
}
