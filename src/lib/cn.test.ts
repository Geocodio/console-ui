import { expect, test } from 'vitest';
import { cn } from './cn';

test('a later conflicting utility wins over an earlier one in the same group', () => {
    expect(cn('px-3', 'px-10')).toBe('px-10');
});

test('this package\'s own theme-scale utilities are recognised as conflicting, not just Tailwind\'s stock scale', () => {
    expect(cn('rounded-control', 'rounded-full')).toBe('rounded-full');
    expect(cn('bg-panel-2', 'bg-accent')).toBe('bg-accent');
    expect(cn('shadow-card', 'shadow-none')).toBe('shadow-none');
    expect(cn('animate-spinner-spin', 'animate-none')).toBe('animate-none');
});

test('non-conflicting classes are preserved together', () => {
    expect(cn('flex items-center', 'gap-2')).toBe('flex items-center gap-2');
});

test('falsy inputs are dropped without producing stray whitespace', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
});
