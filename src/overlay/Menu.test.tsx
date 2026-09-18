import { Menu as BaseMenu } from '@base-ui/react/menu';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MenuItems } from './Menu.js';

const noop = () => {};

/**
 * The indicator spans of a rendered row list, in row order — Base UI stamps the row's state onto
 * the indicator as `data-checked` / `data-unchecked`, which is what lets an assertion below say
 * *which* row's indicator it is talking about rather than grepping the whole document.
 */
function indicators(html: string): { state: string; className: string }[] {
    return [...html.matchAll(/<span data-(checked|unchecked)="" aria-hidden="true" class="([^"]*)"/g)].map((match) => ({
        state: match[1] as string,
        className: match[2] as string,
    }));
}

/** `MenuItems` reads Base UI's root context, so it only renders inside a `Menu.Root`. */
function render(items: Parameters<typeof MenuItems>[0]['items']): string {
    return renderToStaticMarkup(
        <BaseMenu.Root>
            <MenuItems items={items} />
        </BaseMenu.Root>,
    );
}

const SWITCHER = [
    { key: 'all', label: 'All environments', checked: false, onSelect: noop },
    { key: 'prod', label: 'Production', checked: true, onSelect: noop },
];

describe('MenuItems checkbox rows', () => {
    /**
     * Half the contract: `keepMounted` leaves the indicator in the DOM on an unchecked row, so a
     * label does not shift sideways as the selection moves down the menu. Drop `keepMounted` and
     * only the checked row keeps an indicator — which this catches.
     */
    it('keeps the indicator mounted on an unchecked row', () => {
        expect(indicators(render(SWITCHER)).map((indicator) => indicator.state)).toEqual(['unchecked', 'checked']);
    });

    /**
     * The other half, and the bug. An indicator that is mounted but has nothing hiding it draws a
     * tick on *every* row, so a single-select menu reads as though everything in it were selected
     * — which is what a seven-environment switcher looked like. Nothing in the accessibility tree
     * catches it: `aria-checked` is correct on every row, so it is visible only to an eye.
     *
     * Asserted on the span Base UI marked `data-unchecked`, not on the document, so moving the
     * rule to some other element fails here rather than passing on a coincidence.
     */
    it('hides the tick on the unchecked row', () => {
        const unchecked = indicators(render(SWITCHER)).find((indicator) => indicator.state === 'unchecked');

        expect(unchecked?.className).toContain('data-[unchecked]:invisible');
    });

    /**
     * `invisible`, never `hidden`: `display: none` takes the box away with the tick, which is
     * exactly the layout shift `keepMounted` is here to prevent — the two would cancel out and
     * the menu would look fixed while still jumping.
     */
    it('keeps the indicator box while hiding it', () => {
        for (const indicator of indicators(render(SWITCHER))) {
            expect(indicator.className).not.toContain('data-[unchecked]:hidden');
        }
    });

    /** A row with no `checked` is an ordinary action row and gets no indicator at all. */
    it('renders no indicator for a row that is not a checkbox', () => {
        expect(indicators(render([{ key: 'a', label: 'Rename', onSelect: noop }]))).toEqual([]);
    });
});
