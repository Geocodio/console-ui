import type React from 'react';

/** An individually searchable row on a settings page -- search deep-links to `${href}#${id}`. */
export interface SettingsNavRow {
    id: string;
    label: string;
    keywords?: string[];
}

export interface SettingsNavItem {
    slug: string;
    href: string;
    label: string;
    /** Shown under the page title in the shell's header. */
    description?: string;
    /** Any 15px mark; the shell sizes nothing here. Pass the app's own icon element. */
    icon?: React.ReactNode;
    /** Lower-case terms matched by `searchSettingsNav` in addition to `label`. */
    keywords?: string[];
    rows?: SettingsNavRow[];
}

export interface SettingsNavSection {
    title: string;
    items: SettingsNavItem[];
}

export interface SettingsSearchHit {
    item: SettingsNavItem;
    /** True when the query matched the item itself, not only one of its rows. */
    itemMatch: boolean;
    rowHits: SettingsNavRow[];
}

function matches(label: string, keywords: string[] | undefined, query: string): boolean {
    return label.toLowerCase().includes(query) || (keywords ?? []).some((keyword) => keyword.toLowerCase().includes(query));
}

/**
 * An item is a hit when the query matches its label/keywords or any of its
 * rows'; the row hits are what the shell renders as deep links. Section order
 * is preserved and an empty or whitespace query yields no hits, which is how
 * the shell tells "browsing" from "searching".
 */
export function searchSettingsNav(sections: SettingsNavSection[], query: string): SettingsSearchHit[] {
    const term = query.trim().toLowerCase();
    if (term === '') {
        return [];
    }
    const hits: SettingsSearchHit[] = [];
    for (const section of sections) {
        for (const item of section.items) {
            const itemMatch = matches(item.label, item.keywords, term);
            const rowHits = (item.rows ?? []).filter((row) => matches(row.label, row.keywords, term));
            if (itemMatch || rowHits.length > 0) {
                hits.push({ item, itemMatch, rowHits });
            }
        }
    }
    return hits;
}

/**
 * The URL the search box's Enter key visits for the top hit: the item itself
 * when its own label/keywords matched, otherwise the first matching row's
 * deep link.
 */
export function settingsSearchHitHref(hit: SettingsSearchHit): string {
    const firstRow = hit.rowHits[0];
    if (!hit.itemMatch && firstRow) {
        return `${hit.item.href}#${firstRow.id}`;
    }
    return hit.item.href;
}

export function findSettingsNavItem(sections: SettingsNavSection[], slug: string): SettingsNavItem | undefined {
    for (const section of sections) {
        const item = section.items.find((candidate) => candidate.slug === slug);
        if (item) {
            return item;
        }
    }
    return undefined;
}
