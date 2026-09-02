import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type React from 'react';
import { forwardRef, useId } from 'react';
import { cn } from '../lib/cn.js';

export interface TooltipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'id' | 'children'> {
    /** The tooltip text. Becomes the trigger's accessible description. */
    label: string;
    /** Delay before showing, in ms. Default 400. */
    delay?: number;
    side?: 'top' | 'right' | 'bottom' | 'left';
    /** The element the tooltip describes. Becomes the trigger itself. */
    children: React.ReactElement;
}

/**
 * The hover/focus hint every icon button, truncated label, and disabled
 * control's "why" in the system composes, built on Base UI's `Tooltip`
 * rather than hand-rolled.
 *
 * `children` is passed as `Tooltip.Trigger`'s `render` prop, not as its
 * `children` -- `render` composes the generated props (event handlers,
 * `aria-describedby`, the id Base UI tracks) onto the caller's own element,
 * where `Menu.Trigger` wraps its children in a real `<button>`. Passing
 * `children` here the way `Menu` takes `trigger` would nest the
 * caller's own interactive element inside a second `<button>` Base UI
 * renders, which is invalid HTML for anything but a plain `<button>` child
 * and defeats the point of `render` entirely.
 *
 * Base UI's `Tooltip.Trigger`/`Tooltip.Popup` do not wire up
 * `aria-describedby` or `role="tooltip"` on their own (measured against the
 * installed 1.7.0: neither part references the other's id anywhere in
 * source). That association is written here explicitly with a single
 * `useId()`-generated id shared between the two, so assistive tech actually
 * announces the label as the trigger's accessible description while the
 * tooltip is open.
 *
 * `Tooltip.Provider` is mounted inside this component, once per `Tooltip`,
 * rather than once around the app -- it keeps the consumer API simple (no
 * app-root wrapper required) at the cost of the delay-group behaviour the
 * Provider exists for: hovering from one tooltip straight to an adjacent one
 * would normally skip the reopen delay, and that grouping only works across
 * tooltips sharing one Provider. Every `Tooltip` here gets its own, so that
 * skip never happens. If adjacent-tooltip grouping is ever wanted, this is
 * the thing to change -- lifting a single `Tooltip.Provider` to wrap a
 * region or the app, rather than mounting one per `Tooltip`.
 *
 * `className`/rest land on `Tooltip.Popup`, the tooltip's primary visual
 * surface -- not the positioner or portal. Native `id` is excluded from the
 * spreadable rest: the popup's id is the `useId()` value this component
 * generates itself to wire `aria-describedby`, and letting a caller override
 * it would break that association.
 */
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
    { label, delay = 400, side = 'top', children, className, ...rest },
    ref,
) {
    const descriptionId = useId();

    return (
        <BaseTooltip.Provider delay={delay}>
            <BaseTooltip.Root>
                <BaseTooltip.Trigger render={children} aria-describedby={descriptionId} />
                <BaseTooltip.Portal>
                    <BaseTooltip.Positioner className="outline-none" side={side} sideOffset={6}>
                        <BaseTooltip.Popup
                            ref={ref}
                            {...rest}
                            id={descriptionId}
                            role="tooltip"
                            className={cn(
                                'ui-floating rounded-control border border-hair bg-panel px-2 py-1 text-[11.5px] text-body shadow-overlay',
                                className,
                            )}
                        >
                            {label}
                        </BaseTooltip.Popup>
                    </BaseTooltip.Positioner>
                </BaseTooltip.Portal>
            </BaseTooltip.Root>
        </BaseTooltip.Provider>
    );
});
