import {
    Button,
    CommandPalette,
    type CommandPaletteItem,
    type CommandPaletteSection,
    ConfirmDialog,
} from '@geocodio/console-ui';
import { useCallback, useMemo, useState } from 'react';

interface Entry {
    id: string;
    group: 'Recent' | 'Actions' | 'Navigate';
    label: string;
    hint?: string;
    shortcut?: string[];
    destructive?: boolean;
    confirm?: string;
    children?: Array<{ id: string; label: string }>;
}

const ENTRIES: Entry[] = [
    { id: 'recent-travis', group: 'Recent', label: 'us/tx/travis', hint: 'source', children: [{ id: 'run-now', label: 'Run now' }, { id: 'open-runs', label: 'Open runs' }] },
    { id: 'sync', group: 'Actions', label: 'Sync sources', hint: 'actions', shortcut: ['⌘', 'S'], confirm: 'Sync every source now?' },
    { id: 'purge', group: 'Actions', label: 'Purge stale builds', hint: 'actions', destructive: true },
    { id: 'builds', group: 'Navigate', label: 'Go to builds', hint: 'navigate', shortcut: ['G', 'B'] },
    { id: 'sources', group: 'Navigate', label: 'Go to sources', hint: 'navigate' },
];

export function PaletteRoute() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [expanded, setExpanded] = useState<string | null>(null);
    const [pending, setPending] = useState<Entry | null>(null);
    const [lastSelected, setLastSelected] = useState('none');
    const [manyRows, setManyRows] = useState(false);

    const choose = useCallback((id: string) => {
        setLastSelected(id);
        setOpen(false);
    }, []);

    const sections = useMemo((): CommandPaletteSection[] => {
        const term = query.trim().toLowerCase();
        const source = manyRows
            ? Array.from({ length: 40 }, (_, index): Entry => ({ id: `row-${index}`, group: 'Navigate', label: `Row ${index}` }))
            : ENTRIES;
        const matching = source.filter((entry) => entry.label.toLowerCase().includes(term));
        const toItems = (entries: Entry[]): CommandPaletteItem[] =>
            entries.flatMap((entry): CommandPaletteItem[] => {
                const row: CommandPaletteItem = {
                    id: entry.id,
                    label: entry.label,
                    hint: entry.hint,
                    shortcut: entry.shortcut,
                    destructive: entry.destructive,
                    onSelect: () => (entry.confirm ? setPending(entry) : choose(entry.id)),
                };
                if (expanded !== entry.id || !entry.children) {
                    return [row];
                }
                return [
                    row,
                    ...entry.children.map(
                        (child): CommandPaletteItem => ({ id: child.id, label: child.label, nested: true, hint: 'action', onSelect: () => choose(child.id) }),
                    ),
                ];
            });

        return (['Recent', 'Actions', 'Navigate'] as const).map((group) => ({
            title: group,
            items: toItems(matching.filter((entry) => entry.group === group)),
        }));
    }, [query, expanded, manyRows, choose]);

    const items = sections.flatMap((section) => section.items);
    const [selectedIndex, setSelectedIndex] = useState(0);

    return (
        <div className="text-body">
            <h1 className="mb-4 text-[21px] font-semibold">CommandPalette</h1>
            <div className="mb-4 flex gap-2">
                <Button
                    variant="primary"
                    data-testid="open-palette"
                    onClick={() => {
                        setQuery('');
                        setExpanded(null);
                        setSelectedIndex(0);
                        setOpen(true);
                    }}
                >
                    Open palette
                </Button>
                <Button data-testid="toggle-many" onClick={() => setManyRows((current) => !current)}>
                    {manyRows ? 'Few rows' : 'Many rows'}
                </Button>
            </div>
            <p className="text-[12px] text-muted">
                Last selected: <span data-testid="palette-result">{lastSelected}</span> · open:{' '}
                <span data-testid="palette-open">{open ? 'yes' : 'no'}</span>
            </p>
            <span data-testid="fail-reference" className="text-fail">
                fail tone reference
            </span>

            <CommandPalette
                open={open}
                onOpenChange={setOpen}
                query={query}
                onQueryChange={(next) => {
                    setQuery(next);
                    setSelectedIndex(0);
                }}
                sections={sections}
                selectedIndex={selectedIndex}
                onSelectedIndexChange={setSelectedIndex}
                placeholder="Search, or > for commands"
                data-testid="palette"
                inputProps={{ 'data-testid': 'palette-input', spellCheck: false } as React.InputHTMLAttributes<HTMLInputElement>}
                onInputKeyDown={(event) => {
                    const current = items[selectedIndex];
                    if (event.key === 'ArrowRight' && current && ENTRIES.find((entry) => entry.id === current.id)?.children) {
                        event.preventDefault();
                        setExpanded(current.id);
                    } else if (event.key === 'Escape' && expanded) {
                        event.preventDefault();
                        setExpanded(null);
                    }
                }}
            >
                <ConfirmDialog
                    open={pending !== null}
                    onOpenChange={(next) => {
                        if (!next) {
                            setPending(null);
                        }
                    }}
                    title={pending ? `${pending.label}?` : ''}
                    body={pending?.confirm ?? ''}
                    confirmLabel={pending?.label ?? 'Confirm'}
                    destructive={false}
                    onConfirm={() => {
                        const id = pending?.id ?? 'none';
                        setPending(null);
                        choose(id);
                    }}
                />
            </CommandPalette>
        </div>
    );
}
