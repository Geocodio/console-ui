import { expect, type Page, test } from '@playwright/test';

test.describe('Button', () => {
    test('each variant renders and is clickable', async ({ page }) => {
        await page.goto('/button');

        for (const variant of ['primary', 'secondary', 'tertiary', 'destructive', 'link']) {
            const button = page.getByTestId(`variant-${variant}`);
            await expect(button).toBeVisible();
            await button.click();
        }

        const clicks = JSON.parse((await page.getByTestId('variant-clicks').textContent()) ?? '{}');
        expect(clicks).toEqual({ primary: 1, secondary: 1, tertiary: 1, destructive: 1, link: 1 });
    });

    test('pending disables the button, shows the spinner, and blocks a second click', async ({ page }) => {
        await page.goto('/button');

        const button = page.getByTestId('pending-button');
        await expect(button).toBeEnabled();
        await expect(button.locator('svg.animate-spin')).toHaveCount(0);

        await page.getByTestId('toggle-pending').click();
        await expect(button).toBeDisabled();
        await expect(button.locator('svg.animate-spin')).toBeVisible();
        await expect(button).toHaveText(/Saving/);

        // A disabled button does not dispatch click events at all, but click
        // it anyway (force, since Playwright refuses on a disabled target by
        // default) to prove the handler genuinely never fires.
        await button.click({ force: true });
        await expect(page.getByTestId('pending-clicks')).toHaveText('0');
    });

    test('an unsized icon lays out at the spinner size, not 0x0', async ({ page }) => {
        await page.goto('/button');

        const measure = (testId: string) =>
            page
                .getByTestId(testId)
                .locator('svg')
                .evaluate((el) => {
                    // Computed style, not getBoundingClientRect: the spinner is
                    // mid-rotation, and a rotated square's bounding box is wider
                    // than the square. The used value is the laid-out size.
                    const { width, height } = window.getComputedStyle(el);
                    return { width, height };
                });

        // 14px is `size-3.5`, the spinner's size; the icon must match it so
        // toggling `pending` does not shift the label.
        await expect.poll(() => measure('icon-button-unsized')).toEqual({ width: '14px', height: '14px' });

        await page.getByTestId('toggle-pending').click();
        await expect(page.getByTestId('pending-button').locator('svg.animate-spin')).toBeVisible();
        await expect.poll(() => measure('pending-button')).toEqual({ width: '14px', height: '14px' });
    });

    test('a caller-sized icon keeps the size the caller asked for', async ({ page }) => {
        await page.goto('/button');

        await expect
            .poll(() =>
                page
                    .getByTestId('icon-button-sized')
                    .locator('svg')
                    .evaluate((el) => {
                        const { width, height } = el.getBoundingClientRect();
                        return { width, height };
                    }),
            )
            .toEqual({ width: 16, height: 16 });
    });

    test('type="submit" inside a form actually submits', async ({ page }) => {
        await page.goto('/button');

        await expect(page.getByTestId('form-submitted')).toHaveText('no');
        await page.getByTestId('submit-button').click();
        await expect(page.getByTestId('form-submitted')).toHaveText('yes');
    });

    test('rest props reach the DOM', async ({ page }) => {
        await page.goto('/button');

        const button = page.getByTestId('rest-props-button');
        await expect(button).toHaveAttribute('title', 'Hover title');
        await expect(button).toHaveAttribute('data-extra', 'carried-through');
    });

    test('IconButton exposes label as its accessible name', async ({ page }) => {
        await page.goto('/button');

        await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
    });

    test('keyboard focus shows a visible focus indicator', async ({ page }) => {
        await page.goto('/button');

        // Click a preceding sentinel (mouse focus, no guaranteed focus-visible),
        // then Tab -- keyboard-driven focus is what must show the ring.
        await page.getByTestId('before-focus-button').click();
        await page.keyboard.press('Tab');

        const button = page.getByTestId('focus-button');
        await expect(button).toBeFocused();

        const outline = await button.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return { style: style.outlineStyle, width: style.outlineWidth };
        });
        expect(outline.style).not.toBe('none');
        expect(outline.width).not.toBe('0px');
    });

    test.describe('variant="link"', () => {
        const color = (page: Page, testId: string) =>
            page.getByTestId(testId).evaluate((el) => window.getComputedStyle(el).color);

        test('sits inline at the surrounding text height with no box', async ({ page }) => {
            await page.goto('/button');

            const height = (testId: string) =>
                page.getByTestId(testId).evaluate((el) => el.getBoundingClientRect().height);

            // The sentence holding three link buttons must lay out exactly as
            // tall as the same words in plain spans: a boxed variant's `h-8`
            // would push the line box out.
            expect(await height('link-sentence')).toBe(await height('link-sentence-plain'));

            const link = page.getByTestId('variant-link');
            const linkHeight = await height('variant-link');
            const lineHeight = await link.evaluate((el) =>
                Number.parseFloat(window.getComputedStyle(el.parentElement as Element).lineHeight),
            );
            expect(Math.abs(linkHeight - lineHeight)).toBeLessThanOrEqual(2);

            const box = await link.evaluate((el) => {
                const style = window.getComputedStyle(el);
                return {
                    borderWidth: style.borderWidth,
                    backgroundColor: style.backgroundColor,
                    paddingLeft: style.paddingLeft,
                    fontSize: style.fontSize,
                    parentFontSize: window.getComputedStyle(el.parentElement as Element).fontSize,
                };
            });
            expect(box.borderWidth).toBe('0px');
            expect(box.backgroundColor).toBe('rgba(0, 0, 0, 0)');
            expect(box.paddingLeft).toBe('0px');
            expect(box.fontSize).toBe(box.parentFontSize);
        });

        test('is coloured accent-text, and className="text-fail" recolours it', async ({ page }) => {
            await page.goto('/button');

            expect(await color(page, 'variant-link')).toBe(await color(page, 'ref-accent-text'));
            expect(await color(page, 'link-fail')).toBe(await color(page, 'ref-fail'));
            expect(await color(page, 'link-fail')).not.toBe(await color(page, 'variant-link'));
        });

        test('keyboard focus shows a visible focus indicator', async ({ page }) => {
            await page.goto('/button');

            await page.getByTestId('before-focus-button').click();
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');

            const link = page.getByTestId('focus-link');
            await expect(link).toBeFocused();

            const outline = await link.evaluate((el) => {
                const style = window.getComputedStyle(el);
                return { style: style.outlineStyle, width: style.outlineWidth };
            });
            expect(outline.style).not.toBe('none');
            expect(outline.width).not.toBe('0px');
        });

        test('pending swaps the icon for the spinner', async ({ page }) => {
            await page.goto('/button');

            const link = page.getByTestId('link-pending');
            await expect(link.locator('svg')).toHaveCount(1);
            await expect(link.locator('svg.animate-spin')).toHaveCount(0);

            await page.getByTestId('toggle-pending').click();
            await expect(link).toBeDisabled();
            await expect(link.locator('svg.animate-spin')).toBeVisible();
            await expect(link.locator('svg')).toHaveCount(1);
            await expect(link).toHaveText(/Saving/);
        });
    });
});
