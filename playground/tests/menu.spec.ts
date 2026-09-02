import { expect, test } from '@playwright/test';

test.describe('Menu', () => {
    test('popup has role menu, items have role menuitem', async ({ page }) => {
        await page.goto('/menu');
        await page.getByTestId('open-menu').click();
        const menu = page.getByRole('menu');
        await expect(menu).toBeVisible();
        await expect(menu.getByRole('menuitem', { name: 'Edit' })).toBeVisible();
    });

    test('ArrowDown / ArrowUp move the highlight', async ({ page }) => {
        await page.goto('/menu');
        await page.getByTestId('open-menu').click();
        await expect(page.getByRole('menu')).toBeVisible();

        await page.keyboard.press('ArrowDown');
        await expect(page.getByTestId('item-edit')).toHaveAttribute('data-highlighted', '');

        await page.keyboard.press('ArrowDown');
        await expect(page.getByTestId('item-duplicate')).toHaveAttribute('data-highlighted', '');

        await page.keyboard.press('ArrowUp');
        await expect(page.getByTestId('item-edit')).toHaveAttribute('data-highlighted', '');
    });

    test('ArrowRight opens a submenu and ArrowLeft closes it', async ({ page }) => {
        await page.goto('/menu');
        await page.getByTestId('open-menu').click();
        await expect(page.getByRole('menu').first()).toBeVisible();

        // Navigate down to the submenu trigger with the keyboard -- disabled
        // items are skipped by roving focus, so this is the real path a
        // keyboard user takes rather than a fixed press count.
        for (let i = 0; i < 10; i += 1) {
            const highlighted = await page
                .getByTestId('item-submenu')
                .evaluate((el) => el.getAttribute('data-highlighted') !== null);
            if (highlighted) {
                break;
            }
            await page.keyboard.press('ArrowDown');
        }
        await expect(page.getByTestId('item-submenu')).toHaveAttribute('data-highlighted', '');
        await page.keyboard.press('ArrowRight');

        const submenu = page.getByRole('menu').nth(1);
        await expect(submenu).toBeVisible();
        // ArrowLeft only closes the submenu once keyboard focus has actually
        // landed inside it -- wait for that before pressing it, rather than
        // racing the highlight-transfer that follows ArrowRight. The popup
        // also has to finish its own enter transition first: Base UI's
        // floating-ui focus guards can swallow a key press that lands
        // mid-transition, the same class of race Task 8 hit with Tab.
        await expect(page.getByTestId('item-folder-a')).toHaveAttribute('data-highlighted', '');
        // Let the submenu's own enter transition finish -- Base UI's
        // floating-ui focus guards can swallow a key press that lands
        // mid-transition, the same class of race Task 8 hit with Tab.
        await page.waitForTimeout(200);

        await page.keyboard.press('ArrowLeft');
        await expect(submenu).toBeHidden();
        await expect(page.getByRole('menu')).toBeVisible();
    });

    test('Enter selects and fires onSelect', async ({ page }) => {
        await page.goto('/menu');
        await expect(page.getByTestId('menu-result')).toHaveText('none');
        await page.getByTestId('open-menu').click();
        await page.keyboard.press('ArrowDown');
        await expect(page.getByTestId('item-edit')).toHaveAttribute('data-highlighted', '');
        await page.keyboard.press('Enter');
        await expect(page.getByRole('menu')).toBeHidden();
        await expect(page.getByTestId('menu-result')).toHaveText('edit');
    });

    test('a keepOpen plain item leaves the menu open; a normal item closes it', async ({ page }) => {
        await page.goto('/menu');
        await page.getByTestId('open-menu').click();
        await expect(page.getByRole('menu')).toBeVisible();

        await page.getByTestId('item-keep-open-plain').click();
        await expect(page.getByTestId('menu-result')).toHaveText('keep-open-plain');
        await expect(page.getByRole('menu')).toBeVisible();

        await page.getByTestId('item-edit').click();
        await expect(page.getByTestId('menu-result')).toHaveText('edit');
        await expect(page.getByRole('menu')).toBeHidden();
    });

    test('a keepOpen checkable item leaves the menu open', async ({ page }) => {
        await page.goto('/menu');
        await page.getByTestId('open-menu').click();
        await expect(page.getByRole('menu')).toBeVisible();

        const pinItem = page.getByTestId('item-keep-open-checkable');
        await expect(pinItem).toHaveAttribute('aria-checked', 'false');
        await pinItem.click();
        await expect(page.getByTestId('menu-result')).toHaveText('pin');
        await expect(page.getByRole('menu')).toBeVisible();
        await expect(pinItem).toHaveAttribute('aria-checked', 'true');

        // A checkable item without keepOpen still closes -- this is the
        // asymmetric-default case: Menu.CheckboxItem's own closeOnClick
        // default is false, so this only passes if the component explicitly
        // overrides it for non-keepOpen checkable items too.
        const notifyItem = page.getByTestId('item-close-checkable');
        await expect(notifyItem).toBeVisible();
        await notifyItem.click();
        await expect(page.getByTestId('menu-result')).toHaveText('notifications');
        await expect(page.getByRole('menu')).toBeHidden();
    });

    test('Escape closes and focus returns to the trigger', async ({ page }) => {
        await page.goto('/menu');
        await page.getByTestId('open-menu').click();
        await expect(page.getByRole('menu')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.getByRole('menu')).toBeHidden();
        // `open-menu` marks the trigger's content, not the real interactive
        // element -- Menu.Trigger renders the actual <button>, so focus
        // return is asserted on that button by its accessible name.
        await expect(page.getByRole('button', { name: 'Actions' })).toBeFocused();
    });

    test('a menu triggered inside an overflow-hidden ancestor is not clipped', async ({ page }) => {
        await page.goto('/menu');
        await page.getByTestId('open-clipped-menu').click();
        const menu = page.getByRole('menu');
        await expect(menu).toBeVisible();
        // Let the enter transition finish before measuring.
        await page.waitForTimeout(250);

        const viewport = page.viewportSize();
        const box = await menu.boundingBox();
        if (viewport === null || box === null) {
            throw new Error('expected a viewport size and a bounding box');
        }

        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);

        // The full item list must be present and visible -- if the popup
        // were still clipped to the 48px-tall overflow-hidden container this
        // last item would be present in the DOM but not actually visible.
        await expect(page.getByTestId('item-delete')).toBeVisible();
    });

    test('collision avoidance keeps a menu near the right edge inside the viewport', async ({ page }) => {
        await page.goto('/menu');
        await page.getByTestId('open-edge-menu').click();
        const menu = page.getByRole('menu');
        await expect(menu).toBeVisible();
        await page.waitForTimeout(250);

        const viewport = page.viewportSize();
        const box = await menu.boundingBox();
        if (viewport === null || box === null) {
            throw new Error('expected a viewport size and a bounding box');
        }

        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
    });

    test('className lands on the real trigger button, not a descendant', async ({ page }) => {
        await page.goto('/menu');

        // Locate by aria-haspopup, the attribute Base UI puts on the actual
        // <button> Menu.Trigger renders -- this is the element the class
        // must land on, not the <span> that supplies the button's content.
        const pillTrigger = page.locator('[aria-haspopup]', {
            has: page.getByTestId('open-pill-menu'),
        });
        await expect(pillTrigger).toHaveClass(/rounded-pill/);
        await expect(pillTrigger).toHaveClass(/border-hair/);

        // The content span itself must not carry the trigger's classes --
        // that would be the same "styling on a non-interactive wrapper"
        // mistake this prop exists to avoid.
        const pillContent = page.getByTestId('open-pill-menu');
        await expect(pillContent).not.toHaveClass(/rounded-pill/);

        await pillTrigger.click();
        await expect(page.getByRole('menu')).toBeVisible();
    });
});
