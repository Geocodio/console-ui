import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

const tokens = readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8');

test('every semantic colour has a matching soft variant', () => {
    for (const name of ['ok', 'warn', 'fail', 'info', 'idle']) {
        expect(tokens).toContain(`--${name}:`);
        expect(tokens).toContain(`--${name}-soft:`);
    }
});

test('no hue-named colour tokens survive', () => {
    for (const name of ['--green:', '--orange:', '--red:', '--blue:']) {
        expect(tokens).not.toContain(name);
    }
});

test('the colour palette is declared once, not duplicated per theme', () => {
    expect(tokens).toContain('light-dark(');
    // Each colour appears exactly once. The easy mistake is pasting the whole
    // light palette twice (once under @media, once under [data-theme]); this
    // is the guard against that shape coming back.
    for (const name of ['--panel:', '--text:', '--accent:', '--ok:']) {
        expect(tokens.split(name)).toHaveLength(2);
    }
});

test('only shadows use the two-block form, because light-dark() takes colours only', () => {
    // prefers-color-scheme is legitimate here -- box-shadow lists cannot go
    // through light-dark(). It must not appear for any colour token.
    const themed = tokens.slice(tokens.indexOf('@media (prefers-color-scheme'));
    expect(themed).toContain('--shadow-card:');
    expect(themed).not.toContain('--panel:');
    expect(themed).not.toContain('--accent:');
});

test('every custom property is exposed as a Tailwind theme token', () => {
    const theme = tokens.slice(tokens.indexOf('@theme'));
    for (const token of ['--color-panel', '--color-ok', '--radius-card', '--shadow-overlay']) {
        expect(theme).toContain(token);
    }
});

test('brand tokens are mapped to utilities but ship no value', () => {
    expect(tokens).not.toMatch(/--brand:/);
    expect(tokens).not.toMatch(/--brand-soft:/);
    const theme = tokens.slice(tokens.indexOf('@theme'));
    expect(theme).toContain('--color-brand: var(--brand)');
    expect(theme).toContain('--color-brand-soft: var(--brand-soft)');
});
