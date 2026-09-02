import { Menu, type MenuItemSpec } from '@geocodio/console-ui';
import { type ReactNode, useState } from 'react';

function TriggerButton({ children, testId }: { children: ReactNode; testId: string }) {
    // Content only -- `Menu`'s own `Menu.Trigger` is the real `<button>` this
    // renders inside of. A second `<button>` here would nest interactive
    // elements, which is invalid HTML and breaks focus return on close.
    return (
        <span
            data-testid={testId}
            className="rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
        >
            {children}
        </span>
    );
}

export function MenuRoute() {
    const [result, setResult] = useState('none');
    const [pinned, setPinned] = useState(false);
    const [notifications, setNotifications] = useState(true);

    const items: MenuItemSpec[] = [
        {
            key: 'edit',
            label: 'Edit',
            testId: 'item-edit',
            onSelect: () => setResult('edit'),
        },
        {
            key: 'duplicate',
            label: 'Duplicate',
            testId: 'item-duplicate',
            onSelect: () => setResult('duplicate'),
        },
        {
            key: 'pin',
            label: 'Pin to top',
            dividerAbove: true,
            keepOpen: true,
            checked: pinned,
            testId: 'item-keep-open-checkable',
            onSelect: () => {
                setPinned((value) => !value);
                setResult('pin');
            },
        },
        {
            key: 'notifications',
            label: 'Notify on change',
            checked: notifications,
            testId: 'item-close-checkable',
            onSelect: () => {
                setNotifications((value) => !value);
                setResult('notifications');
            },
        },
        {
            key: 'keep-open-plain',
            label: 'Keep open (plain)',
            keepOpen: true,
            testId: 'item-keep-open-plain',
            onSelect: () => setResult('keep-open-plain'),
        },
        {
            key: 'move',
            label: 'Move to',
            testId: 'item-submenu',
            submenu: [
                {
                    key: 'folder-a',
                    label: 'Folder A',
                    testId: 'item-folder-a',
                    onSelect: () => setResult('folder-a'),
                },
                {
                    key: 'folder-b',
                    label: 'Folder B',
                    testId: 'item-folder-b',
                    onSelect: () => setResult('folder-b'),
                },
            ],
        },
        {
            key: 'disabled',
            label: 'Unavailable action',
            disabled: true,
            testId: 'item-disabled',
        },
        {
            key: 'delete',
            label: 'Delete',
            danger: true,
            dividerAbove: true,
            testId: 'item-delete',
            onSelect: () => setResult('delete'),
        },
    ];

    return (
        <div className="text-body">
            <h1 className="mb-4 text-[21px] font-semibold">Menu</h1>

            <p className="mb-4 text-[12.5px] text-muted">
                Last selection: <span data-testid="menu-result">{result}</span>
            </p>

            <div className="flex items-start gap-4">
                <Menu trigger={<TriggerButton testId="open-menu">Actions</TriggerButton>} items={items} />
            </div>

            <div className="mt-24 flex justify-end pr-4">
                <Menu
                    trigger={<TriggerButton testId="open-edge-menu">Edge menu</TriggerButton>}
                    items={items}
                    align="end"
                />
            </div>

            <h2 className="mb-2 mt-8 text-[14px] font-semibold">Custom trigger styling</h2>
            <p className="mb-2 max-w-prose text-[12.5px] text-muted">
                <code>className</code> puts the visual affordance on the real trigger button
                itself -- a pill filter control and a 26px square icon button, two common
                non-uniform trigger shapes.
            </p>
            <div className="flex items-start gap-4">
                <Menu
                    trigger={<span data-testid="open-pill-menu">All sources</span>}
                    className="rounded-pill border border-hair px-2 py-0.5 text-[11px] font-medium"
                    items={items}
                />
                <Menu
                    trigger={<span data-testid="open-square-menu">⋯</span>}
                    className="flex h-[26px] w-[26px] items-center justify-center rounded-control text-[14px] hover:bg-panel-2"
                    items={items}
                />
            </div>

            <section className="mt-24">
                <h2 className="mb-2 text-[14px] font-semibold">Overflow-hidden ancestor</h2>
                <p className="mb-4 max-w-prose text-[12.5px] text-muted">
                    The trigger below sits inside a short, clipping container. The menu popup is
                    portalled, so it must render fully visible outside that container instead of
                    being clipped to its bounds.
                </p>
                <div className="h-12 w-56 overflow-hidden rounded-card border border-hair bg-panel p-2">
                    <Menu
                        trigger={<TriggerButton testId="open-clipped-menu">Clipped</TriggerButton>}
                        items={items}
                    />
                </div>
            </section>
        </div>
    );
}
