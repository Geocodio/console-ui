import { Select as BaseSelect } from '@base-ui/react/select';
import type React from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/cn.js';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface SelectProps
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value' | 'defaultValue'> {
    options: SelectOption[];
    value: string | null;
    onChange: (value: string | null) => void;
    placeholder?: string;
    disabled?: boolean;
    /** Classes for the popup panel -- the select's second surface. */
    popupClassName?: string;
}

// Same visual spec as `TextInput`'s `CONTROL` -- see that file for the
// provenance note on the literal-shadow and raw-`var()` cleanup, and on the
// `outline-none` exception. This copy adds the flex layout the trigger needs
// to lay the value and chevron out on one line; `TextInput` doesn't need
// that, so the two aren't shared as a single constant.
// No width baked in, deliberately -- the caller owns it, exactly as the
// `TextInput` control string does. `cn` is `twMerge`, so an explicit caller
// width does override a `w-full` here; the breakage is at call sites that pass
// NO width and reasonably expect a content-sized control. A row of filter
// selects in a `flex flex-wrap gap-1.5` container once rendered as four
// stacked 449px controls because of it.
const TRIGGER_CLASSES =
    'flex h-8 items-center justify-between gap-2 rounded-control border border-hair-strong bg-panel px-3 ' +
    'text-left text-[13px] text-body shadow-card disabled:cursor-not-allowed disabled:opacity-50 outline-none ' +
    'transition-[box-shadow,border-color] hover:border-faint focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]';

const ITEM_CLASSES =
    'flex h-8 cursor-default select-none items-center justify-between gap-2 rounded-control px-2.5 text-[12.5px] ' +
    'text-body outline-none data-[highlighted]:bg-panel-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-40';

function ChevronIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="shrink-0">
            <path
                d="M2.5 4.5L6 8L9.5 4.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="shrink-0">
            <path
                d="M2.5 6.25L4.75 8.5L9.5 3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/**
 * A real listbox popup replacing a native `<select>`. The CSS-only route
 * is to upgrade the closed control's popup to a token-styled panel via
 * `appearance: base-select` inside an `@supports` block, which only Chromium
 * currently implements; every other engine falls back to the unstyled native
 * popup. Base UI's `Select` renders a real, portalled `role="listbox"` that
 * looks and behaves identically everywhere, so that `@supports` block becomes
 * deletable once an app migrates to this component.
 *
 * `Select.Trigger` reads the same `Field` label/description/error/invalid
 * wiring `TextInput` does when nested inside a `Field` (confirmed against
 * the installed 1.7.0 -- see `Field.tsx`), and renders `role="combobox"`
 * with `aria-expanded`/`aria-haspopup="listbox"` on its own.
 *
 * `className`/rest land on `Select.Trigger`, the always-present primary
 * surface; `popupClassName` styles the popup panel, the select's one other
 * meaningful surface -- same shape `Menu` uses, whose own trigger is its
 * primary surface (`className`) and whose popup is its second
 * (`popupClassName`). Rest is spread onto the trigger before `disabled`,
 * matching every other controlled component here, though `disabled` is
 * already extracted as its own named prop so there is no actual clobbering
 * risk to guard against.
 */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
    { options, value, onChange, placeholder, disabled, className, popupClassName, ...rest },
    ref,
) {
    return (
        <BaseSelect.Root items={options} value={value} onValueChange={onChange} disabled={disabled}>
            <BaseSelect.Trigger ref={ref} {...rest} className={cn(TRIGGER_CLASSES, className)}>
                <BaseSelect.Value placeholder={placeholder} className="truncate" />
                <BaseSelect.Icon className="text-faint">
                    <ChevronIcon />
                </BaseSelect.Icon>
            </BaseSelect.Trigger>
            <BaseSelect.Portal>
                <BaseSelect.Positioner className="outline-none" sideOffset={4}>
                    <BaseSelect.Popup
                        className={cn(
                            'ui-floating min-w-[var(--anchor-width)] rounded-card border border-hair bg-panel p-1 shadow-overlay',
                            popupClassName,
                        )}
                    >
                        <BaseSelect.List>
                            {options.map((option) => (
                                <BaseSelect.Item
                                    key={option.value}
                                    value={option.value}
                                    disabled={option.disabled}
                                    className={ITEM_CLASSES}
                                >
                                    <BaseSelect.ItemText className="truncate">{option.label}</BaseSelect.ItemText>
                                    <BaseSelect.ItemIndicator className="shrink-0">
                                        <CheckIcon />
                                    </BaseSelect.ItemIndicator>
                                </BaseSelect.Item>
                            ))}
                        </BaseSelect.List>
                    </BaseSelect.Popup>
                </BaseSelect.Positioner>
            </BaseSelect.Portal>
        </BaseSelect.Root>
    );
});
