/**
 * An app's identity mark, defined once as data so the same shapes render as
 * React in the corner lockup and serialise to an SVG data URI for the tab
 * favicon. One flat colour, one closed silhouette: every fill and stroke is
 * `currentColor`, so the mark takes its colour from wherever it is placed.
 */
export type BrandMarkShapeTag = 'path' | 'circle' | 'ellipse' | 'rect' | 'line' | 'polygon';

export interface BrandMarkShape {
    tag: BrandMarkShapeTag;
    attrs: Record<string, string | number>;
}

export interface BrandMark {
    /** The drawing grid, e.g. `'0 0 64 64'`. */
    viewBox: string;
    /**
     * A tighter crop for the favicon, where the 16px tile has no room for the
     * padding the in-app lockup wants. Falls back to `viewBox`.
     */
    faviconViewBox?: string;
    shapes: BrandMarkShape[];
}

export interface BrandFaviconOptions {
    /** A small status dot drawn over the mark's bottom-right corner. */
    pip?: string | null;
    /**
     * The colour the pip is knocked out of so it stays legible at 16px: the
     * tab strip's background, not the page's.
     */
    pipBackground?: string;
}

function attrsToString(attrs: Record<string, string | number>, color: string): string {
    return Object.entries(attrs)
        .map(([key, value]) => `${key}="${String(value).replace(/currentColor/g, color)}"`)
        .join(' ');
}

export function serializeBrandMarkShapes(shapes: BrandMarkShape[], color: string): string {
    return shapes.map((shape) => `<${shape.tag} ${attrsToString(shape.attrs, color)}/>`).join('');
}

function parseViewBox(viewBox: string): { x: number; y: number; width: number; height: number } {
    const [x = 0, y = 0, width = 64, height = 64] = viewBox.split(/[\s,]+/).map(Number);
    return { x, y, width, height };
}

/** The mark as a standalone SVG document in the given colour. */
export function brandMarkSvg(mark: BrandMark, color: string, options: BrandFaviconOptions = {}): string {
    const viewBox = mark.faviconViewBox ?? mark.viewBox;
    const box = parseViewBox(viewBox);
    // Pip radius and inset scale with the grid so a 64-unit and a 24-unit mark
    // wear the same dot at 16px.
    const radius = box.width * 0.17;
    const inset = box.width * 0.2;
    const pip = options.pip
        ? `<circle cx="${box.x + box.width - inset}" cy="${box.y + box.height - inset}" r="${radius}" fill="${options.pip}" stroke="${options.pipBackground ?? '#ffffff'}" stroke-width="${radius * 0.36}"/>`
        : '';

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="${color}">${serializeBrandMarkShapes(mark.shapes, color)}${pip}</svg>`;
}

export function brandMarkDataUri(mark: BrandMark, color: string, options: BrandFaviconOptions = {}): string {
    return `data:image/svg+xml,${encodeURIComponent(brandMarkSvg(mark, color, options))}`;
}
