import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shell, Stage } from "@/components/Shell";
import { useSessionDraft } from "@/lib/sessionStore";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/authStore";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { draft, update, reset } = useSessionDraft();
  const { toast } = useToast();
  const { configured, sendMagicLink } = useAuth();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function sendLink() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast({
        title: "Email needed",
        description: "Enter an email address to receive a secure link.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      if (draft.savedId) {
        await apiRequest("PATCH", `/api/sessions/${draft.savedId}`, {
          ownerEmail: trimmedEmail,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
        queryClient.invalidateQueries({ queryKey: ["/api/sessions", draft.savedId] });
      }

      update({ ownerEmail: trimmedEmail });

      if (!configured) {
        toast({
          title: "Ready for Supabase.",
          description: "Add your Supabase URL and anon key to send secure links.",
        });
        setSent(true);
        return;
      }

      await sendMagicLink(trimmedEmail);
      toast({
        title: "Secure link sent.",
        description: "Open it from your email to return to your reflections.",
      });
      setSent(true);
    } catch (err: any) {
      toast({
        title: "Could not send link",
        description: err?.message ?? "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function skip() {
    reset();
    setLocation("/");
  }

  function finishForNow() {
    reset();
    setLocation("/archive");
  }

  return (
    <Shell showNav={false}>
      <Stage testid="stage-signup">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h2
              className="font-serif text-3xl sm:text-4xl text-foreground/90 tracking-tight"
              data-testid="text-signup-heading"
            >
              Save your reflections?
            </h2>
            <p
              className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md"
              data-testid="text-signup-subtext"
            >
              Enter your email to keep this session private and available when you return.
              No password needed.
            </p>
          </div>

          {!configured && (
            <div
              className="rounded-lg border border-card-border bg-card/60 p-4 text-sm text-muted-foreground leading-relaxed"
              data-testid="state-supabase-unconfigured"
            >
              Magic links are wired in, but Supabase keys have not been added yet.
              This prototype will remember the email on the session, then secure links
              will send once the keys are configured.
            </div>
          )}

          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-muted-foreground">Email</span>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                data-testid="input-signup-email"
                className="bg-card/60"
              />
            </label>
          </div>

          {sent && (
            <p
              className="text-sm text-muted-foreground leading-relaxed"
              data-testid="text-magic-link-sent"
            >
              {configured
                ? "Check your email for the secure link. You can close this screen."
                : "This is ready for the Supabase keys. For now, your reflection remains in the prototype archive."}
            </p>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              onClick={skip}
              className="text-muted-foreground"
              data-testid="button-skip-signup"
            >
              Not now
            </Button>
            <Button
              size="lg"
              onClick={sent ? finishForNow : sendLink}
              disabled={submitting}
              data-testid="button-submit-signup"
              className="min-w-32"
            >
              {sent ? "Continue" : submitting ? "Sending…" : "Send secure link"}
            </Button>
          </div>
        </div>
      </Stage>
    </Shell>
  );
}
