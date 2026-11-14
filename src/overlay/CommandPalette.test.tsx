// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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

describe('CommandPalette more button', () => {
    it('a row with onMore shows a more button', () => {
        renderPalette([row('a', { onMore: noop }), row('b', { onMore: noop, moreLabel: 'Open actions' })]);

        const more = screen.getByRole('button', { name: 'More actions' });
        const rowElement = screen.getByTestId('palette-item-a');
        expect(more).toBeDefined();
        expect(rowElement.contains(more)).toBe(false);
        expect(more.contains(rowElement)).toBe(false);
        expect(more.parentElement).toBe(rowElement.parentElement);
        expect(screen.getByRole('button', { name: 'Open actions' })).toBeDefined();
    });

    it('clicking the more button calls onMore and not onSelect', async () => {
        const onMore = vi.fn();
        const onSelect = vi.fn();
        renderPalette([row('a', { onMore, onSelect })]);

        await userEvent.click(screen.getByRole('button', { name: 'More actions' }));

        expect(onMore).toHaveBeenCalledTimes(1);
        expect(onSelect).not.toHaveBeenCalled();
    });

    it('Tab on the selected row calls its onMore and keeps focus in the input', async () => {
        const onMore = vi.fn();
        const { input } = renderPalette([row('a', { onMore })]);

        input.focus();
        await userEvent.keyboard('{Tab}');

        expect(onMore).toHaveBeenCalledTimes(1);
        expect(document.activeElement).toBe(input);
    });

    it('Tab on a row without onMore keeps default behaviour', () => {
        const { input } = renderPalette([row('a')]);

        input.focus();
        const notPrevented = fireEvent.keyDown(input, { key: 'Tab' });

        expect(notPrevented).toBe(true);
    });
});

describe('CommandPalette steps', () => {
    it('shows the step title as a chip before the input', () => {
        const { input } = renderPalette([row('a')], { step: { title: 'us/tx/travis' } });

        const chip = screen.getByTestId('palette-step');
        expect(chip.textContent).toBe('us/tx/travis');
        expect(chip.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('Backspace on an empty input calls onBack when a step is set', async () => {
        const onBack = vi.fn();
        const { input } = renderPalette([row('a')], { step: { title: 'Step' }, onBack });

        input.focus();
        await userEvent.keyboard('{Backspace}');

        expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('Backspace with text in the input does not call onBack', async () => {
        const onBack = vi.fn();
        const { input } = renderPalette([row('a')], { step: { title: 'Step' }, onBack, query: 'abc' });

        input.focus();
        await userEvent.keyboard('{Backspace}');

        expect(onBack).not.toHaveBeenCalled();
    });

    it('Escape calls onBack and keeps the palette open when a step is set', async () => {
        const onBack = vi.fn();
        const { input, onOpenChange } = renderPalette([row('a')], { step: { title: 'Step' }, onBack });

        input.focus();
        await userEvent.keyboard('{Escape}');

        expect(onBack).toHaveBeenCalledTimes(1);
        expect(onOpenChange).not.toHaveBeenCalledWith(false);
    });

    it('Escape closes the palette when no step is set', async () => {
        const { input, onOpenChange } = renderPalette([row('a')]);

        input.focus();
        await userEvent.keyboard('{Escape}');

        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('onInputKeyDown still runs first and can claim Backspace', async () => {
        const onBack = vi.fn();
        const { input } = renderPalette([row('a')], {
            step: { title: 'Step' },
            onBack,
            onInputKeyDown: (event) => {
                if (event.key === 'Backspace') {
                    event.preventDefault();
                }
            },
        });

        input.focus();
        await userEvent.keyboard('{Backspace}');

        expect(onBack).not.toHaveBeenCalled();
    });
});
