import { expect, test } from '@playwright/test';

test.describe('StackedTable', () => {
    test('desktop: renders as a table with a visible header and no drawn labels', async ({ page }) => {
        await page.goto('/stacked-table');
        await expect(page.getByRole('columnheader', { name: 'Repository' })).toBeVisible();
        const display = await page.getByTestId('row-1').evaluate((el) => getComputedStyle(el).display);
        expect(display).toBe('table-row');
        const before = await page.getByTestId('slug-1').evaluate((el) => getComputedStyle(el, '::before').content);
        expect(['none', 'normal', '']).toContain(before);
    });

    test.describe('phone', () => {
        test.use({ viewport: { width: 390, height: 800 } });

        test('stacks rows, hides the header, draws each column label, and never scrolls sideways', async ({
            page,
        }) => {
            await page.goto('/stacked-table');
            await expect(page.getByTestId('stacked-head')).toBeHidden();
            const rowDisplay = await page.getByTestId('row-1').evaluate((el) => getComputedStyle(el).display);
            expect(rowDisplay).toBe('block');
            const cellDisplay = await page.getByTestId('slug-1').evaluate((el) => getComputedStyle(el).display);
            expect(cellDisplay).toBe('flex');
            const before = await page.getByTestId('slug-1').evaluate((el) => getComputedStyle(el, '::before').content);
            expect(['attr(data-label)', '"Repository"']).toContain(before);
            const labelText = await page.getByTestId('tasks-1').evaluate((el) => el.getAttribute('data-label'));
            expect(labelText).toBe('Tasks');
            const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
            const viewport = await page.evaluate(() => window.innerWidth);
            expect(pageWidth).toBeLessThanOrEqual(viewport);
            const rowBox = await page.getByTestId('row-1').boundingBox();
            expect(rowBox?.height).toBeGreaterThan(60);
        });
    });
});
