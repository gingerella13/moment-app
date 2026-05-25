import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Shell, Stage } from "@/components/Shell";
import { Logo } from "@/components/Logo";
import { useSessionDraft } from "@/lib/sessionStore";

export default function Completion() {
  const [, setLocation] = useLocation();
  const { reset } = useSessionDraft();

  function finishToHome() {
    // Gentle signup prompt only after a first completed session.
    // The brief: do not block; allow continuing locally.
    setLocation("/signup");
  }

  function continueReflection() {
    reset();
    setLocation("/begin");
  }

  return (
    <Shell showNav={false}>
      <Stage testid="stage-completion">
        <div className="flex flex-col items-center text-center gap-10">
          <div className="text-primary/80">
            <Logo size={48} />
          </div>

          <div className="flex flex-col items-center gap-4">
            <h2
              className="font-serif text-3xl sm:text-4xl text-foreground/90 tracking-tight"
              data-testid="text-completion-heading"
            >
              Thank you for noticing.
            </h2>
            <p
              className="text-sm sm:text-base text-muted-foreground max-w-sm"
              data-testid="text-completion-subtext"
            >
              Your session has been saved privately.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              onClick={continueReflection}
              data-testid="button-continue-reflection"
              className="min-w-48"
            >
              Continue Reflection
            </Button>
            <Button
              size="lg"
              onClick={finishToHome}
              data-testid="button-finish"
              className="min-w-32"
            >
              Finish
            </Button>
          </div>
        </div>
      </Stage>
    </Shell>
  );
}
