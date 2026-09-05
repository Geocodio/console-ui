import { useEffect } from 'react';
import { type BrandFaviconOptions, type BrandMark, brandMarkDataUri } from './brandMark.js';

export interface BrandFaviconColor {
    light: string;
    dark: string;
}

export interface UseBrandFaviconOptions extends Omit<BrandFaviconOptions, 'pipBackground'> {
    /**
     * Tab-strip backgrounds the pip is knocked out of. A favicon cannot read
     * CSS custom properties, so these are literals; the defaults are the
     * package's light and dark `--panel` values.
     */
    pipBackground?: BrandFaviconColor;
}

const DEFAULT_PIP_BACKGROUND: BrandFaviconColor = { light: '#ffffff', dark: '#171819' };

function prefersDark(): boolean {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false;
}

function iconLink(): HTMLLinkElement {
    const existing = document.querySelector<HTMLLinkElement>('link[rel="icon"][data-brand-favicon]');
    if (existing) {
        return existing;
    }
    // Any static `<link rel="icon">` the page shipped for first paint keeps
    // its place; this one is inserted after it so it wins.
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.dataset.brandFavicon = '';
    document.head.appendChild(link);
    return link;
}

/**
 * Draws the app's mark as the tab favicon in its brand colour, following the
 * OS colour scheme (a tab strip follows the OS, not the page theme), with an
 * optional status pip. Pass `pip: null` for the plain mark.
 */
export function useBrandFavicon(mark: BrandMark, color: BrandFaviconColor, options: UseBrandFaviconOptions = {}): void {
    const { pip = null, pipBackground = DEFAULT_PIP_BACKGROUND } = options;

    useEffect(() => {
        if (typeof document === 'undefined') {
            return;
        }

        const paint = () => {
            const scheme = prefersDark() ? 'dark' : 'light';
            iconLink().href = brandMarkDataUri(mark, color[scheme], { pip, pipBackground: pipBackground[scheme] });
        };

        paint();

        if (typeof window.matchMedia !== 'function') {
            return;
        }
        const query = window.matchMedia('(prefers-color-scheme: dark)');
        query.addEventListener('change', paint);
        return () => query.removeEventListener('change', paint);
    }, [mark, color, pip, pipBackground]);
}
