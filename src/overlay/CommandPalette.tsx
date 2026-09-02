import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type React from 'react';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { Kbd } from '../display/Kbd.js';
import { cn } from '../lib/cn.js';

export interface CommandPaletteItem {
    /** Stable identity for the row; also seeds `data-testid` when `testId` is not given. */
    id: string;
    label: React.ReactNode;
    /** Muted text at the trailing edge -- a type, a group, a context hint. */
    hint?: React.ReactNode;
    /** Already-parsed keycap labels, rendered through `Kbd`. */
    shortcut?: string[];
    /** Paints the label in the fail tone. */
    destructive?: boolean;
    /** Indents the row under the one above it, for child actions of a result. */
    nested?: boolean;
    onSelect: () => void;
    testId?: string;
}

export interface CommandPaletteSection {
    /** Omit for an untitled block of rows. */
    title?: string;
    items: CommandPaletteItem[];
}

export interface CommandPaletteProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onKeyDown'> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    query: string;
    onQueryChange: (query: string) => void;
    sections: CommandPaletteSection[];
    /** Accessible name of the dialog. Visually hidden. */
    label?: string;
    placeholder?: string;
    /** Shown in place of the list when every section is empty. */
    emptyMessage?: React.ReactNode;
    /** Controlled selection. Leave both unset and the palette tracks it. */
    selectedIndex?: number;
    onSelectedIndexChange?: (index: number) => void;
    /**
     * Runs before the palette's own key handling. Call `preventDefault()` to
     * claim a key: the palette then skips its arrow/Enter handling for it,
     * and a claimed Escape keeps the palette open instead of closing it.
     */
    onInputKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
    /** Spread onto the search input (`data-testid`, `spellCheck`, `aria-*`, ...). */
    inputProps?: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onKeyDown' | 'placeholder'>;
    inputRef?: React.Ref<HTMLInputElement>;
    /** Tailwind width utility for the popup. */
    width?: string;
    /**
     * Rendered inside the popup after the list. A `ConfirmDialog` placed here
     * nests inside the palette, so Escape and backdrop dismissal close only
     * the confirm while it is open.
     */
    children?: React.ReactNode;
}

/**
 * The shell of a ⌘K-style palette: a top-anchored modal with a search input,
 * a sectioned list and keyboard selection. It owns none of the data -- the
 * caller filters, ranks, fetches and decides what each row does -- which is
 * the part that differs between apps, while the shell is what they had each
 * built three times over.
 *
 * Rows are plain `<button>`s, not a listbox: a palette mixes navigation,
 * commands and result rows, and the callers' existing tests address them as
 * buttons. The current row carries `data-selected="true"`.
 *
 * Built on Base UI's dialog for the portal, focus containment, scroll lock,
 * Escape and backdrop dismissal, and nested-dialog awareness. The input is a
 * raw `<input>` rather than `TextInput`: it is full-bleed and borderless, and
 * the popup border is the focus surface. `className`/rest land on the popup.
 */
export const CommandPalette = forwardRef<HTMLDivElement, CommandPaletteProps>(function CommandPalette(
    {
        open,
        onOpenChange,
        query,
        onQueryChange,
        sections,
        label = 'Command palette',
        placeholder = 'Type a command or search…',
        emptyMessage = 'No matches',
        selectedIndex: controlledIndex,
        onSelectedIndexChange,
        onInputKeyDown,
        inputProps,
        inputRef,
        width = 'w-[min(600px,calc(100vw-2rem))]',
        children,
        className,
        ...rest
    },
    ref,
) {
    const items = useMemo(() => sections.flatMap((section) => section.items), [sections]);
    const [uncontrolledIndex, setUncontrolledIndex] = useState(0);
    const selected = Math.min(controlledIndex ?? uncontrolledIndex, Math.max(0, items.length - 1));
    const escapeClaimedRef = useRef(false);
    const listRef = useRef<HTMLDivElement>(null);

    const setSelected = (next: number) => {
        setUncontrolledIndex(next);
        onSelectedIndexChange?.(next);
    };

    // A new query invalidates the row under the cursor. `setState` in an
    // effect keyed on the query is the one place this can live without the
    // caller having to mirror it, and it is a no-op in controlled mode.
    // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on `query` deliberately
    useEffect(() => {
        setUncontrolledIndex(0);
    }, [query]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: re-run whenever the selection moves, which is what `selected` tracks
    useEffect(() => {
        listRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView?.({ block: 'nearest' });
    }, [selected]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        onInputKeyDown?.(event);
        if (event.defaultPrevented) {
            if (event.key === 'Escape') {
                escapeClaimedRef.current = true;
                queueMicrotask(() => {
                    escapeClaimedRef.current = false;
                });
            }
            return;
        }
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setSelected(Math.min(items.length - 1, selected + 1));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setSelected(Math.max(0, selected - 1));
        } else if (event.key === 'Enter') {
            event.preventDefault();
            items[selected]?.onSelect();
        }
    };

    let rowIndex = -1;

    return (
        <BaseDialog.Root
            open={open}
            onOpenChange={(next, details) => {
                if (!next && escapeClaimedRef.current) {
                    details.cancel();
                    return;
                }
                onOpenChange(next);
            }}
        >
            <BaseDialog.Portal>
                <BaseDialog.Backdrop className="ui-backdrop fixed inset-0 bg-black/30" />
                <BaseDialog.Popup
                    ref={ref}
                    {...rest}
                    className={cn(
                        'ui-palette fixed left-1/2 top-[14vh] -translate-x-1/2 overflow-hidden',
                        width,
                        'rounded-card border border-hair-strong bg-panel-2 shadow-overlay',
                        className,
                    )}
                >
                    <BaseDialog.Title className="sr-only">{label}</BaseDialog.Title>
                    <input
                        {...inputProps}
                        ref={inputRef}
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className={cn(
                            'w-full border-b border-hair bg-transparent px-4 py-3 text-[13.5px] text-body outline-none placeholder:text-faint',
                            inputProps?.className,
                        )}
                    />
                    <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-1.5">
                        {sections.map((section, sectionIndex) =>
                            section.items.length === 0 ? null : (
                                <div key={section.title ?? sectionIndex} className="mb-1 last:mb-0">
                                    {section.title && (
                                        <div className="px-3 pb-0.5 pt-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-faint">
                                            {section.title}
                                        </div>
                                    )}
                                    {section.items.map((item) => {
                                        rowIndex += 1;
                                        const index = rowIndex;
                                        const isSelected = index === selected;

                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                data-testid={item.testId ?? `palette-item-${item.id}`}
                                                data-selected={isSelected ? 'true' : undefined}
                                                onClick={item.onSelect}
                                                onMouseEnter={() => setSelected(index)}
                                                className={cn(
                                                    'flex w-full items-baseline justify-between gap-3 rounded-control py-2 text-left text-[13px]',
                                                    item.nested ? 'pl-7 pr-3' : 'px-3',
                                                    item.destructive ? 'text-fail' : 'text-body',
                                                    isSelected ? 'bg-accent-soft' : 'hover:bg-accent-soft',
                                                )}
                                            >
                                                <span className="min-w-0 truncate">
                                                    {item.nested && <span className="mr-1.5 text-faint">↳</span>}
                                                    {item.label}
                                                </span>
                                                <span className="flex shrink-0 items-center gap-2 text-[11px] text-faint">
                                                    {item.shortcut && <Kbd keys={item.shortcut} />}
                                                    {item.hint && <span>{item.hint}</span>}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            ),
                        )}
                        {items.length === 0 && <p className="px-3 py-2 text-[13px] text-faint">{emptyMessage}</p>}
                    </div>
                    {children}
                </BaseDialog.Popup>
            </BaseDialog.Portal>
        </BaseDialog.Root>
    );
});
