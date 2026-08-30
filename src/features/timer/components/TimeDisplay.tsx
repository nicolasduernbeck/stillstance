import { formatDuration, formatDurationAria } from "../../../lib/format";

interface TimeDisplayProps {
  ms: number;
  dimmed?: boolean;
}

export function TimeDisplay({ ms, dimmed = false }: TimeDisplayProps) {
  return (
    <div
      aria-label={formatDurationAria(ms)}
      className={`text-6xl font-extralight tracking-tight [font-variant-numeric:tabular-nums] sm:text-7xl ${
        dimmed ? "text-fg-secondary" : "text-fg"
      }`}
    >
      {formatDuration(ms)}
    </div>
  );
}
