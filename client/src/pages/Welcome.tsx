import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Shell, Stage } from "@/components/Shell";
import { Logo } from "@/components/Logo";
import { useSessionDraft } from "@/lib/sessionStore";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const { reset } = useSessionDraft();

  function begin() {
    reset();
    setLocation("/begin");
  }

  return (
    <Shell>
      <Stage testid="stage-welcome">
        <div className="flex flex-col items-center text-center gap-10">
          <div className="text-foreground/90">
            <Logo size={56} />
          </div>

          <div className="flex flex-col items-center gap-5">
            <h1
              className="font-serif text-4xl sm:text-5xl tracking-tight text-foreground"
              data-testid="text-app-name"
            >
              Moment
            </h1>
            <p
              className="text-base sm:text-lg text-muted-foreground max-w-md leading-relaxed"
              data-testid="text-welcome-tagline"
            >
              A quiet space to pause, notice, and return to yourself.
            </p>
          </div>

          <Button
            size="lg"
            onClick={begin}
            data-testid="button-begin"
            className="min-w-32"
          >
            Begin
          </Button>
        </div>
      </Stage>
    </Shell>
  );
}
