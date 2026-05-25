import { createContext, useContext, useState, ReactNode, useCallback } from "react";

// In-memory store of the in-progress session.
// Per requirements: no localStorage/sessionStorage/cookies/indexedDB.
// Refreshing the page during a session resets the draft — that's acceptable
// for a "moment"; finished sessions are persisted server-side.

export type SessionDraft = {
  feeling: string;
  body: string;
  hardest: string;
  integration: string;
  // Server id assigned after the session is saved on completion
  savedId: number | null;
  // Account metadata (optional)
  ownerId: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
};

const empty: SessionDraft = {
  feeling: "",
  body: "",
  hardest: "",
  integration: "",
  savedId: null,
  ownerId: null,
  ownerName: null,
  ownerEmail: null,
};

type Ctx = {
  draft: SessionDraft;
  update: (patch: Partial<SessionDraft>) => void;
  reset: () => void;
};

const SessionDraftContext = createContext<Ctx | null>(null);

export function SessionDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<SessionDraft>(empty);

  const update = useCallback((patch: Partial<SessionDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
  }, []);

  const reset = useCallback(() => setDraft(empty), []);

  return (
    <SessionDraftContext.Provider value={{ draft, update, reset }}>
      {children}
    </SessionDraftContext.Provider>
  );
}

export function useSessionDraft() {
  const ctx = useContext(SessionDraftContext);
  if (!ctx) throw new Error("useSessionDraft must be used within SessionDraftProvider");
  return ctx;
}
