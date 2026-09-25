import { expect, test } from '@playwright/test';

test.describe('TabBar', () => {
    test('is a nav landmark with 56px slots and the active slot marked', async ({ page }) => {
        await page.goto('/tab-bar');
        const bar = page.getByRole('navigation', { name: 'Main' });
        await expect(bar).toBeVisible();

        const tasks = bar.getByTestId('tab-tasks');
        await expect(tasks).toHaveAttribute('aria-current', 'page');
        await expect(bar.getByTestId('tab-reviews')).not.toHaveAttribute('aria-current', 'page');
        const box = await tasks.boundingBox();
        expect(box?.width).toBeGreaterThanOrEqual(56);
        expect(box?.height).toBeGreaterThanOrEqual(56);
    });

    test('shows a badge for 18 and none for 0', async ({ page }) => {
        await page.goto('/tab-bar');
        await expect(page.getByTestId('tab-tasks-badge')).toHaveText('18');
        await expect(page.getByTestId('tab-reviews-badge')).toHaveCount(0);
    });

    test('a link slot navigates and becomes active, a button slot fires its handler', async ({ page }) => {
        await page.goto('/tab-bar');
        await page.getByTestId('tab-repos').click();
        await expect(page.getByTestId('active-key')).toHaveText('repos');
        await expect(page.getByTestId('tab-repos')).toHaveAttribute('aria-current', 'page');

        await page.getByTestId('tab-more').click();
        await expect(page.getByTestId('more-count')).toHaveText('1');
        await expect(page.getByTestId('tab-more')).not.toHaveAttribute('aria-current', 'page');
    });

    test('the round action button fires and has an accessible name', async ({ page }) => {
        await page.goto('/tab-bar');
        await page.getByRole('button', { name: 'New task' }).click();
        await expect(page.getByTestId('created-count')).toHaveText('1');
    });

    test('the bar sits in flow: content scrolls above it, not under it', async ({ page }) => {
        await page.goto('/tab-bar');
        const frame = page.getByTestId('phone-frame');
        const bar = page.getByTestId('tab-bar');
        const frameBox = await frame.boundingBox();
        const barBox = await bar.boundingBox();
        expect(barBox && frameBox && barBox.y + barBox.height <= frameBox.y + frameBox.height + 1).toBe(true);
        const scroller = frame.locator('.overflow-auto');
        const scrollerBox = await scroller.boundingBox();
        expect(scrollerBox && barBox && scrollerBox.y + scrollerBox.height <= barBox.y + 1).toBe(true);
    });
});
