import { Radio } from '@base-ui/react/radio';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import type React from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/cn.js';

export interface RadioOption {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
}

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
    /** Accessible name for the group as a whole. */
    label: string;
    options: RadioOption[];
    value: string | null;
    onChange: (value: string) => void;
    disabled?: boolean;
    /** Lay the options out in a row instead of a column. */
    orientation?: 'vertical' | 'horizontal';
}

// Same 16px sizing and focus treatment as Checkbox.tsx, including the same
// `data-[disabled]:...` fix in place of Tailwind's `disabled:` variant --
// `Radio.Root` is also a `<span role="radio">`, so `:disabled` never matches
// it either. See Checkbox.tsx's CONTROL comment for the full explanation.
const RADIO_CONTROL =
    'flex size-4 shrink-0 items-center justify-center rounded-full border border-hair-strong bg-panel ' +
    'outline-none transition-[box-shadow,border-color] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 ' +
    'hover:border-faint focus-visible:border-accent focus-visible:shadow-[0_0_0_3px_var(--accent-soft)] ' +
    'data-[checked]:border-accent';

/**
 * A styled replacement for bare browser-default radios, which render
 * off-palette in dark mode.
 *
 * `RadioGroup` (the group) and `Radio.Root` (each item) resolve their
 * accessible names differently, both confirmed against the installed 1.7.0:
 *
 * - `RadioGroup`'s `aria-labelledby` only gets wired when a `Field`/fieldset
 *   ancestor provides a `labelId` (read off `RadioGroup.js`); standalone,
 *   that's `undefined`. `aria-label` isn't consumed specially by the
 *   component, so it passes straight through the `role="radiogroup"` div's
 *   props, and that's what's used here.
 * - Each `Radio.Root` renders a `<span role="radio">` plus a hidden native
 *   `<input>`, and (identically to `Checkbox.Root`) resolves
 *   `aria-labelledby` by walking up from that hidden input to an ancestor
 *   `<label>` -- so each option is wrapped in its own `<label>` rather than
 *   given an explicit `aria-label`, matching `Checkbox.tsx`'s approach and
 *   keeping the visible text clickable.
 *
 * `orientation` drives two things: the flex layout direction, and (via
 * `aria-orientation` passed straight through to `RadioGroup`'s own
 * `role="radiogroup"` element) what's announced to assistive tech. Neither
 * `RadioGroup` nor its `role="radiogroup"` element sets `aria-orientation`
 * on its own (confirmed against the installed 1.7.0 `RadioGroup.js`), and
 * ARIA's implicit default for `radiogroup` is `vertical` -- so a group
 * rendered horizontally with nothing set here would be announced as
 * vertical, telling screen reader users to expect the wrong arrow keys.
 * This component always passes an explicit value (defaulting to
 * `'vertical'`) so the announcement matches the layout instead of relying
 * on that implicit default.
 *
 * Arrow-key navigation itself stays bidirectional regardless: `RadioGroup`
 * doesn't pass an `orientation` to the underlying composite, which defaults
 * to `'both'` (`useCompositeRoot.js`), so Up/Down and Left/Right both move
 * the selection no matter what this component announces. That combination
 * is fine, not contradictory -- declaring `aria-orientation="horizontal"`
 * while Up/Down also work doesn't mislead anyone, since the keys the
 * announcement implies (Left/Right) do function; it only matters that the
 * announced axis's own keys work, which they always do here.
 *
 * `className`/rest land on the root `role="radiogroup"` div `BaseRadioGroup`
 * renders. Rest is spread BEFORE `value`/`onValueChange`/`disabled` below, so
 * a caller cannot silently override this component's own controlled state
 * by spreading an unrelated prop of the same name.
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
    { label, options, value, onChange, disabled, orientation = 'vertical', className, ...rest },
    ref,
) {
    return (
        <BaseRadioGroup<string>
            {...rest}
            ref={ref}
            aria-label={label}
            aria-orientation={orientation}
            value={value ?? undefined}
            onValueChange={(next) => onChange(next)}
            disabled={disabled}
            className={cn('flex', orientation === 'horizontal' ? 'flex-row gap-4' : 'flex-col gap-2.5', className)}
        >
            {options.map((option) => (
                // biome-ignore lint/a11y/noLabelWithoutControl: Radio.Root renders a real, labelable hidden <input> as a sibling of its visible span, same as Checkbox.Root -- see Checkbox.tsx's doc comment for why this wires the accessible name.
                <label
                    key={option.value}
                    className="flex cursor-pointer items-start gap-2 has-disabled:cursor-not-allowed"
                >
                    <Radio.Root
                        value={option.value}
                        disabled={disabled || option.disabled}
                        className={cn(RADIO_CONTROL, 'mt-0.5')}
                    >
                        <Radio.Indicator className="flex size-1.5 rounded-full bg-accent" />
                    </Radio.Root>
                    <span className="flex flex-col">
                        <span className="text-[13px] text-body">{option.label}</span>
                        {option.description ? (
                            <span className="text-[11.5px] text-muted">{option.description}</span>
                        ) : null}
                    </span>
                </label>
            ))}
        </BaseRadioGroup>
    );
});
