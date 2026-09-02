import type React from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/cn.js';

export interface KbdProps extends React.HTMLAttributes<HTMLSpanElement> {
    /**
     * Already-parsed key labels, one per keycap (e.g. `['⌘', 'K']`).
     * This takes labels rather than a shortcut string because a shortcut
     * parser is app-specific and does not belong in a shared package; each
     * app parses its own shortcut strings and hands this component the result.
     */
    keys: string[];
}

const MODIFIER_GLYPHS = '⌘⇧⌥⌃↵↑↓';

/** A row of keycaps for a keyboard shortcut, e.g. `<Kbd keys={['⌘', 'K']} />`. */
export const Kbd = forwardRef<HTMLSpanElement, KbdProps>(function Kbd({ keys, className, ...rest }, ref) {
    return (
        <span ref={ref} {...rest} className={cn('flex gap-1', className)}>
            {keys.map((key, keyIndex) => (
                <kbd
                    // biome-ignore lint/suspicious/noArrayIndexKey: `keys` is a fixed, non-reorderable list of keycap labels for one render -- there is no stable identity to key by other than position.
                    key={keyIndex}
                    className="inline-flex min-w-[21px] items-center justify-center whitespace-nowrap rounded-chip border border-hair-strong border-b-2 bg-panel-2 px-1.5 py-px text-[11.5px] font-medium leading-[18px] text-muted"
                >
                    {Array.from(key).map((char, charIndex) =>
                        MODIFIER_GLYPHS.includes(char) ? (
                            // biome-ignore lint/suspicious/noArrayIndexKey: same reasoning -- a fixed, non-reorderable sequence of characters within one keycap.
                            <span key={charIndex} className="text-[15px] leading-[18px]">
                                {char}
                            </span>
                        ) : (
                            char
                        ),
                    )}
                </kbd>
            ))}
        </span>
    );
});
