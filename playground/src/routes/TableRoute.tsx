import { Table, Tbody, Td, Th, Thead, Tr } from '@geocodio/console-ui';
import { useState } from 'react';

interface Row {
    id: string;
    name: string;
    buildId: string;
    status: string;
}

const ROWS: Row[] = [
    { id: '1', name: 'Washington', buildId: 'bld_9f21a', status: 'Ready' },
    { id: '2', name: 'Oregon', buildId: 'bld_2c88e', status: 'Ready' },
    { id: '3', name: 'Nevada', buildId: 'bld_7710d', status: 'Building' },
];

export function TableRoute() {
    const [selectedId, setSelectedId] = useState('2');
    const [clicks, setClicks] = useState(0);

    return (
        <div className="max-w-xl text-body">
            <h1 className="mb-4 text-[21px] font-semibold">Table</h1>

            <Table data-testid="table">
                <Thead>
                    <tr>
                        <Th>Name</Th>
                        <Th>Build ID</Th>
                        <Th>Status</Th>
                    </tr>
                </Thead>
                <Tbody>
                    {ROWS.map((row) => (
                        <Tr
                            key={row.id}
                            data-testid={`row-${row.id}`}
                            selected={row.id === selectedId}
                            interactive
                            onClick={() => {
                                setSelectedId(row.id);
                                setClicks((count) => count + 1);
                            }}
                        >
                            <Td>{row.name}</Td>
                            <Td className="font-mono" data-testid={`build-id-${row.id}`}>
                                {row.buildId}
                            </Td>
                            <Td data-testid={`status-${row.id}`}>{row.status}</Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            <p className="mt-4 text-[12px] text-muted">
                Row clicks: <span data-testid="row-clicks">{clicks}</span>
            </p>
        </div>
    );
}
