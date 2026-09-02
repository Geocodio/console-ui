import { Button, IconButton } from '@geocodio/console-ui';
import { useState } from 'react';

function PlusIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

/** Mimics a Heroicon: no width/height attributes, no size class. */
function UnsizedIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className={className}>
            <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
                d="M2.5 2.5l7 7M9.5 2.5l-7 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

export function ButtonRoute() {
    const [pending, setPending] = useState(false);
    const [pendingClicks, setPendingClicks] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [clicks, setClicks] = useState<Record<string, number>>({});

    const bumpClicks = (key: string) => {
        setClicks((current) => ({ ...current, [key]: (current[key] ?? 0) + 1 }));
    };

    return (
        <div className="text-body">
            <h1 className="mb-4 text-[21px] font-semibold">Button</h1>

            <h2 className="mb-2 text-[14px] font-semibold">Variants</h2>
            <div className="mb-2 flex gap-2">
                <Button variant="primary" data-testid="variant-primary" onClick={() => bumpClicks('primary')}>
                    Primary
                </Button>
                <Button
                    variant="secondary"
                    data-testid="variant-secondary"
                    onClick={() => bumpClicks('secondary')}
                >
                    Secondary
                </Button>
                <Button variant="tertiary" data-testid="variant-tertiary" onClick={() => bumpClicks('tertiary')}>
                    Tertiary
                </Button>
                <Button
                    variant="destructive"
                    data-testid="variant-destructive"
                    onClick={() => bumpClicks('destructive')}
                >
                    Destructive
                </Button>
            </div>
            <p className="mb-8 text-[12px] text-muted">
                Clicks: <span data-testid="variant-clicks">{JSON.stringify(clicks)}</span>
            </p>

            <h2 className="mb-2 text-[14px] font-semibold">Link</h2>
            <p className="mb-2 text-[12px]" data-testid="link-sentence">
                <span>Loading failed.</span>{' '}
                <Button variant="link" data-testid="variant-link" onClick={() => bumpClicks('link')}>
                    Retry
                </Button>{' '}
                <Button variant="link" className="text-fail" data-testid="link-fail">
                    Delete
                </Button>{' '}
                <Button
                    variant="link"
                    icon={<PlusIcon />}
                    pending={pending}
                    pendingLabel="Saving..."
                    data-testid="link-pending"
                >
                    Save
                </Button>
            </p>
            <p className="mb-2 text-[12px]" data-testid="link-sentence-plain">
                <span>Loading failed.</span> <span>Retry</span> <span>Delete</span> <span>Save</span>
            </p>
            <p className="mb-8 text-[12px]">
                <span className="text-accent-text" data-testid="ref-accent-text">
                    accent-text reference
                </span>{' '}
                <span className="text-fail" data-testid="ref-fail">
                    fail reference
                </span>
            </p>

            <h2 className="mb-2 text-[14px] font-semibold">Icon</h2>
            <div className="mb-8 flex gap-2">
                <Button variant="secondary" icon={<PlusIcon />} data-testid="icon-button">
                    Add source
                </Button>
                <Button variant="secondary" icon={<UnsizedIcon />} data-testid="icon-button-unsized">
                    Heroicon-style
                </Button>
                <Button variant="secondary" icon={<UnsizedIcon className="size-4" />} data-testid="icon-button-sized">
                    Caller-sized
                </Button>
            </div>

            <h2 className="mb-2 text-[14px] font-semibold">Pending</h2>
            <div className="mb-8 flex items-center gap-2">
                <Button
                    variant="primary"
                    icon={<PlusIcon />}
                    pending={pending}
                    pendingLabel="Saving..."
                    data-testid="pending-button"
                    onClick={() => setPendingClicks((n) => n + 1)}
                >
                    Save
                </Button>
                <button
                    type="button"
                    data-testid="toggle-pending"
                    onClick={() => setPending((current) => !current)}
                    className="rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
                >
                    Toggle pending ({pending ? 'on' : 'off'})
                </button>
                <p className="text-[12px] text-muted">
                    Pending clicks: <span data-testid="pending-clicks">{pendingClicks}</span>
                </p>
            </div>

            <h2 className="mb-2 text-[14px] font-semibold">Disabled</h2>
            <div className="mb-8 flex gap-2">
                <Button variant="primary" disabled data-testid="disabled-button">
                    Can't touch this
                </Button>
            </div>

            <h2 className="mb-2 text-[14px] font-semibold">Rest props</h2>
            <div className="mb-8 flex gap-2">
                <Button
                    variant="secondary"
                    title="Hover title"
                    data-testid="rest-props-button"
                    data-extra="carried-through"
                >
                    Hover me
                </Button>
            </div>

            <h2 className="mb-2 text-[14px] font-semibold">Form submission</h2>
            <form
                className="mb-8 flex items-center gap-2"
                onSubmit={(event) => {
                    event.preventDefault();
                    setSubmitted(true);
                }}
            >
                <Button type="submit" variant="primary" data-testid="submit-button">
                    Submit
                </Button>
                <p className="text-[12px] text-muted">
                    Submitted: <span data-testid="form-submitted">{submitted ? 'yes' : 'no'}</span>
                </p>
            </form>

            <h2 className="mb-2 text-[14px] font-semibold">Keyboard focus</h2>
            <div className="mb-8 flex gap-2">
                <button
                    type="button"
                    data-testid="before-focus-button"
                    className="rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
                >
                    Click me first
                </button>
                <Button variant="secondary" data-testid="focus-button">
                    Tab to me
                </Button>
                <Button variant="link" data-testid="focus-link">
                    Then to me
                </Button>
            </div>

            <h2 className="mb-2 text-[14px] font-semibold">IconButton</h2>
            <div className="mb-8 flex gap-2">
                <IconButton label="Close" data-testid="icon-button-close">
                    <CloseIcon />
                </IconButton>
            </div>

            <h2 className="mb-2 text-[14px] font-semibold">className override (tailwind-merge)</h2>
            <p className="mb-2 text-[12px] text-muted">
                The second button's own `px-3.5` and this `className`'s `px-10` are in the same
                utility group -- `cn` should keep only the caller's value, not both.
            </p>
            <div className="flex gap-2">
                <Button data-testid="classname-merge-default">Default padding</Button>
                <Button data-testid="classname-merge-override" className="px-10">
                    Overridden padding
                </Button>
            </div>
        </div>
    );
}
