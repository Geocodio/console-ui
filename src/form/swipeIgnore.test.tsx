import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Checkbox } from './Checkbox.js';
import { RadioGroup } from './RadioGroup.js';
import { Toggle } from './Toggle.js';

/**
 * Regression guard: Toggle, Checkbox and RadioGroup render their interactive
 * element as a `<span role="...">` rather than a native control. Base UI's
 * `Sheet`/`Dialog` swipe-to-dismiss gesture only skips
 * `button,a,input,select,textarea,label,[role="button"]` by default
 * (`useSwipeDismiss.mjs`), so without `data-base-ui-swipe-ignore` a mouse
 * press on one of these controls inside an open Sheet starts the drawer's
 * swipe gesture instead of toggling the control -- see each component's doc
 * comment for the full mechanism.
 */
describe('data-base-ui-swipe-ignore', () => {
    it('is set on Toggle\'s root', () => {
        const html = renderToStaticMarkup(
            <Toggle checked={false} onCheckedChange={() => {}} label="Email notifications" />,
        );
        expect(html).toContain('data-base-ui-swipe-ignore');
    });

    it('is set on Checkbox\'s root', () => {
        const html = renderToStaticMarkup(<Checkbox checked={false} onCheckedChange={() => {}} label="I agree" />);
        expect(html).toContain('data-base-ui-swipe-ignore');
    });

    it('is set on every RadioGroup option', () => {
        const html = renderToStaticMarkup(
            <RadioGroup
                label="Billing plan"
                value="monthly"
                onChange={() => {}}
                options={[
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'annual', label: 'Annual' },
                ]}
            />,
        );
        expect((html.match(/data-base-ui-swipe-ignore/g) ?? []).length).toBe(2);
    });
});
