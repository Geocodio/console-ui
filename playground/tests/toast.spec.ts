import { expect, test } from '@playwright/test';

test.describe('Toast', () => {
    test('appears when raised and auto-dismisses after its duration', async ({ page }) => {
        await page.goto('/toast');
        const toast = page.getByText('Quick toast');

        await page.getByTestId('toast-quick').click();
        await expect(toast).toBeVisible();
        // 300ms duration -- polling well past it proves it actually left,
        // not merely that it hadn't rendered yet.
        await expect(toast).toBeHidden({ timeout: 3000 });
    });

    test('durationMs: null does not auto-dismiss', async ({ page }) => {
        await page.goto('/toast');

        // `ToastHost` on this page is given `defaultDurationMs={300}` (see
        // `App.tsx`) specifically so this test can be discriminating and
        // fast: raising a default-duration toast alongside a `durationMs:
        // null` one and waiting comfortably past that short default proves
        // `null` really disables the timer, rather than merely not having
        // fired yet. Waiting out Base UI's real, unconfigured default
        // (5000ms, confirmed in the installed 1.7.0's `ToastProvider.js`)
        // would leave both toasts visible at the 3s mark regardless of
        // whether `null` was handled correctly -- that version of this test
        // could not fail for the reason it exists.
        await page.getByTestId('toast-default-duration').click();
        // "toast-persistent" raises a high-priority (error) toast, so its
        // title text legitimately appears twice: once in the visible
        // dialog, and again inside Toast.Viewport's own visually-hidden,
        // redundant `role="alert"` announcer for unfocused high-priority
        // toasts (confirmed in the installed 1.7.0's `ToastViewport.js`;
        // see the dedicated live-region test below). `.first()` is the
        // visible one -- it renders before that announcer in DOM order.
        await page.getByTestId('toast-persistent').click();
        const defaultToast = page.getByText('Uses the provider default');
        const persistentToast = page.getByText('Stays until dismissed').first();

        await expect(defaultToast).toBeVisible();
        await expect(persistentToast).toBeVisible();

        // Comfortably past the 300ms default, nowhere near Base UI's real
        // 5000ms default -- discriminating in both directions.
        await expect(defaultToast).toBeHidden({ timeout: 1000 });
        await expect(persistentToast).toBeVisible();
    });

    test('the action button fires its callback exactly once', async ({ page }) => {
        await page.goto('/toast');
        const result = page.getByTestId('action-result');

        await expect(result).toHaveText('0');
        await page.getByTestId('toast-with-action').click();
        await page.getByRole('button', { name: 'Undo' }).click();
        await expect(result).toHaveText('1');
    });

    test('the action closes its own toast after firing the callback', async ({ page }) => {
        await page.goto('/toast');

        await page.getByTestId('toast-with-action').click();
        const toastRoot = page.getByRole('dialog', { name: 'Source archived' });
        await expect(toastRoot).toBeVisible();

        await page.getByRole('button', { name: 'Undo' }).click();
        await expect(toastRoot).toBeHidden();
    });

    test('limit hides the toasts it supersedes, not just makes them non-interactive', async ({ page }) => {
        await page.goto('/toast');

        // ToastHost on this page is given `limit={5}` (see App.tsx) so this
        // can raise one more than the limit and stay deterministic. Base UI
        // itself only flags the excess toast `data-limited` and `inert` --
        // it stays in the DOM at full opacity unless the package's own CSS
        // hides it, which is exactly the gap this test exists to catch: an
        // assertion on the attribute would have passed before the fix.
        await page.getByTestId('toast-limit-burst').click();

        await expect(page.getByText('Limit toast 6', { exact: true })).toBeVisible();
        await expect(page.getByText('Limit toast 2', { exact: true })).toBeVisible();
        await expect(page.getByText('Limit toast 1', { exact: true })).toBeHidden();
    });

    test('multiple toasts stack rather than replacing each other', async ({ page }) => {
        await page.goto('/toast');

        await page.getByTestId('toast-burst').click();
        for (let index = 1; index <= 5; index += 1) {
            await expect(page.getByText(`Toast ${index}`, { exact: true })).toBeVisible();
        }
    });

    test('the toast is announced via the viewport live region', async ({ page }) => {
        await page.goto('/toast');
        const viewport = page.getByRole('region', { name: 'Notifications' });

        // The live region exists before anything is raised, and carries the
        // aria-live/aria-atomic/aria-relevant triple the installed 1.7.0
        // sets on Toast.Viewport -- confirmed by reading ToastViewport.js,
        // not assumed.
        await expect(viewport).toHaveAttribute('aria-live', 'polite');
        await expect(viewport).toHaveAttribute('aria-atomic', 'false');
        await expect(viewport).toHaveAttribute('aria-relevant', 'additions text');

        await page.getByTestId('toast-success').click();
        const toastRoot = page.getByRole('dialog', { name: 'Source saved' });
        await expect(toastRoot).toBeVisible();

        // A high-priority (error) toast renders role="alertdialog" -- but,
        // confirmed in the installed 1.7.0's `ToastRoot.js`, that dialog
        // carries `aria-hidden="true"` until it is focused (so an unfocused
        // one is invisible to `getByRole`, by design: it exists to keep the
        // dialog's own aria-live announcement from double-firing). The
        // actual urgent announcement instead comes from a second mechanism
        // entirely -- `ToastViewport.js` renders a visually-hidden
        // `role="alert"` node per unfocused high-priority toast, containing
        // its title and description as plain text.
        await page.getByTestId('toast-error').click();
        const alertDialog = page.locator('[role="alertdialog"]', { hasText: 'Build failed' });
        await expect(alertDialog).toHaveAttribute('aria-hidden', 'true');
        await expect(page.getByRole('alertdialog', { name: 'Build failed' })).toHaveCount(0);

        const announcer = page.getByRole('alert');
        await expect(announcer).toContainText('Build failed');
    });

    test('kind is distinguishable to assistive tech, not just by a coloured edge', async ({ page }) => {
        await page.goto('/toast');

        // `ToastList` prefixes every toast with a visually hidden
        // "Success:"/"Error:"/"Info:" label (`KIND_LABEL` in `Toast.tsx`) so
        // kind survives for assistive tech even though the visible cue is
        // just a coloured left edge. Assert it's actually there, for more
        // than one kind, so a refactor that drops the prefix and leaves only
        // colour fails here instead of regressing silently.
        await page.getByTestId('toast-success').click();
        await expect(page.getByRole('dialog', { name: 'Source saved' })).toContainText(
            'Success: Source saved',
        );

        await page.getByTestId('toast-info').click();
        await expect(page.getByRole('dialog', { name: 'A new version is available' })).toContainText(
            'Info: A new version is available',
        );
    });

    test('a toast raised from outside React still appears', async ({ page }) => {
        await page.goto('/toast');

        await page.getByTestId('toast-outside').click();
        await expect(page.getByText('Raised from outside React')).toBeVisible();
        await expect(page.getByText('Called from a module-scope function, not a component.')).toBeVisible();
    });

    test('Close dismisses the toast, and Close/Action show a focus indicator', async ({ page }) => {
        await page.goto('/toast');

        await page.getByTestId('toast-with-action').click();
        const toastRoot = page.getByRole('dialog', { name: 'Source archived' });
        await expect(toastRoot).toBeVisible();

        // "toast-outside" is the last focusable element in normal page flow
        // -- clicking it (mouse focus, no guaranteed focus-visible) both
        // raises a second toast and sets up a deterministic Tab path into
        // the portalled toast list. The toast list orders newest-first
        // (confirmed empirically: Base UI prepends, it does not append), so
        // from this sentinel Tab visits, in order: the new "outside" toast's
        // Root, its Close, then the earlier "Source archived" toast's Root,
        // its Action ("Undo"), and its Close.
        await page.getByTestId('toast-outside').click();
        await page.keyboard.press('Tab'); // outside toast: Root
        await page.keyboard.press('Tab'); // outside toast: Close
        await page.keyboard.press('Tab'); // action toast: Root
        await page.keyboard.press('Tab'); // action toast: Action ("Undo")

        const actionButton = page.getByRole('button', { name: 'Undo' });
        await expect(actionButton).toBeFocused();
        await expect(actionButton).toHaveCSS('outline-style', 'solid');

        await page.keyboard.press('Tab'); // action toast: Close
        const closeButton = toastRoot.getByRole('button', { name: 'Dismiss' });
        await expect(closeButton).toBeFocused();
        await expect(closeButton).toHaveCSS('outline-style', 'solid');

        await closeButton.click();
        await expect(toastRoot).toBeHidden();
    });

    test('ToastHost forwards className/rest to Toast.Viewport, its one always-present surface', async ({ page }) => {
        await page.goto('/toast');

        // `data-testid="toast-viewport"` is passed to `ToastHost` in
        // App.tsx, mounted once for the whole app -- this proves it reaches
        // the real `Toast.Viewport` element rather than being swallowed,
        // and that the element exists whether or not a toast is showing.
        const viewport = page.getByTestId('toast-viewport');
        await expect(viewport).toBeAttached();
        await expect(viewport).toHaveClass(/fixed/);
    });
});
