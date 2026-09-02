// The shared control class string, written to this package's rules: the literal
// `shadow-[0_1px_2px_rgba(40,42,48,0.04)]` becomes the `shadow-card` token,
// and the raw `var(--text-3)` / `var(--accent)` references become
// `hover:border-faint` / `focus:border-accent`. The 3px focus ring keeps an
// arbitrary value -- there is no token utility for a spread-only ring -- so
// `var(--accent-soft)` stays inline there.
//
// `outline-none` is this package's one sanctioned exception to "never put
// outline-none on a focusable element" (see README Conventions): the
// `focus:border-accent` + `shadow-[0_0_0_3px_var(--accent-soft)]` pair below
// IS the focus indicator, not an omission of one. Guarded by a test per
// control asserting a visible indicator on keyboard focus.
//
// Shared by every text-like control (`TextInput`, `Textarea`) so they read
// as one family; each adds only its own geometry on top.
export const TEXT_CONTROL =
    'rounded-control border border-hair-strong bg-panel px-3 text-[13px] text-body shadow-card ' +
    'placeholder:text-faint disabled:opacity-50 outline-none transition-[box-shadow,border-color] ' +
    'hover:border-faint focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]';
