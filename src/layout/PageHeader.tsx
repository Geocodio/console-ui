import type React from 'react';
import { forwardRef } from 'react';
import { Button } from '../form/Button.js';
import { cn } from '../lib/cn.js';
import { Menu, type MenuItemSpec } from '../overlay/Menu.js';

function ChevronRightIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="shrink-0 text-faint">
            <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function MoreIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <circle cx="3" cy="8" r="1.4" />
            <circle cx="8" cy="8" r="1.4" />
            <circle cx="13" cy="8" r="1.4" />
        </svg>
    );
}

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
    /** Shown after the crumbs as the current page. */
    title?: React.ReactNode;
    /** Breadcrumb trail. When there is no `title`, the last crumb is the current page. */
    crumbs?: React.ReactNode[];
    /** The primary action, always visible. One button on pages that also pass `overflow`. */
    actions?: React.ReactNode;
    /** Secondary actions: tertiary buttons from `sm` up, a "More" menu below it. */
    overflow?: MenuItemSpec[];
    /** Accessible name of the "More" menu trigger. */
    overflowLabel?: string;
    overflowIcon?: React.ReactNode;
    /** Tab strips, toggles, search boxes. Inline from `sm` up, a full-width second row below. */
    children?: React.ReactNode;
}

/**
 * The 48px page header every page opens with: crumbs and title on the left,
 * actions on the right, and a middle slot for tab strips and toggles.
 *
 * Below `sm` the header wraps instead of clipping. The middle slot drops to
 * a full-width second row, the crumbs truncate, and `overflow` actions fold
 * into a menu so the primary action stays reachable. Above `sm` the same
 * markup lays out on one row, with the overflow actions as tertiary buttons.
 *
 * `className`/rest land on the `<header>`. Native `title` is excluded from
 * the spreadable rest because `title` already names the page-title prop.
 */
export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(function PageHeader(
    { title, crumbs, actions, overflow, overflowLabel = 'More actions', overflowIcon, children, className, ...rest },
    ref,
) {
    const hasOverflow = overflow !== undefined && overflow.length > 0;

    return (
        <header
            ref={ref}
            {...rest}
            className={cn(
                'flex min-h-12 shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-hair bg-app px-4 py-2 sm:flex-nowrap sm:px-5 sm:py-0',
                className,
            )}
        >
            <div data-testid="page-header-crumbs" className="order-1 flex min-w-0 flex-1 items-center gap-1.5 text-[13px] sm:flex-initial">
                {crumbs?.map((crumb, index) => (
                    <span key={String(crumb)} className="flex min-w-0 items-center gap-1.5">
                        {index > 0 && <ChevronRightIcon />}
                        <span className={cn('min-w-0 truncate', index === crumbs.length - 1 && !title ? 'font-medium text-body' : 'text-muted')}>{crumb}</span>
                    </span>
                ))}
                {title !== undefined && title !== null && (
                    <>
                        {crumbs && crumbs.length > 0 && <ChevronRightIcon />}
                        <span className="min-w-0 truncate font-medium text-body">{title}</span>
                    </>
                )}
            </div>

            {children !== undefined && children !== null && (
                <div
                    data-testid="page-header-slot"
                    className="order-3 flex w-full min-w-0 flex-wrap items-center gap-2 sm:order-2 sm:w-auto sm:flex-1"
                >
                    {children}
                </div>
            )}

            <div data-testid="page-header-actions" className="order-2 ml-auto flex shrink-0 items-center gap-2 sm:order-3">
                {actions}
                {hasOverflow && (
                    <>
                        <div data-testid="page-header-overflow-buttons" className="hidden items-center gap-2 sm:flex">
                            {overflow.map((item) => (
                                <Button
                                    key={item.key}
                                    variant="tertiary"
                                    icon={item.icon}
                                    disabled={item.disabled}
                                    onClick={item.onSelect}
                                    data-testid={item.testId}
                                    className={item.danger ? 'text-fail hover:text-fail' : undefined}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </div>
                        <Menu
                            trigger={overflowIcon ?? <MoreIcon />}
                            aria-label={overflowLabel}
                            items={overflow}
                            align="end"
                            data-testid="page-header-overflow-menu"
                            className="h-8 w-8 justify-center px-0 sm:hidden"
                        />
                    </>
                )}
            </div>
        </header>
    );
});
