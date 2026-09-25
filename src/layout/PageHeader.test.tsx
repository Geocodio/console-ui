import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PageHeader } from './PageHeader.js';

describe('PageHeader', () => {
    it('renders crumbs that truncate, with the last one as the current page', () => {
        const html = renderToStaticMarkup(<PageHeader crumbs={['Repositories', 'geocodio-dashboard']} />);

        expect(html).toContain('data-testid="page-header-crumbs"');
        expect(html).toContain('Repositories');
        expect(html).toContain('geocodio-dashboard');
        expect(html).toContain('min-w-0');
        expect((html.match(/truncate/g) ?? []).length).toBeGreaterThanOrEqual(2);
        expect(html).toContain('font-medium text-body');
    });

    it('renders two JSX crumbs without collision', () => {
        const html = renderToStaticMarkup(
            <PageHeader
                crumbs={[
                    <span key="a">A</span>,
                    <span key="b">B</span>,
                ]}
            />,
        );

        expect(html).toContain('>A<');
        expect(html).toContain('>B<');
    });

    it('renders a title after the crumbs', () => {
        const html = renderToStaticMarkup(<PageHeader crumbs={['Tasks']} title="ENG-1290" />);

        expect(html.indexOf('Tasks')).toBeLessThan(html.indexOf('ENG-1290'));
    });

    it('puts the middle slot on its own full-width row below sm and inline above', () => {
        const html = renderToStaticMarkup(
            <PageHeader crumbs={['Costs']}>
                <span>period toggle</span>
            </PageHeader>,
        );

        expect(html).toContain('data-testid="page-header-slot"');
        expect(html).toContain('w-full');
        expect(html).toContain('sm:w-auto');
        expect(html).toContain('sm:flex-1');
        expect(html).not.toContain('overflow-x-auto');
    });

    it('renders overflow items as buttons from sm up and as a menu below', () => {
        const html = renderToStaticMarkup(
            <PageHeader
                crumbs={['Skills']}
                actions={<button type="button">Install</button>}
                overflow={[{ key: 'refresh', label: 'Refresh marketplaces', onSelect: () => {}, testId: 'refresh' }]}
            />,
        );

        expect(html).toContain('data-testid="page-header-overflow-buttons"');
        expect(html).toContain('hidden');
        expect(html).toContain('sm:flex');
        expect(html).toContain('Refresh marketplaces');
        expect(html).toContain('data-testid="page-header-overflow-menu"');
        expect(html).toContain('sm:hidden');
        expect(html).toContain('aria-label="More actions"');
        expect(html).toContain('Install');
    });

    it('renders no overflow chrome for an empty list and keeps the actions', () => {
        const html = renderToStaticMarkup(<PageHeader crumbs={['Skills']} actions={<button type="button">Install</button>} overflow={[]} />);

        expect(html).not.toContain('page-header-overflow-buttons');
        expect(html).not.toContain('page-header-overflow-menu');
        expect(html).toContain('Install');
    });

    it('merges className and spreads rest onto the header', () => {
        const html = renderToStaticMarkup(<PageHeader crumbs={['A']} className="bg-panel" data-testid="hdr" />);

        expect(html).toContain('<header');
        expect(html).toContain('bg-panel');
        expect(html).toContain('data-testid="hdr"');
    });
});
