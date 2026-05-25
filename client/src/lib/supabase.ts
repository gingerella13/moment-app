const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("your-project") &&
    !supabaseAnonKey.includes("your-anon-key")
);

export type AuthUser = {
  id: string;
  email?: string;
};

export function getSupabaseAuthHeaders(accessToken?: string) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured yet.");
  }

  return {
    apikey: supabaseAnonKey!,
    Authorization: `Bearer ${accessToken ?? supabaseAnonKey!}`,
    "Content-Type": "application/json",
  };
}

export function getSupabaseAuthUrl(path: string) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured yet.");
  }

  return `${supabaseUrl!.replace(/\/$/, "")}/auth/v1${path}`;
}

export function getMagicLinkRedirectUrl() {
  return `${window.location.origin}${window.location.pathname}`;
}

export function readAccessTokenFromUrl() {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const query = window.location.search.startsWith("?")
    ? window.location.search.slice(1)
    : window.location.search;
  const params = new URLSearchParams(hash || query);
  return params.get("access_token");
}
