import { extendTailwindMerge } from 'tailwind-merge';

/**
 * `twMerge` extended with this package's own theme scales -- registered
 * across TWO `@theme` blocks: `styles/tokens.css`'s `@theme inline` block
 * under the standard `--color-*`, `--radius-*` and `--shadow-*` namespaces,
 * and `styles/animations.css`'s `@theme` block under `--animate-*`. Tailwind
 * treats all of these as values on the same scale as its own stock ones
 * (e.g. `rounded-control` alongside `rounded-lg`, `animate-spinner-spin`
 * alongside `animate-none`), not distinct utilities. `twMerge`'s bundled
 * default config only knows Tailwind's own stock scale values, though, so
 * without this extension it would not see e.g. `rounded-control` and
 * `rounded-full`, `bg-accent` and `bg-panel-2`, or `animate-spinner-spin`
 * and `animate-none` as conflicting, and both classes would land in the
 * output -- defeating the point for every component that ships one of this
 * package's own tokens. Verified empirically against the installed 3.6.0
 * before adding this list -- including that a missed `animate` extension
 * left `twMerge('animate-spinner-spin', 'animate-none')` returning both
 * classes unmerged, exactly the half-working case this extension exists to
 * prevent.
 */
const twMerge = extendTailwindMerge({
    extend: {
        theme: {
            color: [
                'app',
                'sidebar',
                'panel',
                'panel-2',
                'hair',
                'hair-strong',
                'body',
                'muted',
                'faint',
                'accent',
                'accent-soft',
                'accent-text',
                'accent-ink',
                'ok',
                'ok-soft',
                'warn',
                'warn-soft',
                'fail',
                'fail-soft',
                'info',
                'info-soft',
                'idle',
                'idle-soft',
                'note',
            ],
            radius: ['control', 'card', 'chip', 'pill'],
            shadow: ['card', 'overlay'],
            animate: ['fade-in', 'pop-in', 'menu-in', 'sheet-in', 'toast-in', 'spinner-spin'],
        },
    },
});

/**
 * The single class-composition helper every component in this package routes
 * through. Plain string concatenation (`` `${BASE} ${className ?? ''}` ``,
 * this package's pattern before this change) puts both the component's own
 * class and the caller's into the class list with no conflict resolution: if
 * the two disagree (the component ships `px-3`, a caller passes `px-4`),
 * which one wins is decided by their order in the compiled stylesheet, not by
 * the caller's evident intent to override. `twMerge` instead keeps only the
 * last class in any given group (e.g. horizontal padding), so a caller's
 * `className` reliably overrides the component's own classes in the same
 * utility group rather than merely coexisting with them.
 */
export function cn(...inputs: Array<string | false | null | undefined>): string {
    return twMerge(inputs.filter(Boolean).join(' '));
}
