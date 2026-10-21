import type { JSX } from 'react';

type SkeletonVariant = 'text' | 'circle' | 'rect';

interface SkeletonTextProps {
  width?: string;
  height?: string;
  className?: string;
  ariaLabel?: string;
  variant?: SkeletonVariant;
  lines?: number;
  gap?: string;
}

export function SkeletonText({
  width = '6em',
  height = '1em',
  className = '',
  ariaLabel,
  variant = 'text',
  lines = 1,
  gap = '0.5em',
}: SkeletonTextProps): JSX.Element {
  const baseClass = `skeleton-text skeleton-${variant} ${className}`.trim();
  const a11yProps = ariaLabel
    ? {
        role: 'status' as const,
        'aria-live': 'polite' as const,
        'aria-label': ariaLabel,
      }
    : { 'aria-hidden': true as const };

  if (lines > 1) {
    return (
      <span
        className="skeleton-group"
        style={{ display: 'flex', flexDirection: 'column', gap }}
        {...a11yProps}
      >
        {Array.from({ length: lines }).map((_, index) => (
          <span
            key={index}
            className={baseClass}
            style={{
              width: index === lines - 1 ? '70%' : width,
              height,
            }}
          />
        ))}
      </span>
    );
  }

  return (
    <span className={baseClass} style={{ width, height }} {...a11yProps} />
  );
}
