import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AppBrand, BrandMarkIcon } from './AppBrand.js';
import type { BrandMark } from './brandMark.js';

const mark: BrandMark = {
    viewBox: '0 0 64 64',
    shapes: [{ tag: 'path', attrs: { d: 'M32 4 L60 32 L32 60 L4 32 Z' } }],
};

describe('BrandMarkIcon', () => {
    it('renders the shapes inside a currentColor svg at the requested size', () => {
        const html = renderToStaticMarkup(<BrandMarkIcon mark={mark} size={24} />);

        expect(html).toContain('width="24" height="24" viewBox="0 0 64 64" fill="currentColor"');
        expect(html).toContain('<path d="M32 4 L60 32 L32 60 L4 32 Z">');
        expect(html).toContain('text-brand');
    });
});

describe('AppBrand', () => {
    it('renders a root link with the mark and the name', () => {
        const html = renderToStaticMarkup(<AppBrand name="Ledger" mark={mark} />);

        expect(html).toContain('href="/"');
        expect(html).toContain('width="20" height="20"');
        expect(html).toContain('>Ledger</span>');
    });

    it('drops the name but keeps an accessible label when compact', () => {
        const html = renderToStaticMarkup(<AppBrand name="Ledger" mark={mark} compact />);

        expect(html).not.toContain('</span>');
        expect(html).toContain('aria-label="Ledger"');
    });

    it('renders through the supplied link component', () => {
        const Link = ({ href, children }: { href: string; children?: React.ReactNode }) => (
            <span data-href={href}>{children}</span>
        );
        const html = renderToStaticMarkup(<AppBrand name="Ledger" mark={mark} href="/inbox" LinkComponent={Link} />);

        expect(html).toContain('data-href="/inbox"');
    });
});
