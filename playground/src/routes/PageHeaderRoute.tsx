import { Button, PageHeader } from '@geocodio/console-ui';
import { useState } from 'react';

const LONG_CRUMB = 'a-very-long-repository-slug-that-goes-on-and-on-past-the-edge-of-any-phone-screen-and-then-some-more';

export function PageHeaderRoute() {
    const [selected, setSelected] = useState('');
    const [period, setPeriod] = useState('7d');

    return (
        <div className="text-body">
            <h1 className="mb-4 text-[21px] font-semibold">PageHeader</h1>
            <p className="mb-4 text-[13px] text-muted">
                Last action: <span data-testid="selected">{selected || 'none'}</span>
            </p>

            <div data-testid="header-frame" className="overflow-hidden rounded-card border border-hair">
                <PageHeader
                    data-testid="header"
                    crumbs={['Repositories', LONG_CRUMB]}
                    actions={
                        <Button variant="primary" data-testid="primary" onClick={() => setSelected('primary')}>
                            Add repository
                        </Button>
                    }
                    overflow={[
                        { key: 'refresh', label: 'Refresh marketplaces', onSelect: () => setSelected('refresh'), testId: 'refresh' },
                        { key: 'history', label: 'History', onSelect: () => setSelected('history'), testId: 'history' },
                        { key: 'delete', label: 'Delete', danger: true, dividerAbove: true, onSelect: () => setSelected('delete'), testId: 'delete' },
                    ]}
                >
                    <div className="flex gap-0.5 rounded-control bg-panel-2 p-0.5" data-testid="period">
                        {['7d', '30d', '90d'].map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setPeriod(option)}
                                aria-pressed={period === option}
                                className={period === option ? 'h-6 rounded-chip bg-panel px-2 text-[12px] text-body shadow-card' : 'h-6 rounded-chip px-2 text-[12px] text-muted'}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </PageHeader>
            </div>
        </div>
    );
}
