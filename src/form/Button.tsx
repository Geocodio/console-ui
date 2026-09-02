import type React from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/cn.js';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'link';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    /** Leading icon. Replaced by the spinner while `pending`. */
    icon?: React.ReactNode;
    /** Blocks re-entry and shows a spinner in place of `icon`. Implies `disabled`. */
    pending?: boolean;
    /** Accessible label used while pending, if it differs from the resting label. */
    pendingLabel?: string;
}

const BASE_CLASSES =
    'inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50';

/**
 * The 32px control box every boxed variant shares. Kept out of `BASE_CLASSES`
 * so `link` can opt out of the geometry entirely instead of overriding it.
 */
const CONTROL_CLASSES = 'h-8 gap-1.5 rounded-control px-3.5 text-[13px]';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
    primary: cn(CONTROL_CLASSES, 'bg-accent text-accent-ink shadow-card hover:opacity-90'),
    secondary: cn(CONTROL_CLASSES, 'border border-hair-strong bg-panel text-body shadow-card hover:bg-panel-2'),
    tertiary: cn(CONTROL_CLASSES, 'text-muted hover:bg-panel-2 hover:text-body'),
    // White-on-fail measures ~3.4:1 in dark mode (fails WCAG AA for text),
    // because `--fail` is lighter there. `--accent-ink` is themed the other
    // way -- near-black in dark mode, white in light mode -- so pairing it
    // with `--fail` clears 4.5:1 in both themes instead of failing one.
    destructive: cn(CONTROL_CLASSES, 'bg-fail text-accent-ink shadow-card hover:opacity-90'),
    // No box at all: inherits the surrounding text's size so it sits in a
    // sentence or table cell without changing the line height. `align-top`
    // rather than the inline-flex default of baseline: with an `icon`, the
    // container's baseline is synthesised from the icon slot's bottom edge,
    // which lifts the button ~2px off the text baseline and grows the line
    // box. The button's height already equals the inherited line-height, so
    // pinning its top to the line box's top lines it up exactly. Destructive
    // callers recolour it with `className="text-fail"`.
    link: 'gap-1 align-top text-[length:inherit] text-accent-text underline-offset-[3px] hover:underline disabled:no-underline',
};

function Spinner() {
    return (
        <svg
            className="size-3.5 shrink-0 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
            />
        </svg>
    );
}

/**
 * A fixed 14px box for whatever the caller hands to `icon`. Heroicons (and
 * any svg without width/height attributes) compute `width: 100%`, and as a
 * direct flex item with `min-width: auto` they absorb all shrinkage and
 * collapse to 0x0. Inside this box `100%` resolves to 14px instead, the same
 * size as the spinner the slot swaps with, so `pending` no longer shifts the
 * label. The box does not clip, so a caller's own `size-*` on their svg still
 * renders at the size they asked for.
 */
function IconSlot({ children }: { children: React.ReactNode }) {
    return <span className="inline-flex size-3.5 shrink-0 items-center justify-center *:shrink-0">{children}</span>;
}

/**
 * The button every action in the system renders through -- 32px control
 * geometry (so it lines up with form inputs), a richer API than a bare
 * `<button>` (`icon`, `pending`, a borderless `tertiary` variant), plus a
 * box-less `link` variant for text-height inline actions.
 *
 * Deliberately a plain `<button>`, not Base UI's `button` module: that module
 * exists to give non-native elements (an `<a>`, a `<div role="button">`)
 * native button keyboard/activation semantics via its `render` prop. This
 * component always renders a real `<button>`, which already has all of that
 * for free, so the module would add an indirection with no behavioural gain.
 *
 * Extends `React.ButtonHTMLAttributes` and spreads the rest props onto the
 * element, so `title`, `aria-*`, `form`, `name` and refs all reach the DOM --
 * unlike the version this replaces, which required `onClick`, swallowed every
 * other prop, and called `preventDefault()` unconditionally so a
 * `type="submit"` button could never actually submit its form.
 *
 * Rest is spread BEFORE `type`/`disabled`/`aria-busy` are applied, so a
 * caller cannot silently override this component's own `aria-busy` (there is
 * no named prop for it to be destructured out of rest the way `pending` is)
 * by passing an `aria-busy` of their own.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    {
        variant = 'secondary',
        icon,
        pending = false,
        pendingLabel,
        type = 'button',
        disabled,
        children,
        className,
        ...rest
    },
    ref,
) {
    const isDisabled = disabled || pending;

    return (
        <button
            ref={ref}
            {...rest}
            type={type}
            disabled={isDisabled}
            aria-busy={pending || undefined}
            className={cn(BASE_CLASSES, VARIANT_CLASSES[variant], className)}
        >
            {pending ? <Spinner /> : icon ? <IconSlot>{icon}</IconSlot> : null}
            {pending && pendingLabel ? pendingLabel : children}
        </button>
    );
});
