import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import type React from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/cn.js';

export interface CheckboxProps extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, 'onChange'> {
    checked: boolean | 'indeterminate';
    onCheckedChange: (checked: boolean) => void;
    label: string;
    /** Visually hide the label while keeping it as the accessible name. */
    hideLabel?: boolean;
    disabled?: boolean;
    id?: string;
}

// 16px box to sit on the 13px text baseline it labels; see TextInput.tsx for
// the provenance note on the `outline-none` exception and the 3px
// `accent-soft` ring -- this reuses the same pair as its focus indicator.
//
// Disabled uses `data-[disabled]:...`, not Tailwind's `disabled:` variant.
// `disabled:` compiles to the CSS `:disabled` pseudo-class, which only
// matches native form elements (input, button, select, ...); `Checkbox.Root`
// renders a `<span role="checkbox">`, so `:disabled` never matches it and
// `disabled:opacity-50` silently did nothing (verified in a real browser:
// computed opacity stayed 1 while `aria-disabled`/`data-disabled` were
// correctly set). `data-[disabled]` targets the `data-disabled` attribute
// Base UI actually sets on this span when disabled -- see the "visibly
// dimmed" test in playground/tests/choice.spec.ts, which asserts computed
// opacity rather than only the attribute.
const CONTROL =
    'flex size-4 shrink-0 items-center justify-center rounded-chip border border-hair-strong bg-panel ' +
    'text-accent-ink outline-none transition-[box-shadow,border-color] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 ' +
    'hover:border-faint focus-visible:border-accent focus-visible:shadow-[0_0_0_3px_var(--accent-soft)] ' +
    'data-[checked]:border-accent data-[checked]:bg-accent data-[indeterminate]:border-accent data-[indeterminate]:bg-accent';

function CheckIcon() {
    return (
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
                d="M2.5 6.25L4.75 8.5L9.5 3.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function DashIcon() {
    return (
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2.5 6H9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    );
}

/**
 * A 16px checkbox with a genuine indeterminate state (table select-all
 * depends on it).
 *
 * Wrapping `Checkbox.Root` directly in a `<label>`, with the visible label
 * text as a sibling, is Base UI's own mechanism for wiring the accessible
 * name here (confirmed against the installed 1.7.0 by reading
 * `CheckboxRoot.js`): `Checkbox.Root` renders a `<span role="checkbox">`
 * plus a hidden native `<input>` as siblings, and resolves its
 * `aria-labelledby` by walking up from that hidden input to find an
 * ancestor `<label>` -- no `Field` wiring is needed, and none is used here
 * standalone. `Checkbox.Root`'s own `onClick` already calls
 * `preventDefault()` before re-dispatching the click onto the hidden input,
 * which is what stops the native label-click redirect from double-toggling
 * when the box itself (not the text) is clicked.
 *
 * Indeterminate is real, not just drawn: passing `indeterminate` sets the
 * hidden input's native `indeterminate` property AND `aria-checked="mixed"`
 * on the `role="checkbox"` span (both read directly off `CheckboxRoot.js`),
 * so assistive tech gets the mixed state either way.
 *
 * `className`/rest props land on the outer `<label>`, the component's
 * primary visual surface -- rest is spread BEFORE `checked`/`onCheckedChange`/
 * `disabled` are applied to `Checkbox.Root`, not onto the label itself, so a
 * caller cannot accidentally clobber this component's own controlled props
 * by spreading unrelated label attributes.
 */
export const Checkbox = forwardRef<HTMLLabelElement, CheckboxProps>(function Checkbox(
    { checked, onCheckedChange, label, hideLabel, disabled, id, className, ...rest },
    ref,
) {
    const indeterminate = checked === 'indeterminate';

    return (
        // biome-ignore lint/a11y/noLabelWithoutControl: Checkbox.Root renders a real, labelable hidden <input> as a sibling of its visible span -- invisible to Biome's JSX-only check, but that's what wires this label's aria-labelledby (see the doc comment above).
        <label
            ref={ref}
            {...rest}
            className={cn('inline-flex cursor-pointer items-center gap-2 has-disabled:cursor-not-allowed', className)}
        >
            <BaseCheckbox.Root
                id={id}
                checked={indeterminate ? false : checked}
                indeterminate={indeterminate}
                onCheckedChange={onCheckedChange}
                disabled={disabled}
                className={CONTROL}
            >
                <BaseCheckbox.Indicator className="flex" keepMounted={false}>
                    {indeterminate ? <DashIcon /> : <CheckIcon />}
                </BaseCheckbox.Indicator>
            </BaseCheckbox.Root>
            <span className={cn('text-[13px] text-body', hideLabel && 'sr-only')}>{label}</span>
        </label>
    );
});
