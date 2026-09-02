import type React from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/cn.js';

export type StatusPillTone = 'ok' | 'warn' | 'fail' | 'info' | 'idle' | 'accent';
export type StatusPillVariant = 'pill' | 'glyph';

export interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
    tone: StatusPillTone;
    label: string;
    /** `pill` is the bordered dot. `glyph` is bare mono uppercase with `glyph` as the marker. */
    variant?: StatusPillVariant;
    /** The `glyph` variant's marker. Ignored by `pill`, which always draws its dot. */
    glyph?: React.ReactNode;
    /** Animates the marker. Only meaningful while the state is genuinely live. */
    pulse?: boolean;
}

const TONE_CLASSES: Record<StatusPillTone, string> = {
    ok: 'text-ok',
    warn: 'text-warn',
    fail: 'text-fail',
    info: 'text-info',
    idle: 'text-idle',
    accent: 'text-accent',
};

const VARIANT_CLASSES: Record<StatusPillVariant, string> = {
    pill: 'gap-1 rounded-pill border border-hair px-2 py-0.5 text-[11px] font-medium',
    glyph: 'gap-[5px] font-mono text-[11.5px] font-semibold tracking-[0.03em]',
};

/**
 * Two anatomies over one tone scale. `pill` is a bordered dot; `glyph` is
 * a bare mono status line, where the marker is a caller-supplied character
 * rather than a dot and a live state pulses.
 *
 * Each app maps its own vocabulary (ticket statuses, build/run/proposal
 * statuses) to a tone, a label and a glyph before rendering this -- that
 * mapping is domain language and stays app-side.
 * The marker never carries meaning alone: `label` is always real text.
 */
export const StatusPill = forwardRef<HTMLSpanElement, StatusPillProps>(function StatusPill(
    { tone, label, variant = 'pill', glyph, pulse = false, className, ...rest },
    ref,
) {
    return (
        <span
            ref={ref}
            {...rest}
            className={cn('inline-flex items-center', VARIANT_CLASSES[variant], TONE_CLASSES[tone], className)}
        >
            <span
                className={cn(
                    variant === 'pill' && 'inline-block size-2 rounded-full bg-current',
                    pulse && 'animate-status-pulse',
                )}
            >
                {variant === 'glyph' ? glyph : null}
            </span>
            {label}
        </span>
    );
});
