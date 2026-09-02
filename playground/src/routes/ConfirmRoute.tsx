import { ConfirmDialog } from '@geocodio/console-ui';
import { useState } from 'react';

export function ConfirmRoute() {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState('none');
    const [archiveOpen, setArchiveOpen] = useState(false);
    const [archiveResult, setArchiveResult] = useState('none');

    return (
        <div className="text-body">
            <h1 className="mb-4 text-[21px] font-semibold">Confirm</h1>

            <div className="flex gap-2">
                <button
                    type="button"
                    data-testid="open-confirm"
                    onClick={() => {
                        setResult('none');
                        setOpen(true);
                    }}
                    className="rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
                >
                    Delete source
                </button>
                <button
                    type="button"
                    data-testid="toggle-busy"
                    onClick={() => setBusy((current) => !current)}
                    className="rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
                >
                    Toggle busy ({busy ? 'on' : 'off'})
                </button>
            </div>

            <p className="mt-4 text-[12px] text-muted">
                Result: <span data-testid="confirm-result">{result}</span>
            </p>

            <ConfirmDialog
                open={open}
                onOpenChange={setOpen}
                title="Delete Wake County parcels"
                body="This permanently deletes the source and every build that used it. This cannot be undone."
                confirmLabel="Delete"
                busy={busy}
                onConfirm={() => {
                    setResult('confirmed');
                    setOpen(false);
                }}
            />

            <h2 className="mb-2 mt-8 text-[14px] font-semibold">Non-destructive</h2>
            <p className="mb-2 max-w-prose text-[12.5px] text-muted">
                <code>destructive=&#123;false&#125;</code> swaps the confirm button to the accent
                treatment, for confirmations that aren't a "delete this permanently" flow.
            </p>

            <button
                type="button"
                data-testid="open-confirm-archive"
                onClick={() => {
                    setArchiveResult('none');
                    setArchiveOpen(true);
                }}
                className="rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
            >
                Archive source
            </button>

            <p className="mt-4 text-[12px] text-muted">
                Result: <span data-testid="confirm-archive-result">{archiveResult}</span>
            </p>

            <ConfirmDialog
                open={archiveOpen}
                onOpenChange={setArchiveOpen}
                title="Archive Wake County parcels"
                body="Archived sources stop building but keep their history. You can unarchive them later."
                confirmLabel="Archive"
                destructive={false}
                confirmTestId="archive-confirm"
                cancelTestId="archive-cancel"
                onConfirm={() => {
                    setArchiveResult('confirmed');
                    setArchiveOpen(false);
                }}
            />
        </div>
    );
}
