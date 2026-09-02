import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type React from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/cn.js';

export interface DialogProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'onKeyDown'> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Accessible name. Rendered as the visible heading unless `hideTitle`. */
    title: string;
    /** Visually hides the title while keeping it as the accessible name. */
    hideTitle?: boolean;
    description?: string;
    /** Tailwind width utility, e.g. 'w-96'. Defaults to 'w-96'. */
    width?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    /**
     * Renders through Base UI's `alert-dialog` module instead of `dialog`:
     * sets `role="alertdialog"`, forces `modal`, and disables pointer
     * dismissal so the backdrop cannot close it. Internal -- `ConfirmDialog`
     * is the only intended consumer.
     */
    alert?: boolean;
    /** Forwarded to the popup element. `ConfirmDialog` uses this to wire Enter-to-confirm. */
    onPopupKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
    /** Forwarded to the popup's `initialFocus`. `ConfirmDialog` uses this to focus the confirm button. */
    initialFocus?: React.RefObject<HTMLElement | null>;
}

/**
 * The modal shell every dialog in the system composes.
 *
 * `title` is required and is not decorative: it is the dialog's accessible
 * name. A dialog whose design has no visible heading passes `hideTitle` and
 * still announces correctly, which is why there is no way to omit it.
 *
 * Focus containment, scroll lock, portalling and Escape all come from Base UI,
 * which renders the popup through floating-ui's FloatingFocusManager. That
 * isolates the background by marking sibling elements aria-hidden rather than
 * by setting aria-modal on the popup -- do not add aria-modal here, it
 * duplicates the mechanism against the library's design.
 * Exit is handled by data-ending-style in overlays.css -- the popup stays
 * mounted while it leaves, so there is no unmount race to manage here.
 *
 * `alert` swaps the underlying parts from `@base-ui/react/dialog` to
 * `@base-ui/react/alert-dialog`. The two modules' parts share an identical
 * API (Root/Portal/Backdrop/Popup/Title/Description), so the cast below only
 * unifies their nominally distinct prop types for the compiler -- it does not
 * change behaviour. The alert-dialog module forces `role="alertdialog"`,
 * `modal: true`, and disables pointer dismissal itself; none of that is
 * reimplemented here.
 *
 * `className`/rest land on the popup -- the dialog's primary visual surface,
 * not the portal or backdrop. Native `title`/`onKeyDown` are deliberately
 * excluded from the spreadable rest: `title` already names this component's
 * accessible-name string, and `onKeyDown` already has a named equivalent in
 * `onPopupKeyDown`, so extending them here would silently shadow one meaning
 * with the other instead of reaching the DOM as a caller would expect.
 */
export const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(
    {
        open,
        onOpenChange,
        title,
        hideTitle = false,
        description,
        width = 'w-96',
        children,
        footer,
        alert = false,
        onPopupKeyDown,
        initialFocus,
        className,
        ...rest
    },
    ref,
) {
    const Parts = (alert ? AlertDialog : BaseDialog) as unknown as typeof BaseDialog;

    return (
        <Parts.Root open={open} onOpenChange={onOpenChange}>
            <Parts.Portal>
                <Parts.Backdrop className="ui-backdrop fixed inset-0 bg-black/30" />
                <Parts.Popup
                    ref={ref}
                    {...rest}
                    className={cn(
                        'ui-popup fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
                        width,
                        'rounded-card border border-hair bg-panel p-4 shadow-overlay',
                        className,
                    )}
                    onKeyDown={onPopupKeyDown}
                    initialFocus={initialFocus}
                >
                    <Parts.Title className={hideTitle ? 'sr-only' : 'mb-2 text-[14px] font-semibold text-body'}>
                        {title}
                    </Parts.Title>
                    {description && (
                        <Parts.Description className="mb-4 text-[12.5px] text-muted">
                            {description}
                        </Parts.Description>
                    )}
                    {children}
                    {footer && <div className="mt-4 flex justify-end gap-2">{footer}</div>}
                </Parts.Popup>
            </Parts.Portal>
        </Parts.Root>
    );
});
