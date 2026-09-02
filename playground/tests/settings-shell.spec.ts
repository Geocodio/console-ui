import { expect, type Page, test } from '@playwright/test';

const MOBILE = { width: 480, height: 800 };

async function isInViewport(page: Page, testId: string): Promise<boolean> {
    return page.getByTestId(testId).evaluate((el) => {
        const box = el.getBoundingClientRect();
        return box.top >= 0 && box.bottom <= window.innerHeight;
    });
}

test.describe('SettingsShell', () => {
    test('renders every section and item, with the current item as the header', async ({ page }) => {
        await page.goto('/settings');
        const sidebar = page.getByTestId('settings-sidebar');
        await expect(sidebar).toBeVisible();
        await expect(sidebar.getByTestId('settings-nav-section')).toHaveText([/Personal/, /AI/, /Workspace/]);
        for (const slug of ['profile', 'notifications', 'prompts', 'users']) {
            await expect(sidebar.getByTestId(`settings-nav-${slug}`)).toBeVisible();
        }
        await expect(sidebar.getByTestId('settings-nav-prompts')).toHaveAttribute('href', '/settings/prompts');
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('Profile');
        await expect(page.getByText('Your personal signature, appended to everything you send.')).toBeVisible();
        await expect(page.getByTestId('settings-page-profile')).toBeVisible();
    });

    test('highlights the item for the current path and no other', async ({ page }) => {
        await page.goto('/settings/prompts');
        const sidebar = page.getByTestId('settings-sidebar');
        const active = sidebar.getByTestId('settings-nav-prompts');
        const idle = sidebar.getByTestId('settings-nav-profile');

        await expect(active).toHaveAttribute('aria-current', 'page');
        await expect(idle).not.toHaveAttribute('aria-current', 'page');
        await expect(sidebar.locator('[aria-current="page"]')).toHaveCount(1);

        const activeStyle = await active.evaluate((el) => ({ bg: getComputedStyle(el).backgroundColor, weight: getComputedStyle(el).fontWeight }));
        const idleStyle = await idle.evaluate((el) => ({ bg: getComputedStyle(el).backgroundColor, weight: getComputedStyle(el).fontWeight }));
        expect(activeStyle.bg).not.toBe('rgba(0, 0, 0, 0)');
        expect(idleStyle.bg).toBe('rgba(0, 0, 0, 0)');
        expect(Number(activeStyle.weight)).toBeGreaterThan(Number(idleStyle.weight));
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('Prompts & models');
    });

    test('navigating through the sidebar reaches the other page', async ({ page }) => {
        await page.goto('/settings');
        await page.getByTestId('settings-sidebar').getByTestId('settings-nav-users').click();
        await expect(page).toHaveURL(/\/settings\/users$/);
        await expect(page.getByTestId('settings-page-users')).toBeVisible();
        await expect(page.getByTestId('settings-sidebar').getByTestId('settings-nav-users')).toHaveAttribute('aria-current', 'page');
    });

    test('search filters items and rows, and clearing it brings the sections back', async ({ page }) => {
        await page.goto('/settings');
        const sidebar = page.getByTestId('settings-sidebar');
        const search = sidebar.getByTestId('settings-search');

        await search.fill('draft');
        const results = sidebar.getByTestId('settings-search-results');
        await expect(results).toBeVisible();
        await expect(sidebar.getByTestId('settings-nav-section')).toHaveCount(0);
        await expect(results.getByTestId('settings-nav-prompts')).toBeVisible();
        await expect(results.getByTestId('settings-search-row-automation-draft-only-support')).toHaveAttribute(
            'href',
            '/settings/prompts#automation-draft-only-support',
        );
        await expect(results.getByTestId('settings-nav-profile')).toHaveCount(0);
        await expect(results.getByTestId('settings-search-row-model-triage')).toHaveCount(0);

        await search.fill('');
        await expect(sidebar.getByTestId('settings-search-results')).toHaveCount(0);
        await expect(sidebar.getByTestId('settings-nav-section')).toHaveCount(3);
    });

    test('a row hit is indented under its item', async ({ page }) => {
        await page.goto('/settings');
        const sidebar = page.getByTestId('settings-sidebar');
        await sidebar.getByTestId('settings-search').fill('haiku');
        const itemLeft = await sidebar.getByTestId('settings-nav-prompts').evaluate((el) => el.getBoundingClientRect().left);
        const rowLeft = await sidebar.getByTestId('settings-search-row-model-triage').evaluate((el) => el.getBoundingClientRect().left);
        expect(rowLeft).toBeGreaterThan(itemLeft);
    });

    test('Escape clears the search', async ({ page }) => {
        await page.goto('/settings');
        const search = page.getByTestId('settings-sidebar').getByTestId('settings-search');
        await search.fill('users');
        await expect(page.getByTestId('settings-sidebar').getByTestId('settings-search-results')).toBeVisible();
        await search.press('Escape');
        await expect(search).toHaveValue('');
        await expect(page.getByTestId('settings-sidebar').getByTestId('settings-search-results')).toHaveCount(0);
    });

    test('shows the no-results state and Enter does nothing there', async ({ page }) => {
        await page.goto('/settings');
        const sidebar = page.getByTestId('settings-sidebar');
        await sidebar.getByTestId('settings-search').fill('zzz');
        await expect(sidebar.getByTestId('settings-search-results')).toHaveText('No settings match.');
        await sidebar.getByTestId('settings-search').press('Enter');
        await expect(page).toHaveURL(/\/settings$/);
    });

    test('Enter visits the top hit: the item when it matched, the row deep link when only a row did', async ({ page }) => {
        await page.goto('/settings');
        const search = page.getByTestId('settings-sidebar').getByTestId('settings-search');
        await search.fill('roles');
        await search.press('Enter');
        await expect(page).toHaveURL(/\/settings\/users$/);

        await page.goto('/settings');
        await search.fill('haiku');
        await search.press('Enter');
        await expect(page).toHaveURL(/\/settings\/prompts#model-triage$/);
    });

    test('a row deep link lands on the row itself, scrolled into view', async ({ page }) => {
        await page.goto('/settings/prompts');
        expect(await isInViewport(page, 'row-model-triage')).toBe(false);

        await page.getByTestId('settings-sidebar').getByTestId('settings-search').fill('haiku');
        await page.getByTestId('settings-sidebar').getByTestId('settings-search-row-model-triage').click();
        await expect(page).toHaveURL(/#model-triage$/);
        await expect(page.getByTestId('row-model-triage')).toBeVisible();
        expect(await isInViewport(page, 'row-model-triage')).toBe(true);
    });

    test('the back link falls through to backHref when nothing was remembered', async ({ page }) => {
        await page.goto('/settings');
        const back = page.getByTestId('settings-sidebar').getByTestId('settings-back-to-app');
        await expect(back).toHaveText('Back to app');
        await expect(back).toHaveAttribute('href', '/tokens');
    });

    test('the back link returns to the remembered path and honours a disabled lookup', async ({ page }) => {
        await page.goto('/button');
        await page.evaluate(() => sessionStorage.setItem('settings.return-to', '/button?from=test'));
        await page.goto('/settings');
        const back = page.getByTestId('settings-sidebar').getByTestId('settings-back-to-app');
        await expect(back).toHaveAttribute('href', '/button?from=test');
        await back.click();
        await expect(page).toHaveURL(/\/button\?from=test$/);

        await page.goto('/settings?no-storage');
        await expect(page.getByTestId('settings-sidebar').getByTestId('settings-back-to-app')).toHaveAttribute('href', '/tokens');
    });

    test('keyboard focus is visible on the back link, a nav item, and the search box', async ({ page }) => {
        await page.goto('/settings');
        const sidebar = page.getByTestId('settings-sidebar');
        const outline = (el: Element) => {
            const style = getComputedStyle(el);
            return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth, boxShadow: style.boxShadow };
        };

        await page.keyboard.press('Tab');
        await expect(sidebar.getByTestId('settings-back-to-app')).toBeFocused();
        const backStyle = await sidebar.getByTestId('settings-back-to-app').evaluate(outline);
        expect(backStyle.outlineStyle).toBe('solid');
        expect(backStyle.outlineWidth).not.toBe('0px');

        await page.keyboard.press('Tab');
        await expect(sidebar.getByTestId('settings-search')).toBeFocused();
        const searchStyle = await sidebar.getByTestId('settings-search').evaluate(outline);
        expect(searchStyle.outlineStyle).toBe('none');
        expect(searchStyle.boxShadow).not.toBe('none');

        await page.keyboard.press('Tab');
        await expect(sidebar.getByTestId('settings-nav-profile')).toBeFocused();
        const navStyle = await sidebar.getByTestId('settings-nav-profile').evaluate(outline);
        expect(navStyle.outlineStyle).toBe('solid');
        expect(navStyle.outlineWidth).not.toBe('0px');
    });

    test('wide swaps the reading column for a work-surface width', async ({ page }) => {
        await page.goto('/settings');
        const narrow = await page.getByRole('heading', { level: 1 }).evaluate((el) => (el.closest('.mx-auto') as HTMLElement).getBoundingClientRect().width);
        await page.goto('/settings?wide');
        const wide = await page.getByRole('heading', { level: 1 }).evaluate((el) => (el.closest('.mx-auto') as HTMLElement).getBoundingClientRect().width);
        expect(wide).toBeGreaterThan(narrow);
    });

    test.describe('below lg', () => {
        test.use({ viewport: MOBILE });

        test('the sidebar folds into a drawer that opens from the header and closes from the backdrop', async ({ page }) => {
            await page.goto('/settings');
            await expect(page.getByTestId('settings-sidebar')).toBeHidden();
            await expect(page.getByTestId('settings-mobile-drawer')).toHaveCount(0);

            const opener = page.getByTestId('settings-mobile-nav');
            await expect(opener).toHaveText('Settings');
            await opener.click();
            const drawer = page.getByRole('dialog', { name: 'Settings' });
            await expect(drawer).toBeVisible();
            await expect(drawer.getByTestId('settings-nav-profile')).toHaveAttribute('aria-current', 'page');
            await expect(drawer.getByTestId('settings-back-to-app')).toBeVisible();

            await page.mouse.click(MOBILE.width - 10, MOBILE.height / 2);
            await expect(page.getByTestId('settings-mobile-drawer')).toHaveCount(0);
        });

        test('Escape inside the drawer closes it and a nav click navigates', async ({ page }) => {
            await page.goto('/settings');
            await page.getByTestId('settings-mobile-nav').click();
            await page.getByTestId('settings-mobile-drawer').getByTestId('settings-search').press('Escape');
            await expect(page.getByTestId('settings-mobile-drawer')).toHaveCount(0);

            await page.getByTestId('settings-mobile-nav').click();
            await page.getByTestId('settings-mobile-drawer').getByTestId('settings-nav-users').click();
            await expect(page).toHaveURL(/\/settings\/users$/);
            await expect(page.getByTestId('settings-page-users')).toBeVisible();
        });
    });
});
