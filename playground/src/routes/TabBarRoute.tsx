import { TabBar, type TabBarItem } from '@geocodio/console-ui';
import { useState } from 'react';

function Icon({ d }: { d: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={d} />
        </svg>
    );
}

const ICONS = {
    tasks: 'M4 5h16M4 12h16M4 19h10',
    reviews: 'M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z',
    repos: 'm8 7-5 5 5 5M16 7l5 5-5 5',
    more: 'M4 6h16M4 12h16M4 18h16',
    plus: 'M12 5v14M5 12h14',
};

export function TabBarRoute() {
    const [active, setActive] = useState('tasks');
    const [moreOpened, setMoreOpened] = useState(0);
    const [created, setCreated] = useState(0);

    const items: TabBarItem[] = [
        { key: 'tasks', label: 'Tasks', icon: <Icon d={ICONS.tasks} />, href: '#tasks', active: active === 'tasks', badge: 18, testId: 'tab-tasks', onSelect: () => setActive('tasks') },
        { key: 'reviews', label: 'Reviews', icon: <Icon d={ICONS.reviews} />, href: '#reviews', active: active === 'reviews', badge: 0, testId: 'tab-reviews', onSelect: () => setActive('reviews') },
        { key: 'repos', label: 'Repos', icon: <Icon d={ICONS.repos} />, href: '#repos', active: active === 'repos', testId: 'tab-repos', onSelect: () => setActive('repos') },
        { key: 'more', label: 'More', icon: <Icon d={ICONS.more} />, testId: 'tab-more', onSelect: () => setMoreOpened((count) => count + 1) },
    ];

    return (
        <div className="max-w-xl text-body">
            <h1 className="mb-4 text-[21px] font-semibold">TabBar</h1>
            <p className="mb-4 text-[13px] text-muted">
                Active: <span data-testid="active-key">{active}</span> · More opened <span data-testid="more-count">{moreOpened}</span> times · created{' '}
                <span data-testid="created-count">{created}</span>
            </p>

            {/* A phone-width frame so the bar's geometry can be measured on a desktop viewport too. */}
            <div data-testid="phone-frame" className="flex h-[300px] w-[393px] flex-col overflow-hidden rounded-card border border-hair bg-app">
                <div className="flex-1 overflow-auto p-4 text-[13px] text-muted">
                    {Array.from({ length: 12 }, (_, index) => index + 1).map((row) => (
                        <p key={row} className="mb-3">
                            Row {row}: content that scrolls above the bar, never under it.
                        </p>
                    ))}
                </div>
                <TabBar items={items} action={{ label: 'New task', icon: <Icon d={ICONS.plus} />, onSelect: () => setCreated((count) => count + 1), testId: 'tab-action' }} />
            </div>
        </div>
    );
}
