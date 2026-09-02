import { expect, test } from '@playwright/test';

test.describe('Combobox', () => {
    test('the input has an accessible name from the Field label', async ({ page }) => {
        await page.goto('/combobox');
        await expect(page.getByRole('combobox', { name: 'Model', exact: true })).toBeVisible();
    });

    test('typing filters the list', async ({ page }) => {
        await page.goto('/combobox');
        const input = page.getByRole('combobox', { name: 'Model', exact: true });
        await input.click();
        const listbox = page.getByRole('listbox');
        await expect(listbox).toBeVisible();
        await expect(page.getByRole('option')).toHaveCount(8);

        await input.fill('claude');
        await expect(page.getByRole('option')).toHaveCount(3);
        await expect(page.getByRole('option', { name: 'Claude Sonnet 4', exact: false })).toBeVisible();
        await expect(page.getByRole('option', { name: 'GPT-4o', exact: true })).toHaveCount(0);
    });

    test('a description renders as a second line in the list', async ({ page }) => {
        await page.goto('/combobox');
        const input = page.getByRole('combobox', { name: 'Model', exact: true });
        await input.click();
        const option = page.getByRole('option', { name: 'Claude Sonnet 4', exact: false });
        await expect(option).toContainText('Balanced cost and quality');
    });

    test('ArrowDown then Enter selects the highlighted option, and the active option is announced', async ({
        page,
    }) => {
        await page.goto('/combobox');
        const input = page.getByRole('combobox', { name: 'Model', exact: true });
        await input.click();

        await page.keyboard.press('ArrowDown');
        const firstOption = page.getByRole('option', { name: 'GPT-4o', exact: true });
        await expect(firstOption).toHaveAttribute('data-highlighted', '');

        // Base UI's combobox uses virtual focus: the input stays the
        // DOM-focused element and announces the highlighted option via
        // `aria-activedescendant` pointing at that option's id, rather than
        // moving real focus into the listbox.
        const activeId = await input.getAttribute('aria-activedescendant');
        expect(activeId).toBeTruthy();
        await expect(firstOption).toHaveAttribute('id', activeId as string);

        await page.keyboard.press('Enter');
        await expect(page.getByRole('listbox')).toBeHidden();
        await expect(page.getByTestId('model-result')).toHaveText('gpt-4o');
        await expect(page.getByTestId('model-count')).toHaveText('1');
    });

    test('onChange fires exactly once per selection', async ({ page }) => {
        await page.goto('/combobox');
        const input = page.getByRole('combobox', { name: 'Model', exact: true });

        await input.click();
        await page.getByRole('option', { name: 'GPT-4o', exact: true }).click();
        await expect(page.getByTestId('model-result')).toHaveText('gpt-4o');
        await expect(page.getByTestId('model-count')).toHaveText('1');

        await input.click();
        await page.getByRole('option', { name: 'Llama 3 70B' }).click();
        await expect(page.getByTestId('model-result')).toHaveText('llama-3-70b');
        await expect(page.getByTestId('model-count')).toHaveText('2');
    });

    test('Escape closes without changing the value', async ({ page }) => {
        await page.goto('/combobox');
        const input = page.getByRole('combobox', { name: 'Model', exact: true });

        await input.click();
        await page.keyboard.type('gpt');
        await expect(page.getByRole('listbox')).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(page.getByRole('listbox')).toBeHidden();
        await expect(page.getByTestId('model-result')).toHaveText('none');
        await expect(page.getByTestId('model-count')).toHaveText('0');
        await expect(input).toHaveValue('');
    });

    test('a disabled option cannot be selected, including by a forced click', async ({ page }) => {
        await page.goto('/combobox');
        const input = page.getByRole('combobox', { name: 'Model', exact: true });
        await input.click();

        const disabledOption = page.getByRole('option', { name: 'Gemini 1.5 Flash' });
        await expect(disabledOption).toHaveAttribute('aria-disabled', 'true');

        await disabledOption.click({ force: true });
        // A real selection closes the popup -- still open is proof nothing
        // committed, even though the click event was forced past Playwright's
        // actionability check.
        await expect(page.getByRole('listbox')).toBeVisible();
        await expect(page.getByTestId('model-result')).not.toHaveText('gemini-1.5-flash');
        await expect(page.getByTestId('model-count')).toHaveText('0');
    });

    test('allowCustom commits free text that matches no option', async ({ page }) => {
        await page.goto('/combobox');
        const input = page.getByRole('combobox', { name: 'Model id' });

        await input.click();
        await input.fill('a-brand-new-model-id');
        await page.keyboard.press('Enter');

        await expect(page.getByTestId('custom-result')).toHaveText('a-brand-new-model-id');
        await expect(page.getByTestId('custom-count')).toHaveText('1');
        await expect(input).toHaveValue('a-brand-new-model-id');
    });

    test('without allowCustom, the same unmatched text reverts instead of committing', async ({ page }) => {
        await page.goto('/combobox');
        const input = page.getByRole('combobox', { name: 'Model', exact: true });

        await input.click();
        await input.fill('a-brand-new-model-id');
        await page.keyboard.press('Enter');

        await expect(page.getByTestId('model-result')).toHaveText('none');
        await expect(page.getByTestId('model-count')).toHaveText('0');
        await expect(input).toHaveValue('');
    });

    test('a disabled combobox is not interactive', async ({ page }) => {
        await page.goto('/combobox');
        const input = page.getByRole('combobox', { name: 'Disabled combobox' });
        await expect(input).toBeDisabled();
    });

    test('the whole control is operable by keyboard alone, from focus to committed selection', async ({ page }) => {
        await page.goto('/combobox');

        // "Click me first" sits right before the "Tab target" combobox in DOM
        // order, so a single Tab reaches its input directly -- there's no
        // separate trigger button to Tab through first.
        await page.getByTestId('before-focus-combobox').click();
        await page.keyboard.press('Tab');

        const input = page.getByRole('combobox', { name: 'Tab target' });
        await expect(input).toBeFocused();

        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowDown');
        const secondOption = page.getByRole('option', { name: 'GPT-4o mini' });
        await expect(secondOption).toHaveAttribute('data-highlighted', '');
        await page.keyboard.press('Enter');

        // The "Tab target" combobox has no result readout wired up -- the
        // popup closing on a real commit (not still open, as a disabled or
        // reverted selection would leave it) is the observable proof here.
        await expect(page.getByRole('listbox')).toBeHidden();
        await expect(input).toHaveValue('GPT-4o mini');
    });

    test('keyboard focus shows a visible focus indicator, not just outline: none', async ({ page }) => {
        await page.goto('/combobox');

        await page.getByTestId('before-focus-combobox').click();
        await page.keyboard.press('Tab');

        const input = page.getByRole('combobox', { name: 'Tab target' });
        await expect(input).toBeFocused();

        const focusStyle = await input.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return { outlineStyle: style.outlineStyle, boxShadow: style.boxShadow };
        });
        // `outline-none` is deliberate here (this package's sanctioned
        // form-control exception, same as `TextInput`/`Select`) -- the real
        // indicator is the focus border plus the accent-soft box-shadow
        // ring, so assert those instead of the outline this component
        // intentionally suppresses.
        expect(focusStyle.outlineStyle).toBe('none');
        expect(focusStyle.boxShadow).not.toBe('none');
    });
});
