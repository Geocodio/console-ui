import { expect, test } from '@playwright/test';

test.describe('@source scanning of dist/', () => {
    test('a class that exists only inside the compiled package reaches the built CSS', async ({ page, request }) => {
        // This is the guarantee the whole packaging approach depends on:
        // `playground/src/app.css` points Tailwind's scanner at
        // `../node_modules/@geocodio/console-ui/dist` with an explicit
        // `@source` directive, because Tailwind skips `node_modules` during
        // its own auto-detection. If that directive is ever removed, or
        // stops matching (a path change, a Tailwind config change, dist/
        // moving), Tailwind silently generates CSS with none of this
        // package's `data-[...]`/`animate-*`/`ui-*` utilities in it -- every
        // consuming app renders unstyled, with no build error anywhere.
        //
        // `animate-spinner-spin` is asserted here because it exists only in
        // `src/display/Spinner.tsx` (compiled into dist/) and nowhere in
        // `playground/src` -- so this test can only pass because `@source`
        // found it in dist/, not by incidental proximity to a matching
        // string elsewhere in the scanned tree.
        await page.goto('/');

        const stylesheetHrefs = await page.evaluate(() =>
            Array.from(document.styleSheets)
                .map((sheet) => sheet.href)
                .filter((href): href is string => Boolean(href)),
        );
        expect(stylesheetHrefs.length).toBeGreaterThan(0);

        const cssTexts = await Promise.all(
            stylesheetHrefs.map(async (href) => (await request.get(href)).text()),
        );
        const css = cssTexts.join('\n');

        expect(css).toContain('animate-spinner-spin');
    });
});

test.describe('strict-palette.css import order', () => {
    test('package colour utilities survive the strict-palette reset', async ({ page, request }) => {
        // strict-palette.css's `@theme { --color-*: initial; }` is a wildcard
        // reset: it deletes every `--color-*` custom property registered
        // before it in the cascade, not just Tailwind's stock palette. This
        // package registers its own colours via an `@theme inline` block in
        // tokens.css, so importing strict-palette.css AFTER the package's
        // tokens (instead of before, as `playground/src/app.css` and the
        // README both require) deletes this package's colours too.
        //
        // The failure is completely silent: no build error, no console
        // warning -- every colour utility, Tailwind's and this package's
        // alike, simply stops existing in the compiled CSS. This assertion
        // is what stands between that regression and a consuming app
        // rendering on borders alone. It checks several tokens spanning
        // different families (surface, semantic, accent, border) so it
        // cannot pass by coincidence of one token surviving.
        await page.goto('/');

        const stylesheetHrefs = await page.evaluate(() =>
            Array.from(document.styleSheets)
                .map((sheet) => sheet.href)
                .filter((href): href is string => Boolean(href)),
        );
        expect(stylesheetHrefs.length).toBeGreaterThan(0);

        const cssTexts = await Promise.all(
            stylesheetHrefs.map(async (href) => (await request.get(href)).text()),
        );
        const css = cssTexts.join('\n');

        for (const utility of ['.bg-panel-2', '.text-fail', '.bg-accent-soft', '.border-hair-strong']) {
            expect(css).toContain(utility);
        }
    });
});
