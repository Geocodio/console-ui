import type React from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/cn.js';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Required -- becomes the button's accessible name via `aria-label`. */
    label: string;
    children: React.ReactNode;
}

/**
 * A borderless 26px icon-only square. Used for row-level affordances
 * (close, overflow, remove) that don't warrant a labelled `Button`.
 *
 * `label` is required rather than optional because an icon-only button with
 * no accessible name is invisible to assistive tech; there is no way to
 * render one without supplying it. Rest is spread BEFORE `type`/`aria-label`
 * are applied, so a stray `aria-label` in rest cannot silently override the
 * required accessible name.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
    { label, children, type = 'button', className, ...rest },
    ref,
) {
    return (
        <button
            ref={ref}
            {...rest}
            type={type}
            aria-label={label}
            className={cn(
                'inline-flex size-[26px] shrink-0 items-center justify-center rounded-control text-faint transition-colors hover:bg-panel-2 hover:text-muted disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
        >
            {children}
        </button>
    );
});
