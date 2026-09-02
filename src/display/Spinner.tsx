import type React from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/cn.js';

export type SpinnerSize = 'sm' | 'md';

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
    size?: SpinnerSize;
    /** Announced to screen readers; omit when adjacent text already says what is loading. */
    label?: string;
}

const SIZE_CLASSES: Record<SpinnerSize, string> = {
    sm: 'size-[11px] border',
    md: 'size-[15px] border-2',
};

/**
 * An indeterminate ring, sized by border
 * thickness rather than an SVG stroke so it inherits `currentColor` for
 * free. The a11y branch is the point of the component -- with a `label` it
 * is `role="status"` and gets announced; without one it is `aria-hidden`,
 * because the common case is a spinner sitting next to text that already
 * says what is loading (a "Saving..." button label, say), and double
 * announcing both would be worse than announcing neither. Rest is spread
 * BEFORE `role`/`aria-label`/`aria-hidden` are applied, so a stray same-named
 * attribute in rest cannot silently override this component's a11y branch.
 */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
    { size = 'sm', label, className, ...rest },
    ref,
) {
    const classes = cn(
        'animate-spinner-spin inline-block shrink-0 rounded-full border-current border-t-transparent opacity-70',
        SIZE_CLASSES[size],
        className,
    );

    if (label) {
        return <span ref={ref} {...rest} role="status" aria-label={label} className={classes} />;
    }

    return <span ref={ref} {...rest} aria-hidden="true" className={classes} />;
});
