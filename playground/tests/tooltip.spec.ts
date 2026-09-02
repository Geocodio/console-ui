import { expect, test } from '@playwright/test';

test.describe('Tooltip', () => {
    test('appears on hover, after the delay', async ({ page }) => {
        await page.goto('/tooltip');
        const trigger = page.getByTestId('tooltip-button');
        const tooltip = page.getByRole('tooltip');

        await trigger.hover();
        // Default delay is 400ms -- well inside that window the tooltip must
        // still be closed, not merely "not yet asserted visible".
        await expect(tooltip).toBeHidden({ timeout: 150 });
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toHaveText('Create a new source');
    });

    test('appears on keyboard focus', async ({ page }) => {
        await page.goto('/tooltip');
        const trigger = page.getByTestId('tooltip-button');
        const tooltip = page.getByRole('tooltip');

        await expect(tooltip).toBeHidden();
        await trigger.focus();
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toHaveText('Create a new source');
    });

    test('Escape dismisses it while the trigger keeps focus', async ({ page }) => {
        await page.goto('/tooltip');
        const trigger = page.getByTestId('tooltip-button');
        const tooltip = page.getByRole('tooltip');

        await trigger.focus();
        await expect(tooltip).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(tooltip).toBeHidden();
        await expect(trigger).toBeFocused();
    });

    test('the trigger has the label as its accessible description', async ({ page }) => {
        await page.goto('/tooltip');
        const trigger = page.getByTestId('tooltip-button');

        await trigger.focus();
        await expect(page.getByRole('tooltip')).toBeVisible();
        await expect(trigger).toHaveAccessibleDescription('Create a new source');
    });

    test('the trigger in the DOM is the caller\'s own element, not a wrapper', async ({ page }) => {
        await page.goto('/tooltip');

        const button = page.getByTestId('tooltip-button');
        await expect(button).toHaveJSProperty('tagName', 'BUTTON');
        await expect(button).toHaveClass(/border-hair-strong/);

        const span = page.getByTestId('tooltip-span');
        await expect(span).toHaveJSProperty('tagName', 'SPAN');
        await expect(span).toHaveClass(/rounded-pill/);

        // The trigger's parent must be plain page markup, not a Base UI
        // wrapper -- `render` composes props onto the caller's element in
        // place instead of nesting a generated <button> around it.
        const parentTag = await button.evaluate((el) => el.parentElement?.tagName);
        expect(parentTag).toBe('DIV');
    });
});
