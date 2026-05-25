import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Shell, Stage } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Session } from "@shared/schema";

function formatDate(ms: number) {
  const d = new Date(ms);
  return d.toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Block({ label, value, testid }: { label: string; value: string; testid: string }) {
  const empty = !value || value.trim().length === 0;
  return (
    <div className="flex flex-col gap-2" data-testid={testid}>
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground/80">
        {label}
      </p>
      <p className="font-serif text-base sm:text-lg text-foreground/90 leading-relaxed whitespace-pre-wrap">
        {empty ? (
          <span className="text-muted-foreground/70 italic">— left blank —</span>
        ) : (
          value
        )}
      </p>
    </div>
  );
}

export default function SessionDetail() {
  const [, params] = useRoute("/session/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const id = params?.id ? parseInt(params.id, 10) : NaN;

  const { data, isLoading, isError, error } = useQuery<Session>({
    queryKey: ["/api/sessions", id],
    enabled: !Number.isNaN(id),
  });

  const deleteMut = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/sessions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({ title: "Released.", description: "This session has been let go." });
      setLocation("/archive");
    },
    onError: (err: Error) => {
      toast({
        title: "Could not delete",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Shell>
      <Stage testid="stage-session-detail">
        <div className="flex flex-col gap-10">
          <Button
            variant="ghost"
            onClick={() => setLocation("/archive")}
            className="self-start text-muted-foreground -ml-2"
            data-testid="button-back-archive"
          >
            ← Archive
          </Button>

          {isLoading && (
            <div className="flex flex-col gap-6" data-testid="state-loading">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}

          {isError && (
            <div
              className="rounded-lg border border-destructive/30 bg-destructive/5 p-5 text-sm"
              data-testid="text-detail-error"
            >
              We could not find this session. {(error as Error)?.message}
            </div>
          )}

          {data && (
            <>
              <div className="flex flex-col gap-2">
                <p
                  className="text-sm text-muted-foreground"
                  data-testid="text-session-date"
                >
                  {formatDate(data.createdAt)}
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl text-foreground/90 tracking-tight">
                  A moment
                </h2>
              </div>

              <div className="flex flex-col gap-8">
                <Block
                  label="What were you feeling?"
                  value={data.feeling}
                  testid="block-feeling"
                />
                <Block
                  label="Where in your body?"
                  value={data.body}
                  testid="block-body"
                />
                <Block
                  label="What felt hardest to sit with?"
                  value={data.hardest}
                  testid="block-hardest"
                />
                <Block
                  label="What changed after noticing?"
                  value={data.integration}
                  testid="block-integration"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/60">
                <Button
                  variant="ghost"
                  onClick={() => deleteMut.mutate()}
                  disabled={deleteMut.isPending}
                  className="text-muted-foreground hover:text-destructive"
                  data-testid="button-delete-session"
                >
                  {deleteMut.isPending ? "Releasing…" : "Release this session"}
                </Button>
                <Button
                  onClick={() => setLocation("/")}
                  data-testid="button-new-session"
                >
                  Begin another
                </Button>
              </div>
            </>
          )}
        </div>
      </Stage>
    </Shell>
  );
}
