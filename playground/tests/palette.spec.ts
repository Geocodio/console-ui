import { expect, type Page, test } from '@playwright/test';

async function openPalette(page: Page) {
    await page.goto('/palette');
    await page.getByTestId('open-palette').click();
    await expect(page.getByTestId('palette')).toBeVisible();
}

test.describe('CommandPalette', () => {
    test('opens as a named dialog with focus in the input', async ({ page }) => {
        await openPalette(page);
        await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeVisible();
        await expect(page.getByTestId('palette-input')).toBeFocused();
        await expect(page.getByTestId('palette-input')).toHaveAttribute('placeholder', 'Search, or > for commands');
    });

    test('renders sections in order with hints and keycaps', async ({ page }) => {
        await openPalette(page);
        const rows = page.getByTestId('palette').getByRole('button');
        await expect(rows).toHaveCount(5);
        await expect(rows.nth(0)).toContainText('us/tx/travis');
        await expect(rows.nth(0)).toContainText('source');
        await expect(rows.nth(1).locator('kbd')).toHaveText(['⌘', 'S']);
        await expect(page.getByTestId('palette').getByText('Recent', { exact: true })).toBeVisible();
    });

    test('the first row is selected and the arrow keys move the selection', async ({ page }) => {
        await openPalette(page);
        await expect(page.getByTestId('palette-item-recent-travis')).toHaveAttribute('data-selected', 'true');

        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowDown');
        await expect(page.getByTestId('palette-item-purge')).toHaveAttribute('data-selected', 'true');
        await expect(page.getByTestId('palette-item-recent-travis')).not.toHaveAttribute('data-selected', 'true');

        await page.keyboard.press('ArrowUp');
        await expect(page.getByTestId('palette-item-sync')).toHaveAttribute('data-selected', 'true');
    });

    test('ArrowUp at the top and ArrowDown at the bottom stay put', async ({ page }) => {
        await openPalette(page);
        await page.keyboard.press('ArrowUp');
        await expect(page.getByTestId('palette-item-recent-travis')).toHaveAttribute('data-selected', 'true');
        for (let step = 0; step < 8; step++) {
            await page.keyboard.press('ArrowDown');
        }
        await expect(page.getByTestId('palette-item-sources')).toHaveAttribute('data-selected', 'true');
    });

    test('Enter runs the selected row and the caller closes the palette', async ({ page }) => {
        await openPalette(page);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await expect(page.getByTestId('palette-result')).toHaveText('builds');
        await expect(page.getByTestId('palette-open')).toHaveText('no');
        await expect(page.getByTestId('palette')).toBeHidden();
    });

    test('typing filters through the caller and resets the selection to the first match', async ({ page }) => {
        await openPalette(page);
        await page.keyboard.press('ArrowDown');
        await page.getByTestId('palette-input').fill('go to');
        const rows = page.getByTestId('palette').getByRole('button');
        await expect(rows).toHaveCount(2);
        await expect(page.getByTestId('palette-item-builds')).toHaveAttribute('data-selected', 'true');
        await expect(page.getByTestId('palette').getByText('Recent', { exact: true })).toHaveCount(0);
    });

    test('hovering a row selects it and clicking runs it', async ({ page }) => {
        await openPalette(page);
        await page.getByTestId('palette-item-sources').hover();
        await expect(page.getByTestId('palette-item-sources')).toHaveAttribute('data-selected', 'true');
        await page.getByTestId('palette-item-sources').click();
        await expect(page.getByTestId('palette-result')).toHaveText('sources');
    });

    test('shows the empty message when nothing matches', async ({ page }) => {
        await openPalette(page);
        await page.getByTestId('palette-input').fill('zzz');
        await expect(page.getByTestId('palette').getByText('No matches')).toBeVisible();
        await page.keyboard.press('Enter');
        await expect(page.getByTestId('palette-open')).toHaveText('yes');
    });

    test('Escape and a backdrop click close it', async ({ page }) => {
        await openPalette(page);
        await page.keyboard.press('Escape');
        await expect(page.getByTestId('palette')).toBeHidden();
        await expect(page.getByTestId('palette-open')).toHaveText('no');

        await page.getByTestId('open-palette').click();
        await expect(page.getByTestId('palette')).toBeVisible();
        await page.mouse.click(10, 10);
        await expect(page.getByTestId('palette')).toBeHidden();
    });

    test('a caller that claims Escape keeps the palette open', async ({ page }) => {
        await openPalette(page);
        await page.keyboard.press('ArrowRight');
        await expect(page.getByTestId('palette-item-run-now')).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(page.getByTestId('palette-item-run-now')).toBeHidden();
        await expect(page.getByTestId('palette')).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(page.getByTestId('palette')).toBeHidden();
    });

    test('a nested row is indented under its parent and runs on Enter', async ({ page }) => {
        await openPalette(page);
        await page.keyboard.press('ArrowRight');
        const parent = page.getByTestId('palette-item-recent-travis');
        const child = page.getByTestId('palette-item-run-now');
        const parentLeft = await parent.locator('span').first().evaluate((el) => el.getBoundingClientRect().left);
        const childLeft = await child.locator('span').first().evaluate((el) => el.getBoundingClientRect().left);
        expect(childLeft).toBeGreaterThan(parentLeft);

        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await expect(page.getByTestId('palette-result')).toHaveText('run-now');
    });

    test('a confirm rendered inside nests: Escape closes only the confirm', async ({ page }) => {
        await openPalette(page);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        const confirm = page.getByRole('alertdialog');
        await expect(confirm).toBeVisible();
        await expect(confirm).toContainText('Sync every source now?');

        await page.keyboard.press('Escape');
        await expect(confirm).toBeHidden();
        await expect(page.getByTestId('palette')).toBeVisible();
        await expect(page.getByTestId('palette-open')).toHaveText('yes');

        await page.keyboard.press('Enter');
        await page.getByRole('alertdialog').getByRole('button', { name: 'Sync sources' }).click();
        await expect(page.getByTestId('palette-result')).toHaveText('sync');
        await expect(page.getByTestId('palette')).toBeHidden();
    });

    test('a destructive row is painted in the fail tone', async ({ page }) => {
        await openPalette(page);
        const failColor = await page.getByTestId('fail-reference').evaluate((el) => getComputedStyle(el).color);
        const rowColor = await page.getByTestId('palette-item-purge').evaluate((el) => getComputedStyle(el).color);
        const bodyColor = await page.getByTestId('palette-item-sync').evaluate((el) => getComputedStyle(el).color);
        expect(rowColor).toBe(failColor);
        expect(bodyColor).not.toBe(failColor);
    });

    test('the selected row is kept in view as the selection moves through a long list', async ({ page }) => {
        await page.goto('/palette');
        await page.getByTestId('toggle-many').click();
        await page.getByTestId('open-palette').click();
        await expect(page.getByTestId('palette')).toBeVisible();
        for (let step = 0; step < 30; step++) {
            await page.keyboard.press('ArrowDown');
        }
        const row = page.getByTestId('palette-item-row-30');
        await expect(row).toHaveAttribute('data-selected', 'true');
        const visible = await row.evaluate((el) => {
            const list = el.closest('.overflow-y-auto') as HTMLElement;
            const listBox = list.getBoundingClientRect();
            const box = el.getBoundingClientRect();
            // 1px of slack: the two rects come from different boxes and
            // round independently at the fractional edge.
            return box.top >= listBox.top - 1 && box.bottom <= listBox.bottom + 1;
        });
        expect(visible).toBe(true);
    });
});
