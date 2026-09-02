import { Field as BaseField } from '@base-ui/react/field';
import type React from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/cn.js';
import { TEXT_CONTROL } from './controlClasses.js';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

type ControlProps = React.ComponentProps<typeof BaseField.Control>;

/**
 * The multi-line sibling of `TextInput`. A raw `<textarea>` inside a `Field`
 * has no accessible name -- `Field` only labels controls that join Base UI's
 * field context -- so this renders through `Field.Control`'s `render` prop,
 * which swaps the underlying `<input>` for a `<textarea>` while keeping every
 * prop `Field.Control` computes: `id`, `aria-labelledby`, `aria-describedby`,
 * `aria-invalid`, and the change/focus/blur handlers that drive dirty, touched
 * and filled state. Confirmed against the installed 1.7.0 `FieldControl`
 * source: its props are merged onto whatever `render` supplies, and its
 * Enter-to-commit handler already checks `tagName === 'INPUT'` so a textarea
 * keeps Enter for newlines.
 *
 * `Field.Control` is typed for an `<input>`, so the textarea-only props
 * (`rows`, `cols`, `wrap`) and the ref are cast across. The runtime spreads
 * them onto the real `<textarea>` unchanged.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
    { className, ...rest },
    ref,
) {
    return (
        <BaseField.Control
            render={<textarea />}
            ref={ref as React.Ref<HTMLInputElement>}
            {...(rest as ControlProps)}
            className={cn(TEXT_CONTROL, 'min-h-20 resize-y py-1.5 leading-normal', className)}
        />
    );
});
