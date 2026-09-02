import { expect, test } from '@playwright/test';

test.describe('Checkbox', () => {
    test('label is the accessible name', async ({ page }) => {
        await page.goto('/choice');
        const checkbox = page.getByTestId('checkbox-agree').getByRole('checkbox');
        await expect(checkbox).toHaveAccessibleName('I agree to the terms');
    });

    test('a hidden label still becomes the accessible name', async ({ page }) => {
        await page.goto('/choice');
        await expect(page.getByRole('checkbox', { name: 'Hidden label checkbox' })).toBeVisible();
    });

    test('Space toggles the checkbox from the keyboard', async ({ page }) => {
        await page.goto('/choice');
        const checkbox = page.getByTestId('checkbox-agree').getByRole('checkbox');
        await checkbox.focus();
        await expect(checkbox).toHaveAttribute('aria-checked', 'false');
        await page.keyboard.press('Space');
        await expect(checkbox).toHaveAttribute('aria-checked', 'true');
        await page.keyboard.press('Space');
        await expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });

    test('onCheckedChange fires once per toggle', async ({ page }) => {
        await page.goto('/choice');
        const checkbox = page.getByTestId('checkbox-agree').getByRole('checkbox');
        const count = page.getByTestId('checkbox-agree-count');
        await expect(count).toHaveText('0');
        await checkbox.click();
        await expect(count).toHaveText('1');
        await checkbox.click();
        await expect(count).toHaveText('2');
    });

    test('the indeterminate checkbox reports mixed state to assistive tech', async ({ page }) => {
        await page.goto('/choice');
        const checkbox = page.getByTestId('checkbox-select-all').getByRole('checkbox');
        await expect(checkbox).toHaveAttribute('aria-checked', 'mixed');

        const nativeIndeterminate = await checkbox.evaluate((el) => {
            const input = el.parentElement?.querySelector('input[type="checkbox"]');
            return input instanceof HTMLInputElement ? input.indeterminate : null;
        });
        expect(nativeIndeterminate).toBe(true);
    });

    test('clicking an indeterminate checkbox resolves it to a definite state', async ({ page }) => {
        await page.goto('/choice');
        const checkbox = page.getByTestId('checkbox-select-all').getByRole('checkbox');
        await checkbox.click();
        await expect(checkbox).not.toHaveAttribute('aria-checked', 'mixed');
        await expect(page.getByTestId('checkbox-select-all-count')).toHaveText('1');
    });

    test('a disabled checkbox is not Tab-reachable and reports disabled', async ({ page }) => {
        await page.goto('/choice');
        const checkbox = page.getByRole('checkbox', { name: 'Archived source' });
        await expect(checkbox).toHaveAttribute('data-disabled', '');
        // A non-native, non-composite Base UI control sets tabindex="-1" when
        // disabled (confirmed against the installed 1.7.0's
        // useFocusableWhenDisabled.js) -- that removes it from Tab order,
        // which is the real user-facing guarantee. A plain `.focus()` call
        // would still succeed on a tabindex="-1" element per spec (it is
        // still programmatically focusable), so that isn't what's asserted
        // here.
        await expect(checkbox).toHaveAttribute('tabindex', '-1');
    });

    test('a disabled checkbox is visibly dimmed, not just marked disabled', async ({ page }) => {
        await page.goto('/choice');
        // Regression test: Tailwind's `disabled:` variant compiles to the CSS
        // `:disabled` pseudo-class, which only matches native form elements
        // (input, button, select, textarea, ...). Checkbox.Root renders a
        // `<span role="checkbox">`, so `disabled:opacity-50` never matched --
        // the control reported disabled to assistive tech but looked
        // identical to an enabled one. `data-[disabled]:opacity-50` is the
        // fix; this asserts the actual computed appearance, which the
        // attribute-only tests above can't catch.
        const enabled = page.getByRole('checkbox', { name: 'I agree to the terms' });
        const disabled = page.getByRole('checkbox', { name: 'Archived source' });

        const enabledOpacity = await enabled.evaluate((el) => Number(window.getComputedStyle(el).opacity));
        const disabledOpacity = await disabled.evaluate((el) => Number(window.getComputedStyle(el).opacity));
        expect(disabledOpacity).toBeLessThan(enabledOpacity);
    });

    test('cursor is pointer when enabled and not-allowed when disabled', async ({ page }) => {
        await page.goto('/choice');
        // Regression: Base UI renders `<span role="checkbox">`, which the
        // native-element selectors in base.css's cursor-restoration rule
        // don't match on their own -- the `[role='checkbox']` addition is
        // what makes this pass. Computed style, not a class-name check, so a
        // change that stops matching the element is caught.
        const enabled = page.getByRole('checkbox', { name: 'I agree to the terms' });
        const disabled = page.getByRole('checkbox', { name: 'Archived source' });

        await expect(enabled).toHaveCSS('cursor', 'pointer');
        await expect(disabled).toHaveCSS('cursor', 'not-allowed');
    });

    test('keyboard focus shows a visible indicator', async ({ page }) => {
        await page.goto('/choice');
        const checkbox = page.getByRole('checkbox', { name: 'Focus target checkbox' });
        const unfocusedBorderColor = await checkbox.evaluate((el) => window.getComputedStyle(el).borderColor);

        await page.getByTestId('before-focus-choice').click();
        await page.keyboard.press('Tab');
        await expect(checkbox).toBeFocused();

        // The border/box-shadow swap is behind `transition-[box-shadow,
        // border-color]`, so the very first computed style read after focus
        // can land mid-transition -- poll instead of a single read.
        await expect
            .poll(() => checkbox.evaluate((el) => window.getComputedStyle(el).borderColor))
            .not.toBe(unfocusedBorderColor);

        const focusStyle = await checkbox.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return { outlineStyle: style.outlineStyle, boxShadow: style.boxShadow, borderColor: style.borderColor };
        });
        expect(focusStyle.outlineStyle).toBe('none');
        expect(focusStyle.boxShadow).not.toBe('none');
        // Regression: `focus-visible:border-accent` is the other half of this
        // control's focus indicator alongside the box-shadow ring above --
        // without this, a change that dropped just the border swap would be
        // silent.
        expect(focusStyle.borderColor).not.toBe(unfocusedBorderColor);
    });
});

test.describe('Native form elements', () => {
    test('cursor is pointer on native checkbox, radio and tab, and not-allowed when disabled', async ({ page }) => {
        await page.goto('/choice');
        // Regression: base.css's cursor-restoration rule originally covered
        // the ARIA-role spans Base UI renders (`[role='checkbox']`,
        // `[role='radio']`) but not the *native* `input[type='checkbox']`/
        // `input[type='radio']` elements an app may use directly, nor
        // `[role='tab']`. Computed style, not a class-name check, so a
        // selector that stops matching is caught.
        await expect(page.getByTestId('native-checkbox')).toHaveCSS('cursor', 'pointer');
        await expect(page.getByTestId('native-radio')).toHaveCSS('cursor', 'pointer');
        await expect(page.getByTestId('native-tab')).toHaveCSS('cursor', 'pointer');
        await expect(page.getByTestId('native-checkbox-disabled')).toHaveCSS('cursor', 'not-allowed');
    });
});

test.describe('RadioGroup', () => {
    test('the group exposes its label as the group name', async ({ page }) => {
        await page.goto('/choice');
        await expect(page.getByRole('radiogroup', { name: 'Billing plan' })).toBeVisible();
    });

    test('aria-orientation matches the vertical/horizontal prop rather than falling back to the ARIA-implicit vertical default', async ({ page }) => {
        await page.goto('/choice');
        await expect(page.getByRole('radiogroup', { name: 'Billing plan' })).toHaveAttribute(
            'aria-orientation',
            'vertical',
        );
        await expect(page.getByRole('radiogroup', { name: 'Size' })).toHaveAttribute(
            'aria-orientation',
            'horizontal',
        );
    });

    test('each option exposes its label as the accessible name', async ({ page }) => {
        await page.goto('/choice');
        await expect(page.getByRole('radio', { name: 'Monthly' })).toBeVisible();
        await expect(page.getByRole('radio', { name: 'Annual' })).toBeVisible();
    });

    test('arrow keys move selection within the group', async ({ page }) => {
        await page.goto('/choice');
        const monthly = page.getByRole('radio', { name: 'Monthly' });
        const annual = page.getByRole('radio', { name: 'Annual' });

        await monthly.focus();
        await expect(monthly).toHaveAttribute('aria-checked', 'true');

        await page.keyboard.press('ArrowDown');
        await expect(annual).toHaveAttribute('aria-checked', 'true');
        await expect(annual).toBeFocused();
        await expect(monthly).toHaveAttribute('aria-checked', 'false');
    });

    test('onChange fires once per selection with the right value', async ({ page }) => {
        await page.goto('/choice');
        await expect(page.getByTestId('radio-plan-count')).toHaveText('0');

        await page.getByRole('radio', { name: 'Annual' }).click();
        await expect(page.getByTestId('radio-plan-value')).toHaveText('annual');
        await expect(page.getByTestId('radio-plan-count')).toHaveText('1');

        await page.getByRole('radio', { name: 'Monthly' }).click();
        await expect(page.getByTestId('radio-plan-value')).toHaveText('monthly');
        await expect(page.getByTestId('radio-plan-count')).toHaveText('2');
    });

    test('a disabled option cannot be selected', async ({ page }) => {
        await page.goto('/choice');
        const lifetime = page.getByRole('radio', { name: 'Lifetime' });
        await expect(lifetime).toHaveAttribute('data-disabled', '');
        await lifetime.click({ force: true });
        await expect(page.getByTestId('radio-plan-value')).not.toHaveText('lifetime');
    });

    test('a horizontal orientation still supports arrow-key navigation', async ({ page }) => {
        await page.goto('/choice');
        const group = page.getByTestId('radio-size');
        const small = group.getByRole('radio', { name: 'Small' });
        const medium = group.getByRole('radio', { name: 'Medium' });

        await small.focus();
        await page.keyboard.press('ArrowRight');
        await expect(medium).toHaveAttribute('aria-checked', 'true');
    });

    test('every option in a disabled group reports disabled and ignores clicks', async ({ page }) => {
        await page.goto('/choice');
        const group = page.getByTestId('radio-disabled');
        const radio = group.getByRole('radio', { name: 'Medium' });
        await expect(radio).toHaveAttribute('aria-disabled', 'true');

        // Base UI keeps exactly one roving tab stop even when every item in a
        // RadioGroup is disabled (confirmed against the installed 1.7.0's
        // useCompositeRoot.js: "If every item is disabled, keep the current
        // [highlighted index]") -- so this asserts the click is a no-op
        // rather than that the control is unreachable.
        await radio.click({ force: true });
        await expect(radio).toHaveAttribute('aria-checked', 'false');
    });

    test('a disabled radio option is visibly dimmed, not just marked disabled', async ({ page }) => {
        await page.goto('/choice');
        // Same regression as Checkbox: Radio.Root is a <span role="radio">,
        // so `disabled:opacity-50` never matched the CSS `:disabled`
        // pseudo-class. Asserts the fix (`data-[disabled]:opacity-50`) by
        // computed appearance, not just the `aria-disabled` attribute.
        const enabled = page.getByRole('radio', { name: 'Monthly' });
        const disabled = page.getByRole('radio', { name: 'Lifetime' });

        const enabledOpacity = await enabled.evaluate((el) => Number(window.getComputedStyle(el).opacity));
        const disabledOpacity = await disabled.evaluate((el) => Number(window.getComputedStyle(el).opacity));
        expect(disabledOpacity).toBeLessThan(enabledOpacity);
    });

    test('cursor is pointer when enabled and not-allowed when disabled', async ({ page }) => {
        await page.goto('/choice');
        // Same regression as Checkbox: `<span role="radio">` needs the
        // `[role='radio']` addition in base.css to get a restored pointer
        // cursor at all.
        const enabled = page.getByRole('radio', { name: 'Monthly' });
        const disabled = page.getByRole('radio', { name: 'Lifetime' });

        await expect(enabled).toHaveCSS('cursor', 'pointer');
        await expect(disabled).toHaveCSS('cursor', 'not-allowed');
    });

    test('keyboard focus shows a visible indicator', async ({ page }) => {
        await page.goto('/choice');
        const radioAlpha = page.getByRole('radio', { name: 'Alpha' });
        const unfocusedBorderColor = await radioAlpha.evaluate((el) => window.getComputedStyle(el).borderColor);

        await page.getByTestId('before-focus-choice').click();
        await page.keyboard.press('Tab'); // checkbox
        await page.keyboard.press('Tab'); // into radio group
        await expect(radioAlpha).toBeFocused();

        // Same transition race as Checkbox's version of this test -- poll
        // rather than reading the computed style once, immediately.
        await expect
            .poll(() => radioAlpha.evaluate((el) => window.getComputedStyle(el).borderColor))
            .not.toBe(unfocusedBorderColor);

        const focusStyle = await radioAlpha.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return { outlineStyle: style.outlineStyle, boxShadow: style.boxShadow, borderColor: style.borderColor };
        });
        expect(focusStyle.outlineStyle).toBe('none');
        expect(focusStyle.boxShadow).not.toBe('none');
        // Regression: same border-swap indicator as Checkbox -- assert it
        // actually changes on focus, not just that the box-shadow ring does.
        expect(focusStyle.borderColor).not.toBe(unfocusedBorderColor);
    });
});

test.describe('Toggle', () => {
    test('label is the accessible name', async ({ page }) => {
        await page.goto('/choice');
        await expect(page.getByRole('switch', { name: 'Email notifications' })).toBeVisible();
    });

    test('Base UI supplies role="switch" and aria-checked itself', async ({ page }) => {
        await page.goto('/choice');
        const toggle = page.getByRole('switch', { name: 'Email notifications' });
        await expect(toggle).toHaveAttribute('role', 'switch');
        await expect(toggle).toHaveAttribute('aria-checked', 'true');
    });

    test('Space toggles the switch from the keyboard', async ({ page }) => {
        await page.goto('/choice');
        const toggle = page.getByRole('switch', { name: 'Email notifications' });
        await toggle.focus();
        await expect(toggle).toHaveAttribute('aria-checked', 'true');
        await page.keyboard.press('Space');
        await expect(toggle).toHaveAttribute('aria-checked', 'false');
        await page.keyboard.press('Space');
        await expect(toggle).toHaveAttribute('aria-checked', 'true');
    });

    test('onCheckedChange fires once per toggle', async ({ page }) => {
        await page.goto('/choice');
        const toggle = page.getByRole('switch', { name: 'Email notifications' });
        const count = page.getByTestId('toggle-notifications-count');
        await expect(count).toHaveText('0');
        await toggle.click();
        await expect(count).toHaveText('1');
        await toggle.click();
        await expect(count).toHaveText('2');
    });

    test('a disabled toggle is not Tab-reachable and reports disabled', async ({ page }) => {
        await page.goto('/choice');
        const toggle = page.getByRole('switch', { name: 'Disabled toggle' });
        await expect(toggle).toHaveAttribute('data-disabled', '');
        // Same reasoning as Checkbox's disabled test: tabindex="-1" is the
        // real "not Tab-reachable" contract for a non-native disabled Base UI
        // control, not whether a raw `.focus()` call succeeds.
        await expect(toggle).toHaveAttribute('tabindex', '-1');
    });

    test('a disabled toggle is visibly dimmed, not just marked disabled', async ({ page }) => {
        await page.goto('/choice');
        // Same regression as Checkbox/RadioGroup: Switch.Root is a
        // <span role="switch">, so `disabled:opacity-50` never matched.
        // Asserts the fix (`data-[disabled]:opacity-50`) by computed
        // appearance.
        const enabled = page.getByRole('switch', { name: 'Email notifications' });
        const disabled = page.getByRole('switch', { name: 'Disabled toggle' });

        const enabledOpacity = await enabled.evaluate((el) => Number(window.getComputedStyle(el).opacity));
        const disabledOpacity = await disabled.evaluate((el) => Number(window.getComputedStyle(el).opacity));
        expect(disabledOpacity).toBeLessThan(enabledOpacity);
    });

    test('cursor is pointer when enabled and not-allowed when disabled', async ({ page }) => {
        await page.goto('/choice');
        // Same regression as Checkbox/RadioGroup, but Toggle has no
        // wrapping `<label>` at all to fall back on -- `Switch.Root` is a
        // bare `<span role="switch">`, so before base.css's `[role='switch']`
        // addition, hovering an enabled toggle showed the default arrow
        // cursor while every other choice control showed a pointer.
        const enabled = page.getByRole('switch', { name: 'Email notifications' });
        const disabled = page.getByRole('switch', { name: 'Disabled toggle' });

        await expect(enabled).toHaveCSS('cursor', 'pointer');
        await expect(disabled).toHaveCSS('cursor', 'not-allowed');
    });

    test('keyboard focus shows a visible indicator', async ({ page }) => {
        await page.goto('/choice');
        await page.getByTestId('before-focus-choice').click();
        await page.keyboard.press('Tab'); // checkbox
        await page.keyboard.press('Tab'); // radio alpha
        await page.keyboard.press('Tab'); // toggle

        const toggle = page.getByRole('switch', { name: 'Focus target toggle' });
        await expect(toggle).toBeFocused();

        // Toggle has no border, unlike Checkbox/RadioGroup, so the 3px
        // `accent-soft` box-shadow halo alone is not a reliable visible
        // indicator (it is ~1.1:1 against `--bg` in both themes). The global
        // `:focus-visible` outline (no longer suppressed by `outline-none`)
        // is what actually makes focus visible here; the box-shadow remains
        // a bonus on top of it.
        const focusStyle = await toggle.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };
        });
        expect(focusStyle.outlineStyle).not.toBe('none');
        expect(Number.parseFloat(focusStyle.outlineWidth)).toBeGreaterThan(0);
    });
});
