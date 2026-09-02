# @geocodio/console-ui

React components and design tokens for dashboards and internal tools, built on Base UI and Tailwind v4.

This is not a brand theme. It is a dense, neutral system for the kind of
screens a team looks at all day: tables, forms, settings, consoles. Keep your
customer-facing brand styling in its own package; nothing here depends on it.

## Installation

```bash
npm install @geocodio/console-ui
```

Peer dependencies: `react` and `react-dom` `^19`, and `tailwindcss` `^4`.
Tailwind must also `@source` the package's `dist` directory so it sees the
package's class names -- see Usage below.

## Usage

In your app's CSS entry point:

```css
@import 'tailwindcss';
@import '@geocodio/console-ui/styles.css';
@source '../../node_modules/@geocodio/console-ui/dist';
```

**The `@source` line is required.** Tailwind skips `node_modules` when
auto-detecting classes, so without it the package's components render with no
styling and no error. Adjust the relative path to your CSS file's location.

**`isolation: isolate` on the app's root element is required.** Overlay
components (`Dialog` and its family) are built on Base UI, which portals
popups to `<body>` and relies on stacking contexts rather than escalating
z-index. This package sets `position: relative` on `body` for its half of
that contract — Safari 26+ specifically needs a positioned `body` for
backdrops to paint correctly, and `base.css` already ships that — but the
matching `isolation: isolate` has to live on the consuming app's own root
element (e.g. `#root` or `#app`), because this package does not own that
element. Skipping it produces no error; it can just let a popup render behind
app chrome.

```css
#root {
    isolation: isolate;
}
```

## Components

Every component here is built on [Base UI](https://base-ui.com). None of them
wire up every ARIA relationship automatically — see
[Conventions](#conventions) below before assuming one does.

Every component also follows one `className`/rest-prop/ref policy — see
[Conventions](#conventions) for the full statement. In short: `className`
merges (via `cn`, not string concatenation) onto the component's primary
visual element, rest props spread onto that same element, and a ref forwards
there too. A component with a second meaningful surface (a popup, e.g.)
exposes a named prop for it — `popupClassName` on `Select`/`Combobox`/`Menu`
— rather than overloading `className`. The per-component tables below list
only what's specific to each component; the `className`/rest/ref behaviour
itself is not repeated in every row for components where it works exactly as
stated here.

### Form

#### Button

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `ButtonVariant` | `'secondary'` | Visual style: `'primary'`, `'secondary'`, `'tertiary'`, `'destructive'`, `'link'`. `'link'` drops the 32px box entirely — no border, background, padding or fixed height, and it inherits the surrounding font size — for text actions that sit inline in a sentence or table cell ("Edit", "Retry", a toast's "Undo"); pass `className="text-fail"` for a destructive one. |
| `icon` | `React.ReactNode` | — | Leading icon. Replaced by a spinner while `pending`. |
| `pending` | `boolean` | `false` | Blocks re-entry and shows a spinner in place of `icon`. Implies `disabled`. |
| `pendingLabel` | `string` | — | Rendered in place of `children` while pending, if it differs from the resting label. |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Native button type, defaulted so an unlabelled `type` never accidentally submits a form. |
| ...rest | `React.ButtonHTMLAttributes<HTMLButtonElement>` | — | Spread onto the underlying `<button>` before `aria-busy` is applied, so a stray same-named attribute can't clobber it — `onClick`, `aria-*`, `form`, `name`, `disabled`, `className` (merged via `cn`), all reach the DOM, plus a forwarded ref. |

A plain `<button>`, not Base UI's `button` module — that module exists to
give non-native elements native button semantics, which a real `<button>`
already has.

```tsx
import { Button } from '@geocodio/console-ui';

<Button variant="primary" onClick={save}>Save</Button>
<Button variant="destructive" pending pendingLabel="Deleting…" onClick={remove}>
    Delete
</Button>
<p>Loading failed. <Button variant="link" onClick={retry}>Retry</Button></p>
```

#### IconButton

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Required. Becomes the button's accessible name via `aria-label` — there is no way to render one without it. |
| `children` | `React.ReactNode` | — | The icon. |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Native button type. |
| ...rest | `React.ButtonHTMLAttributes<HTMLButtonElement>` | — | Spread onto the underlying `<button>` before `aria-label` is applied, so a stray same-named attribute can't clobber the required accessible name, plus a forwarded ref. |

A borderless 26px icon-only square for row-level affordances (close,
overflow, remove) that don't warrant a labelled `Button`.

```tsx
<IconButton label="Close" onClick={onClose}>
    <XIcon />
</IconButton>
```

#### Field

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | The field's label text. |
| `description` | `string` | — | Helper text under the control. |
| `error` | `string` | — | Error text; when present the control shows its invalid state. Mutually exclusive with `description` in the rendered output — an error supersedes the description. |
| `children` | `React.ReactNode` | — | The control (`TextInput`, `Textarea`, `Select`, or any other Base UI-compatible control). |
| `className` | `string` | — | Classes on the root. |
| ...rest | `React.HTMLAttributes<HTMLDivElement>` | — | Spread onto `Field.Root`, plus a forwarded ref to it. |

Built on Base UI's `Field` module, which wires label, description, error and
`aria-invalid` onto the control automatically — see
[Conventions](#conventions).

```tsx
<Field label="County name" description="Shown on the public map.">
    <TextInput value={name} onChange={(e) => setName(e.target.value)} />
</Field>

<Field label="County name" error="Required">
    <TextInput value={name} onChange={(e) => setName(e.target.value)} />
</Field>
```

#### TextInput

| Prop | Type | Default | Description |
|---|---|---|---|
| ...rest | `React.InputHTMLAttributes<HTMLInputElement>` | — | All native input props (`value`, `onChange`, `placeholder`, `disabled`, `type`, etc.), plus a forwarded ref. No props of its own. |

Built on Base UI's `Field.Control` rather than a plain `<input>`, so it
participates in an ancestor `Field`'s wiring when nested inside one, and
falls back to a plain, uncontexted input standalone.

```tsx
<TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search sources…" />
```

#### Textarea

| Prop | Type | Default | Description |
|---|---|---|---|
| ...rest | `React.TextareaHTMLAttributes<HTMLTextAreaElement>` | — | All native textarea props (`value`, `onChange`, `rows`, `placeholder`, `disabled`, etc.), plus a forwarded ref. No props of its own. |

The multi-line sibling of `TextInput`, sharing its control styling. Renders
through `Field.Control`'s `render` prop, so a `Textarea` inside a `Field` gets
the label as its accessible name, the description/error as its accessible
description, and `aria-invalid` — a raw `<textarea>` inside a `Field` gets
none of those. Enter inserts a newline; only `TextInput` commits on Enter.

```tsx
<Field label="Notes" description="Shown to the on-call operator.">
    <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
</Field>
```

#### Select

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `SelectOption[]` | — | The list of selectable options. |
| `value` | `string \| null` | — | Controlled selected value. |
| `onChange` | `(value: string \| null) => void` | — | Called when the selection changes. |
| `placeholder` | `string` | — | Shown when `value` is `null`. |
| `disabled` | `boolean` | `false` | Disables the trigger. |
| `className` | `string` | — | Classes on the trigger — the select's primary surface. |
| `popupClassName` | `string` | — | Classes on the popup panel — the select's second surface. |
| ...rest | `React.ButtonHTMLAttributes<HTMLButtonElement>` (minus `onChange`/`value`/`defaultValue`) | — | Spread onto the trigger, plus a forwarded ref to it. |

`SelectOption`: `value: string`, `label: string`, `disabled?: boolean`.

A real, portalled `role="listbox"` popup replacing a native `<select>`, so it
looks and behaves identically everywhere rather than depending on
Chromium-only `appearance: base-select`.

```tsx
<Select
    options={[
        { value: 'nc', label: 'North Carolina' },
        { value: 'sc', label: 'South Carolina', disabled: true },
    ]}
    value={state}
    onChange={setState}
    placeholder="Choose a state"
/>
```

#### Checkbox

| Prop | Type | Default | Description |
|---|---|---|---|
| `checked` | `boolean \| 'indeterminate'` | — | Controlled checked state. |
| `onCheckedChange` | `(checked: boolean) => void` | — | Called on toggle. |
| `label` | `string` | — | Accessible name, and (unless `hideLabel`) the visible label text. |
| `hideLabel` | `boolean` | `false` | Visually hides the label while keeping it as the accessible name. |
| `disabled` | `boolean` | `false` | Disables the control. |
| `id` | `string` | — | Forwarded to the underlying hidden `<input>`. |
| `className` | `string` | — | Classes on the outer `<label>` — the checkbox's primary surface. |
| ...rest | `React.LabelHTMLAttributes<HTMLLabelElement>` | — | Spread onto that `<label>` (before `checked`/`onCheckedChange`/`disabled` are applied to the inner control, so it can't clobber them), plus a forwarded ref to it. |

Indeterminate is real, not just drawn: it sets the hidden input's native
`indeterminate` property and `aria-checked="mixed"`.

```tsx
<Checkbox
    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
    onCheckedChange={toggleAll}
    label="Select all"
/>
```

#### RadioGroup

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Accessible name for the group as a whole. |
| `options` | `RadioOption[]` | — | The options. |
| `value` | `string \| null` | — | Controlled selected value. |
| `onChange` | `(value: string) => void` | — | Called when the selection changes. |
| `disabled` | `boolean` | `false` | Disables every option. |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Layout direction, and the announced `aria-orientation` on the group (neither Base UI nor this component set it otherwise, and ARIA's implicit default is `'vertical'`, which would misannounce a horizontal group). Arrow-key navigation always moves in both axes regardless of this prop's value — that's consistent, not contradictory, since the keys the announcement implies do work. |
| `className` | `string` | — | Classes on the root `role="radiogroup"` element. |
| ...rest | `React.HTMLAttributes<HTMLDivElement>` (minus `onChange`/`defaultValue`) | — | Spread onto that root before `value`/`onValueChange`/`disabled`, plus a forwarded ref to it. |

`RadioOption`: `value: string`, `label: string`, `description?: string`,
`disabled?: boolean`.

```tsx
<RadioGroup
    label="Merge strategy"
    options={[
        { value: 'skip', label: 'Skip', description: 'Leave existing rows untouched.' },
        { value: 'overwrite', label: 'Overwrite' },
    ]}
    value={strategy}
    onChange={setStrategy}
/>
```

#### Toggle

| Prop | Type | Default | Description |
|---|---|---|---|
| `checked` | `boolean` | — | Controlled checked state. |
| `onCheckedChange` | `(checked: boolean) => void` | — | Called on toggle. |
| `label` | `string` | — | Accessible name. Toggles rarely have a visible label of their own. |
| `disabled` | `boolean` | `false` | Disables the control. |
| `className` | `string` | — | Classes on `Switch.Root` — the toggle's only real surface. |
| ...rest | `React.HTMLAttributes<HTMLSpanElement>` | — | Spread onto `Switch.Root` before `checked`/`onCheckedChange`/`disabled`, plus a forwarded ref to it. |

```tsx
<Toggle checked={enabled} onCheckedChange={setEnabled} label="Enable nightly builds" />
```

#### Combobox

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `ComboboxOption[]` | — | The list of options. |
| `value` | `string \| null` | — | Controlled selected value. |
| `onChange` | `(value: string \| null) => void` | — | Called when the selection changes (including a committed custom value; see `allowCustom`). |
| `placeholder` | `string` | — | Placeholder text. |
| `allowCustom` | `boolean` | `false` | Accept free text that matches no option, committed on blur/Enter. |
| `disabled` | `boolean` | `false` | Disables the control. |
| `className` | `string` | — | Classes on the input — the combobox's primary surface. |
| `popupClassName` | `string` | — | Classes on the popup panel — the combobox's second surface. |
| ...rest | `React.InputHTMLAttributes<HTMLInputElement>` (minus `onChange`/`value`/`defaultValue`) | — | Spread onto the input, plus a forwarded ref to it. |

`ComboboxOption`: `value: string`, `label: string`, `description?: string`
(secondary line under the label in the list), `disabled?: boolean`.

The searchable picker built on `@base-ui/react/combobox` rather than
`@base-ui/react/autocomplete` — Autocomplete's `value` is a free-text query
string with no selection concept, which doesn't fit this component's
`string | null` committed-value contract.

```tsx
<Combobox
    options={sources.map((s) => ({ value: s.id, label: s.name, description: s.state }))}
    value={sourceId}
    onChange={setSourceId}
    placeholder="Find a source…"
    allowCustom
/>
```

### Overlay

#### Dialog

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | Controlled open state. |
| `onOpenChange` | `(open: boolean) => void` | — | Called on any close (Escape, backdrop, programmatic). |
| `title` | `string` | — | Required. The dialog's accessible name, rendered as the heading unless `hideTitle`. |
| `hideTitle` | `boolean` | `false` | Visually hides the title while keeping it as the accessible name. |
| `description` | `string` | — | Optional supporting text under the title. |
| `width` | `string` | `'w-96'` | Tailwind width utility for the popup. |
| `children` | `React.ReactNode` | — | Body content. |
| `footer` | `React.ReactNode` | — | Rendered right-aligned below the body, typically action buttons. |
| `alert` | `boolean` | `false` | Renders through `@base-ui/react/alert-dialog`: `role="alertdialog"`, always modal, backdrop cannot dismiss. Intended for `ConfirmDialog`. |
| `onPopupKeyDown` | `React.KeyboardEventHandler<HTMLDivElement>` | — | Forwarded to the popup element. |
| `initialFocus` | `React.RefObject<HTMLElement \| null>` | — | Forwarded to the popup's `initialFocus`. |
| `className` | `string` | — | Classes on the popup — the dialog's primary surface (not the portal or backdrop). |
| ...rest | `React.HTMLAttributes<HTMLDivElement>` (minus `title`/`onKeyDown`, which already have dedicated meanings above) | — | Spread onto the popup, plus a forwarded ref to it. |

```tsx
const [open, setOpen] = useState(false);

<Dialog
    open={open}
    onOpenChange={setOpen}
    title="Rename source"
    description="Choose a new name for this source."
    footer={
        <>
            <button type="button" onClick={() => setOpen(false)}>Cancel</button>
            <button type="button" onClick={() => setOpen(false)}>Save</button>
        </>
    }
>
    <input defaultValue="Wake County parcels" />
</Dialog>
```

#### CommandPalette

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | Controlled open state. |
| `onOpenChange` | `(open: boolean) => void` | — | Called on Escape, backdrop click, or when the caller should close it. |
| `query` | `string` | — | Controlled input value. The caller filters/ranks with it. |
| `onQueryChange` | `(query: string) => void` | — | |
| `sections` | `CommandPaletteSection[]` | — | `{ title?, items }` blocks; empty sections render nothing. |
| `label` | `string` | `'Command palette'` | Accessible name of the dialog (visually hidden). |
| `placeholder` | `string` | `'Type a command or search…'` | |
| `emptyMessage` | `React.ReactNode` | `'No matches'` | Shown when every section is empty. |
| `selectedIndex` / `onSelectedIndexChange` | `number` / `(index) => void` | uncontrolled | Controlled selection across all sections. Uncontrolled, the palette resets to the first row whenever `query` changes. |
| `onInputKeyDown` | `KeyboardEventHandler` | — | Runs before the palette's own handling. `preventDefault()` claims the key: arrows/Enter are skipped, and a claimed Escape keeps the palette open. |
| `inputProps` | `InputHTMLAttributes` (minus value/onChange/onKeyDown/placeholder) | — | Spread onto the input — `data-testid`, `spellCheck`, `aria-*`. |
| `inputRef` | `Ref<HTMLInputElement>` | — | |
| `width` | `string` | `'w-[min(600px,calc(100vw-2rem))]'` | Tailwind width utility for the popup. |
| `children` | `React.ReactNode` | — | Rendered inside the popup after the list. A `ConfirmDialog` here nests, so Escape/backdrop close only the confirm. |
| `className` / ...rest | | | Land on the popup, plus a forwarded ref to it. |

`CommandPaletteItem`: `{ id, label, hint?, shortcut?: string[], destructive?, nested?, href?, onSelect, testId? }`.
Rows are `<button>`s carrying `data-testid` (`testId`, else `palette-item-<id>`) and
`data-selected="true"` on the current one. `shortcut` renders through `Kbd`; `nested`
indents a row under its predecessor (a result's child actions). Give a row that
navigates an `href` and it renders as an `<a>`: ⌘/Ctrl/Shift-click and middle-click
open it in a new tab through the browser, while a plain click and Enter still call
`onSelect` so the app can route it (Inertia visit, recents bookkeeping, closing the
palette).

The shell of a ⌘K palette — top-anchored modal, search input, sectioned list,
arrow/Enter/hover selection, scroll-into-view — with none of the data. Each app
owns filtering, ranking, fetching and what a row does; that is the part that
differed between the three palettes this replaces.

```tsx
<CommandPalette
    open={open}
    onOpenChange={setOpen}
    query={query}
    onQueryChange={setQuery}
    sections={[
        { title: 'Navigate', items: pages.map((p) => ({ id: p.id, label: p.label, hint: 'page', onSelect: () => go(p) })) },
    ]}
>
    <ConfirmDialog open={pending !== null} destructive={false} … />
</CommandPalette>
```

#### ConfirmDialog

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | Controlled open state. |
| `onOpenChange` | `(open: boolean) => void` | — | Called on any close. |
| `title` | `string` | — | The dialog's accessible name. |
| `body` | `React.ReactNode` | — | Name the target and the consequence, not "Are you sure?". |
| `confirmLabel` | `string` | — | Label for the confirm button. |
| `onConfirm` | `() => void` | — | Called on confirm (click or Enter). |
| `busy` | `boolean` | `false` | Blocks re-entry and disables both buttons while the action is in flight. |
| `destructive` | `boolean` | `true` | Destructive (red) vs. accent styling for the confirm button. |
| `confirmTestId` | `string` | — | `data-testid` for the confirm button, so tests click it by id rather than by `confirmLabel`. |
| `cancelTestId` | `string` | — | `data-testid` for the cancel button. |
| `className` | `string` | — | Forwarded straight through to `Dialog`, landing on its popup. |
| ...rest | `React.HTMLAttributes<HTMLDivElement>` (minus `title`/`onKeyDown`) | — | Forwarded to `Dialog` the same way, plus a forwarded ref to its popup. |

```tsx
<ConfirmDialog
    open={open}
    onOpenChange={setOpen}
    title="Delete Wake County parcels"
    body="This permanently deletes the source and every build that used it. This cannot be undone."
    confirmLabel="Delete"
    onConfirm={() => {
        deleteSource();
        setOpen(false);
    }}
/>
```

#### Sheet

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | Controlled open state. |
| `onOpenChange` | `(open: boolean) => void` | — | Called on any close. |
| `title` | `string` | — | The sheet's accessible name. |
| `hideTitle` | `boolean` | `false` | Visually hides the title while keeping it as the accessible name. |
| `side` | `'right' \| 'bottom'` | `'right'` | Which edge it enters from. `'bottom'` is the mobile pattern. |
| `width` | `string` | `'w-[480px]'` | Tailwind width utility, used only when `side='right'`. |
| `children` | `React.ReactNode` | — | Body content. |
| `className` | `string` | — | Classes on the popup panel — the sheet's primary surface. |
| ...rest | `React.HTMLAttributes<HTMLDivElement>` (minus `title`) | — | Spread onto that panel, plus a forwarded ref to it. |

```tsx
<Sheet open={open} onOpenChange={setOpen} title="Source details" side="right">
    <p>Details for the selected source.</p>
</Sheet>
```

#### Menu

| Prop | Type | Default | Description |
|---|---|---|---|
| `trigger` | `React.ReactNode` | — | The trigger button's content (icon/label). Not another interactive element — `Menu.Trigger` is itself the real `<button>`. |
| `className` | `string` | — | Classes on the trigger button itself (the menu's primary, always-present surface), for non-uniform triggers (pill filters, icon buttons). Merged with `cn`, not a replacement. |
| `popupClassName` | `string` | — | Classes on the popup panel — the menu's second surface. |
| `items` | `MenuItemSpec[]` | — | The menu's contents. |
| `header` | `string` | — | Optional label rendered above the items. |
| `align` | `'start' \| 'end'` | `'start'` | Popup alignment against the trigger. |
| ...rest | `React.ButtonHTMLAttributes<HTMLButtonElement>` | — | Spread onto `Menu.Trigger`, plus a forwarded ref to that same button. |

`MenuItemSpec`: `key`, `label`, `icon?`, `dividerAbove?`, `danger?`, `checked?`
(renders a checkable item), `keepOpen?` (keep the menu open after selecting),
`disabled?`, `testId?`, `submenu?: MenuItemSpec[]`, `onSelect?`.

```tsx
<Menu
    trigger={<span>Actions</span>}
    items={[
        { key: 'edit', label: 'Edit', onSelect: () => edit() },
        {
            key: 'pin',
            label: 'Pin to top',
            checked: pinned,
            keepOpen: true,
            onSelect: () => setPinned((v) => !v),
        },
        {
            key: 'move',
            label: 'Move to',
            submenu: [{ key: 'a', label: 'Folder A', onSelect: () => move('a') }],
        },
        { key: 'delete', label: 'Delete', danger: true, dividerAbove: true, onSelect: () => remove() },
    ]}
/>
```

#### Tooltip

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | The tooltip text. Becomes the trigger's accessible description. |
| `delay` | `number` | `400` | Delay before showing, in ms. |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` | Popup placement. |
| `children` | `React.ReactElement` | — | The single element the tooltip describes. Passed as Base UI's `render` prop, so it must be exactly one element, not a fragment of several. |
| `className` | `string` | — | Classes on the popup — the tooltip's primary surface (not the positioner or portal). |
| ...rest | `React.HTMLAttributes<HTMLDivElement>` (minus `id`, which this component generates itself to wire `aria-describedby`) | — | Spread onto the popup, plus a forwarded ref to it. |

```tsx
<Tooltip label="Create a new source">
    <button type="button">New source</button>
</Tooltip>
```

#### Toast

`toast` is a plain object, callable from anywhere — a React component or a
plain module. `ToastHost` is a component, mounted once at the app root.

| Export | Description |
|---|---|
| `toast.success(title, options?)` | Raises a success toast. |
| `toast.error(title, options?)` | Raises an error toast, rendered `role="alertdialog"` and announced urgently. |
| `toast.info(title, options?)` | Raises an info toast. |
| `ToastHost({ limit?, defaultDurationMs?, className?, ...rest })` | Renders the stacked viewport. `limit` caps concurrent toasts (Base UI default 3). `defaultDurationMs` sets the auto-dismiss duration (ms) for any toast that doesn't pass its own `durationMs` (Base UI's own default: 5000). `className`/rest land on `Toast.Viewport` — the one element this component always renders, toasts or none, and the thing an app restyles first (e.g. moving the stack to top-center) — plus a forwarded ref to it. Mount once, anywhere in the tree. |

`ToastOptions`: `description?: string`, `durationMs?: number | null` (`null`
keeps it until dismissed; omitted uses Base UI's own 5000ms default),
`action?: { label: string; onClick: () => void }`.

```tsx
// App root, once:
<ToastHost />

// Anywhere, including a plain module with no React involved:
import { toast } from '@geocodio/console-ui';

toast.success('Source saved');
toast.error('Build failed', { description: 'See the log for details.' });
toast.info('Source archived', {
    action: { label: 'Undo', onClick: () => restoreSource(id) },
});
```

Built on `@base-ui/react/toast`'s `createToastManager`, which is why this
component ships with no event-bus of its own: a manager created outside
React can be called from anywhere, which is the one thing a hand-rolled
`window` `CustomEvent` toast bus would otherwise exist for. A
server-deadline undo countdown is deliberately not included — it is domain
behaviour (a draining progress bar against a server-supplied ISO timestamp),
not a toast primitive, and belongs app-side, built on `action` plus the
caller's own timer.

### Display

#### Badge

| Prop | Type | Default | Description |
|---|---|---|---|
| `tone` | `BadgeTone` | `'neutral'` | Colour: `'neutral'`, `'ok'`, `'warn'`, `'fail'`, `'info'`, `'accent'`. |
| `children` | `React.ReactNode` | — | The label content. |
| ...rest | `React.HTMLAttributes<HTMLSpanElement>` | — | Spread onto the `<span>`, plus a forwarded ref to it. |

Tones map to the package's semantic tokens rather than hue names, so it
composes with `StatusPill` and the rest of the token system.

```tsx
<Badge tone="ok">Active</Badge>
```

#### EmptyState

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | — | The heading. |
| `body` | `string` | — | Supporting text. |
| `icon` | `React.ReactNode` | — | Optional mark above the title — an app's own branding slot. |
| `action` | `React.ReactNode` | — | Optional way out of the dead end, usually a `Button`. |
| ...rest | `React.HTMLAttributes<HTMLDivElement>` | — | Spread onto the root `<div>`, plus a forwarded ref to it. |

```tsx
<EmptyState
    title="No sources yet"
    body="Add a source to start building an address database for this county."
    action={<Button variant="primary" onClick={addSource}>Add source</Button>}
/>
```

#### Kbd

| Prop | Type | Default | Description |
|---|---|---|---|
| `keys` | `string[]` | — | Already-parsed key labels, one per keycap. The caller parses its own shortcut strings; this component only renders the result. |
| ...rest | `React.HTMLAttributes<HTMLSpanElement>` | — | Spread onto the outer `<span>`, plus a forwarded ref to it. |

```tsx
<Kbd keys={['⌘', 'K']} />
```

#### Skeleton

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | — | Sizes the block, e.g. `'h-4 w-32'`. |
| ...rest | `React.HTMLAttributes<HTMLDivElement>` | — | Spread onto the `<div>`, plus a forwarded ref to it. |

A pulsing placeholder block. Its animation is disabled under
`prefers-reduced-motion: reduce` by the package's global rule in
`base.css`, not by anything in this component.

```tsx
<Skeleton className="h-4 w-32" />
```

#### Spinner

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `SpinnerSize` | `'sm'` | `'sm'` or `'md'`. |
| `label` | `string` | — | Announced to screen readers as `role="status"`. Omit when adjacent text already says what is loading — with no `label` the spinner is `aria-hidden` instead, since announcing both would be worse than announcing neither. |
| ...rest | `React.HTMLAttributes<HTMLSpanElement>` | — | Spread onto the `<span>` before `role`/`aria-label`/`aria-hidden` are applied, so a stray same-named attribute can't clobber them, plus a forwarded ref to it. |

```tsx
<Spinner size="md" label="Loading sources" />
```

#### StatusPill

| Prop | Type | Default | Description |
|---|---|---|---|
| `tone` | `StatusPillTone` | — | Required. `'ok'`, `'warn'`, `'fail'`, `'info'`, or `'idle'`. |
| `label` | `string` | — | Required. The dot never carries meaning alone. |
| ...rest | `React.HTMLAttributes<HTMLSpanElement>` | — | Spread onto the `<span>`, plus a forwarded ref to it. |

A caller maps its own domain status (a build state, a ticket status) to a
tone and label before rendering this — that mapping stays app-side.

```tsx
<StatusPill tone="ok" label="Running" />
```

#### Table, Thead, Tbody, Tr, Th, Td

Presentational table parts, headless of any data library — a caller keeps
its own data-table wiring (TanStack Table or otherwise) and feeds these
components plain markup.

`Table`, `Thead`, `Tbody`, `Th` and `Td` take only their native HTML
attributes (`React.TableHTMLAttributes<HTMLTableElement>`,
`React.HTMLAttributes<HTMLTableSectionElement>`,
`React.ThHTMLAttributes<HTMLTableCellElement>`,
`React.TdHTMLAttributes<HTMLTableCellElement>` respectively) plus
`className`, and add no props of their own. Each forwards a ref to its own
element. `Td` deliberately does not default to `font-mono` — a caller
wanting monospace columns (build IDs, coordinates) passes
`className="font-mono"`.

`Tr` adds two props on top of `React.HTMLAttributes<HTMLTableRowElement>`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `selected` | `boolean` | `false` | Row is selected. Sets `aria-selected` as well as the visual state, so the signal isn't colour-only. |
| `interactive` | `boolean` | `false` | Row responds to clicks — adds the pointer affordance and hover state. Does **not** add `tabIndex` or key handling: a row that is only mouse-clickable, with no focusable descendant, is a gap this leaves to the caller (add `tabIndex={0}`, `role="button"`, and a key handler, or wrap a real link/button as the row's primary target). |
| ...rest | `React.HTMLAttributes<HTMLTableRowElement>` | — | Spread onto the `<tr>`, plus a forwarded ref to it. |

```tsx
<Table>
    <Thead>
        <Tr>
            <Th>Source</Th>
            <Th>Status</Th>
        </Tr>
    </Thead>
    <Tbody>
        {sources.map((source) => (
            <Tr key={source.id} interactive onClick={() => open(source.id)}>
                <Td>{source.name}</Td>
                <Td>
                    <StatusPill tone={source.tone} label={source.status} />
                </Td>
            </Tr>
        ))}
    </Tbody>
</Table>
```

### Layout

#### SettingsShell

Full-window, Linear-style settings chrome: a sidebar (back link, search, icon
nav grouped in sections) beside a narrow content column that renders the
current item's title and description over `children`. Below `lg` the sidebar
folds into a drawer behind a header button. Router-agnostic — links render
through `LinkComponent` (a plain `<a>` by default) and the current path is a
prop, so an Inertia app passes its `Link` and `usePage().url`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `sections` | `SettingsNavSection[]` | — | Required. `{ title, items }`; each item is `{ slug, href, label, description?, icon?, keywords?, rows? }` and each row `{ id, label, keywords? }`. Filter the array before passing it (e.g. drop admin-only sections for non-admins). |
| `slug` | `string` | — | Required. The item whose page is being shown; drives the header and `aria-current="page"`. An unknown slug renders no header rather than throwing. |
| `currentPath` | `string` | — | Required. The current pathname without query or hash; an item is active when `item.href === currentPath`. |
| `backHref` | `string` | `'/'` | Where the back link lands when nothing was remembered (below). |
| `backLabel` | `string` | `'Back to app'` | The back link's text. |
| `returnToStorageKey` | `string \| null` | `'settings.return-to'` | `sessionStorage` key the back link reads on mount; a stored value wins over `backHref`. `null` disables the lookup. |
| `LinkComponent` | `React.ComponentType<SettingsLinkProps>` | `<a>` | Renders every link (back, items, row deep links). Receives `href`, `className`, `children`, `onClick`, `aria-current`, `data-testid` — a subset Inertia's `Link` accepts as-is. |
| `onNavigate` | `(href: string) => void` | `window.location.assign` | Runs when Enter is pressed in the search box with at least one hit. Inertia apps pass `router.visit`. |
| `wide` | `boolean` | `false` | Swaps the `max-w-2xl` reading column for `max-w-6xl` — for pages that are editors rather than forms. |
| `searchPlaceholder` | `string` | `'Search settings…'` | Placeholder and accessible name of the search box. |
| `noResultsLabel` | `string` | `'No settings match.'` | Shown in place of results when the query matches nothing. |
| `mobileTitle` | `string` | `'Settings'` | Label of the header button that opens the drawer below `lg`, and the drawer's accessible name. |
| `backIcon`, `searchIcon`, `menuIcon` | `React.ReactNode` | inline SVGs | Slots for the three marks the shell draws itself; the per-item icon comes from `item.icon`. |
| ...rest | `React.HTMLAttributes<HTMLDivElement>` | — | Spread onto the outer `flex h-dvh w-screen` root, plus a forwarded ref. `className` merges via `cn`, so `h-full w-full` un-pins it from the viewport when the shell is embedded. |

Search goes through the exported pure helper `searchSettingsNav(sections,
query)`: an item is a hit when the query (case-insensitive, trimmed) is a
substring of its `label` or any `keywords` entry, or of any row's; a hit
lists its matching rows as deep links to `${href}#${row.id}`. Pressing Enter
visits the top hit via `settingsSearchHitHref` — the item itself when its own
label/keywords matched, otherwise the first matching row's deep link.
`Escape` clears the query. The shell does no scrolling of its own: pages put
`id={row.id}` on the row's element and the browser's hash navigation lands
on it. `findSettingsNavItem(sections, slug)` is exported too.

The back link's return path is stamped by the app, not the shell — call
`rememberSettingsReturnPath(url)` (or write `sessionStorage` under
`SETTINGS_RETURN_TO_STORAGE_KEY` yourself) on every navigation that is not
inside settings. Storage failures (private mode, disabled) fall back to
`backHref` silently.

Test hooks: `settings-sidebar`, `settings-back-to-app`, `settings-search`,
`settings-search-results`, `settings-nav-section`, `settings-nav-<slug>`,
`settings-search-row-<id>`, `settings-mobile-nav`, `settings-mobile-drawer`
— stable `data-testid`s for browser tests to target.

```tsx
import { Link, router, usePage } from '@inertiajs/react';
import { SettingsShell, type SettingsNavSection } from '@geocodio/console-ui';

const SECTIONS: SettingsNavSection[] = [
    {
        title: 'Personal',
        items: [
            {
                slug: 'profile',
                href: '/settings/profile',
                label: 'Profile',
                icon: <Icon name="mine" className="h-[15px] w-[15px] shrink-0" />,
                description: 'Your personal signature.',
                keywords: ['signature', 'email'],
                rows: [{ id: 'signature', label: 'Signature', keywords: ['sign-off'] }],
            },
        ],
    },
];

<SettingsShell
    sections={SECTIONS}
    slug="profile"
    currentPath={usePage().url.split('#')[0].split('?')[0]}
    LinkComponent={Link}
    onNavigate={(href) => router.visit(href)}
>
    <ProfileForm />
</SettingsShell>
```

## Conventions

Three things learned the hard way, kept here so they don't have to be
rediscovered:

- **Every component takes `className`, spreads rest props, and forwards a
  ref onto its one primary visual element** — the popup for an overlay, the
  outer `<label>` for `Checkbox`, `Switch.Root` for `Toggle`, and so on. A
  component with a second meaningful surface (a popup behind a trigger, say)
  gets a named prop for it instead of overloading `className` —
  `className` for the trigger (Menu's primary surface) and `popupClassName`
  for the popup (its second surface) on `Menu`, `Select` and `Combobox`.
  This grew out of a concrete
  cost: before this policy, the playground had to wrap `Checkbox`, `Toggle`
  and `Badge` in an extra `<div data-testid>` because there was nowhere on
  the component itself to put one, and every consuming app would have hit
  the same workaround. `className` is always merged with `cn` (below), never
  string-concatenated, and never simply replaced by the caller's value.
  **Rest props are always spread onto the element BEFORE this component's
  own explicit props that share a name are applied** — not after — so a
  caller's incidental prop of the same name is silently overridden by this
  component's own contract instead of silently overriding it. This matters
  most for a controlled component's own state (`Checkbox`/`RadioGroup`/
  `Toggle`/`Select`/`Combobox`'s `checked`/`value`/`onChange`/`disabled`) and
  for a component's own accessibility contract that depends on a required
  prop (`IconButton`'s `aria-label`, `Spinner`'s `role`/`aria-label`/
  `aria-hidden`, `Button`'s `aria-busy`, `Skeleton`'s `aria-hidden`). It's
  harmless for `className` specifically, since `className` is always
  destructured out before `rest` is spread and merged separately via `cn` —
  but the ordering is applied uniformly across every component regardless,
  so there's one rule instead of a per-component judgment call. The one
  exception with a real reason: `Dialog`/`ConfirmDialog`/`Sheet` exclude
  native `title` (and `Dialog`/`ConfirmDialog` also exclude `onKeyDown`) from
  their spreadable rest type entirely, because `title` already names each
  component's accessible-name string prop and `onKeyDown` already has a
  named equivalent (`onPopupKeyDown`) — extending them would let a
  same-named native attribute type-check while silently doing nothing,
  rather than reaching the DOM as a caller would expect. `ToastHost` is the
  only component where rest lands on an element with no props of its own
  besides `className`/rest (`Toast.Viewport`, the one node it always
  renders, toasts or none) rather than on something driven by app data.
- **Route every class composition through `cn`** (`src/lib/cn.ts`), not
  string concatenation. `cn` wraps `tailwind-merge`, extended with this
  package's own `@theme` scale values (the `--radius-*`/`--color-*`/
  `--shadow-*`/`--animate-*` tokens registered in `tokens.css` and
  `animations.css`) — verified empirically against the installed 3.6.0 that
  without that extension, `tailwind-merge`'s bundled config does not
  recognise e.g. `rounded-control` as conflicting with `rounded-full`, or
  `animate-spinner-spin` with `animate-none`, since it only knows Tailwind's
  own stock scale values. Plain concatenation (`` `${BASE} ${className ??
  ''}` ``, this package's pattern before `cn` existed) puts both a
  component's own class and a caller's conflicting one in the class list
  with no resolution — which one visually wins is then decided by their
  order in the compiled stylesheet, not by the caller's evident intent to
  override, and `className` support that doesn't reliably let you override
  is worse than none. `cn` is exported from the package root for apps
  composing their own components on these same tokens, so they don't have to
  solve the identical merge problem a second time.
- **Never put `outline-none` on a focusable element** unless a non-outline
  focus indicator is guaranteed (as `Menu` items do with
  `data-[highlighted]:bg-panel-2`). Tailwind v4's layer order is fixed —
  `base` before `utilities` — so an `outline-none` utility always beats this
  package's global `:focus-visible` ring (`styles/base.css`) regardless of
  source order. This shipped a menu trigger with no visible focus state at
  all until it was caught. The sanctioned exception is the **form-control
  category**, not a fixed list of components: `TextInput`, `Textarea`,
  `Select`, `Combobox`, `Checkbox` and `RadioGroup` all pair their
  `outline-none` with the accent border plus a 3px `accent-soft` box-shadow
  ring, which together are the real indicator — and any component added to
  that category later inherits the same obligation, not just the same
  license. Naming components here would drift the moment the next one
  shipped, since nothing would force this list to grow with it; naming the
  category instead makes the rule self-maintaining. Every such use must
  carry a comment at the `outline-none` explaining why it's safe, and a test
  asserting a visible focus indicator — so nobody "fixes" an `outline-none`
  they find without realizing it's load-bearing, and so a new form control
  copying the pattern without both of those isn't actually finished.
- **Base UI does not uniformly wire ARIA between a component's parts.**
  `Dialog` sets `aria-labelledby`/`aria-describedby` itself, but `Tooltip`
  sets no `aria-describedby` or `role="tooltip"` at all — that association is
  written explicitly in `Tooltip.tsx` with a shared `useId()`. Don't assume a
  new Base UI-backed component gets this for free; assert accessible
  name/description in tests for every component that needs one. `Field` is
  an example that DOES wire it all itself (label, description, error, and
  `aria-invalid` all reach `TextInput`/`Textarea`/`Select` automatically), confirmed by
  reading the installed 1.7.0 source, not assumed. `Toast` is another
  example that wires itself: `Toast.Viewport` sets
  `role="region"`/`aria-live="polite"`/`aria-relevant="additions text"`, and
  `Toast.Root` sets `role="dialog"` (or `"alertdialog"` for a high-priority
  toast) with `aria-labelledby`/`aria-describedby` pointed at `Toast.Title`/
  `Toast.Description`'s own generated ids — all confirmed by reading the
  installed 1.7.0 source.

## Entry points

| Import | Contents |
|---|---|
| `@geocodio/console-ui` | React components |
| `@geocodio/console-ui/styles.css` | All-in-one: tokens + fonts + base + animations + overlays |
| `@geocodio/console-ui/tokens.css` | Custom properties and `@theme` mapping only |
| `@geocodio/console-ui/base.css` | Body, focus ring, cursors, reduced-motion |
| `@geocodio/console-ui/fonts.css` | IBM Plex Sans + Mono via `@fontsource` |
| `@geocodio/console-ui/animations.css` | `animate-*` utilities |
| `@geocodio/console-ui/overlays.css` | `.ui-popup`, `.ui-floating`, `.ui-sheet-right`, `.ui-sheet-bottom`, `.ui-toast` transitions |
| `@geocodio/console-ui/strict-palette.css` | **Opt-in.** Deletes Tailwind's stock palette. Import BEFORE `styles.css`/`tokens.css` — see below |

`strict-palette.css` must be imported **before** the package's tokens, not
after. `--color-*: initial` is a wildcard reset: it wipes every `--color-*`
custom property registered before it in the cascade. This package registers
its own colours via an `@theme inline` block in `tokens.css`/`styles.css`, so
importing `strict-palette.css` after them deletes this package's colours too
— silently. There's no build error; every colour utility (Tailwind's stock
palette and this package's tokens alike) just stops existing.

```css
@import 'tailwindcss';
@import '@geocodio/console-ui/strict-palette.css';  /* before the tokens it must not wipe */
@import '@geocodio/console-ui/styles.css';
@source '../../node_modules/@geocodio/console-ui/dist';
```

## Theming

Light and dark follow the OS. Nothing in the package sets a theme, and no
JavaScript is involved — the correct theme paints on the first byte.

An app that wants a manual override stamps `data-theme="light"` or
`data-theme="dark"` on `<html>`. To avoid a flash, stamp it from a blocking
inline script in `<head>`, before first paint.

## Playground

```bash
npm run build && cd playground && npm install && npm run dev
```

The playground consumes the package the way a real app does. If something works
in the playground it works in an app; if it only works via a relative import,
it is broken.

## Publishing

Tag a release on `main`:

```bash
npm version patch   # or minor / major
git push --follow-tags
```

The `vX.Y.Z` tag triggers CI, which publishes the package to npmjs.com with
provenance.
