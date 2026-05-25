import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Shell, Stage } from "@/components/Shell";
import { useSessionDraft } from "@/lib/sessionStore";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/authStore";

export default function Integration() {
  const [, setLocation] = useLocation();
  const { draft, update } = useSessionDraft();
  const { user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  async function finish() {
    setSaving(true);
    try {
      const res = await apiRequest("POST", "/api/sessions", {
        feeling: draft.feeling,
        body: draft.body,
        hardest: draft.hardest,
        integration: draft.integration,
        ownerId: user?.id ?? draft.ownerId ?? null,
        ownerEmail: user?.email ?? draft.ownerEmail ?? null,
      });
      const saved = await res.json();
      update({ savedId: saved.id });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      setLocation("/complete");
    } catch (err: any) {
      toast({
        title: "Could not save",
        description: err?.message ?? "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Shell showNav={false}>
      <Stage testid="stage-integration">
        <div className="flex flex-col gap-10">
          <p
            className="font-serif text-3xl sm:text-4xl text-foreground/90 leading-snug"
            data-testid="text-integration-cue"
          >
            Take one slow breath.
          </p>

          <div className="flex flex-col gap-4">
            <label
              htmlFor="integration-input"
              className="text-sm text-muted-foreground leading-relaxed"
              data-testid="text-integration-prompt"
            >
              Optional — what changed after noticing this?
            </label>
            <Textarea
              id="integration-input"
              value={draft.integration}
              onChange={(e) => update({ integration: e.target.value })}
              placeholder="You can leave this empty."
              rows={4}
              className="resize-none text-base leading-relaxed font-serif bg-card/60 border-border/80 focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40"
              data-testid="input-integration"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              onClick={() => setLocation("/hardest")}
              className="text-muted-foreground"
              data-testid="button-back"
            >
              Back
            </Button>
            <Button
              size="lg"
              onClick={finish}
              disabled={saving}
              data-testid="button-finish-session"
              className="min-w-32"
            >
              {saving ? "Saving…" : "Finish"}
            </Button>
          </div>
        </div>
      </Stage>
    </Shell>
  );
}
