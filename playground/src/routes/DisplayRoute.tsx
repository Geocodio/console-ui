import {
    Badge,
    type BadgeTone,
    EmptyState,
    Kbd,
    Skeleton,
    Spinner,
    StatusPill,
    type StatusPillTone,
} from '@geocodio/console-ui';
import { useState } from 'react';

const BADGE_TONES: BadgeTone[] = ['neutral', 'ok', 'warn', 'fail', 'info', 'accent'];
const PILL_TONES: StatusPillTone[] = ['ok', 'warn', 'fail', 'info', 'idle', 'accent'];

function MarkIcon() {
    return <span data-testid="empty-state-icon">📭</span>;
}

export function DisplayRoute() {
    const [actionCount, setActionCount] = useState(0);

    return (
        <div className="max-w-xl text-body">
            <h1 className="mb-4 text-[21px] font-semibold">Display</h1>

            <div className="flex flex-col gap-8">
                <section className="flex flex-col gap-2">
                    <h2 className="text-[14px] font-semibold">Spinner</h2>
                    <div className="flex items-center gap-4">
                        <Spinner size="sm" data-testid="spinner-sm-unlabeled" />
                        <Spinner size="md" data-testid="spinner-md-unlabeled" />
                        <Spinner size="sm" label="Loading sources" data-testid="spinner-labeled" />
                    </div>
                </section>

                <section className="flex flex-col gap-2">
                    <h2 className="text-[14px] font-semibold">Kbd</h2>
                    <div className="flex items-center gap-3">
                        <Kbd keys={['K']} data-testid="kbd-single" />
                        <Kbd keys={['⌘', 'K']} data-testid="kbd-combo" />
                        <Kbd keys={['⌃', '↑']} data-testid="kbd-arrows" />
                    </div>
                </section>

                <section className="flex flex-col gap-2">
                    <h2 className="text-[14px] font-semibold">Skeleton</h2>
                    <Skeleton className="h-4 w-32" data-testid="skeleton" />
                </section>

                <section className="flex flex-col gap-2">
                    <h2 className="text-[14px] font-semibold">EmptyState</h2>
                    <div data-testid="empty-state" className="rounded-card border border-hair">
                        <EmptyState
                            title="No sources yet"
                            body="Sources you add will show up here once they finish their first build."
                            icon={<MarkIcon />}
                            action={
                                <button
                                    type="button"
                                    data-testid="empty-state-action"
                                    className="rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
                                    onClick={() => setActionCount((count) => count + 1)}
                                >
                                    Add a source
                                </button>
                            }
                        />
                    </div>
                    <p className="text-[12px] text-muted">
                        Action clicks: <span data-testid="empty-state-action-count">{actionCount}</span>
                    </p>
                </section>

                <section className="flex flex-col gap-2">
                    <h2 className="text-[14px] font-semibold">Badge</h2>
                    <div className="flex flex-wrap items-center gap-2">
                        {BADGE_TONES.map((tone) => (
                            <Badge key={tone} tone={tone} data-testid={`badge-${tone}`}>
                                {tone}
                            </Badge>
                        ))}
                    </div>
                </section>

                <section className="flex flex-col gap-2">
                    <h2 className="text-[14px] font-semibold">StatusPill</h2>
                    <div className="flex flex-wrap items-center gap-2">
                        {PILL_TONES.map((tone) => (
                            <StatusPill key={tone} tone={tone} label={tone} data-testid={`status-pill-${tone}`} />
                        ))}
                        <StatusPill
                            tone="info"
                            variant="glyph"
                            glyph="●"
                            pulse
                            label="RUNNING"
                            data-testid="status-pill-glyph"
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}
