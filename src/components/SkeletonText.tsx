import type { JSX } from 'react';

interface SkeletonTextProps {
  width?: string;
  height?: string;
  className?: string;
  ariaLabel?: string;
}

export function SkeletonText({
  width = '6em',
  height = '1em',
  className = '',
  ariaLabel,
}: SkeletonTextProps): JSX.Element {
  return (
    <span
      className={`skeleton-text ${className}`.trim()}
      style={{ width, height }}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
    />
  );
}
