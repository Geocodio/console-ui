import type React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TabBar, type TabBarItem } from './TabBar.js';

const icon = <svg data-icon="x" />;

const items: TabBarItem[] = [
    { key: 'tasks', label: 'Tasks', icon, href: '/tasks', active: true, badge: 3, testId: 'tab-tasks' },
    { key: 'reviews', label: 'Reviews', icon, href: '/reviews', badge: 0 },
    { key: 'repos', label: 'Repos', icon, href: '/repos', badge: null },
    { key: 'more', label: 'More', icon, onSelect: () => {}, testId: 'tab-more' },
];

describe('TabBar', () => {
    it('renders a nav landmark with one slot per item and marks the active one', () => {
        const html = renderToStaticMarkup(<TabBar items={items} />);

        expect(html).toContain('<nav');
        expect(html).toContain('aria-label="Main"');
        expect(html).toContain('data-testid="tab-bar"');
        expect(html).toContain('href="/tasks"');
        expect(html).toContain('aria-current="page"');
        expect((html.match(/aria-current="page"/g) ?? []).length).toBe(1);
        expect(html).toContain('>Tasks</span>');
        expect(html).toContain('text-accent-text');
    });

    it('shows a badge for a positive count and none for 0 or null', () => {
        const html = renderToStaticMarkup(<TabBar items={items} />);

        expect(html).toContain('data-testid="tab-tasks-badge"');
        expect(html).toContain('>3</span>');
        expect(html).not.toContain('>0</span>');
        expect((html.match(/-badge"/g) ?? []).length).toBe(1);
    });

    it('renders an item without href as a button', () => {
        const html = renderToStaticMarkup(<TabBar items={items} />);

        expect(html).toContain('<button type="button"');
        expect(html).toContain('data-testid="tab-more"');
        expect(html).not.toContain('href="undefined"');
    });

    it('renders the round action button with an accessible name', () => {
        const html = renderToStaticMarkup(
            <TabBar items={items} action={{ label: 'New task', icon, onSelect: () => {}, testId: 'tab-action' }} />,
        );

        expect(html).toContain('aria-label="New task"');
        expect(html).toContain('data-testid="tab-action"');
        expect(html).toContain('bg-accent');
    });

    it('renders links through the supplied link component and merges className', () => {
        const Link = ({ href, children, className }: { href: string; children?: React.ReactNode; className?: string }) => (
            <span data-href={href} className={className}>
                {children}
            </span>
        );
        const html = renderToStaticMarkup(<TabBar items={items} LinkComponent={Link} className="lg:hidden" data-testid="yak-bar" />);

        expect(html).toContain('data-href="/tasks"');
        expect(html).toContain('lg:hidden');
        expect(html).toContain('data-testid="yak-bar"');
        expect(html).not.toContain('data-testid="tab-bar"');
    });
});
