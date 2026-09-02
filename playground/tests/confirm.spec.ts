import { expect, test } from '@playwright/test';

test.describe('ConfirmDialog', () => {
    test('Enter confirms', async ({ page }) => {
        await page.goto('/confirm');
        await page.getByTestId('open-confirm').click();
        await expect(page.getByRole('alertdialog')).toBeVisible();
        await page.keyboard.press('Enter');
        await expect(page.getByTestId('confirm-result')).toHaveText('confirmed');
    });

    test('Escape closes it without firing onConfirm', async ({ page }) => {
        await page.goto('/confirm');
        await page.getByTestId('open-confirm').click();
        await expect(page.getByRole('alertdialog')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.getByRole('alertdialog')).toBeHidden();
        await expect(page.getByTestId('confirm-result')).toHaveText('none');
    });

    test('confirm button holds initial focus on open', async ({ page }) => {
        await page.goto('/confirm');
        await page.getByTestId('open-confirm').click();
        const dialog = page.getByRole('alertdialog');
        await expect(dialog).toBeVisible();
        await expect(dialog.getByRole('button', { name: 'Delete' })).toBeFocused();
    });

    test('busy disables both buttons', async ({ page }) => {
        await page.goto('/confirm');
        // Modal dialogs make the background inert while open, so toggling
        // busy has to happen before the dialog opens.
        await page.getByTestId('toggle-busy').click();
        await page.getByTestId('open-confirm').click();
        const dialog = page.getByRole('alertdialog');
        await expect(dialog).toBeVisible();
        await expect(dialog.getByRole('button', { name: 'Delete' })).toBeDisabled();
        await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    });

    test('is an alert dialog with an accessible name', async ({ page }) => {
        await page.goto('/confirm');
        await page.getByTestId('open-confirm').click();
        const dialog = page.getByRole('alertdialog');
        await expect(dialog).toBeVisible();
        await expect(dialog).toHaveAccessibleName('Delete Wake County parcels');
    });

    test('clicking the backdrop does not close it', async ({ page }) => {
        await page.goto('/confirm');
        await page.getByTestId('open-confirm').click();
        await expect(page.getByRole('alertdialog')).toBeVisible();
        await page.locator('.ui-backdrop').click({ position: { x: 5, y: 5 } });
        await expect(page.getByRole('alertdialog')).toBeVisible();
        await expect(page.getByTestId('confirm-result')).toHaveText('none');
    });

    test('destructive vs non-destructive confirm buttons carry different styling', async ({ page }) => {
        await page.goto('/confirm');

        await page.getByTestId('open-confirm').click();
        const destructiveDialog = page.getByRole('alertdialog');
        await expect(destructiveDialog).toBeVisible();
        await expect(destructiveDialog.getByRole('button', { name: 'Delete' })).toHaveClass(/bg-fail/);
        await page.keyboard.press('Escape');
        await expect(destructiveDialog).toBeHidden();

        await page.getByTestId('open-confirm-archive').click();
        const nonDestructiveDialog = page.getByRole('alertdialog');
        await expect(nonDestructiveDialog).toBeVisible();
        const archiveButton = nonDestructiveDialog.getByRole('button', { name: 'Archive' });
        await expect(archiveButton).not.toHaveClass(/bg-fail/);
        await expect(archiveButton).toHaveClass(/bg-accent/);
    });

    test('confirmTestId and cancelTestId land on the footer buttons', async ({ page }) => {
        await page.goto('/confirm');

        await page.getByTestId('open-confirm-archive').click();
        const dialog = page.getByRole('alertdialog');
        await expect(dialog).toBeVisible();
        await expect(page.getByTestId('archive-confirm')).toHaveText('Archive');
        await page.getByTestId('archive-cancel').click();
        await expect(dialog).toBeHidden();
        await expect(page.getByTestId('confirm-archive-result')).toHaveText('none');

        await page.getByTestId('open-confirm-archive').click();
        await expect(page.getByRole('alertdialog')).toBeVisible();
        await page.getByTestId('archive-confirm').click();
        await expect(page.getByRole('alertdialog')).toBeHidden();
        await expect(page.getByTestId('confirm-archive-result')).toHaveText('confirmed');
    });
});
