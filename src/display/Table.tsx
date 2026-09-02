import type React from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/cn.js';

/**
 * Presentational table parts mapped onto package tokens. Headless of any
 * data library on purpose: a package shared across apps must not force a
 * table library on all of them. These parts are plain markup -- an app can
 * keep its TanStack Table wiring and feed `Table`/`Thead`/`Tbody`/`Tr`/
 * `Th`/`Td`, and hand-rolled table markup can feed them too.
 *
 * `Td` deliberately does not hardcode `font-mono` -- monospace cells are a
 * domain choice for things like build data, not a table default. A caller
 * wanting monospace columns passes `className="font-mono"`.
 */
export const Table = forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement>>(function Table(
    { className, ...rest },
    ref,
) {
    return <table ref={ref} {...rest} className={cn('w-full border-collapse text-[13px]', className)} />;
});

export const Thead = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
    function Thead({ className, ...rest }, ref) {
        return (
            <thead ref={ref} {...rest} className={cn('[&>tr]:border-b [&>tr]:border-hair-strong', className)} />
        );
    },
);

export const Tbody = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
    function Tbody({ className, ...rest }, ref) {
        return <tbody ref={ref} {...rest} className={cn(className)} />;
    },
);

export const Th = forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(function Th(
    { className, ...rest },
    ref,
) {
    return (
        <th
            ref={ref}
            {...rest}
            className={cn('px-2 py-2 text-left text-[12px] font-semibold uppercase tracking-[0.06em] text-muted', className)}
        />
    );
});

/**
 * No `font-mono` here -- see the module doc comment. Callers that want
 * monospace columns (build IDs, coordinates, etc.) pass their own
 * `className="font-mono"`.
 */
export const Td = forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(function Td(
    { className, ...rest },
    ref,
) {
    return <td ref={ref} {...rest} className={cn('px-2 text-body', className)} />;
});

export interface TrProps extends React.HTMLAttributes<HTMLTableRowElement> {
    /** Row is selected. Sets `aria-selected` as well as the visual state. */
    selected?: boolean;
    /** Row responds to clicks -- adds the pointer affordance and hover state. */
    interactive?: boolean;
}

/**
 * The header row (inside `Thead`) gets its rule from `Thead`'s own
 * `[&>tr]:border-b` -- a direct-child selector, not a descendant one -- this
 * component itself only carries the body-row styling, since a header row
 * never needs the 38px height, hover, or selected states. A caller renders
 * `<Thead><tr>...` with plain markup or this same `Tr`; either way, only a
 * `tr` that is a direct child of `Thead` picks up the border rule -- it does
 * not cascade to rows nested more deeply.
 *
 * `selected` sets `aria-selected` so assistive tech gets the same signal as
 * the background colour -- colour alone would make the state invisible to
 * screen reader users.
 *
 * `interactive` only adds pointer/hover affordances; it does not add
 * `tabIndex` or key handling. A clickable row that only responds to a mouse
 * is a real accessibility gap, but making every interactive row focusable
 * and Enter/Space-activatable by default has real costs here: nested
 * interactive elements (a link, a checkbox, a menu button) inside the row
 * would fight the row's own key handling and produce double-activation or a
 * confusing tab order, and `TrProps` has no `onActivate` contract to
 * standardize the fallback behaviour around. `interactive` rows commonly
 * wrap a real link or button as their primary target, which already carries
 * its own keyboard semantics; a `Tr` that is *only* clickable, with no
 * focusable descendant, is the gap this decision leaves to the caller.
 * Callers with that shape should add `tabIndex={0}`, `role="button"` (or a
 * wrapping `<a>`), and their own key handler -- the primitive stays
 * unopinionated rather than guessing at activation semantics that don't fit
 * every table.
 */
export const Tr = forwardRef<HTMLTableRowElement, TrProps>(function Tr(
    { selected, interactive, className, ...rest },
    ref,
) {
    return (
        <tr
            ref={ref}
            {...rest}
            aria-selected={selected ? true : undefined}
            className={cn(
                'h-[38px] border-b border-hair',
                interactive && 'cursor-pointer hover:bg-panel-2',
                selected && 'bg-panel-2',
                className,
            )}
        />
    );
});
