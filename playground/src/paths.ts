/**
 * The playground is served from `/` in local dev and from `/console-ui/` on
 * GitHub Pages (`vite build --base=/console-ui/`). Every absolute link and
 * every pathname comparison goes through here so both deployments work
 * without either one knowing about the other.
 */

/** Vite's base with the trailing slash removed: '' locally, '/console-ui' on Pages. */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Prefix a root-relative path (`/tokens`) with the deployment base. */
export function href(path: string): string {
    return `${BASE}${path}`;
}

/** The current pathname with the deployment base stripped, so `/console-ui/tokens` matches as `/tokens`. */
export function routePath(): string {
    const { pathname } = window.location;
    if (BASE !== '' && (pathname === BASE || pathname.startsWith(`${BASE}/`))) {
        return pathname.slice(BASE.length) || '/';
    }
    return pathname;
}
