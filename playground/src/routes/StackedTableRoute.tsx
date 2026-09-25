import { Badge, StackedTable, StackedTbody, StackedTd, StackedThead, StackedTr, Th } from '@geocodio/console-ui';

const ROWS = [
    { id: '1', slug: 'geocodio-dashboard', ci: 'GitHub Actions', status: 'Active', tasks: 42 },
    { id: '2', slug: 'website-apps-upload', ci: 'Drone', status: 'Active', tasks: 7 },
    { id: '3', slug: 'laravel-tailscale-identity', ci: 'GitHub Actions', status: 'Paused', tasks: 0 },
];

export function StackedTableRoute() {
    return (
        <div className="max-w-xl text-body">
            <h1 className="mb-4 text-[21px] font-semibold">StackedTable</h1>
            <p className="mb-4 text-[13px] text-muted">
                A table above md; stacked labelled rows below it. Resize the window to see both.
            </p>

            <StackedTable data-testid="stacked">
                <StackedThead data-testid="stacked-head">
                    <tr>
                        <Th>Repository</Th>
                        <Th>CI</Th>
                        <Th>Status</Th>
                        <Th className="text-right">Tasks</Th>
                    </tr>
                </StackedThead>
                <StackedTbody>
                    {ROWS.map((row) => (
                        <StackedTr key={row.id} data-testid={`row-${row.id}`}>
                            <StackedTd label="Repository" className="font-mono" data-testid={`slug-${row.id}`}>
                                {row.slug}
                            </StackedTd>
                            <StackedTd label="CI">{row.ci}</StackedTd>
                            <StackedTd label="Status">
                                <Badge tone={row.status === 'Active' ? 'ok' : 'neutral'}>{row.status}</Badge>
                            </StackedTd>
                            <StackedTd label="Tasks" className="md:text-right" data-testid={`tasks-${row.id}`}>
                                {row.tasks}
                            </StackedTd>
                        </StackedTr>
                    ))}
                </StackedTbody>
            </StackedTable>
        </div>
    );
}
