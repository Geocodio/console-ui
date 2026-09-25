import { describe, expect, it } from 'vitest';
import { DIALOG_POPUP_CLASSES } from './Dialog.js';

// renderToStaticMarkup produces empty markup here: Base UI's Dialog.Portal
// needs a document to render into, which vitest's `node` environment does
// not provide. The clamp is asserted on the exported class constant instead.
describe('Dialog', () => {
    it('clamps the popup to the viewport so the default width fits a 360px phone', () => {
        expect(DIALOG_POPUP_CLASSES).toContain('max-w-[calc(100vw-1.5rem)]');
    });
});
