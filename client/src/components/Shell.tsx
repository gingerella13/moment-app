import { ReactNode } from "react";
import { Link } from "wouter";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/authStore";

type Props = {
  children: ReactNode;
  // when false, the top nav is hidden (used inside the deep flow)
  showNav?: boolean;
};

// Spacious, restrained layout shell.
export function Shell({ children, showNav = true }: Props) {
  const { configured, user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {showNav && (
        <header className="w-full">
          <div className="mx-auto max-w-3xl px-6 sm:px-8 pt-8 sm:pt-10 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-foreground/90 hover-elevate rounded-md px-2 py-1 -mx-2"
              data-testid="link-home"
              aria-label="Moment home"
            >
              <Logo size={22} />
              <span className="font-serif text-base tracking-tight">Moment</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/archive"
                className="text-muted-foreground hover:text-foreground hover-elevate rounded-md px-3 py-1.5 transition-colors"
                data-testid="link-archive"
              >
                Archive
              </Link>
              {configured && user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void signOut()}
                  className="text-muted-foreground hover:text-foreground"
                  data-testid="button-sign-out"
                >
                  Sign out
                </Button>
              )}
            </nav>
          </div>
        </header>
      )}

      <main className="flex-1 flex flex-col">{children}</main>

      <footer className="w-full">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 py-8 text-xs text-muted-foreground/70">
          <span data-testid="text-footer">Moment · a quiet practice</span>
        </div>
      </footer>
    </div>
  );
}

// A centered stage used by every flow screen.
export function Stage({
  children,
  testid,
}: {
  children: ReactNode;
  testid?: string;
}) {
  return (
    <section
      className="flex-1 flex items-center justify-center px-6 sm:px-8 py-12 sm:py-16"
      data-testid={testid}
    >
      <div className="w-full max-w-xl settle-in">{children}</div>
    </section>
  );
}
