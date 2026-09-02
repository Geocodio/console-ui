import { Toast as BaseToast } from '@base-ui/react/toast';
import type React from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/cn.js';

export type ToastKind = 'success' | 'error' | 'info';

export interface ToastOptions {
    description?: string;
    /** `null` keeps it until dismissed. Omitted, Base UI's own default (5000ms) applies. */
    durationMs?: number | null;
    action?: { label: string; onClick: () => void };
}

/**
 * The single manager instance every `toast.*` call and `ToastHost` share.
 *
 * `createToastManager()` (confirmed against the installed 1.7.0's
 * `@base-ui/react/toast` export list) is what makes this task small: it is a
 * manager that lives outside React and can be driven from anywhere, which is
 * the entire reason apps end up building a `window` `CustomEvent` bus of
 * their own -- so a plain module (a fetch wrapper, an error boundary, a
 * websocket handler) could raise a toast without being a React component.
 * No such bus exists here; a module-scope manager plus this file's
 * `toast` export does the same job with no window-global wiring, and
 * `playground/tests/toast.spec.ts` proves a toast raised from a plain
 * module-scope function (not a component) still reaches the screen.
 *
 * Pulled off the `BaseToast` namespace rather than imported by name --
 * the installed 1.7.0's `@base-ui/react/toast` barrel re-exports everything
 * except the `Toast` namespace itself (`index.parts.js`) as type-only
 * (`export type * from "./createToastManager.js"`), so `import {
 * createToastManager } from '@base-ui/react/toast'` type-errors under
 * `verbatimModuleSyntax` even though the runtime function exists. The `Toast`
 * namespace re-exports it as a real value (`index.parts.js`), which is what
 * this reaches through.
 */
const toastManager = BaseToast.createToastManager();

const KIND_LABEL: Record<ToastKind, string> = {
    success: 'Success',
    error: 'Error',
    info: 'Info',
};

/**
 * `type` drives the left-edge colour (`data-type` -- Base UI's own
 * `getStateAttributesProps` turns any truthy string state value into
 * `data-<key>="<value>"` with no custom mapping needed, confirmed against
 * the installed 1.7.0 source). `priority: 'high'` on `error` makes Base UI
 * render that toast as `role="alertdialog"` and announce it urgently
 * (`aria-live` assertive-equivalent) instead of the `role="dialog"` /
 * polite announcement every other kind gets -- see `ToastRoot.js`.
 */
function raise(kind: ToastKind, title: string, options?: ToastOptions): void {
    toastManager.add({
        title,
        description: options?.description,
        type: kind,
        priority: kind === 'error' ? 'high' : 'low',
        timeout: options?.durationMs === null ? 0 : options?.durationMs,
        actionProps: options?.action
            ? { children: options.action.label, onClick: options.action.onClick }
            : undefined,
    });
}

/** Fire a toast from anywhere -- React or a plain module. */
export const toast = {
    success: (title: string, options?: ToastOptions) => raise('success', title, options),
    error: (title: string, options?: ToastOptions) => raise('error', title, options),
    info: (title: string, options?: ToastOptions) => raise('info', title, options),
};

const EDGE_CLASSES: Record<ToastKind, string> = {
    success: 'bg-ok',
    error: 'bg-fail',
    info: 'bg-info',
};

function CloseIcon() {
    return (
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
            <path
                d="M1.5 1.5L9.5 9.5M9.5 1.5L1.5 9.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
            />
        </svg>
    );
}

/**
 * Reads the live toast list from `useToastManager()`, which only resolves
 * inside `Toast.Provider` -- split out from `ToastHost` so that constraint
 * doesn't leak to callers.
 *
 * Kind is never colour-only: the coloured left edge is a plain
 * `aria-hidden` `<span>`, not a `::before` pseudo-element -- Tailwind never
 * sets a pseudo-element's `content` unless a `before:content-[...]` utility
 * is also present, so a bare `before:bg-*` renders no box at all. The edge
 * is paired with a visually hidden `"Success:"` / `"Error:"` / `"Info:"`
 * prefix, kept as a plain sibling `<span>` rather than folded into
 * `Toast.Title`'s own children -- it still reads to assistive tech as part
 * of this newly-inserted subtree when `Toast.Viewport`'s `aria-live` region
 * announces it, without corrupting `Toast.Title`'s own text (which callers
 * and `playground/tests/toast.spec.ts` both reasonably expect to be exactly
 * the given `title`, e.g. for exact-text and accessible-name assertions).
 *
 * `Toast.Action` is rendered with no props spread from `item.actionProps`:
 * the installed 1.7.0's `ToastAction.js` already merges `toast.actionProps`
 * (children AND handlers) onto the button from context on its own
 * (`props: [elementProps, toast.actionProps, ...]`). Spreading the same
 * `onClick` here too double-fired the caller's callback on a single click --
 * caught by `playground/tests/toast.spec.ts`'s action-count assertion. The
 * `onClick` given here instead closes the toast: `mergeProps` (confirmed in
 * the installed 1.7.0's source) runs same-event handlers right-to-left, so
 * `toast.actionProps.onClick` (the caller's, merged in after `elementProps`)
 * always fires first, and this one always fires after -- the caller's
 * action runs, then its toast goes away, matching what the component this
 * replaced did.
 *
 * `Root` deliberately keeps the default outline instead of `outline-none` --
 * it renders `tabIndex={0}` (confirmed in the installed 1.7.0's
 * `ToastRoot.js`) and Base UI's own focus management moves real keyboard
 * focus onto the next toast's root after one is dismissed
 * (`store.js`'s `handleFocusManagement`), so it needs the same visible
 * indicator any other focusable element gets. `overflow-hidden` on this
 * element (for the edge bar) does not clip that outline -- outline paints
 * outside the border box regardless of the element's own overflow.
 */
interface ToastListProps extends React.HTMLAttributes<HTMLDivElement> {}

const ToastList = forwardRef<HTMLDivElement, ToastListProps>(function ToastList({ className, ...rest }, ref) {
    const { toasts, close } = BaseToast.useToastManager();

    // `toasts` (confirmed empirically, and against `store.js`'s
    // `addToast`/`setToasts`) is newest-first, not append-order -- so
    // `flex-col-reverse` here renders the array's first (newest) entry
    // nearest the viewport's bottom-right corner, oldest pushed upward,
    // which is the stacking order every toast system uses. This does not
    // change *tab* order, which still follows DOM/array order regardless of
    // `flex-direction`: reaching the newest toast is still the first Tab
    // stop from outside the viewport.
    return (
        <BaseToast.Viewport
            ref={ref}
            {...rest}
            className={cn(
                'fixed bottom-4 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col-reverse gap-2',
                className,
            )}
        >
            {toasts.map((item) => {
                const kind = (item.type as ToastKind | undefined) ?? 'info';

                return (
                    <BaseToast.Root
                        key={item.id}
                        toast={item}
                        className="ui-toast relative flex items-stretch overflow-hidden rounded-card border border-hair bg-panel shadow-overlay"
                    >
                        <span aria-hidden="true" className={cn('w-1 shrink-0', EDGE_CLASSES[kind])} />
                        <BaseToast.Content className="flex flex-1 items-start gap-2 py-2.5 pl-2.5 pr-2.5">
                            <div className="min-w-0 flex-1">
                                <span className="sr-only">{KIND_LABEL[kind]}: </span>
                                <BaseToast.Title className="text-[13px] font-medium text-body" />
                                <BaseToast.Description className="text-[12px] text-muted" />
                            </div>
                            {item.actionProps && (
                                <BaseToast.Action
                                    onClick={() => close(item.id)}
                                    className="shrink-0 rounded-control px-2 py-1 text-[12px] font-medium text-accent-text hover:bg-panel-2"
                                />
                            )}
                            <BaseToast.Close
                                aria-label="Dismiss"
                                className="shrink-0 rounded-control p-1 text-faint hover:bg-panel-2 hover:text-body"
                            >
                                <CloseIcon />
                            </BaseToast.Close>
                        </BaseToast.Content>
                    </BaseToast.Root>
                );
            })}
        </BaseToast.Viewport>
    );
});

export interface ToastHostProps extends React.HTMLAttributes<HTMLDivElement> {
    limit?: number;
    /**
     * Default auto-dismiss duration (ms) for a toast that doesn't pass its
     * own `durationMs`. Forwarded to `Toast.Provider`'s `timeout`, whose own
     * default is 5000ms (confirmed in the installed 1.7.0's
     * `ToastProvider.js`). Exposed here mainly so it's testable: a fixed,
     * short default is what lets `playground/tests/toast.spec.ts` tell "no
     * timer was scheduled" (`durationMs: null`) apart from "the timer just
     * hasn't fired yet" without waiting out the real 5s default on every run.
     */
    defaultDurationMs?: number;
}

/**
 * Mount once at the app root. Owns the module-scope `toastManager`, so any
 * `toast.*` call anywhere in the app reaches this one host.
 *
 * `className`/rest land on `Toast.Viewport`, via `ToastList` -- unlike the
 * rest of this file, `Toast.Viewport` is NOT conditionally rendered: it is
 * mounted unconditionally regardless of whether any toast is currently
 * showing (confirmed against the installed 1.7.0's
 * `toast/viewport/ToastViewport.mjs`), so it is a real, always-present
 * primary surface -- the same shape every other component in the package
 * follows -- and the one an app reaches for first to reposition the stack
 * (e.g. top-center instead of the bottom-right default).
 */
export const ToastHost = forwardRef<HTMLDivElement, ToastHostProps>(function ToastHost(
    { limit = 3, defaultDurationMs, className, ...rest },
    ref,
) {
    return (
        <BaseToast.Provider toastManager={toastManager} limit={limit} timeout={defaultDurationMs}>
            <BaseToast.Portal>
                <ToastList ref={ref} {...rest} className={className} />
            </BaseToast.Portal>
        </BaseToast.Provider>
    );
});
