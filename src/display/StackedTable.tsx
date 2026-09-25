import type React from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/cn.js';
import { Table, Tbody, Td, Thead, Tr, type TrProps } from './Table.js';

/**
 * `Table` parts that collapse into stacked rows below `md`: the header row
 * hides, each `<tr>` becomes a block with a hairline under it, and each
 * `<td>` becomes a flex row whose column label (from `label`) is drawn
 * before the value. Above `md` the parts are exactly `Table`/`Thead`/
 * `Tbody`/`Tr`/`Td`, so a page swaps its imports and keeps its markup.
 *
 * The header keeps using plain `Th` cells; those are hidden with the
 * `StackedThead`, so they need no stacked variant.
 */
export const StackedTable = forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement>>(
    function StackedTable({ className, ...rest }, ref) {
        return <Table ref={ref} {...rest} className={cn('max-md:block', className)} />;
    },
);

export const StackedThead = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
    function StackedThead({ className, ...rest }, ref) {
        return <Thead ref={ref} {...rest} className={cn('max-md:hidden', className)} />;
    },
);

export const StackedTbody = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
    function StackedTbody({ className, ...rest }, ref) {
        return <Tbody ref={ref} {...rest} className={cn('max-md:block', className)} />;
    },
);

export const StackedTr = forwardRef<HTMLTableRowElement, TrProps>(function StackedTr({ className, ...rest }, ref) {
    return <Tr ref={ref} {...rest} className={cn('max-md:block max-md:h-auto max-md:py-2.5', className)} />;
});

export interface StackedTdProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
    /** The column label drawn before the value below `md`. Omit for a cell that needs none (an actions cell). */
    label?: string;
}

const LABEL_CLASSES =
    'max-md:before:w-24 max-md:before:shrink-0 max-md:before:text-[11px] max-md:before:font-semibold max-md:before:uppercase max-md:before:tracking-[0.06em] max-md:before:text-muted max-md:before:content-[attr(data-label)]';

export const StackedTd = forwardRef<HTMLTableCellElement, StackedTdProps>(function StackedTd(
    { label, className, ...rest },
    ref,
) {
    return (
        <Td
            ref={ref}
            {...rest}
            {...(label !== undefined ? { 'data-label': label } : {})}
            className={cn(
                'max-md:flex max-md:items-baseline max-md:gap-3 max-md:px-0 max-md:py-1',
                label !== undefined && LABEL_CLASSES,
                className,
            )}
        />
    );
});
