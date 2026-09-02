import { expect, test } from '@playwright/test';

test.describe('cn / tailwind-merge conflict resolution', () => {
    test("a caller's className overrides the component's own conflicting utility, by computed style", async ({
        page,
    }) => {
        await page.goto('/button');

        const defaultButton = page.getByTestId('classname-merge-default');
        const overriddenButton = page.getByTestId('classname-merge-override');

        // `Button` ships `px-3.5` (14px); the override button's `className="px-10"`
        // (40px) is in the same utility group. Plain string concatenation would
        // ship both classes and leave the winner to source order in the compiled
        // stylesheet; `cn` (routed through `tailwind-merge`) must keep only the
        // caller's class. Asserting the class LIST would not catch a regression
        // back to concatenation -- both classes could still be present in the
        // list while the browser's cascade happens to render the component's
        // own value. Only the computed style proves which one actually won.
        const defaultPaddingLeft = await defaultButton.evaluate((el) => window.getComputedStyle(el).paddingLeft);
        const overriddenPaddingLeft = await overriddenButton.evaluate(
            (el) => window.getComputedStyle(el).paddingLeft,
        );

        expect(defaultPaddingLeft).toBe('14px');
        expect(overriddenPaddingLeft).toBe('40px');
        expect(overriddenPaddingLeft).not.toBe(defaultPaddingLeft);
    });
});
