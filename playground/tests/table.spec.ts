import { expect, test } from '@playwright/test';

test.describe('Table', () => {
    test('semantic table markup is reachable by role', async ({ page }) => {
        await page.goto('/table');

        await expect(page.getByRole('table')).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Build ID' })).toBeVisible();
        await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();

        const rows = page.getByRole('row');
        // Header row + three body rows.
        await expect(rows).toHaveCount(4);

        await expect(page.getByRole('cell', { name: 'Washington' })).toBeVisible();
    });

    test('a selected row exposes aria-selected and an unselected one does not', async ({ page }) => {
        await page.goto('/table');

        await expect(page.getByTestId('row-2')).toHaveAttribute('aria-selected', 'true');
        await expect(page.getByTestId('row-1')).not.toHaveAttribute('aria-selected', 'true');
        expect(await page.getByTestId('row-1').getAttribute('aria-selected')).toBeNull();
    });

    test('an interactive row fires its onClick', async ({ page }) => {
        await page.goto('/table');

        await expect(page.getByTestId('row-clicks')).toHaveText('0');
        await page.getByTestId('row-1').click();
        await expect(page.getByTestId('row-clicks')).toHaveText('1');
        await expect(page.getByTestId('row-1')).toHaveAttribute('aria-selected', 'true');
    });

    test('Td has no monospace by default and a caller font-mono class applies', async ({ page }) => {
        await page.goto('/table');

        const defaultCell = page.getByTestId('status-1');
        const monoCell = page.getByTestId('build-id-1');

        const [defaultFont, monoFont] = await Promise.all([
            defaultCell.evaluate((el) => window.getComputedStyle(el).fontFamily),
            monoCell.evaluate((el) => window.getComputedStyle(el).fontFamily),
        ]);

        expect(defaultFont).not.toBe(monoFont);
        expect(monoFont.toLowerCase()).toMatch(/mono/);
    });

    test('rest props and className reach the DOM on each part', async ({ page }) => {
        await page.goto('/table');

        await expect(page.getByTestId('table')).toBeVisible();
        await expect(page.getByTestId('build-id-1')).toHaveClass(/font-mono/);
    });
});
