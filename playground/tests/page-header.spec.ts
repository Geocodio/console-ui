import { expect, test } from '@playwright/test';

const PHONE = { width: 390, height: 800 };

test.describe('PageHeader', () => {
    test('desktop: overflow items are buttons, the menu trigger is hidden, the slot is inline', async ({ page }) => {
        await page.goto('/page-header');
        await expect(page.getByTestId('page-header-overflow-buttons')).toBeVisible();
        await expect(page.getByTestId('refresh')).toBeVisible();
        await expect(page.getByTestId('page-header-overflow-menu')).toBeHidden();

        const crumbs = await page.getByTestId('page-header-crumbs').boundingBox();
        const slot = await page.getByTestId('page-header-slot').boundingBox();
        expect(crumbs && slot && Math.abs(crumbs.y - slot.y) < 8).toBe(true);

        await page.getByTestId('history').click();
        await expect(page.getByTestId('selected')).toHaveText('history');
    });

    test.describe('phone', () => {
        test.use({ viewport: PHONE });

        test('never grows wider than the viewport, even with a long crumb', async ({ page }) => {
            await page.goto('/page-header');
            const header = page.getByTestId('header');
            const width = await header.evaluate((el) => el.scrollWidth);
            const viewport = await page.evaluate(() => window.innerWidth);
            expect(width).toBeLessThanOrEqual(viewport);
            const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
            expect(pageWidth).toBeLessThanOrEqual(viewport);
        });

        test('folds the overflow into a menu and keeps the primary action', async ({ page }) => {
            await page.goto('/page-header');
            await expect(page.getByTestId('page-header-overflow-buttons')).toBeHidden();
            await expect(page.getByTestId('primary')).toBeVisible();
            const trigger = page.getByRole('button', { name: 'More actions' });
            await expect(trigger).toBeVisible();
            await trigger.click();
            await page.getByRole('menuitem', { name: 'Refresh marketplaces' }).click();
            await expect(page.getByTestId('selected')).toHaveText('refresh');
        });

        test('drops the slot to a second full-width row', async ({ page }) => {
            await page.goto('/page-header');
            const crumbs = await page.getByTestId('page-header-crumbs').boundingBox();
            const slot = await page.getByTestId('page-header-slot').boundingBox();
            const header = await page.getByTestId('header').boundingBox();
            expect(crumbs && slot && slot.y > crumbs.y + crumbs.height - 1).toBe(true);
            expect(slot && header && slot.width > header.width * 0.8).toBe(true);
            await expect(page.getByTestId('period')).toBeVisible();
        });
    });
});
