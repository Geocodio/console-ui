import { toast } from '@geocodio/console-ui';
import { useState } from 'react';

/**
 * Raises a toast from a plain module-scope function, not a component or a
 * hook -- this is the capability `createToastManager` exists for, and the
 * reason the package needs no `window` `CustomEvent` bus of its own. Called
 * directly from a button's
 * `onClick` below, with no React state or context involved.
 */
function raiseFromOutsideReact(): void {
    toast.info('Raised from outside React', {
        description: 'Called from a module-scope function, not a component.',
        durationMs: null,
    });
}

export function ToastRoute() {
    const [actionCount, setActionCount] = useState(0);

    return (
        <div className="text-body">
            <h1 className="mb-4 text-[21px] font-semibold">Toast</h1>

            <p className="mb-6 max-w-prose text-[12.5px] text-muted">
                <code>ToastHost</code> is mounted once, in <code>App.tsx</code>, alongside every
                other route, with <code>defaultDurationMs=300</code> so the "Default duration"
                button below is fast to test against -- these buttons otherwise only call the
                exported <code>toast.*</code> functions, most passing <code>durationMs: null</code>{' '}
                themselves so they don't race that short default.
            </p>

            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    data-testid="toast-success"
                    className="rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
                    onClick={() => toast.success('Source saved', { durationMs: null })}
                >
                    Success
                </button>
                <button
                    type="button"
                    data-testid="toast-error"
                    className="rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
                    onClick={() => toast.error('Build failed', { durationMs: null })}
                >
                    Error
                </button>
                <button
                    type="button"
                    data-testid="toast-info"
                    className="rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
                    onClick={() => toast.info('A new version is available', { durationMs: null })}
                >
                    Info
                </button>
                <button
                    type="button"
                    data-testid="toast-with-description"
                    className="rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
                    onClick={() =>
                        toast.success('Source saved', {
                            description: 'Wake County parcels was updated just now.',
                            durationMs: null,
                        })
                    }
                >
                    With description
                </button>
                <button
                    type="button"
                    data-testid="toast-with-action"
                    className="rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
                    onClick={() =>
                        toast.info('Source archived', {
                            action: { label: 'Undo', onClick: () => setActionCount((count) => count + 1) },
                            durationMs: null,
                        })
                    }
                >
                    With action
                </button>
                <button
                    type="button"
                    data-testid="toast-quick"
                    className="rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
                    onClick={() => toast.success('Quick toast', { durationMs: 300 })}
                >
                    Quick (300ms)
                </button>
                <button
                    type="button"
                    data-testid="toast-default-duration"
                    className="rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
                    onClick={() => toast.info('Uses the provider default')}
                >
                    Default duration
                </button>
                <button
                    type="button"
                    data-testid="toast-persistent"
                    className="rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
                    onClick={() => toast.error('Stays until dismissed', { durationMs: null })}
                >
                    Never auto-dismisses
                </button>
                <button
                    type="button"
                    data-testid="toast-burst"
                    className="rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
                    onClick={() => {
                        for (let index = 1; index <= 5; index += 1) {
                            toast.info(`Toast ${index}`, { durationMs: null });
                        }
                    }}
                >
                    Raise 5 quickly
                </button>
                <button
                    type="button"
                    data-testid="toast-limit-burst"
                    className="rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
                    onClick={() => {
                        for (let index = 1; index <= 6; index += 1) {
                            toast.info(`Limit toast ${index}`, { durationMs: null });
                        }
                    }}
                >
                    Raise 6 (limit is 5)
                </button>
                <button
                    type="button"
                    data-testid="toast-outside"
                    className="rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
                    onClick={raiseFromOutsideReact}
                >
                    Raise from outside React
                </button>
            </div>

            <p className="mt-6 text-[12.5px] text-muted">
                Action callback fired: <span data-testid="action-result">{actionCount}</span> time
                {actionCount === 1 ? '' : 's'}
            </p>
        </div>
    );
}
