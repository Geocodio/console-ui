import { Sheet } from '@geocodio/console-ui';
import { useState } from 'react';

export function SheetRoute() {
    const [rightOpen, setRightOpen] = useState(false);
    const [bottomOpen, setBottomOpen] = useState(false);

    return (
        <div className="text-body">
            <h1 className="mb-4 text-[21px] font-semibold">Sheet</h1>

            <div className="flex gap-2">
                <button
                    type="button"
                    data-testid="open-sheet-right"
                    onClick={() => setRightOpen(true)}
                    className="rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
                >
                    Open right sheet
                </button>
                <button
                    type="button"
                    data-testid="open-sheet-bottom"
                    onClick={() => setBottomOpen(true)}
                    className="rounded-control border border-hair-strong bg-panel px-3 py-1 text-[12px]"
                >
                    Open bottom sheet
                </button>
            </div>

            <Sheet open={rightOpen} onOpenChange={setRightOpen} title="Source details" side="right">
                <p className="text-[12.5px] text-muted">
                    This is the right-side slideover, 480px wide by default.
                </p>
            </Sheet>

            <Sheet open={bottomOpen} onOpenChange={setBottomOpen} title="Queue" side="bottom">
                <p className="text-[12.5px] text-muted">
                    This is the mobile bottom sheet, capped at 80% of the viewport
                    height.
                </p>
            </Sheet>
        </div>
    );
}
