// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { Combobox, type ComboboxOption } from './Combobox.js';

const options: ComboboxOption[] = [
    { value: 'a', label: 'Gazetteer append' },
    { value: 'b', label: 'MCP' },
];

afterEach(cleanup);

describe('Combobox filter', () => {
    it('lists only the options the custom filter accepts', async () => {
        render(
            <Combobox
                options={options}
                value={null}
                onChange={() => {}}
                filter={(option, query) => option.label.toLowerCase().includes(query.replace(/ /g, '').slice(0, 3))}
            />,
        );

        await userEvent.type(screen.getByRole('combobox'), 'gaz app');

        expect(screen.queryByText('Gazetteer append')).not.toBeNull();
        expect(screen.queryByText('MCP')).toBeNull();
    });

    it('falls back to the default contains-match when no filter is given', async () => {
        render(<Combobox options={options} value={null} onChange={() => {}} />);

        await userEvent.type(screen.getByRole('combobox'), 'gaz app');

        expect(screen.queryByText('Gazetteer append')).toBeNull();
        expect(screen.queryByText('MCP')).toBeNull();
    });
});
