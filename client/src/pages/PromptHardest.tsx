import { useLocation } from "wouter";
import { PromptScreen } from "@/components/PromptScreen";
import { useSessionDraft } from "@/lib/sessionStore";

export default function PromptHardest() {
  const [, setLocation] = useLocation();
  const { draft, update } = useSessionDraft();

  return (
    <PromptScreen
      testidStage="stage-prompt-hardest"
      testidInput="input-hardest"
      testidContinue="button-continue-hardest"
      stepLabel="Three of three"
      prompt="What feels hardest to sit with right now?"
      value={draft.hardest}
      onChange={(v) => update({ hardest: v })}
      onContinue={() => setLocation("/integration")}
      onBack={() => setLocation("/body")}
    />
  );
}
