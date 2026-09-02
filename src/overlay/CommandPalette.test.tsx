import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { isModifiedClick, PaletteRow } from './CommandPalette.js';

const noop = () => {};

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
