import { ReactNode } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Shell, Stage } from "@/components/Shell";

type Props = {
  testidStage: string;
  testidInput: string;
  testidContinue: string;
  prompt: string;
  helper?: ReactNode;
  value: string;
  onChange: (v: string) => void;
  onContinue: () => void;
  onBack?: () => void;
  continueLabel?: string;
  // Currently every prompt is optional (no character minimum) per the brief
  allowEmpty?: boolean;
  stepLabel?: string;
};

export function PromptScreen({
  testidStage,
  testidInput,
  testidContinue,
  prompt,
  helper,
  value,
  onChange,
  onContinue,
  onBack,
  continueLabel = "Continue",
  allowEmpty = true,
  stepLabel,
}: Props) {
  const [, setLocation] = useLocation();

  return (
    <Shell showNav={false}>
      <Stage testid={testidStage}>
        <div className="flex flex-col gap-8">
          {stepLabel && (
            <p
              className="text-xs uppercase tracking-[0.18em] text-muted-foreground/80"
              data-testid="text-step-label"
            >
              {stepLabel}
            </p>
          )}

          <h2
            className="font-serif text-3xl sm:text-4xl text-foreground/90 leading-tight tracking-tight"
            data-testid="text-prompt"
          >
            {prompt}
          </h2>

          {helper && (
            <div className="text-sm text-muted-foreground leading-relaxed" data-testid="text-helper">
              {helper}
            </div>
          )}

          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write what comes."
            rows={6}
            className="resize-none text-base leading-relaxed font-serif bg-card/60 border-border/80 focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40"
            data-testid={testidInput}
            autoFocus
          />

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              onClick={onBack ?? (() => setLocation("/"))}
              className="text-muted-foreground"
              data-testid="button-back"
            >
              Back
            </Button>
            <Button
              size="lg"
              onClick={onContinue}
              disabled={!allowEmpty && value.trim().length === 0}
              data-testid={testidContinue}
              className="min-w-32"
            >
              {continueLabel}
            </Button>
          </div>
        </div>
      </Stage>
    </Shell>
  );
}
