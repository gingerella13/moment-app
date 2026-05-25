import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Shell, Stage } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Session } from "@shared/schema";
import { useAuth } from "@/lib/authStore";

function formatDate(ms: number) {
  const d = new Date(ms);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function previewLine(s: Session): string {
  const candidates = [s.feeling, s.body, s.hardest, s.integration];
  for (const c of candidates) {
    const t = (c ?? "").trim();
    if (t) return t;
  }
  return "A quiet session — no words.";
}

export default function Archive() {
  const [, setLocation] = useLocation();
  const { configured, user, loading: authLoading } = useAuth();
  const sessionsUrl =
    configured && user
      ? `/api/sessions?ownerId=${encodeURIComponent(user.id)}&ownerEmail=${encodeURIComponent(user.email ?? "")}`
      : "/api/sessions?guest=true";
  const { data, isLoading, isError, error } = useQuery<Session[]>({
    queryKey: [sessionsUrl],
    enabled: !authLoading,
  });

  return (
    <Shell>
      <Stage testid="stage-archive">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2
              className="font-serif text-3xl sm:text-4xl text-foreground/90 tracking-tight"
              data-testid="text-archive-heading"
            >
              Your reflections
            </h2>
            <p className="text-sm text-muted-foreground" data-testid="text-archive-subtext">
              {configured && user
                ? "Quiet records saved to your account."
                : "Quiet records saved on this prototype."}
            </p>
          </div>

          {isLoading && (
            <ul className="flex flex-col gap-3" data-testid="list-loading">
              {[0, 1, 2].map((i) => (
                <li key={i}>
                  <div className="rounded-lg border border-card-border bg-card/60 p-5 flex flex-col gap-2">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {isError && (
            <div
              className="rounded-lg border border-destructive/30 bg-destructive/5 p-5 text-sm"
              data-testid="text-archive-error"
            >
              Something stopped this from loading. {(error as Error)?.message}
            </div>
          )}

          {!isLoading && !isError && data && data.length === 0 && (
            <div
              className="rounded-lg border border-card-border bg-card/60 p-8 flex flex-col items-start gap-4"
              data-testid="state-empty"
            >
              <p className="font-serif text-xl text-foreground/85">No sessions yet.</p>
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                When you finish a moment, it will rest here — small, private,
                returnable.
              </p>
              <Button
                onClick={() => setLocation("/")}
                data-testid="button-start-first-session"
              >
                Begin a session
              </Button>
            </div>
          )}

          {!isLoading && !isError && data && data.length > 0 && (
            <ul className="flex flex-col gap-3" data-testid="list-sessions">
              {data.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/session/${s.id}`}
                    className="block rounded-lg border border-card-border bg-card/60 p-5 hover-elevate"
                    data-testid={`card-session-${s.id}`}
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <span
                        className="text-xs uppercase tracking-[0.16em] text-muted-foreground/80"
                        data-testid={`text-session-date-${s.id}`}
                      >
                        {formatDate(s.createdAt)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        #{s.id}
                      </span>
                    </div>
                    <p
                      className="mt-2 font-serif text-base sm:text-lg text-foreground/90 leading-snug line-clamp-2"
                      data-testid={`text-session-preview-${s.id}`}
                    >
                      {previewLine(s)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Stage>
    </Shell>
  );
}
