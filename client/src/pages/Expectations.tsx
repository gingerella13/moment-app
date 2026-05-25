import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Shell, Stage } from "@/components/Shell";

export default function Expectations() {
  const [, setLocation] = useLocation();

  const lines = [
    "This takes about 3 minutes.",
    "There are no right answers.",
    "You can stop anytime.",
  ];

  return (
    <Shell showNav={false}>
      <Stage testid="stage-expectations">
        <div className="flex flex-col items-center text-center gap-12">
          <ul className="flex flex-col gap-6 text-balance" data-testid="list-expectations">
            {lines.map((line, i) => (
              <li
                key={i}
                className="font-serif text-2xl sm:text-3xl text-foreground/90 leading-snug"
                data-testid={`text-expectation-${i}`}
              >
                {line}
              </li>
            ))}
          </ul>

          <Button
            size="lg"
            onClick={() => setLocation("/ground")}
            data-testid="button-continue"
            className="min-w-32"
          >
            Continue
          </Button>
        </div>
      </Stage>
    </Shell>
  );
}
