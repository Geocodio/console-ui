import { Switch } from '@base-ui/react/switch';
import type React from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/cn.js';

export interface ToggleProps extends React.HTMLAttributes<HTMLSpanElement> {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    /** Accessible name. Toggles rarely have a visible label of their own. */
    label: string;
    disabled?: boolean;
}

/**
 * A switch built on Base UI's `Switch`. The visual design matches a
 * hand-rolled predecessor pixel-for-pixel -- that version was already
 * correct, so this only changes what it's built on.
 *
 * `Switch.Root` supplies `role="switch"` and `aria-checked` itself
 * (confirmed against the installed 1.7.0 by reading `SwitchRoot.js`), so
 * neither is set here. It does NOT wire `aria-labelledby` without a `Field`
 * ancestor, and toggles have no visible text to associate one with anyway,
 * so `aria-label` is passed directly -- `SwitchRoot.js` doesn't destructure
 * `aria-label`, so it flows straight through onto the rendered span.
 *
 * The off-state fill uses this package's `bg-faint` token utility
 * (`--color-faint: var(--text-3)` in tokens.css) rather than the arbitrary
 * `bg-[var(--text-3)]` it maps to.
 *
 * Disabled uses `data-[disabled]:...`, not Tailwind's `disabled:` variant --
 * same reasoning as Checkbox.tsx's CONTROL comment: `disabled:` compiles to
 * the CSS `:disabled` pseudo-class, which only matches native form elements,
 * and `Switch.Root` is a `<span role="switch">`. `disabled:opacity-50`
 * compiled but never matched anything.
 *
 * `className`/rest land on `Switch.Root`, the only real surface this
 * component renders. Rest is spread BEFORE `checked`/`onCheckedChange`/
 * `disabled` so a caller cannot silently override this component's own
 * controlled state by spreading a same-named prop.
 */
export const Toggle = forwardRef<HTMLSpanElement, ToggleProps>(function Toggle(
    { checked, onCheckedChange, label, disabled, className, ...rest },
    ref,
) {
    return (
        <Switch.Root
            {...rest}
            ref={ref}
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
            aria-label={label}
            className={cn(
                // `inline-block` is load-bearing, not cosmetic. Base UI renders the root
                // as a <span> and the thumb is absolutely positioned, so the root has no
                // in-flow content. Without an explicit display it stays `display: inline`,
                // where width/height DO NOT APPLY to non-replaced inline elements -- the
                // track collapses to 0x0 and only the thumb paints. It happened to look
                // right wherever the parent was a flex container (the root became a flex
                // item), and broke the moment one landed in a table cell.
                'relative inline-block h-[18px] w-8 shrink-0 rounded-pill transition-colors duration-150',
                'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 focus-visible:shadow-[0_0_0_3px_var(--accent-soft)]',
                'data-[checked]:bg-accent data-[unchecked]:bg-faint',
                className,
            )}
        >
            <Switch.Thumb
                className={cn(
                    'absolute top-[2px] size-[14px] rounded-full bg-white shadow-sm transition-[left] duration-150',
                    'ease-[var(--ease-out-quart)] data-[checked]:left-[16px] data-[unchecked]:left-[2px]',
                )}
            />
        </Switch.Root>
    );
});
