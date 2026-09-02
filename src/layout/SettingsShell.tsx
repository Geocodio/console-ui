import type React from 'react';
import { forwardRef, useState } from 'react';
import { TEXT_CONTROL } from '../form/controlClasses.js';
import { cn } from '../lib/cn.js';
import {
    findSettingsNavItem,
    type SettingsNavItem,
    type SettingsNavSection,
    type SettingsSearchHit,
    searchSettingsNav,
    settingsSearchHitHref,
} from './searchSettingsNav.js';

export const SETTINGS_RETURN_TO_STORAGE_KEY = 'settings.return-to';

/**
 * Stamp the URL the shell's back link should return to. An Inertia app would
 * call this from a `router.on('navigate')` listener for every non-settings
 * URL; any router works as long as it is called before the user reaches the
 * shell.
 */
export function rememberSettingsReturnPath(url: string, storageKey: string = SETTINGS_RETURN_TO_STORAGE_KEY): void {
    try {
        sessionStorage.setItem(storageKey, url);
    } catch {
        // Storage may be unavailable (private mode, disabled); the back link
        // then falls back to `backHref`.
    }
}

function readReturnPath(storageKey: string | null): string | null {
    if (storageKey === null || typeof window === 'undefined') {
        return null;
    }
    try {
        return sessionStorage.getItem(storageKey);
    } catch {
        return null;
    }
}

/**
 * The subset of anchor props the shell hands to whatever renders its links.
 * Inertia's `Link` accepts every one of them and can be passed straight
 * through; the default is a plain `<a>` for apps without a client router.
 */
export interface SettingsLinkProps {
    href: string;
    className?: string;
    children?: React.ReactNode;
    onClick?: React.MouseEventHandler<Element>;
    'aria-current'?: 'page';
    'data-testid'?: string;
}

const DefaultLink = forwardRef<HTMLAnchorElement, SettingsLinkProps>(function DefaultLink(props, ref) {
    return <a ref={ref} {...props} />;
});

export interface SettingsShellProps extends React.HTMLAttributes<HTMLDivElement> {
    sections: SettingsNavSection[];
    /** The `slug` of the item whose page is being shown; drives the header and `aria-current`. */
    slug: string;
    /** The current pathname (no query or hash) -- with Inertia, `usePage().url` stripped of both. */
    currentPath: string;
    /** Where the back link lands when nothing was remembered via `rememberSettingsReturnPath`. */
    backHref?: string;
    backLabel?: string;
    /** `sessionStorage` key the back link reads; `null` disables the lookup entirely. */
    returnToStorageKey?: string | null;
    LinkComponent?: React.ComponentType<SettingsLinkProps>;
    /** Runs when Enter is pressed in the search box with at least one hit. Defaults to `window.location.assign`. */
    onNavigate?: (href: string) => void;
    /** Swaps the narrow reading column for a work-surface width. */
    wide?: boolean;
    searchPlaceholder?: string;
    noResultsLabel?: string;
    /** Label on the mobile header button that opens the nav drawer. */
    mobileTitle?: string;
    backIcon?: React.ReactNode;
    searchIcon?: React.ReactNode;
    menuIcon?: React.ReactNode;
}

const NAV_LINK = 'flex items-center gap-2 rounded-control px-2 py-1 text-[13px]';
const NAV_LINK_IDLE = 'text-muted hover:bg-panel-2 hover:text-body';

function ArrowLeftIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
            <path d="M13 8H3M7 4L3 8L7 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function SearchIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

function SidebarIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 3V13" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}

interface NavLinkProps {
    item: SettingsNavItem;
    active: boolean;
    LinkComponent: React.ComponentType<SettingsLinkProps>;
    onNavigate?: () => void;
}

function NavLink({ item, active, LinkComponent, onNavigate }: NavLinkProps) {
    return (
        <LinkComponent
            href={item.href}
            {...(active ? { 'aria-current': 'page' as const } : {})}
            {...(onNavigate ? { onClick: onNavigate } : {})}
            data-testid={`settings-nav-${item.slug}`}
            className={cn(NAV_LINK, active ? 'bg-panel-2 font-medium text-body' : NAV_LINK_IDLE)}
        >
            {item.icon}
            {item.label}
        </LinkComponent>
    );
}

interface SidebarProps {
    sections: SettingsNavSection[];
    currentPath: string;
    backHref: string;
    backLabel: string;
    LinkComponent: React.ComponentType<SettingsLinkProps>;
    onNavigate: (href: string) => void;
    searchPlaceholder: string;
    noResultsLabel: string;
    backIcon: React.ReactNode;
    searchIcon: React.ReactNode;
    onLinkClick?: () => void;
}

function SearchResults({
    hits,
    currentPath,
    noResultsLabel,
    LinkComponent,
    onLinkClick,
}: {
    hits: SettingsSearchHit[];
    currentPath: string;
    noResultsLabel: string;
    LinkComponent: React.ComponentType<SettingsLinkProps>;
    onLinkClick?: () => void;
}) {
    return (
        <div data-testid="settings-search-results" className="flex flex-col gap-0.5">
            {hits.length === 0 && <div className="px-2 py-1 text-[12px] text-faint">{noResultsLabel}</div>}
            {hits.map(({ item, rowHits }) => (
                <div key={item.slug}>
                    <NavLink
                        item={item}
                        active={currentPath === item.href}
                        LinkComponent={LinkComponent}
                        {...(onLinkClick ? { onNavigate: onLinkClick } : {})}
                    />
                    {rowHits.map((row) => (
                        <LinkComponent
                            key={row.id}
                            href={`${item.href}#${row.id}`}
                            {...(onLinkClick ? { onClick: onLinkClick } : {})}
                            data-testid={`settings-search-row-${row.id}`}
                            className={cn('ml-7 flex items-center rounded-control px-2 py-0.5 text-[12px]', NAV_LINK_IDLE)}
                        >
                            {row.label}
                        </LinkComponent>
                    ))}
                </div>
            ))}
        </div>
    );
}

function Sidebar({
    sections,
    currentPath,
    backHref,
    backLabel,
    LinkComponent,
    onNavigate,
    searchPlaceholder,
    noResultsLabel,
    backIcon,
    searchIcon,
    onLinkClick,
}: SidebarProps) {
    const [query, setQuery] = useState('');
    const hits = searchSettingsNav(sections, query);
    const searching = query.trim() !== '';

    return (
        <div className="flex h-full flex-col gap-3 overflow-y-auto p-3">
            <LinkComponent
                href={backHref}
                data-testid="settings-back-to-app"
                {...(onLinkClick ? { onClick: onLinkClick } : {})}
                className={cn(NAV_LINK, 'font-medium', NAV_LINK_IDLE)}
            >
                {backIcon}
                {backLabel}
            </LinkComponent>
            <div className="relative">
                <span className="pointer-events-none absolute left-2 top-1/2 flex -translate-y-1/2 text-faint">{searchIcon}</span>
                {/* `TEXT_CONTROL` carries the form-control `outline-none` exception: its
                    accent border + 3px accent-soft ring is the focus indicator. */}
                <input
                    data-testid="settings-search"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                        const first = hits[0];
                        if (event.key === 'Enter' && first) {
                            event.preventDefault();
                            onNavigate(settingsSearchHitHref(first));
                            onLinkClick?.();
                        }
                        if (event.key === 'Escape') {
                            setQuery('');
                        }
                    }}
                    placeholder={searchPlaceholder}
                    aria-label={searchPlaceholder}
                    className={cn(TEXT_CONTROL, 'h-7 w-full pl-7 pr-2 text-[12.5px] shadow-none')}
                />
            </div>
            {searching ? (
                <SearchResults
                    hits={hits}
                    currentPath={currentPath}
                    noResultsLabel={noResultsLabel}
                    LinkComponent={LinkComponent}
                    {...(onLinkClick ? { onLinkClick } : {})}
                />
            ) : (
                sections.map((section) => (
                    <div key={section.title} data-testid="settings-nav-section">
                        <div className="mb-1 px-2 text-[11.5px] font-medium text-faint">{section.title}</div>
                        <div className="flex flex-col gap-0.5">
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.slug}
                                    item={item}
                                    active={currentPath === item.href}
                                    LinkComponent={LinkComponent}
                                    {...(onLinkClick ? { onNavigate: onLinkClick } : {})}
                                />
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

function defaultNavigate(href: string): void {
    window.location.assign(href);
}

/**
 * A full-window, Linear-style settings chrome -- dedicated sidebar (back link,
 * search, icon nav grouped in sections) plus a narrow content column with the
 * current item's title and description over `children`. Below `lg` the sidebar
 * folds into a drawer behind a header button.
 *
 * Styling goes through token utilities (`rounded-control`, `bg-panel-2`,
 * `shadow-overlay`) rather than raw `var(--...)` arbitrary values, and the
 * search input is `TEXT_CONTROL` with the shell's own geometry on top.
 * Everything router- or app-specific (Inertia `Link`/`usePage`/`router.visit`,
 * the icon set, the nav data, any role-based filtering, `<Head>`, and the
 * notification layer) is a prop or left to the app.
 */
export const SettingsShell = forwardRef<HTMLDivElement, SettingsShellProps>(function SettingsShell(
    {
        sections,
        slug,
        currentPath,
        backHref = '/',
        backLabel = 'Back to app',
        returnToStorageKey = SETTINGS_RETURN_TO_STORAGE_KEY,
        LinkComponent = DefaultLink,
        onNavigate = defaultNavigate,
        wide = false,
        searchPlaceholder = 'Search settings…',
        noResultsLabel = 'No settings match.',
        mobileTitle = 'Settings',
        backIcon = <ArrowLeftIcon />,
        searchIcon = <SearchIcon />,
        menuIcon = <SidebarIcon />,
        className,
        children,
        ...rest
    },
    ref,
) {
    const item = findSettingsNavItem(sections, slug);
    const [returnPath] = useState(() => readReturnPath(returnToStorageKey));
    const [drawerOpen, setDrawerOpen] = useState(false);

    const sidebarProps: SidebarProps = {
        sections,
        currentPath,
        backHref: returnPath ?? backHref,
        backLabel,
        LinkComponent,
        onNavigate,
        searchPlaceholder,
        noResultsLabel,
        backIcon,
        searchIcon,
    };

    return (
        <div ref={ref} {...rest} className={cn('flex h-dvh w-screen overflow-hidden bg-app text-body', className)}>
            <div data-testid="settings-sidebar" className="hidden w-60 shrink-0 border-r border-hair bg-sidebar lg:block">
                <Sidebar {...sidebarProps} />
            </div>
            <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <div className="flex h-11 items-center gap-2 border-b border-hair px-3 pt-[max(env(safe-area-inset-top),0px)] lg:hidden">
                    <button
                        type="button"
                        data-testid="settings-mobile-nav"
                        aria-expanded={drawerOpen}
                        onClick={() => setDrawerOpen(true)}
                        className="flex items-center gap-2 rounded-control px-2 py-1 text-[14px] font-semibold"
                    >
                        <span className="flex text-faint">{menuIcon}</span>
                        {mobileTitle}
                    </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <div className={cn('mx-auto px-6 py-10 max-lg:px-4 max-lg:py-6', wide ? 'max-w-6xl' : 'max-w-2xl')}>
                        {item && (
                            <div className="mb-9">
                                <h1 className="text-[20px] font-semibold tracking-[-0.01em]">{item.label}</h1>
                                {item.description && <p className="mt-1.5 text-[13px] text-muted">{item.description}</p>}
                            </div>
                        )}
                        {children}
                    </div>
                </div>
            </main>
            {drawerOpen && (
                // biome-ignore lint/a11y/noStaticElementInteractions: the backdrop only dismisses; the drawer inside is the focusable surface.
                // biome-ignore lint/a11y/useKeyWithClickEvents: Escape is handled on the drawer below.
                <div
                    data-testid="settings-mobile-backdrop"
                    className="fixed inset-0 z-40 animate-fade-in bg-black/30 lg:hidden"
                    onClick={() => setDrawerOpen(false)}
                >
                    <div
                        data-testid="settings-mobile-drawer"
                        role="dialog"
                        aria-label={mobileTitle}
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => {
                            if (event.key === 'Escape') {
                                setDrawerOpen(false);
                            }
                        }}
                        className="h-full w-64 border-r border-hair bg-sidebar shadow-overlay"
                    >
                        <Sidebar {...sidebarProps} onLinkClick={() => setDrawerOpen(false)} />
                    </div>
                </div>
            )}
        </div>
    );
});
