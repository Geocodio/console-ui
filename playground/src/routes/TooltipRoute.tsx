import { Tooltip } from '@geocodio/console-ui';

function PlusIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
                d="M7 2.5v9M2.5 7h9"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
            />
        </svg>
    );
}

export function TooltipRoute() {
    return (
        <div className="text-body">
            <h1 className="mb-4 text-[21px] font-semibold">Tooltip</h1>

            <p className="mb-6 max-w-prose text-[12.5px] text-muted">
                Wraps a plain button, an icon-only button, and a non-button element -- the
                span is not natively focusable, so it carries its own <code>tabIndex</code>{' '}
                the same way a real non-button trigger would need to.
            </p>

            <div className="flex items-center gap-6">
                <Tooltip label="Create a new source">
                    <button
                        type="button"
                        data-testid="tooltip-button"
                        className="rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
                    >
                        New source
                    </button>
                </Tooltip>

                <Tooltip label="Add item" side="right">
                    <button
                        type="button"
                        data-testid="tooltip-icon-button"
                        aria-label="Add item"
                        className="flex h-7 w-7 items-center justify-center rounded-control border border-hair-strong bg-panel"
                    >
                        <PlusIcon />
                    </button>
                </Tooltip>

                <Tooltip label="Draft -- not yet published" side="bottom">
                    <span
                        data-testid="tooltip-span"
                        // biome-ignore lint/a11y/noNoninteractiveTabindex: a non-button trigger still needs to reach focus for its tooltip, the case this route exists to cover
                        tabIndex={0}
                        className="rounded-pill border border-hair px-2 py-0.5 text-[11px] font-medium"
                    >
                        Draft
                    </span>
                </Tooltip>
            </div>
        </div>
    );
}
