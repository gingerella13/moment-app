import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import {
  AuthUser,
  getMagicLinkRedirectUrl,
  getSupabaseAuthHeaders,
  getSupabaseAuthUrl,
  isSupabaseConfigured,
  readAccessTokenFromUrl,
} from "@/lib/supabase";

type AuthContextValue = {
  configured: boolean;
  user: AuthUser | null;
  loading: boolean;
  sendMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let active = true;
    const token = readAccessTokenFromUrl();

    if (!token) {
      setLoading(false);
      return;
    }

    setAccessToken(token);

    fetch(getSupabaseAuthUrl("/user"), {
      headers: getSupabaseAuthHeaders(token),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        setUser({ id: data.id, email: data.email });
        window.location.hash = "/auth/callback";
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const sendMagicLink = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured yet.");
    }

    const url = `${getSupabaseAuthUrl("/otp")}?redirect_to=${encodeURIComponent(
      getMagicLinkRedirectUrl()
    )}`;
    const res = await fetch(url, {
      method: "POST",
      headers: getSupabaseAuthHeaders(),
      body: JSON.stringify({
        email,
        create_user: true,
      }),
    });

    if (!res.ok) {
      const raw = await res.text();
      let message = "Could not send secure link.";

      try {
        const parsed = JSON.parse(raw);
        message = parsed.message || parsed.msg || parsed.error_description || parsed.error || message;
      } catch {
        message = raw || message;
      }

      if (res.status === 429) {
        throw new Error("A secure link was just sent. Please wait a moment, then check your email or try again.");
      }

      throw new Error(message);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && accessToken) {
      await fetch(getSupabaseAuthUrl("/logout"), {
        method: "POST",
        headers: getSupabaseAuthHeaders(accessToken),
      }).catch(() => undefined);
    }
    setAccessToken(null);
    setUser(null);
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        configured: isSupabaseConfigured,
        user,
        loading,
        sendMagicLink,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
