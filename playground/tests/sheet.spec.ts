import { expect, test } from '@playwright/test';

test.describe('Sheet', () => {
    test('traps Tab inside the sheet', async ({ page }) => {
        await page.goto('/sheet');
        await page.getByTestId('open-sheet-right').click();
        await expect(page.getByRole('dialog')).toBeVisible();

        // Yield a frame between presses; floating-ui redirects focus with
        // guard sentinels, and pressing Tab again within the same frame
        // observes focus mid-redirect, which is not a real failure. Task 8
        // established this for Dialog.
        for (let i = 0; i < 12; i += 1) {
            await page.keyboard.press('Tab');
            await page.waitForTimeout(20);
            const inSheet = await page.evaluate(() =>
                document.querySelector('[role=dialog]')?.contains(document.activeElement) ?? false,
            );
            expect(inSheet, `focus escaped on Tab #${i + 1}`).toBe(true);
        }
    });

    test('Escape closes it and focus returns to the trigger', async ({ page }) => {
        await page.goto('/sheet');
        await page.getByTestId('open-sheet-right').click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).toBeHidden();
        await expect(page.getByTestId('open-sheet-right')).toBeFocused();
    });

    test('has role dialog with an accessible name from title', async ({ page }) => {
        await page.goto('/sheet');
        await page.getByTestId('open-sheet-right').click();
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await expect(dialog).toHaveAccessibleName('Source details');
        await page.keyboard.press('Escape');

        await page.getByTestId('open-sheet-bottom').click();
        const bottomDialog = page.getByRole('dialog');
        await expect(bottomDialog).toBeVisible();
        await expect(bottomDialog).toHaveAccessibleName('Queue');
    });

    test('side="right" is anchored to the right edge, full height', async ({ page }) => {
        await page.goto('/sheet');
        await page.getByTestId('open-sheet-right').click();
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        // Let the enter transition finish before measuring position.
        await page.waitForTimeout(300);

        const viewport = page.viewportSize();
        const box = await dialog.boundingBox();
        if (viewport === null || box === null) {
            throw new Error('expected a viewport size and a bounding box');
        }

        expect(box.x + box.width).toBeCloseTo(viewport.width, 0);
        expect(box.y).toBeCloseTo(0, 0);
        expect(box.y + box.height).toBeCloseTo(viewport.height, 0);
    });

    test('side="bottom" is anchored to the bottom edge and does not exceed 80% of viewport height', async ({
        page,
    }) => {
        await page.goto('/sheet');
        await page.getByTestId('open-sheet-bottom').click();
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await page.waitForTimeout(300);

        const viewport = page.viewportSize();
        const box = await dialog.boundingBox();
        if (viewport === null || box === null) {
            throw new Error('expected a viewport size and a bounding box');
        }

        expect(box.y + box.height).toBeCloseTo(viewport.height, 0);
        expect(box.height).toBeLessThanOrEqual(viewport.height * 0.8 + 1);
    });
});
