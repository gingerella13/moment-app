import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Shell, Stage } from "@/components/Shell";

const TOTAL_SECONDS = 60;
// 8s breath cycle: 4s inhale, 4s exhale (matches the breathe keyframe)
const HALF_CYCLE_MS = 4000;

export default function Grounding() {
  const [, setLocation] = useLocation();
  const [remaining, setRemaining] = useState(TOTAL_SECONDS);
  const [phase, setPhase] = useState<"inhale" | "exhale">("inhale");
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      const elapsedMs = Date.now() - startRef.current;
      const secs = Math.max(0, TOTAL_SECONDS - Math.floor(elapsedMs / 1000));
      setRemaining(secs);
      // Phase based on cycle within elapsed time, in sync with the visual pulse
      const inCycle = elapsedMs % (HALF_CYCLE_MS * 2);
      setPhase(inCycle < HALF_CYCLE_MS ? "inhale" : "exhale");
      if (secs === 0) {
        window.clearInterval(interval);
      }
    }, 200);
    return () => window.clearInterval(interval);
  }, []);

  const done = remaining === 0;

  return (
    <Shell showNav={false}>
      <Stage testid="stage-grounding">
        <div className="flex flex-col items-center text-center gap-14">
          <p
            className="font-serif text-xl sm:text-2xl text-foreground/85 max-w-md leading-relaxed"
            data-testid="text-grounding-cue"
          >
            Notice your breathing before your thoughts.
          </p>

          {/* Breathing pulse */}
          <div className="relative flex items-center justify-center h-56 w-56 sm:h-64 sm:w-64">
            {/* Outer faint halo */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-primary/8 breathe"
              style={{ animationDelay: "0s" }}
            />
            {/* Middle ring */}
            <div
              aria-hidden="true"
              className="absolute inset-6 rounded-full border border-primary/30 breathe"
              style={{ animationDelay: "0.3s" }}
            />
            {/* Inner solid */}
            <div
              aria-hidden="true"
              className="absolute inset-16 rounded-full bg-primary/30 breathe"
              style={{ animationDelay: "0.6s" }}
            />
            {/* Phase label */}
            <div
              className="relative font-serif text-base sm:text-lg text-foreground/70 tracking-wide"
              aria-live="polite"
              data-testid="text-breath-phase"
            >
              {phase === "inhale" ? "Inhale" : "Exhale"}
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div
              className="font-mono text-sm text-muted-foreground tabular-nums"
              data-testid="text-grounding-timer"
              aria-label={`${remaining} seconds remaining`}
            >
              {remaining}s
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/feeling")}
                data-testid="button-skip-grounding"
                className="text-muted-foreground"
              >
                Skip
              </Button>
              <Button
                size="lg"
                onClick={() => setLocation("/feeling")}
                disabled={!done}
                data-testid="button-grounding-continue"
                className="min-w-32"
              >
                {done ? "Continue" : "Continue when ready"}
              </Button>
            </div>
          </div>
        </div>
      </Stage>
    </Shell>
  );
}
