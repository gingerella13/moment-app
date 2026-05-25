import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Shell, Stage } from "@/components/Shell";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <Shell>
      <Stage testid="stage-not-found">
        <div className="flex flex-col items-center text-center gap-8">
          <h2
            className="font-serif text-3xl sm:text-4xl text-foreground/90 tracking-tight"
            data-testid="text-notfound-heading"
          >
            Nothing here.
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Whatever you were looking for has moved or never was. That's okay.
          </p>
          <Button onClick={() => setLocation("/")} data-testid="button-return-home">
            Return home
          </Button>
        </div>
      </Stage>
    </Shell>
  );
}
