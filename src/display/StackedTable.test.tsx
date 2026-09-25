import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { StackedTable, StackedTbody, StackedTd, StackedThead, StackedTr } from './StackedTable.js';
import { Th } from './Table.js';

function render() {
    return renderToStaticMarkup(
        <StackedTable data-testid="t">
            <StackedThead>
                <tr>
                    <Th>Name</Th>
                    <Th>Status</Th>
                </tr>
            </StackedThead>
            <StackedTbody>
                <StackedTr data-testid="r1">
                    <StackedTd label="Name">Washington</StackedTd>
                    <StackedTd label="Status">Ready</StackedTd>
                    <StackedTd>no label</StackedTd>
                </StackedTr>
            </StackedTbody>
        </StackedTable>,
    );
}

describe('StackedTable', () => {
    it('is a real table above md and blocks below', () => {
        const html = render();

        expect(html).toContain('<table');
        expect(html).toContain('max-md:block');
        expect(html).toContain('max-md:hidden');
    });

    it('rows drop their fixed height and cells carry their column label', () => {
        const html = render();

        expect(html).toContain('max-md:h-auto');
        expect(html).toContain('data-label="Name"');
        expect(html).toContain('data-label="Status"');
        expect(html).toContain('max-md:before:content-[attr(data-label)]');
    });

    it('a cell without a label draws no label column', () => {
        const html = render();
        const cells = html.split('<td');
        const unlabeled = cells.find((cell) => cell.includes('no label'));

        expect(unlabeled).toBeDefined();
        expect(unlabeled).not.toContain('data-label');
        expect(unlabeled).not.toContain('before:content');
    });

    it('merges className and spreads rest on every part', () => {
        const html = renderToStaticMarkup(
            <StackedTable className="text-[12px]">
                <StackedTbody>
                    <StackedTr className="bg-panel" data-testid="row">
                        <StackedTd label="A" className="font-mono" data-testid="cell">
                            x
                        </StackedTd>
                    </StackedTr>
                </StackedTbody>
            </StackedTable>,
        );

        expect(html).toContain('text-[12px]');
        expect(html).toContain('bg-panel');
        expect(html).toContain('data-testid="row"');
        expect(html).toContain('font-mono');
        expect(html).toContain('data-testid="cell"');
    });
});
