import { useLocation } from "wouter";
import { PromptScreen } from "@/components/PromptScreen";
import { useSessionDraft } from "@/lib/sessionStore";

const examples = ["head", "chest", "ribs", "arms", "legs"];

export default function PromptBody() {
  const [, setLocation] = useLocation();
  const { draft, update } = useSessionDraft();

  return (
    <PromptScreen
      testidStage="stage-prompt-body"
      testidInput="input-body"
      testidContinue="button-continue-body"
      stepLabel="Two of three"
      prompt="Where do you feel it in your body?"
      helper={
        <span data-testid="text-body-examples">
          For example: {examples.join(", ")}.
        </span>
      }
      value={draft.body}
      onChange={(v) => update({ body: v })}
      onContinue={() => setLocation("/hardest")}
      onBack={() => setLocation("/feeling")}
    />
  );
}
