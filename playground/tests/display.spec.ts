import { expect, test } from '@playwright/test';

test.describe('Spinner', () => {
    test('a labeled spinner exposes role=status with that accessible name', async ({ page }) => {
        await page.goto('/display');
        const spinner = page.getByRole('status', { name: 'Loading sources' });
        await expect(spinner).toBeAttached();
    });

    test('an unlabeled spinner is aria-hidden and not exposed as a status', async ({ page }) => {
        await page.goto('/display');

        const sm = page.getByTestId('spinner-sm-unlabeled');
        await expect(sm).toHaveAttribute('aria-hidden', 'true');
        await expect(sm).not.toHaveAttribute('role', 'status');

        const md = page.getByTestId('spinner-md-unlabeled');
        await expect(md).toHaveAttribute('aria-hidden', 'true');

        // aria-hidden removes it from the accessibility tree entirely, so it
        // cannot be found by an accessible-name query the way the labeled
        // spinner above was.
        await expect(page.getByRole('status')).toHaveCount(1);
    });
});

test.describe('Kbd', () => {
    test('renders one kbd element per key', async ({ page }) => {
        await page.goto('/display');

        await expect(page.getByTestId('kbd-single').locator('kbd')).toHaveCount(1);
        await expect(page.getByTestId('kbd-combo').locator('kbd')).toHaveCount(2);
        await expect(page.getByTestId('kbd-arrows').locator('kbd')).toHaveCount(2);
    });

    test('a keycap is not exposed with an interactive role', async ({ page }) => {
        await page.goto('/display');

        const kbd = page.getByTestId('kbd-combo').locator('kbd').first();
        const role = await kbd.evaluate((el) => el.getAttribute('role'));
        expect(role).toBeNull();
        await expect(page.getByTestId('kbd-combo').getByRole('button')).toHaveCount(0);
    });
});

test.describe('Skeleton', () => {
    test('is aria-hidden', async ({ page }) => {
        await page.goto('/display');
        await expect(page.getByTestId('skeleton')).toHaveAttribute('aria-hidden', 'true');
    });

    test('animates under normal motion preferences', async ({ page }) => {
        await page.goto('/display');
        const duration = await page
            .getByTestId('skeleton')
            .evaluate((el) => window.getComputedStyle(el).animationDuration);
        expect(duration).not.toBe('0s');
    });

    test('suppresses its animation under prefers-reduced-motion: reduce', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('/display');
        const durationSeconds = await page
            .getByTestId('skeleton')
            .evaluate((el) => Number.parseFloat(window.getComputedStyle(el).animationDuration));
        // base.css's global reduced-motion rule forces 0.01ms -- browsers may
        // serialize that as "0.01ms" or "1e-05s" depending on engine, so
        // compare the parsed value rather than the string.
        expect(durationSeconds).toBeCloseTo(0.00001, 5);
    });
});

test.describe('EmptyState', () => {
    test('renders title, body, icon slot and action slot', async ({ page }) => {
        await page.goto('/display');
        const emptyState = page.getByTestId('empty-state');

        await expect(emptyState.getByText('No sources yet')).toBeVisible();
        await expect(
            emptyState.getByText('Sources you add will show up here once they finish their first build.'),
        ).toBeVisible();
        await expect(page.getByTestId('empty-state-icon')).toBeVisible();
        await expect(page.getByTestId('empty-state-action')).toBeVisible();
    });

    test('the action slot is interactive', async ({ page }) => {
        await page.goto('/display');
        await expect(page.getByTestId('empty-state-action-count')).toHaveText('0');
        await page.getByTestId('empty-state-action').click();
        await expect(page.getByTestId('empty-state-action-count')).toHaveText('1');
    });
});

test.describe('Badge', () => {
    for (const tone of ['neutral', 'ok', 'warn', 'fail', 'info', 'accent']) {
        test(`the ${tone} tone renders with its label text`, async ({ page }) => {
            await page.goto('/display');
            await expect(page.getByTestId(`badge-${tone}`)).toHaveText(tone);
        });
    }
});

test.describe('StatusPill', () => {
    for (const tone of ['ok', 'warn', 'fail', 'info', 'idle']) {
        test(`the ${tone} tone renders a dot and its label as real text`, async ({ page }) => {
            await page.goto('/display');
            const pill = page.getByTestId(`status-pill-${tone}`);
            await expect(pill).toHaveText(tone);
            await expect(pill.locator('span')).toBeAttached();

            // The label must be real text content, not conveyed by colour
            // alone -- assert it survives even when colour information is
            // stripped away.
            const text = await pill.evaluate((el) => el.textContent ?? '');
            expect(text.trim().length).toBeGreaterThan(0);
        });
    }

    test('the glyph variant renders its glyph and label, with no pill border', async ({ page }) => {
        await page.goto('/display');
        const pill = page.getByTestId('status-pill-glyph');

        await expect(pill).toHaveText('●RUNNING');
        await expect(pill).toHaveClass(/font-mono/);
        await expect(pill).not.toHaveClass(/rounded-pill/);
    });

    test('pulse animates the marker, and is off by default', async ({ page }) => {
        await page.goto('/display');

        await expect(page.getByTestId('status-pill-glyph').locator('span').first())
            .toHaveClass(/animate-status-pulse/);
        await expect(page.getByTestId('status-pill-ok').locator('span').first())
            .not.toHaveClass(/animate-status-pulse/);
    });

    test('the accent tone renders with its label text', async ({ page }) => {
        await page.goto('/display');
        await expect(page.getByTestId('status-pill-accent')).toHaveText('accent');
    });
});
