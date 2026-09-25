import type React from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/cn.js';

/**
 * The subset of anchor props the bar hands to whatever renders a link slot.
 * Inertia's `Link` accepts every one of them; the default is a plain `<a>`.
 */
export interface TabBarLinkProps {
    href: string;
    className?: string;
    children?: React.ReactNode;
    onClick?: React.MouseEventHandler<Element>;
    'aria-current'?: 'page';
    'data-testid'?: string;
}

const DefaultLink = forwardRef<HTMLAnchorElement, TabBarLinkProps>(function DefaultLink(props, ref) {
    return <a ref={ref} {...props} />;
});

export interface TabBarItem {
    key: string;
    label: string;
    /** A 22px icon. Any svg is sized by the slot. */
    icon: React.ReactNode;
    /** Renders the slot as a link through `LinkComponent`. Omit for a button slot (a "More" slot that opens a drawer). */
    href?: string;
    onSelect?: () => void;
    active?: boolean;
    /** A small count on the icon's corner. Hidden for 0, an empty string, null or undefined. */
    badge?: number | string | null;
    testId?: string;
}

export interface TabBarAction {
    /** Accessible name of the round button. */
    label: string;
    icon: React.ReactNode;
    onSelect: () => void;
    testId?: string;
}

export interface TabBarProps extends React.HTMLAttributes<HTMLElement> {
    /** Three to five slots. */
    items: TabBarItem[];
    /** The round accent button beside the pill, for the one thing people create from anywhere. */
    action?: TabBarAction;
    LinkComponent?: React.ComponentType<TabBarLinkProps>;
    /** Accessible name of the nav landmark. */
    label?: string;
}

const SLOT_CLASSES =
    'relative flex h-14 w-14 shrink-0 flex-col items-center justify-center gap-1 rounded-pill text-[10px] font-medium leading-none';
const SLOT_IDLE_CLASSES = 'text-faint hover:text-muted';
const SLOT_ACTIVE_CLASSES = 'text-accent-text';

function hasBadge(badge: TabBarItem['badge']): badge is number | string {
    return badge !== null && badge !== undefined && badge !== 0 && badge !== '';
}

function Slot({ item, LinkComponent }: { item: TabBarItem; LinkComponent: React.ComponentType<TabBarLinkProps> }) {
    const content = (
        <>
            <span className="relative flex items-center justify-center [&>svg]:size-[22px]">
                {item.icon}
                {hasBadge(item.badge) && (
                    <span
                        data-testid={item.testId ? `${item.testId}-badge` : undefined}
                        className="absolute -top-1.5 left-full -ml-2 rounded-pill bg-accent px-1 text-[9px] font-semibold leading-[14px] text-accent-ink"
                    >
                        {item.badge}
                    </span>
                )}
            </span>
            <span>{item.label}</span>
        </>
    );
    const className = cn(SLOT_CLASSES, item.active ? SLOT_ACTIVE_CLASSES : SLOT_IDLE_CLASSES);
    const current = item.active ? ('page' as const) : undefined;

    if (item.href !== undefined) {
        return (
            <LinkComponent
                href={item.href}
                {...(item.onSelect ? { onClick: item.onSelect } : {})}
                {...(current ? { 'aria-current': current } : {})}
                {...(item.testId ? { 'data-testid': item.testId } : {})}
                className={className}
            >
                {content}
            </LinkComponent>
        );
    }

    return (
        <button type="button" onClick={item.onSelect} aria-current={current} data-testid={item.testId} className={className}>
            {content}
        </button>
    );
}

/**
 * The floating bottom bar for phones: a translucent pill holding three to
 * five slots, and an optional round accent button beside it for the app's
 * one create action. The bar is a strip in normal flow (76px plus the safe
 * area), not an overlay, so page content never scrolls under it; the
 * gradient drawn above the strip makes content read as fading beneath.
 *
 * The bar carries no breakpoint of its own. The app shell decides when it
 * shows, normally `className="lg:hidden"` beside a sidebar that is `hidden
 * lg:flex`.
 *
 * `className`/rest land on the `<nav>`; a caller's `data-testid` replaces
 * the default `tab-bar`.
 */
export const TabBar = forwardRef<HTMLElement, TabBarProps>(function TabBar(
    { items, action, LinkComponent = DefaultLink, label = 'Main', className, ...rest },
    ref,
) {
    return (
        <nav
            ref={ref}
            data-testid="tab-bar"
            {...rest}
            aria-label={label}
            className={cn(
                'ui-tab-bar relative flex shrink-0 items-center justify-center gap-2.5 px-4 pt-2 pb-[max(env(safe-area-inset-bottom),0.75rem)]',
                'before:pointer-events-none before:absolute before:inset-x-0 before:-top-6 before:h-6 before:bg-linear-to-t before:from-app before:to-transparent',
                className,
            )}
        >
            <div className="flex h-[60px] items-center rounded-pill border border-hair bg-panel/90 px-2 shadow-overlay backdrop-blur-xl">
                {items.map((item) => (
                    <Slot key={item.key} item={item} LinkComponent={LinkComponent} />
                ))}
            </div>
            {action && (
                <button
                    type="button"
                    aria-label={action.label}
                    onClick={action.onSelect}
                    data-testid={action.testId}
                    className="flex size-14 shrink-0 items-center justify-center rounded-pill bg-accent text-accent-ink shadow-overlay hover:opacity-90 [&>svg]:size-6"
                >
                    {action.icon}
                </button>
            )}
        </nav>
    );
});
