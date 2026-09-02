import { Field as BaseField } from '@base-ui/react/field';
import type React from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/cn.js';
import { TEXT_CONTROL } from './controlClasses.js';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * The text input every form field in the system renders through. Built on
 * Base UI's `Field.Control` rather than a plain `<input>` so it participates
 * in `Field`'s label/description/error/invalid wiring when nested inside
 * one -- `Field.Control` falls back to a plain, uncontexted `<input>` when
 * there is no ancestor `Field.Root`, so this also works standalone.
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
    { className, ...rest },
    ref,
) {
    return <BaseField.Control ref={ref} {...rest} className={cn(TEXT_CONTROL, 'h-8', className)} />;
});
