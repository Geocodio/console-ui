import { Field as BaseField } from '@base-ui/react/field';
import type React from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/cn.js';

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
    label: string;
    /** Helper text under the control. */
    description?: string;
    /** Error text; when present the control shows its invalid state. */
    error?: string;
    children: React.ReactNode;
}

/**
 * Labels a control (`TextInput`, `Select`, or any other Base UI-compatible
 * control) and associates a label, an optional description, and an optional
 * error with it -- the hand-rolled `<label>`-wraps-everything pattern,
 * replaced by Base UI's `Field` module.
 *
 * Unlike `Tooltip` (this package's other Base UI-backed
 * association), `Field` DOES wire its ARIA relationships itself -- confirmed
 * against the installed 1.7.0 by reading `FieldControl`/`SelectTrigger`
 * source, not assumed:
 *
 * - `Field.Label` registers its id through a shared `LabelableProvider`
 *   context; `Field.Control` and `Select.Trigger` both read it back as
 *   `aria-labelledby`.
 * - `Field.Description` and `Field.Error` each register their id in that
 *   same context's `messageIds` while mounted; the control's
 *   `validation.getValidationProps()` folds every registered id into
 *   `aria-describedby`, so description and error (when rendered) are both
 *   reachable as the control's accessible description.
 * - `Field.Root`'s `invalid` prop drives `state.valid`, which
 *   `getValidationProps()` also reads to set `aria-invalid` on the control.
 *
 * So no manual `useId()` wiring is needed here, in contrast to `Tooltip`.
 *
 * Error and description are mutually exclusive in the rendered output --
 * showing both at once would double the vertical space every field takes and
 * the error already supersedes the description as the thing the user needs
 * to read. `Field.Error`'s own default visibility rule (tied to computed
 * validity, not the `invalid` prop) is bypassed with `match` so it renders
 * exactly when this component decides to mount it.
 *
 * `className`/rest land on `Field.Root`, the outer wrapper every label,
 * control and message shares -- the component's one meaningful surface.
 */
export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
    { label, description, error, children, className, ...rest },
    ref,
) {
    return (
        <BaseField.Root ref={ref} {...rest} invalid={!!error} className={cn('flex flex-col gap-1.5', className)}>
            <BaseField.Label className="text-[12px] font-medium text-muted">{label}</BaseField.Label>
            {children}
            {error ? (
                <BaseField.Error match className="text-[11.5px] text-fail">
                    {error}
                </BaseField.Error>
            ) : description ? (
                <BaseField.Description className="text-[11.5px] text-muted">{description}</BaseField.Description>
            ) : null}
        </BaseField.Root>
    );
});
