import type React from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/cn.js';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * A pulsing placeholder block. It has no reduced-motion
 * guard of its own -- the package's global `prefers-reduced-motion: reduce`
 * rule in `base.css` disables the animation for every consumer, covered by
 * a Playwright test rather than assumed.
 *
 * Rest is spread BEFORE `aria-hidden` is applied, so a stray `aria-hidden`
 * in rest cannot silently un-hide this decorative element from assistive
 * tech.
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
    { className, ...rest },
    ref,
) {
    return (
        <div ref={ref} {...rest} aria-hidden="true" className={cn('animate-pulse rounded bg-panel-2', className)} />
    );
});
