import type React from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/cn.js';

export type BadgeTone = 'neutral' | 'ok' | 'warn' | 'fail' | 'info' | 'accent';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    tone?: BadgeTone;
    children: React.ReactNode;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
    neutral: 'bg-panel-2 text-muted',
    ok: 'bg-ok-soft text-ok',
    warn: 'bg-warn-soft text-warn',
    fail: 'bg-fail-soft text-fail',
    info: 'bg-info-soft text-info',
    accent: 'bg-accent-soft text-accent-text',
};

/**
 * A small tone-coloured label. Tones map to the package's semantic tokens
 * rather than hue names (`green`, `orange`, `red`, `blue`) so it composes
 * with `StatusPill` and the rest of the token system.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
    { tone = 'neutral', children, className, ...rest },
    ref,
) {
    return (
        <span
            ref={ref}
            {...rest}
            className={cn('rounded-chip px-1.5 py-px text-[10px] font-semibold', TONE_CLASSES[tone], className)}
        >
            {children}
        </span>
    );
});
