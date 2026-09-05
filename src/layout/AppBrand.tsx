import type React from 'react';
import { createElement, forwardRef } from 'react';
import { cn } from '../lib/cn.js';
import type { BrandMark } from './brandMark.js';

export interface BrandMarkIconProps extends React.SVGAttributes<SVGSVGElement> {
    mark: BrandMark;
    /** Rendered width and height in px. */
    size?: number;
}

/**
 * The mark as inline SVG. Fills with `currentColor`, so wrap it in `text-brand`
 * (the default) or any other text colour.
 */
export function BrandMarkIcon({ mark, size = 20, className, ...rest }: BrandMarkIconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox={mark.viewBox}
            fill="currentColor"
            aria-hidden="true"
            className={cn('shrink-0 text-brand', className)}
            {...rest}
        >
            {mark.shapes.map((shape, index) => createElement(shape.tag, { key: index, ...shape.attrs }))}
        </svg>
    );
}

/** The subset of anchor props the lockup hands to whatever renders its link. */
export interface AppBrandLinkProps {
    href: string;
    className?: string;
    children?: React.ReactNode;
    'aria-label'?: string;
}

const DefaultLink = forwardRef<HTMLAnchorElement, AppBrandLinkProps>(function DefaultLink(props, ref) {
    return <a ref={ref} {...props} />;
});

export interface AppBrandProps {
    /** The tool's display name, e.g. `'Atlas'`. */
    name: string;
    mark: BrandMark;
    /** Where the lockup links. Defaults to the app root. */
    href?: string;
    /** Renders the link; an Inertia app passes its `Link`. */
    LinkComponent?: React.ComponentType<AppBrandLinkProps>;
    /** Hides the name and shows the mark alone, for narrow rails. */
    compact?: boolean;
    className?: string;
}

/**
 * The corner lockup every tool opens its sidebar with: a 20px mark in the
 * app's brand colour beside its name. The sizes are fixed on purpose so the
 * tools line up when they sit in adjacent tabs.
 */
export function AppBrand({ name, mark, href = '/', LinkComponent = DefaultLink, compact = false, className }: AppBrandProps) {
    return (
        <LinkComponent
            href={href}
            {...(compact ? { 'aria-label': name } : {})}
            className={cn('flex h-7 items-center gap-2 no-underline text-brand', className)}
        >
            <BrandMarkIcon mark={mark} size={20} />
            {!compact && <span className="text-[13.5px] font-semibold tracking-tight text-body">{name}</span>}
        </LinkComponent>
    );
}
