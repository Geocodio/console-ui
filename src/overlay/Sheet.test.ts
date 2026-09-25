import { describe, expect, it } from 'vitest';
import { SHEET_RIGHT_CLASSES } from './Sheet.js';

// renderToStaticMarkup produces empty markup here: Base UI's Drawer.Portal
// needs a document to render into, which vitest's `node` environment does
// not provide. The clamp is asserted on the exported class constant instead.
describe('Sheet', () => {
    it('caps a right sheet at the viewport width', () => {
        expect(SHEET_RIGHT_CLASSES).toContain('max-w-full');
    });
});
