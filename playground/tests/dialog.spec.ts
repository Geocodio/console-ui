import { expect, test } from '@playwright/test';

test.describe('Dialog', () => {
    test('traps Tab inside the dialog', async ({ page }) => {
        await page.goto('/dialog');
        await page.getByTestId('open-dialog').click();
        await expect(page.getByRole('dialog')).toBeVisible();

        // Tab through every focusable in the dialog twice over; focus must
        // never escape to the page behind. This is the defect the whole
        // overlay family exists to fix -- neither app had a focus trap.
        for (let i = 0; i < 12; i += 1) {
            await page.keyboard.press('Tab');
            // Yield a frame. floating-ui contains focus with guard sentinels that
            // redirect on focus; pressing Tab again within the same frame observes
            // focus mid-redirect on a guard, which no real input can do.
            await page.waitForTimeout(20);
            const inDialog = await page.evaluate(() =>
                document.querySelector('[role=dialog]')?.contains(document.activeElement) ?? false,
            );
            expect(inDialog, `focus escaped on Tab #${i + 1}`).toBe(true);
        }
    });

    test('is a labelled dialog that isolates the background', async ({ page }) => {
        await page.goto('/dialog');
        await page.getByTestId('open-dialog').click();
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await expect(dialog).toHaveAccessibleName('Rename source');

        // Modality is enforced by hiding the rest of the document from assistive
        // tech, not by an aria-modal attribute. Assert the mechanism that is
        // actually in use.
        const backgroundHidden = await page.evaluate(() => {
            const d = document.querySelector('[role=dialog]');
            return [...document.body.children]
                .filter((el) => !el.contains(d))
                // Base UI's own `markOthers` (confirmed in the installed
                // 1.7.0's `floating-ui-react/utils/markOthers.js`) deliberately
                // exempts any body child containing an `[aria-live]` element
                // -- e.g. `ToastHost`'s viewport, always mounted alongside
                // every route here -- so its announcements aren't silenced by
                // an open dialog. That container is expected to stay visible.
                .filter((el) => !el.querySelector('[aria-live]'))
                .every((el) => el.getAttribute('aria-hidden') === 'true' || el.hasAttribute('inert'));
        });
        expect(backgroundHidden).toBe(true);
    });

    test('locks background scroll promptly after opening', async ({ page }) => {
        await page.goto('/dialog');
        await page.getByTestId('open-dialog').click();
        await expect(page.getByRole('dialog')).toBeVisible();

        // The lock is applied by an effect that runs a tick after the portal
        // commits -- measured at 0-11.5ms across 10 runs, always within one
        // frame. 500ms is a generous ceiling that still fails loudly if the
        // lock stops being applied at all.
        await expect
            .poll(() => page.evaluate(() => getComputedStyle(document.body).overflow), { timeout: 500 })
            .toBe('hidden');
    });

    test('background does not scroll while the dialog is open', async ({ page }) => {
        await page.goto('/dialog');
        expect(
            await page.evaluate(() => document.body.scrollHeight > window.innerHeight),
            'route must overflow for this test to mean anything',
        ).toBe(true);

        // Prove the wheel actually scrolls this page. Without this, the
        // assertion below passes just as happily when no wheel event was ever
        // processed -- indistinguishable from a working lock.
        await page.mouse.wheel(0, 400);
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
        await page.evaluate(() => window.scrollTo(0, 0));
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

        await page.getByTestId('open-dialog').click();
        await expect(page.getByRole('dialog')).toBeVisible();
        // Wait for the lock itself, not merely for the dialog to be visible.
        // Those are two effects a tick apart, and wheeling between them races.
        await expect
            .poll(() => page.evaluate(() => getComputedStyle(document.body).overflow), { timeout: 500 })
            .toBe('hidden');

        await page.mouse.wheel(0, 400);
        await page.waitForTimeout(100);
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
    });

    test('Escape closes it and focus returns to the trigger', async ({ page }) => {
        await page.goto('/dialog');
        await page.getByTestId('open-dialog').click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).toBeHidden();
        await expect(page.getByTestId('open-dialog')).toBeFocused();
    });

    test('alert mode renders role=alertdialog', async ({ page }) => {
        await page.goto('/dialog');
        await page.getByTestId('open-dialog-alert').click();
        await expect(page.getByRole('alertdialog')).toBeVisible();
        await expect(page.getByRole('alertdialog')).toHaveAccessibleName('Storage almost full');
    });
});
