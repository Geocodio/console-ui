import type React from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/cn.js';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    body: string;
    /** Any mark, taken as a slot rather than welded in, since a mascot or logo is app branding. */
    icon?: React.ReactNode;
    /** Optional way out of the dead end -- usually a Button. */
    action?: React.ReactNode;
}

/**
 * Title, body and optional action rather than bare centred text -- the
 * richer shape is the better default. An animated mascot mark is
 * app-specific branding, so it comes in through the `icon` slot instead of
 * being welded in.
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
    { title, body, icon, action, className, ...rest },
    ref,
) {
    return (
        <div
            ref={ref}
            {...rest}
            className={cn('flex flex-col items-center justify-center gap-3 py-16 text-center', className)}
        >
            {icon}
            <p className="text-[15px] font-semibold text-body">{title}</p>
            <p className="max-w-[42ch] text-[13px] text-muted">{body}</p>
            {action && <div className="mt-1">{action}</div>}
        </div>
    );
});
