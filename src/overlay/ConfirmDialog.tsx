import type React from 'react';
import { forwardRef, useRef } from 'react';
import { Button } from '../form/Button.js';
import { Dialog } from './Dialog.js';

export interface ConfirmDialogProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'onKeyDown'> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    /** Name the target and the consequence. Not "Are you sure?". */
    body: React.ReactNode;
    confirmLabel: string;
    onConfirm: () => void;
    /** Blocks re-entry and disables both buttons while the action is in flight. */
    busy?: boolean;
    /** Destructive styling. Defaults true -- this component exists for destructive actions. */
    destructive?: boolean;
    /** `data-testid` for the confirm button, so tests need not click by its label. */
    confirmTestId?: string;
    /** `data-testid` for the cancel button. */
    cancelTestId?: string;
}

/**
 * The destructive-action confirm every "delete this permanently?" flow uses.
 *
 * Renders through `Dialog`'s `alert` mode (`@base-ui/react/alert-dialog`), so
 * it carries `role="alertdialog"`, is always modal, and cannot be dismissed
 * by clicking the backdrop -- a stray click outside must not confirm or
 * cancel a destructive action.
 *
 * Focus lands on the confirm button on open, and Enter confirms regardless
 * of which element inside the popup holds focus, except when a different
 * button is focused -- there, that button's own activation wins so Cancel
 * still cancels.
 *
 * `className`/rest pass straight through to `Dialog`, which lands them on
 * its popup -- this component's own primary surface is that same popup, it
 * just supplies the body/footer content around it. `title` and `onKeyDown`
 * are excluded from the spreadable rest type for the same reason `Dialog`
 * excludes them: `title` already names this component's own accessible-name
 * string prop, and `onKeyDown` would be silently overwritten by the
 * `onPopupKeyDown`-derived handler `Dialog` applies after its own rest
 * spread.
 */
export const ConfirmDialog = forwardRef<HTMLDivElement, ConfirmDialogProps>(function ConfirmDialog(
    {
        open,
        onOpenChange,
        title,
        body,
        confirmLabel,
        onConfirm,
        busy = false,
        destructive = true,
        confirmTestId,
        cancelTestId,
        ...rest
    },
    ref,
) {
    const confirmRef = useRef<HTMLButtonElement>(null);

    const confirm = () => {
        if (busy) {
            return;
        }
        onConfirm();
    };

    const handlePopupKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
        if (event.key !== 'Enter') {
            return;
        }
        const target = event.target as HTMLElement;
        if (target.tagName === 'BUTTON' && target !== confirmRef.current) {
            return;
        }
        event.preventDefault();
        confirm();
    };

    return (
        <Dialog
            ref={ref}
            {...rest}
            alert
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            initialFocus={confirmRef}
            onPopupKeyDown={handlePopupKeyDown}
            footer={
                <>
                    <Button
                        variant="secondary"
                        disabled={busy}
                        data-testid={cancelTestId}
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        ref={confirmRef}
                        variant={destructive ? 'destructive' : 'primary'}
                        disabled={busy}
                        data-testid={confirmTestId}
                        onClick={confirm}
                    >
                        {confirmLabel}
                    </Button>
                </>
            }
        >
            {body}
        </Dialog>
    );
});
