// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CommandPalette, type CommandPaletteItem, type CommandPaletteProps, isModifiedClick, PaletteRow } from './CommandPalette.js';

const noop = () => {};

afterEach(cleanup);

function renderPalette(items: CommandPaletteItem[], props: Partial<CommandPaletteProps> = {}) {
    const onOpenChange = vi.fn();
    render(
        <CommandPalette
            open
            onOpenChange={onOpenChange}
            query=""
            onQueryChange={noop}
            sections={[{ items }]}
            inputProps={{ 'data-testid': 'palette-input' } as React.InputHTMLAttributes<HTMLInputElement>}
            {...props}
        />,
    );
    return { onOpenChange, input: screen.getByTestId('palette-input') };
}

const row = (id: string, extra: Partial<CommandPaletteItem> = {}): CommandPaletteItem => ({ id, label: id, onSelect: noop, ...extra });
const selectedId = () => document.querySelector('[data-selected="true"]')?.getAttribute('data-testid') ?? null;

describe('PaletteRow', () => {
    it('renders a button when the item has no href', () => {
        const html = renderToStaticMarkup(<PaletteRow item={{ id: 'a', label: 'Sync', onSelect: noop }} selected={false} onHover={noop} />);

        expect(html).toMatch(/^<button /);
        expect(html).toContain('type="button"');
        expect(html).toContain('data-testid="palette-item-a"');
    });

    it('renders a link when the item has an href', () => {
        const html = renderToStaticMarkup(
            <PaletteRow item={{ id: 'a', label: 'us/ny', href: '/sources/1', onSelect: noop }} selected={true} onHover={noop} />,
        );

        expect(html).toMatch(/^<a /);
        expect(html).toContain('href="/sources/1"');
        expect(html).toContain('data-selected="true"');
    });
});

describe('isModifiedClick', () => {
    const click = (overrides: Partial<React.MouseEvent>) =>
        ({ metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, button: 0, ...overrides }) as React.MouseEvent;

    it('is false for a plain primary click', () => {
        expect(isModifiedClick(click({}))).toBe(false);
    });

    it.each([{ metaKey: true }, { ctrlKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }])('is true for %o', (overrides) => {
        expect(isModifiedClick(click(overrides))).toBe(true);
    });
});

describe('CommandPalette disabled rows', () => {
    it('renders a disabled row with aria-disabled and its reason', () => {
        renderPalette([row('a', { disabled: true, disabledReason: 'Needs a repository' })]);

        const rowElement = screen.getByTestId('palette-item-a');
        expect(rowElement.getAttribute('aria-disabled')).toBe('true');
        expect(rowElement.getAttribute('data-disabled')).toBe('true');
        expect(rowElement.textContent).toContain('Needs a repository');
    });

    it('arrow keys skip a disabled row', async () => {
        const { input } = renderPalette([row('a'), row('b', { disabled: true }), row('c')]);

        input.focus();
        await userEvent.keyboard('{ArrowDown}');

        expect(selectedId()).toBe('palette-item-c');
    });

    it('Enter and click on a disabled row do not call onSelect', async () => {
        const onSelect = vi.fn();
        const { input } = renderPalette([row('a', { disabled: true, onSelect })]);

        input.focus();
        await userEvent.keyboard('{Enter}');
        await userEvent.click(screen.getByTestId('palette-item-a'));

        expect(onSelect).not.toHaveBeenCalled();
    });

    it('a list of only disabled rows selects nothing', () => {
        renderPalette([row('a', { disabled: true }), row('b', { disabled: true })]);

        expect(selectedId()).toBeNull();
    });
});
