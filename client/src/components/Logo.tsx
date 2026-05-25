// Moment — custom inline SVG mark.
// A breathing circle: a small inner dot inside a thin ring.
// The negative space and concentric form evoke presence and return.

type Props = {
  size?: number;
  label?: string;
  className?: string;
};

export function Logo({ size = 28, label = "Moment", className }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      role="img"
      aria-label={label}
      className={className}
      fill="none"
      data-testid="img-logo"
    >
      <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="1.25" opacity="0.9" />
      <circle cx="16" cy="16" r="3" fill="currentColor" />
    </svg>
  );
}

// Logo + wordmark for the welcome screen
export function LogoMark({ className }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-3 ${className ?? ""}`}>
      <Logo size={32} />
      <span className="font-serif text-xl tracking-tight" data-testid="text-wordmark">
        Moment
      </span>
    </div>
  );
}
