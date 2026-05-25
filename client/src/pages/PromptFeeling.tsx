import { useLocation } from "wouter";
import { PromptScreen } from "@/components/PromptScreen";
import { useSessionDraft } from "@/lib/sessionStore";

const examples = ["tightness", "heaviness", "warmth", "pressure", "numbness"];

export default function PromptFeeling() {
  const [, setLocation] = useLocation();
  const { draft, update } = useSessionDraft();

  return (
    <PromptScreen
      testidStage="stage-prompt-feeling"
      testidInput="input-feeling"
      testidContinue="button-continue-feeling"
      stepLabel="One of three"
      prompt="What are you feeling right now?"
      helper={
        <span data-testid="text-feeling-examples">
          For example: {examples.join(", ")}.
        </span>
      }
      value={draft.feeling}
      onChange={(v) => update({ feeling: v })}
      onContinue={() => setLocation("/body")}
      onBack={() => setLocation("/ground")}
    />
  );
}
