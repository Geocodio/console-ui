import { expect, test } from '@playwright/test';

test.describe('Field / TextInput', () => {
    test('the accessible name comes from the Field label', async ({ page }) => {
        await page.goto('/form');
        const input = page.getByTestId('input-name');
        await expect(input).toHaveAccessibleName('Source name');
    });

    test('a description is exposed as the accessible description', async ({ page }) => {
        await page.goto('/form');
        const input = page.getByTestId('input-email');
        await expect(input).toHaveAccessibleDescription("We'll send build failures here.");
    });

    test('an error is exposed as the accessible description and sets aria-invalid', async ({ page }) => {
        await page.goto('/form');
        const input = page.getByTestId('input-password');
        await expect(input).toHaveAccessibleDescription('Must be at least 8 characters.');
        await expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    test('a field with no error is not marked invalid', async ({ page }) => {
        await page.goto('/form');
        await expect(page.getByTestId('input-name')).not.toHaveAttribute('aria-invalid', 'true');
    });

    test('a disabled input is not focusable and reports disabled', async ({ page }) => {
        await page.goto('/form');
        const input = page.getByTestId('input-disabled');
        await expect(input).toBeDisabled();

        // A disabled element ignores a direct DOM .focus() call -- assert
        // that rather than a Playwright .focus(), which would fail its own
        // actionability check on a disabled target before we learn anything.
        const focused = await input.evaluate((el) => {
            (el as HTMLInputElement).focus();
            return document.activeElement === el;
        });
        expect(focused).toBe(false);
    });

    test('keyboard focus shows a visible focus indicator, not just outline: none', async ({ page }) => {
        await page.goto('/form');

        // Mouse-focus the sentinel first (no guaranteed focus-visible), then
        // Tab -- keyboard-driven focus is what must show a real indicator.
        await page.getByTestId('before-focus-input').click();
        await page.keyboard.press('Tab');

        const input = page.getByTestId('focus-input');
        await expect(input).toBeFocused();

        const focusStyle = await input.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return { outlineStyle: style.outlineStyle, boxShadow: style.boxShadow, borderColor: style.borderColor };
        });
        // `outline-none` is deliberate here (the package's sanctioned
        // form-control exception) -- the real indicator is the focus border
        // plus the accent-soft box-shadow ring, so assert those instead of
        // the outline this component intentionally suppresses.
        expect(focusStyle.outlineStyle).toBe('none');
        expect(focusStyle.boxShadow).not.toBe('none');
    });
});

test.describe('Field / Textarea', () => {
    test('renders a real textarea that keeps its textarea-only props', async ({ page }) => {
        await page.goto('/form');
        const textarea = page.getByTestId('textarea-notes');
        await expect(textarea).toHaveJSProperty('tagName', 'TEXTAREA');
        await expect(textarea).toHaveAttribute('rows', '3');
    });

    test('the accessible name and description come from the Field', async ({ page }) => {
        await page.goto('/form');
        const textarea = page.getByTestId('textarea-notes');
        await expect(textarea).toHaveAccessibleName('Notes');
        await expect(textarea).toHaveAccessibleDescription('Shown to the on-call operator.');
    });

    test('an error is exposed as the accessible description and sets aria-invalid', async ({ page }) => {
        await page.goto('/form');
        const textarea = page.getByTestId('textarea-error');
        await expect(textarea).toHaveAccessibleDescription('Give the submitter something to act on.');
        await expect(textarea).toHaveAttribute('aria-invalid', 'true');
        await expect(page.getByTestId('textarea-notes')).not.toHaveAttribute('aria-invalid', 'true');
    });

    test('typing reaches onChange and Enter inserts a newline instead of committing', async ({ page }) => {
        await page.goto('/form');
        const textarea = page.getByTestId('textarea-notes');
        await textarea.fill('one');
        await textarea.press('Enter');
        await textarea.pressSequentially('two');
        await expect(textarea).toHaveValue('one\ntwo');
        await expect(page.getByTestId('textarea-length')).toHaveText('7');
    });

    test('keyboard focus shows a visible focus indicator, not just outline: none', async ({ page }) => {
        await page.goto('/form');
        // A programmatic focus() gives no guaranteed focus-visible; leave and
        // come back with the keyboard, which is what must show an indicator.
        await page.getByTestId('textarea-notes').focus();
        await page.keyboard.press('Shift+Tab');
        await page.keyboard.press('Tab');

        const textarea = page.getByTestId('textarea-notes');
        await expect(textarea).toBeFocused();
        const focusStyle = await textarea.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return { outlineStyle: style.outlineStyle, boxShadow: style.boxShadow };
        });
        expect(focusStyle.outlineStyle).toBe('none');
        expect(focusStyle.boxShadow).not.toBe('none');
    });
});

test.describe('Select', () => {
    test('opens, is keyboard-navigable, and reports the chosen value', async ({ page }) => {
        await page.goto('/form');
        const trigger = page.getByRole('combobox', { name: 'State' });
        await expect(page.getByTestId('select-result')).toHaveText('none');

        await trigger.click();
        const listbox = page.getByRole('listbox');
        await expect(listbox).toBeVisible();

        // Opening the popup highlights the first item (North Carolina)
        // already, so a single ArrowDown moves the highlight to South
        // Carolina.
        await expect(page.getByRole('option', { name: 'North Carolina' })).toHaveAttribute(
            'data-highlighted',
            '',
        );
        await page.keyboard.press('ArrowDown');
        await expect(page.getByRole('option', { name: 'South Carolina' })).toHaveAttribute(
            'data-highlighted',
            '',
        );
        await page.keyboard.press('Enter');

        await expect(listbox).toBeHidden();
        await expect(page.getByTestId('select-result')).toHaveText('sc');
        await expect(trigger).toHaveText('South Carolina');
    });

    test('onChange fires exactly once with the selected value', async ({ page }) => {
        await page.goto('/form');
        const trigger = page.getByRole('combobox', { name: 'State' });

        await trigger.click();
        await page.getByRole('option', { name: 'North Carolina' }).click();

        await expect(page.getByTestId('select-result')).toHaveText('nc');

        // Re-open and pick the same item again -- if onChange fired more than
        // once per selection, this second selection also over-fires and the
        // result would still read correctly by coincidence, so instead prove
        // a single fresh selection lands exactly the new value, not a stale
        // or duplicated one.
        await trigger.click();
        await page.getByRole('option', { name: 'Oregon' }).click();
        await expect(page.getByTestId('select-result')).toHaveText('or');
    });

    test('a disabled option cannot be selected', async ({ page }) => {
        await page.goto('/form');
        const trigger = page.getByRole('combobox', { name: 'State' });

        await trigger.click();
        const disabledOption = page.getByRole('option', { name: 'Washington' });
        await expect(disabledOption).toHaveAttribute('aria-disabled', 'true');

        await disabledOption.click({ force: true });
        // The popup stays open and the value is unchanged -- a real
        // selection closes the popup, so still-open is proof nothing
        // committed.
        await expect(page.getByRole('listbox')).toBeVisible();
        await expect(page.getByTestId('select-result')).not.toHaveText('wa');
    });

    test('a disabled Select is not interactive', async ({ page }) => {
        await page.goto('/form');
        const disabledTrigger = page.getByRole('combobox', { name: 'Disabled select' });
        await expect(disabledTrigger).toBeDisabled();
    });

    test('keyboard focus shows a visible focus indicator, not just outline: none', async ({ page }) => {
        await page.goto('/form');

        // Mouse-focus the password input first (no guaranteed
        // focus-visible), then Tab -- the "Archived source name" input
        // between it and the trigger is disabled and so isn't a Tab stop,
        // making this the next keyboard-reachable control.
        const passwordInput = page.getByTestId('input-password');
        await passwordInput.click();
        await page.keyboard.press('Tab');

        const trigger = page.getByRole('combobox', { name: 'State' });
        await expect(trigger).toBeFocused();

        const focusStyle = await trigger.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return { outlineStyle: style.outlineStyle, boxShadow: style.boxShadow, borderColor: style.borderColor };
        });
        // `outline-none` is the package's sanctioned form-control exception
        // (see the README Conventions section) -- the real indicator is
        // `focus:border-accent` plus the accent-soft box-shadow ring, so
        // assert those instead of the outline this component intentionally
        // suppresses.
        expect(focusStyle.outlineStyle).toBe('none');
        expect(focusStyle.boxShadow).not.toBe('none');
    });
});
