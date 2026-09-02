import { expect, test } from '@playwright/test';

/**
 * These assertions exist because the theme system is compiled, not shipped as
 * authored. Tailwind v4 resolves @theme inline, then lightningcss lowers
 * light-dark() into var(--lightningcss-light/dark) pairs and emits the
 * prefers-color-scheme and [data-theme] rules that drive them. Every one of
 * those layers could change under an upgrade with no error surfacing -- the
 * page would simply render one theme's text on the other theme's ground.
 */

const LIGHT_BG = 'rgb(251, 251, 252)'; // --bg light  #fbfbfc
const DARK_BG = 'rgb(15, 16, 17)';     // --bg dark   #0f1011
const LIGHT_TEXT = 'rgb(40, 42, 48)';  // --text light #282a30
const DARK_TEXT = 'rgb(230, 231, 234)'; // --text dark #e6e7ea

const bodyColours = () =>
    document.body
        ? {
              bg: getComputedStyle(document.body).backgroundColor,
              fg: getComputedStyle(document.body).color,
          }
        : { bg: '', fg: '' };

test.describe('theme resolution', () => {
    test('follows the OS in both directions', async ({ page }) => {
        await page.emulateMedia({ colorScheme: 'light' });
        await page.goto('/');
        expect(await page.evaluate(bodyColours)).toEqual({ bg: LIGHT_BG, fg: LIGHT_TEXT });

        await page.emulateMedia({ colorScheme: 'dark' });
        expect(await page.evaluate(bodyColours)).toEqual({ bg: DARK_BG, fg: DARK_TEXT });
    });

    test('[data-theme] overrides the OS in both directions', async ({ page }) => {
        await page.emulateMedia({ colorScheme: 'dark' });
        await page.goto('/');

        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
        expect(await page.evaluate(bodyColours)).toEqual({ bg: LIGHT_BG, fg: LIGHT_TEXT });

        await page.emulateMedia({ colorScheme: 'light' });
        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
        expect(await page.evaluate(bodyColours)).toEqual({ bg: DARK_BG, fg: DARK_TEXT });
    });

    test('removing [data-theme] returns control to the OS', async ({ page }) => {
        await page.emulateMedia({ colorScheme: 'light' });
        await page.goto('/');
        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
        expect(await page.evaluate(bodyColours)).toEqual({ bg: DARK_BG, fg: DARK_TEXT });

        // The System button removes the attribute rather than setting a third
        // value; a `data-theme="system"` would match no selector and strand
        // the viewer in light mode.
        await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));
        expect(await page.evaluate(bodyColours)).toEqual({ bg: LIGHT_BG, fg: LIGHT_TEXT });
    });
});

test.describe('theme switcher', () => {
    test('persists dark across a full page navigation and System returns control to the OS', async ({ page }) => {
        await page.emulateMedia({ colorScheme: 'light' });
        await page.goto('/tokens');

        await page.getByTestId('theme-dark').click();
        await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe(
            'dark',
        );
        expect(await page.evaluate(bodyColours)).toEqual({ bg: DARK_BG, fg: DARK_TEXT });

        // Every nav link is a plain <a href>, so this is a full page reload,
        // not a client-side route change. The stored theme has to survive it.
        await page.getByRole('link', { name: /Dialog/ }).click();
        await page.waitForURL('**/dialog');
        expect(await page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe('dark');
        expect(await page.evaluate(bodyColours)).toEqual({ bg: DARK_BG, fg: DARK_TEXT });

        // A cold reload must also stay dark -- the blocking inline script in
        // index.html reads localStorage before first paint, so there should
        // be no flash of the OS (light) theme.
        await page.reload();
        expect(await page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe('dark');
        expect(await page.evaluate(bodyColours)).toEqual({ bg: DARK_BG, fg: DARK_TEXT });

        await page.getByTestId('theme-system').click();
        await expect
            .poll(() => page.evaluate(() => document.documentElement.getAttribute('data-theme')))
            .toBeNull();
        expect(await page.evaluate(bodyColours)).toEqual({ bg: LIGHT_BG, fg: LIGHT_TEXT });

        await page.emulateMedia({ colorScheme: 'dark' });
        expect(await page.evaluate(bodyColours)).toEqual({ bg: DARK_BG, fg: DARK_TEXT });
    });

    test('System clears the stored value, not just the attribute', async ({ page }) => {
        await page.goto('/tokens');
        await page.getByTestId('theme-dark').click();
        expect(await page.evaluate(() => localStorage.getItem('ui-playground-theme'))).toBe('dark');

        await page.getByTestId('theme-system').click();
        expect(await page.evaluate(() => localStorage.getItem('ui-playground-theme'))).toBeNull();

        // A cold reload after System must not resurrect dark from storage.
        await page.emulateMedia({ colorScheme: 'light' });
        await page.reload();
        expect(await page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBeNull();
    });
});

test('both self-hosted typefaces actually load', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);

    const loaded = await page.evaluate(() => ({
        sans: document.fonts.check('600 16px "IBM Plex Sans"'),
        mono: document.fonts.check('400 16px "IBM Plex Mono"'),
    }));

    // The bug this guards: --font-sans naming a family nothing ever loads,
    // which is silent -- the page just renders in system-ui.
    expect(loaded).toEqual({ sans: true, mono: true });
});
