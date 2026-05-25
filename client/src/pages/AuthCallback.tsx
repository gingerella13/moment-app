import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Shell, Stage } from "@/components/Shell";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/authStore";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { user, loading, configured } = useAuth();
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState("Checking your secure link.");

  useEffect(() => {
    if (!configured) {
      setMessage("Magic links are not configured yet.");
      return;
    }

    if (loading) return;

    if (!user?.email) {
      setMessage("We could not verify this link. You can request a new one.");
      return;
    }

    let active = true;

    async function claim() {
      setClaiming(true);
      try {
        await apiRequest("POST", "/api/sessions/claim", {
          ownerEmail: user!.email,
          ownerId: user!.id,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
        if (!active) return;
        setMessage("Your reflections are ready.");
        setLocation("/archive");
      } catch {
        if (!active) return;
        setMessage("You are signed in. We could not attach older reflections yet.");
      } finally {
        if (active) setClaiming(false);
      }
    }

    claim();

    return () => {
      active = false;
    };
  }, [configured, loading, setLocation, user]);

  return (
    <Shell showNav={false}>
      <Stage testid="stage-auth-callback">
        <div className="flex flex-col gap-8 text-center items-center">
          <div className="flex flex-col gap-3">
            <h2
              className="font-serif text-3xl sm:text-4xl text-foreground/90 tracking-tight"
              data-testid="text-auth-callback-heading"
            >
              Returning to Moment.
            </h2>
            <p
              className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md"
              data-testid="text-auth-callback-message"
            >
              {claiming ? "Saving your place quietly." : message}
            </p>
          </div>
          <Button onClick={() => setLocation("/archive")} data-testid="button-auth-archive">
            Go to archive
          </Button>
        </div>
      </Stage>
    </Shell>
  );
}
