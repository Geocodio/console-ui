import { Drawer } from '@base-ui/react/drawer';
import type React from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/cn.js';

export interface SheetProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Accessible name. Rendered as a visible heading unless hideTitle. */
    title: string;
    hideTitle?: boolean;
    /** Which edge it enters from. 'bottom' is the mobile pattern. */
    side?: 'right' | 'bottom';
    /** Tailwind width utility, used only when side='right'. Default 'w-[480px]'. */
    width?: string;
    children: React.ReactNode;
}

const VIEWPORT_CLASSES: Record<NonNullable<SheetProps['side']>, string> = {
    right: 'fixed inset-0 flex justify-end',
    bottom: 'fixed inset-0 flex items-end justify-center',
};

const POPUP_CLASSES: Record<NonNullable<SheetProps['side']>, string> = {
    right: 'ui-sheet-right h-full border-l',
    bottom: 'ui-sheet-bottom w-full max-h-[80%] border-t',
};

/**
 * The edge-anchored panel every slide-in/slide-up surface in the system
 * composes -- a right-side 480px slideover and a mobile bottom sheet are
 * both this component with a different `side`.
 *
 * Built on Base UI's Drawer, which is Dialog plus swipe-to-dismiss and touch
 * scroll locking. `Drawer.Viewport` is required around `Drawer.Popup` --
 * Base UI logs a dev warning and disables swipe/scroll-lock without it, so
 * it is not optional scaffolding here. `Drawer.Provider`/`Indent`/
 * `IndentBackground` exist for nested-drawer stacking, which this component
 * does not use, so they are omitted.
 *
 * `swipeDirection` is derived from `side` so touch swipe-to-dismiss tracks
 * the edge the sheet actually entered from. The visual position and slide
 * transition are plain CSS in overlays.css (`.ui-sheet-right` /
 * `.ui-sheet-bottom`), keyed on the same `data-starting-style` /
 * `data-ending-style` attributes the rest of the overlay family uses --
 * Base UI has no `side` prop, positioning is entirely ours to write.
 *
 * The bottom variant's grab handle is a plain element, not a Base UI part --
 * the library's `Handle` export is `DrawerHandle`, the imperative
 * trigger-association class, not a visual affordance.
 *
 * `className`/rest land on `Drawer.Popup`, the sheet's primary visual
 * surface -- not the viewport or backdrop. Native `title` is omitted from
 * the spreadable rest for the same reason as `Dialog`: it already names this
 * component's accessible-name string.
 */
export const Sheet = forwardRef<HTMLDivElement, SheetProps>(function Sheet(
    {
        open,
        onOpenChange,
        title,
        hideTitle = false,
        side = 'right',
        width = 'w-[480px]',
        children,
        className,
        ...rest
    },
    ref,
) {
    return (
        <Drawer.Root open={open} onOpenChange={onOpenChange} swipeDirection={side === 'bottom' ? 'down' : 'right'}>
            <Drawer.Portal>
                <Drawer.Backdrop className="ui-backdrop fixed inset-0 bg-black/30" />
                <Drawer.Viewport className={VIEWPORT_CLASSES[side]}>
                    <Drawer.Popup
                        ref={ref}
                        {...rest}
                        className={cn(
                            POPUP_CLASSES[side],
                            side === 'right' && width,
                            side === 'right' && 'pb-4',
                            'flex flex-col border-hair bg-panel pt-4 px-4 shadow-overlay',
                            className,
                        )}
                    >
                        {side === 'bottom' && (
                            <div className="mb-2 flex justify-center" aria-hidden="true">
                                <div className="h-1 w-9 rounded-full bg-hair-strong" />
                            </div>
                        )}
                        <Drawer.Title className={hideTitle ? 'sr-only' : 'mb-2 text-[14px] font-semibold text-body'}>
                            {title}
                        </Drawer.Title>
                        {children}
                    </Drawer.Popup>
                </Drawer.Viewport>
            </Drawer.Portal>
        </Drawer.Root>
    );
});
