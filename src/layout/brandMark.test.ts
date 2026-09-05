import { describe, expect, it } from 'vitest';
import { type BrandMark, brandMarkDataUri, brandMarkSvg, serializeBrandMarkShapes } from './brandMark.js';

const mark: BrandMark = {
    viewBox: '0 0 64 64',
    faviconViewBox: '4 4 56 56',
    shapes: [
        { tag: 'circle', attrs: { cx: 32, cy: 32, r: 20 } },
        { tag: 'line', attrs: { x1: 4, y1: 4, x2: 60, y2: 60, stroke: 'currentColor', 'stroke-width': 3 } },
    ],
};

describe('serializeBrandMarkShapes', () => {
    it('writes each shape as a self-closing element with currentColor replaced', () => {
        expect(serializeBrandMarkShapes(mark.shapes, '#0e8a86')).toBe(
            '<circle cx="32" cy="32" r="20"/><line x1="4" y1="4" x2="60" y2="60" stroke="#0e8a86" stroke-width="3"/>',
        );
    });
});

describe('brandMarkSvg', () => {
    it('uses the favicon crop and sets the fill on the root', () => {
        const svg = brandMarkSvg(mark, '#0e8a86');

        expect(svg).toContain('viewBox="4 4 56 56"');
        expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg" viewBox="4 4 56 56" fill="#0e8a86">');
        expect(svg).not.toContain('<circle cx="48.8"');
    });

    it('draws a pip knocked out of the tab background when asked', () => {
        const svg = brandMarkSvg(mark, '#0e8a86', { pip: '#4e9cf5', pipBackground: '#171819' });

        expect(svg).toContain('fill="#4e9cf5"');
        expect(svg).toContain('stroke="#171819"');
        // Bottom-right of the 56-unit crop: 4 + 56 - 0.2 * 56.
        expect(svg).toContain('cx="48.8" cy="48.8"');
    });

    it('falls back to the drawing grid when there is no favicon crop', () => {
        const svg = brandMarkSvg({ viewBox: '0 0 24 24', shapes: mark.shapes }, '#000');

        expect(svg).toContain('viewBox="0 0 24 24"');
    });
});

describe('brandMarkDataUri', () => {
    it('encodes the document as an SVG data URI', () => {
        const uri = brandMarkDataUri(mark, '#0e8a86');

        expect(uri.startsWith('data:image/svg+xml,')).toBe(true);
        expect(decodeURIComponent(uri.slice('data:image/svg+xml,'.length))).toBe(brandMarkSvg(mark, '#0e8a86'));
    });
});
