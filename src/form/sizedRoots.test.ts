import { readdirSync, readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

/**
 * Regression guard for a defect that shipped in 0.1.3 and was visible on exactly
 * one consuming screen: `Toggle` sized its root with `w-8 h-[18px]` but declared
 * no display. Base UI renders that root as a `<span>` and the thumb is absolutely
 * positioned, so the root has no in-flow content -- it stayed `display: inline`,
 * where width and height do not apply to non-replaced inline elements. The track
 * collapsed to 0x0 and only the thumb painted.
 *
 * It looked correct everywhere the parent happened to be a flex container (the
 * root became a flex item, so the sizes applied) and broke the first time one
 * landed in a `<td>`. `getComputedStyle` still reported `32px` -- that is the
 * *computed* value, while the *used* value was zero -- so a spot check in
 * devtools agreed with the code and disagreed with the screen.
 *
 * The invariant: a component that sizes a root Base UI renders as a `<span>`
 * must pin its own display rather than inherit one from wherever it is placed.
 * Native form controls are exempt -- `<input>`, `<button>`, `<select>` and
 * `<textarea>` are inline-block by default, so sizes already apply.
 */

const DISPLAY = /\b(inline-block|inline-flex|inline-grid|flex|grid|block|table|contents|hidden)\b/;
const SIZES = /\b(w-\d|w-\[|w-full|w-px|h-\d|h-\[|h-full|h-px|size-\d|size-\[)/;

/** Roots that are natively inline-block, so an explicit display buys nothing. */
const NATIVE_CONTROL_ROOTS = new Set(['form/TextInput.tsx', 'form/Textarea.tsx']);

const componentFiles = ['display', 'form', 'layout', 'overlay'].flatMap((dir) => {
    const base = new URL(`../${dir}/`, import.meta.url);
    return readdirSync(base)
        .filter((name) => name.endsWith('.tsx'))
        .map((name) => ({ name: `${dir}/${name}`, source: readFileSync(new URL(name, base), 'utf8') }));
});

test('a component that pins its own width or height also pins a display', () => {
    const offenders = componentFiles
        .filter(({ name }) => !NATIVE_CONTROL_ROOTS.has(name))
        .filter(({ source }) => SIZES.test(source) && !DISPLAY.test(source))
        .map(({ name }) => name);

    expect(offenders).toEqual([]);
});

test("Toggle's root keeps an explicit display so it survives outside a flex parent", () => {
    const toggle = componentFiles.find(({ name }) => name === 'form/Toggle.tsx');
    expect(toggle).toBeDefined();
    expect(toggle?.source).toMatch(/relative inline-block h-\[18px\] w-8/);
});

test('the native-control exemption list stays honest', () => {
    for (const name of NATIVE_CONTROL_ROOTS) {
        const file = componentFiles.find((c) => c.name === name);
        expect(file, `${name} is exempted but no longer exists`).toBeDefined();
    }
});
