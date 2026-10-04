import * as AuthSession from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ApiRequestError, API_BASE_URL, apiRequest } from "../lib/api";

WebBrowser.maybeCompleteAuthSession();

const SESSION_KEY = "ixzzy.mobile.session";

export type AppUser = { id: string; email: string; name: string | null };
type MobileSession = { token: string; expiresAt: string; user: AppUser };
type AuthContextValue = {
  user: AppUser | null;
  token: string | null;
  loading: boolean;
  googleReady: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function saveSession(session: MobileSession) {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify({ token: session.token, user: session.user }));
}

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const savedValue = await SecureStore.getItemAsync(SESSION_KEY);
        if (!savedValue) return;
        const saved = JSON.parse(savedValue) as { token?: unknown; user?: AppUser };
        if (typeof saved.token !== "string") throw new Error("Saved session is invalid.");
        if (active && saved.user) {
          setToken(saved.token);
          setUser(saved.user);
        }
        const session = await apiRequest<{ user: AppUser }>(
          "/api/mobile/auth/session",
          { method: "GET" },
          saved.token,
        );
        if (active) {
          setToken(saved.token);
          setUser(session.user);
        }
      } catch (cause) {
        if (cause instanceof ApiRequestError && cause.status === 401) {
          await SecureStore.deleteItemAsync(SESSION_KEY).catch(() => undefined);
          if (active) {
            setToken(null);
            setUser(null);
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const acceptSession = useCallback(async (session: MobileSession) => {
    await saveSession(session);
    setToken(session.token);
    setUser(session.user);
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const session = await apiRequest<MobileSession>("/api/mobile/auth/credentials", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await acceptSession(session);
  }, [acceptSession]);

  const signInWithGoogle = useCallback(async () => {
    // Browser-based Google login (Option B). Opens the website login,
    // the server prints a 5-minute pickup code, we swap it for a keycard.
    const redirectUri = AuthSession.makeRedirectUri({ scheme: "ixzzy", path: "auth" });
    const startUrl = `${API_BASE_URL}/api/mobile/auth/browser/start?redirect_uri=${encodeURIComponent(redirectUri)}`;
    const result = await WebBrowser.openAuthSessionAsync(startUrl, redirectUri);
    if (result.type === "cancel" || result.type === "dismiss") return;
    if (result.type !== "success") throw new Error("Google sign-in could not be completed. Please try again.");
    const code = new URL(result.url).searchParams.get("code");
    if (!code) throw new Error("Google sign-in could not be completed. Please try again.");
    const session = await apiRequest<MobileSession>("/api/mobile/auth/browser/exchange", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
    await acceptSession(session);
  }, [acceptSession]);

  const signOut = useCallback(async () => {
    const savedToken = token;
    if (savedToken) {
      await apiRequest<{ success: boolean }>("/api/mobile/auth/logout", { method: "POST" }, savedToken)
        .catch(() => undefined);
    }
    await SecureStore.deleteItemAsync(SESSION_KEY).catch(() => undefined);
    setToken(null);
    setUser(null);
  }, [token]);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    googleReady: true,
    signInWithPassword,
    signInWithGoogle,
    signOut,
  }), [user, token, loading, signInWithPassword, signInWithGoogle, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
