import { Dialog } from '@geocodio/console-ui';
import { useState } from 'react';

const FILLER_ROWS = Array.from({ length: 40 }, (_, i) => i);

export function DialogRoute() {
    const [open, setOpen] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);

    return (
        <div className="text-body">
            <h1 className="mb-4 text-[21px] font-semibold">Dialog</h1>

            <div className="flex gap-2">
                <button
                    type="button"
                    data-testid="open-dialog"
                    onClick={() => setOpen(true)}
                    className="rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
                >
                    Rename source
                </button>
                <button
                    type="button"
                    data-testid="open-dialog-alert"
                    onClick={() => setAlertOpen(true)}
                    className="rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
                >
                    Storage almost full
                </button>
            </div>

            <Dialog
                open={open}
                onOpenChange={setOpen}
                title="Rename source"
                description="Choose a new name for this source. This does not change its slug."
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="rounded-control border border-hair-strong bg-accent px-3 py-1 text-[12px] text-accent-ink"
                        >
                            Save
                        </button>
                    </>
                }
            >
                <label className="mb-1 block text-[12px] text-muted" htmlFor="source-name">
                    Name
                </label>
                <input
                    id="source-name"
                    type="text"
                    defaultValue="Wake County parcels"
                    className="w-full rounded-control border border-hair-strong bg-panel px-2 py-1 text-[12px]"
                />
            </Dialog>

            <Dialog
                alert
                open={alertOpen}
                onOpenChange={setAlertOpen}
                title="Storage almost full"
                description="This account has used 92% of its allotted build storage. Delete old builds or request more space."
                footer={
                    <button
                        type="button"
                        data-testid="dismiss-dialog-alert"
                        onClick={() => setAlertOpen(false)}
                        className="rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
                    >
                        Got it
                    </button>
                }
            >
                <p className="text-[12.5px] text-muted">
                    Rendered through the <code>alert</code> mode: <code>role=&quot;alertdialog&quot;</code>,
                    always modal, and the backdrop cannot dismiss it.
                </p>
            </Dialog>

            <section className="mt-8">
                <h2 className="mb-2 text-[14px] font-semibold">Below the fold</h2>
                <p className="mb-4 max-w-prose text-[12.5px] text-muted">
                    This route needs enough content to overflow the viewport so the
                    scroll-lock test has something real to lock.
                </p>
                <div className="flex flex-col gap-2">
                    {FILLER_ROWS.map((row) => (
                        <div key={row} className="rounded-card border border-hair bg-panel p-4 text-[12px]">
                            Row {row}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
