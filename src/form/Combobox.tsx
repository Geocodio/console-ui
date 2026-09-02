import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type React from 'react';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../lib/cn.js';

export interface ComboboxOption {
    value: string;
    label: string;
    /** Secondary line under the label in the list. */
    description?: string;
    disabled?: boolean;
}

export interface ComboboxProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue'> {
    options: ComboboxOption[];
    value: string | null;
    onChange: (value: string | null) => void;
    placeholder?: string;
    /** Accept free text that matches no option. See below. */
    allowCustom?: boolean;
    disabled?: boolean;
    /** Classes for the popup panel -- the combobox's second surface. */
    popupClassName?: string;
}

// Same visual spec as `TextInput`'s `CONTROL` (see that file for the
// provenance note on the literal-shadow cleanup and the `outline-none`
// exception) -- widened to a block-level control and given room on the right
// for the chevron `Combobox.Icon` sits over.
const CONTROL =
    'block h-8 w-full rounded-control border border-hair-strong bg-panel pl-3 pr-7 text-[13px] text-body ' +
    'shadow-card placeholder:text-faint disabled:cursor-not-allowed disabled:opacity-50 outline-none ' +
    'transition-[box-shadow,border-color] hover:border-faint focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]';

const ITEM_CLASSES =
    'flex cursor-default select-none flex-col gap-0.5 rounded-control px-2.5 py-1.5 text-[12.5px] text-body ' +
    'outline-none data-[highlighted]:bg-panel-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-40';

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

function findByLabel(options: ComboboxOption[], text: string): ComboboxOption | undefined {
    const needle = text.trim().toLowerCase();
    return options.find((option) => option.label.toLowerCase() === needle);
}

function isSameOption(a: ComboboxOption | null, b: ComboboxOption | null): boolean {
    return (a?.value ?? null) === (b?.value ?? null);
}

/**
 * A searchable picker. The usual stand-ins are a `Menu` behind a pill
 * (no search at all) and a native `<select>` upgraded via a Chromium-only
 * `appearance: base-select` CSS trick (see `Select.tsx`'s doc comment);
 * neither gives a typeahead over a committed selection.
 *
 * Built on `@base-ui/react/combobox` rather than `@base-ui/react/autocomplete`:
 * confirmed against the installed 1.7.0 that Autocomplete's `value` prop is
 * the input's free-text query string (`AutocompleteRootProps.value` is typed
 * from `AriaCombobox.Props<...>['inputValue']`), with no selection concept at
 * all -- it's built for search-as-you-type, not a picker with a committed
 * value. Combobox's `value`/`onValueChange` are real selection state, which
 * is what this component's `value: string | null` contract needs.
 *
 * The combobox's `items` are the full `ComboboxOption` objects (not bare
 * value strings), since Base UI special-cases the `{ value, label }` item
 * shape for its own `itemToStringLabel`/`itemToStringValue`, which is what
 * drives the built-in type-to-filter behind `Combobox.List`. This component
 * still exposes a plain `string | null` externally: `selectedOption` is
 * looked up from `options` by `value` each render and handed to
 * `Combobox.Root`, and `onValueChange` unwraps the option back to its
 * `.value` before calling the caller's `onChange`.
 *
 * A committed `allowCustom` value that matches no real option is appended to
 * `items` as a synthetic one-off entry (`effectiveOptions`/`effectiveSelected`
 * below) so it, too, has a real item for `Combobox.Root` to treat as
 * "selected". This isn't cosmetic: measured against the installed package,
 * `ComboboxRoot`'s internal close/unmount handler re-syncs the input's text
 * to `stringifyAsLabel(selectedValue)` on every close, using its OWN
 * `value` prop -- not anything this component computes on the side. Handing
 * it `null` for a value that is legitimately committed but merely absent
 * from `options` made it snap the input back to empty text after every
 * custom commit, clobbering the just-typed value. Giving it a same-shaped
 * item to point `value` at (rather than fighting that resync with more
 * local state) keeps this component working with Base UI's model instead of
 * around it.
 *
 * `inputValue` is a second piece of state this component owns itself,
 * decoupled from the committed `value` -- it's what the user is currently
 * typing/filtering by, and only gets reconciled back to the committed
 * value's label when the popup closes. That reconciliation is
 * `commitInputValue`, run from `onOpenChange` on every close that ISN'T a
 * plain item selection (tracked via `justSelectedRef`, set synchronously in
 * `onValueChange` and read back in the `onOpenChange` that follows in the
 * same interaction -- selecting an item already drove `onChange` once, so
 * skip re-deriving a commit from the input text and firing it again) and
 * isn't Escape (which reverts with no `onChange` call at all, matching
 * combobox conventions). On every other close -- Enter with nothing
 * highlighted, or blur -- typed text that matches an option's label commits
 * that option; text that matches nothing commits as free text when
 * `allowCustom` is true, and otherwise reverts to the last committed label.
 *
 * `className`/rest land on `Combobox.Input`, the always-present primary
 * surface; `popupClassName` styles the popup panel, matching `Select`'s and
 * `Menu`'s shape for a second surface.
 */
export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
    { options, value, onChange, placeholder, allowCustom, disabled, className, popupClassName, ...rest },
    ref,
) {
    const selectedOption = options.find((option) => option.value === value) ?? null;
    const customSelection = !selectedOption && allowCustom && value ? { value, label: value } : null;
    const effectiveSelected = selectedOption ?? customSelection;
    const effectiveOptions = useMemo(
        () => (customSelection ? [...options, customSelection] : options),
        [options, customSelection],
    );
    const committedLabel = effectiveSelected ? effectiveSelected.label : '';

    const [inputValue, setInputValue] = useState(committedLabel);
    const justSelectedRef = useRef(false);

    useEffect(() => {
        setInputValue(committedLabel);
    }, [committedLabel]);

    function commitInputValue() {
        const trimmed = inputValue.trim();

        if (trimmed === '') {
            if (allowCustom) {
                if (value !== null) {
                    onChange(null);
                }
            } else {
                setInputValue(committedLabel);
            }
            return;
        }

        const match = findByLabel(options, trimmed);
        if (match) {
            if (match.value !== value) {
                onChange(match.value);
            }
            setInputValue(match.label);
            return;
        }

        if (allowCustom) {
            if (trimmed !== value) {
                onChange(trimmed);
            }
            setInputValue(trimmed);
            return;
        }

        setInputValue(committedLabel);
    }

    return (
        <BaseCombobox.Root
            items={effectiveOptions}
            value={effectiveSelected}
            isItemEqualToValue={isSameOption}
            onValueChange={(item) => {
                justSelectedRef.current = true;
                onChange(item ? item.value : null);
            }}
            inputValue={inputValue}
            onInputValueChange={setInputValue}
            disabled={disabled}
            onOpenChange={(open, eventDetails) => {
                if (open) {
                    return;
                }
                if (justSelectedRef.current) {
                    justSelectedRef.current = false;
                    return;
                }
                if (eventDetails.reason === 'escape-key') {
                    setInputValue(committedLabel);
                    return;
                }
                commitInputValue();
            }}
        >
            <BaseCombobox.InputGroup className="relative">
                <BaseCombobox.Input
                    ref={ref}
                    {...rest}
                    placeholder={placeholder}
                    className={cn(CONTROL, className)}
                />
                <BaseCombobox.Icon className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-faint">
                    <ChevronIcon />
                </BaseCombobox.Icon>
            </BaseCombobox.InputGroup>
            <BaseCombobox.Portal>
                <BaseCombobox.Positioner className="outline-none" sideOffset={4}>
                    <BaseCombobox.Popup
                        className={cn(
                            'ui-floating min-w-[var(--anchor-width)] rounded-card border border-hair bg-panel p-1 shadow-overlay',
                            popupClassName,
                        )}
                    >
                        <BaseCombobox.Empty className="px-2.5 py-1.5 text-[12.5px] text-muted">
                            No matches
                        </BaseCombobox.Empty>
                        <BaseCombobox.List>
                            {(item: ComboboxOption) => (
                                <BaseCombobox.Item
                                    key={item.value}
                                    value={item}
                                    disabled={item.disabled}
                                    className={ITEM_CLASSES}
                                >
                                    <span className="truncate">{item.label}</span>
                                    {item.description && (
                                        <span className="truncate text-[11.5px] text-muted">{item.description}</span>
                                    )}
                                </BaseCombobox.Item>
                            )}
                        </BaseCombobox.List>
                    </BaseCombobox.Popup>
                </BaseCombobox.Positioner>
            </BaseCombobox.Portal>
        </BaseCombobox.Root>
    );
});
