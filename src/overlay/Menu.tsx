import { Menu as BaseMenu } from '@base-ui/react/menu';
import type React from 'react';
import { Fragment, forwardRef } from 'react';
import { cn } from '../lib/cn.js';

export interface MenuItemSpec {
    key: string;
    label: string;
    icon?: React.ReactNode;
    /** Render a hairline separator above this item. */
    dividerAbove?: boolean;
    danger?: boolean;
    /** Renders a checkable item showing a tick when true. */
    checked?: boolean;
    /** Keep the menu open after selecting. */
    keepOpen?: boolean;
    disabled?: boolean;
    testId?: string;
    submenu?: MenuItemSpec[];
    onSelect?: () => void;
}

export interface MenuProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
    /**
     * The trigger button's CONTENT -- an icon, a label, or both. Not another
     * interactive element: Menu.Trigger is itself the real <button>, and
     * nesting a second one inside is invalid HTML and defeats focus return.
     */
    trigger: React.ReactNode;
    /** Classes for the popup panel -- the menu's second surface. */
    popupClassName?: string;
    items: MenuItemSpec[];
    header?: string;
    align?: 'start' | 'end';
}

const DEFAULT_TRIGGER_CLASSES = 'inline-flex items-center';

const ITEM_CLASSES =
    'flex h-8 cursor-default select-none items-center gap-2 rounded-control px-2.5 text-[12.5px] text-body outline-none data-[highlighted]:bg-panel-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-40';

const DANGER_ITEM_CLASSES = 'text-fail data-[highlighted]:bg-panel-2';

function ChevronRightIcon() {
    return (
        <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
            className="ml-auto shrink-0 text-muted"
        >
            <path
                d="M4.5 2.5L8 6L4.5 9.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="shrink-0">
            <path
                d="M2.5 6.25L4.75 8.5L9.5 3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function itemClassName(item: MenuItemSpec): string {
    return cn(ITEM_CLASSES, item.danger && DANGER_ITEM_CLASSES);
}

function MenuItems({ items }: { items: MenuItemSpec[] }) {
    return (
        <>
            {items.map((item) => {
                const node = item.submenu ? (
                    <BaseMenu.SubmenuRoot key={item.key}>
                        <BaseMenu.SubmenuTrigger
                            className={itemClassName(item)}
                            disabled={item.disabled}
                            data-testid={item.testId}
                        >
                            {item.icon}
                            <span className="truncate">{item.label}</span>
                            <ChevronRightIcon />
                        </BaseMenu.SubmenuTrigger>
                        <BaseMenu.Portal>
                            <BaseMenu.Positioner
                                className="outline-none"
                                side="right"
                                align="start"
                                sideOffset={2}
                            >
                                <BaseMenu.Popup className="ui-floating min-w-[180px] rounded-card border border-hair bg-panel p-1 shadow-overlay">
                                    <MenuItems items={item.submenu} />
                                </BaseMenu.Popup>
                            </BaseMenu.Positioner>
                        </BaseMenu.Portal>
                    </BaseMenu.SubmenuRoot>
                ) : item.checked !== undefined ? (
                    <BaseMenu.CheckboxItem
                        key={item.key}
                        checked={item.checked}
                        closeOnClick={!item.keepOpen}
                        disabled={item.disabled}
                        onClick={item.onSelect}
                        className={itemClassName(item)}
                        data-testid={item.testId}
                    >
                        <BaseMenu.CheckboxItemIndicator className="shrink-0" keepMounted>
                            <CheckIcon />
                        </BaseMenu.CheckboxItemIndicator>
                        {item.icon}
                        <span className="truncate">{item.label}</span>
                    </BaseMenu.CheckboxItem>
                ) : (
                    <BaseMenu.Item
                        key={item.key}
                        closeOnClick={!item.keepOpen}
                        disabled={item.disabled}
                        onClick={item.onSelect}
                        className={itemClassName(item)}
                        data-testid={item.testId}
                    >
                        {item.icon}
                        <span className="truncate">{item.label}</span>
                    </BaseMenu.Item>
                );

                return item.dividerAbove ? (
                    <Fragment key={item.key}>
                        <BaseMenu.Separator className="my-1 h-px bg-hair" />
                        {node}
                    </Fragment>
                ) : (
                    node
                );
            })}
        </>
    );
}

/**
 * The data-driven dropdown every overflow / actions menu in the system
 * composes. `MenuItemSpec[]` is a proven data shape for this; what a
 * hand-rolled menu usually lacks is supplied by Base UI: real
 * `role="menu"`/`menuitem` semantics (instead of plain buttons in divs),
 * full keyboard navigation into and out of submenus, portalling (so an
 * `overflow` ancestor can no longer clip the popup), and two-axis collision
 * avoidance for both the root menu and submenus, not just a horizontal flip
 * of the submenu.
 *
 * `Menu.Item`'s `closeOnClick` defaults to `true` while `Menu.CheckboxItem`'s
 * defaults to `false` -- relying on those defaults would make `keepOpen`
 * behave differently for a checkable item than a plain one. Both item kinds
 * here pass `closeOnClick={!item.keepOpen}` explicitly so `keepOpen` means
 * the same thing regardless of `checked`.
 *
 * `modal` is left at Base UI's default (`true`): it locks background scroll
 * and disables outside pointer interaction while the menu is open, which is
 * the behaviour every consuming dropdown wants.
 *
 * `trigger` is rendered as children of `Menu.Trigger`, which is itself the
 * real `<button>` -- it carries the click handling, `aria-haspopup`,
 * `aria-expanded`, and the id `finalFocus` returns to on close. `trigger`
 * should therefore be the button's content (an icon, a label, both), not
 * another interactive element: nesting a second `<button>` inside it is
 * invalid HTML and defeats focus return, since the inner element is not the
 * one Base UI is tracking.
 *
 * `className`/rest land on `Menu.Trigger`, that same real button -- the
 * menu's primary, always-present surface -- so callers whose triggers are
 * not uniform (a pill-shaped filter control, a 26px square icon button on a
 * row) can put the visual affordance (border, radius, hover fill) on the
 * element that actually receives focus and hover, instead of on an inner
 * `<span>` wrapped around inert content. It is merged onto
 * `DEFAULT_TRIGGER_CLASSES` with `cn`, like every other component in the
 * package, rather than replacing it outright. `DEFAULT_TRIGGER_CLASSES`
 * omits `outline-none` deliberately: the package's global `:focus-visible`
 * ring (`styles/base.css`) lives in Tailwind's `base` layer, which loses to
 * any `outline-none` utility in the `utilities` layer regardless of source
 * order, so including it there would leave the trigger with no visible focus
 * state by default.
 *
 * `popupClassName` styles the popup, the menu's one other meaningful
 * surface.
 */
export const Menu = forwardRef<HTMLButtonElement, MenuProps>(function Menu(
    { trigger, className, popupClassName, items, header, align = 'start', ...rest },
    ref,
) {
    return (
        <BaseMenu.Root>
            <BaseMenu.Trigger ref={ref} {...rest} className={cn(DEFAULT_TRIGGER_CLASSES, className)}>
                {trigger}
            </BaseMenu.Trigger>
            <BaseMenu.Portal>
                <BaseMenu.Positioner className="outline-none" align={align} sideOffset={4}>
                    <BaseMenu.Popup
                        className={cn(
                            'ui-floating min-w-[180px] rounded-card border border-hair bg-panel p-1 shadow-overlay',
                            popupClassName,
                        )}
                    >
                        {header && (
                            <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                                {header}
                            </div>
                        )}
                        <MenuItems items={items} />
                    </BaseMenu.Popup>
                </BaseMenu.Positioner>
            </BaseMenu.Portal>
        </BaseMenu.Root>
    );
});
