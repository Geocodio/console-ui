import { ToastHost } from '@geocodio/console-ui';
import { href, routePath } from './paths';
import { ButtonRoute } from './routes/ButtonRoute';
import { ChoiceRoute } from './routes/ChoiceRoute';
import { ComboboxRoute } from './routes/ComboboxRoute';
import { ConfirmRoute } from './routes/ConfirmRoute';
import { DialogRoute } from './routes/DialogRoute';
import { DisplayRoute } from './routes/DisplayRoute';
import { FormRoute } from './routes/FormRoute';
import { MenuRoute } from './routes/MenuRoute';
import { PaletteRoute } from './routes/PaletteRoute';
import { SettingsRoute } from './routes/SettingsRoute';
import { SheetRoute } from './routes/SheetRoute';
import { TableRoute } from './routes/TableRoute';
import { ToastRoute } from './routes/ToastRoute';
import { Tokens } from './routes/Tokens';
import { TooltipRoute } from './routes/TooltipRoute';

const THEME_STORAGE_KEY = 'ui-playground-theme';

/**
 * Persists to localStorage so the choice survives a full page reload -- the
 * nav here is plain `<a href>` with no client router, so every nav click IS
 * a full reload. `index.html` reads this same key in a blocking inline
 * script before first paint, so the stored theme never flashes the OS theme
 * first. 'system' removes both the attribute and the stored value so control
 * returns to the OS, rather than storing a third data-theme value nothing
 * matches.
 */
function setTheme(theme: 'light' | 'dark' | 'system'): void {
    if (theme === 'system') {
        document.documentElement.removeAttribute('data-theme');
        try {
            localStorage.removeItem(THEME_STORAGE_KEY);
        } catch {
            // Storage may be unavailable (private mode, disabled); the
            // attribute removal above still applies for this page's lifetime.
        }
        return;
    }
    document.documentElement.setAttribute('data-theme', theme);
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // Same as above -- the attribute still applies for this page's lifetime.
    }
}

function ThemeSwitcher() {
    return (
        <div className="flex gap-1">
            <button
                type="button"
                data-testid="theme-light"
                onClick={() => setTheme('light')}
                className="rounded-control border border-hair-strong bg-panel px-2 py-1 text-[11px]"
            >
                Light
            </button>
            <button
                type="button"
                data-testid="theme-dark"
                onClick={() => setTheme('dark')}
                className="rounded-control border border-hair-strong bg-panel px-2 py-1 text-[11px]"
            >
                Dark
            </button>
            <button
                type="button"
                data-testid="theme-system"
                onClick={() => setTheme('system')}
                className="rounded-control border border-hair-strong bg-panel px-2 py-1 text-[11px]"
            >
                System
            </button>
        </div>
    );
}

const NAV_LINKS = [
    { href: '/tokens', label: 'Tokens', description: 'Colours, type and elevation' },
    { href: '/button', label: 'Button', description: 'Actions and icon buttons' },
    { href: '/dialog', label: 'Dialog', description: 'Modal shell, default and alert' },
    { href: '/confirm', label: 'Confirm', description: 'Destructive-action confirm' },
    { href: '/sheet', label: 'Sheet', description: 'Edge-anchored panel' },
    { href: '/form', label: 'Form', description: 'Field, TextInput, Select' },
    { href: '/choice', label: 'Choice', description: 'Checkbox, RadioGroup, Toggle' },
    { href: '/combobox', label: 'Combobox', description: 'Searchable picker' },
    { href: '/menu', label: 'Menu', description: 'Dropdown with submenus' },
    { href: '/palette', label: 'Palette', description: '⌘K command palette shell' },
    { href: '/tooltip', label: 'Tooltip', description: 'Hover/focus hint' },
    { href: '/toast', label: 'Toast', description: 'Stacked notifications' },
    { href: '/display', label: 'Display', description: 'Badge, StatusPill, EmptyState, Skeleton, Spinner, Kbd' },
    { href: '/table', label: 'Table', description: 'Table, Thead, Tbody, Tr, Th, Td' },
    { href: '/settings', label: 'Settings', description: 'SettingsShell: nav, search, back link' },
] as const;

function Route() {
    const path = routePath();
    if (path === '/button') {
        return <ButtonRoute />;
    }
    if (path === '/dialog') {
        return <DialogRoute />;
    }
    if (path === '/confirm') {
        return <ConfirmRoute />;
    }
    if (path === '/sheet') {
        return <SheetRoute />;
    }
    if (path === '/form') {
        return <FormRoute />;
    }
    if (path === '/choice') {
        return <ChoiceRoute />;
    }
    if (path === '/combobox') {
        return <ComboboxRoute />;
    }
    if (path === '/menu') {
        return <MenuRoute />;
    }
    if (path === '/palette') {
        return <PaletteRoute />;
    }
    if (path === '/tooltip') {
        return <TooltipRoute />;
    }
    if (path === '/toast') {
        return <ToastRoute />;
    }
    if (path === '/display') {
        return <DisplayRoute />;
    }
    if (path === '/table') {
        return <TableRoute />;
    }
    return <Tokens />;
}

export function App() {
    // The shell is full-window chrome of its own, so it replaces the
    // playground's sidebar rather than nesting inside it.
    if (routePath().startsWith('/settings')) {
        return <SettingsRoute />;
    }
    return (
        <div className="flex min-h-screen bg-app">
            <nav className="sticky top-0 flex h-screen w-40 shrink-0 flex-col gap-4 border-r border-hair bg-sidebar p-4">
                <ThemeSwitcher />
                <div className="flex flex-col gap-1">
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={href(link.href)}
                            className="rounded-control px-2 py-1 hover:bg-panel-2"
                        >
                            <span className="block text-[12px] text-body">{link.label}</span>
                            <span className="block text-[10.5px] text-muted">{link.description}</span>
                        </a>
                    ))}
                </div>
            </nav>
            <main className="flex-1 p-8">
                <Route />
            </main>
            {/* A short default keeps the "Default duration" demo on /toast
                fast to test against; every other toast on this page passes
                its own durationMs so it isn't affected. `limit={5}` is
                explicit (matching the "Raise 5 quickly" demo) so the limit
                fix has deterministic, larger-than-5 room to be tested
                against on the same page. */}
            <ToastHost defaultDurationMs={300} limit={5} data-testid="toast-viewport" />
        </div>
    );
}
