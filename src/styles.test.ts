import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

const read = (name: string) => readFileSync(new URL(`../styles/${name}`, import.meta.url), 'utf8');

test('fonts come from @fontsource, not hand-shipped files', () => {
    const fonts = read('fonts.css');
    expect(fonts).toContain('@fontsource/ibm-plex-sans');
    expect(fonts).toContain('@fontsource/ibm-plex-mono');
    expect(fonts).not.toContain('@font-face');
});

test('base styles paint the body from tokens', () => {
    const base = read('base.css');
    expect(base).toContain('background: var(--bg)');
    expect(base).toContain('color: var(--text)');
});

test('base styles ship a global focus-visible ring', () => {
    expect(read('base.css')).toContain(':focus-visible');
});

test('reduced motion is a global kill switch, not per-animation opt-in', () => {
    expect(read('base.css')).toContain('prefers-reduced-motion: reduce');
});

test('index.css imports every layer except the opt-in ones', () => {
    const index = read('index.css');
    const imports = index.match(/^@import\s+.*$/gm) ?? [];
    for (const layer of ['tokens.css', 'fonts.css', 'base.css', 'animations.css', 'overlays.css']) {
        expect(imports.some((line) => line.includes(layer))).toBe(true);
    }
    // The opt-in layers must not be imported here -- but the file is free to
    // document why they are excluded, so this checks imports, not prose.
    for (const optIn of ['strict-palette']) {
        expect(imports.some((line) => line.includes(optIn))).toBe(false);
    }
});

test('strict-palette.css documents that it must be imported BEFORE the package tokens', () => {
    const strictPalette = read('strict-palette.css');
    expect(strictPalette).toContain('Import BEFORE');
    expect(strictPalette).not.toMatch(/Import AFTER/i);
});

