import { expect, test } from 'vitest';
import {
    findSettingsNavItem,
    type SettingsNavSection,
    searchSettingsNav,
    settingsSearchHitHref,
} from './searchSettingsNav';

const SECTIONS: SettingsNavSection[] = [
    {
        title: 'Personal',
        items: [
            {
                slug: 'profile',
                href: '/settings/profile',
                label: 'Profile',
                keywords: ['signature', 'me'],
                rows: [
                    { id: 'signature', label: 'Signature', keywords: ['sign-off', 'footer'] },
                    { id: 'desktop-app', label: 'Desktop app', keywords: ['download'] },
                ],
            },
            { slug: 'notifications', href: '/settings/notifications', label: 'Notifications', keywords: ['alerts'] },
        ],
    },
    {
        title: 'AI',
        items: [
            {
                slug: 'prompts',
                href: '/settings/prompts',
                label: 'Prompts & models',
                rows: [{ id: 'automation-draft-only-support', label: 'Draft only for support requests', keywords: ['draft'] }],
            },
        ],
    },
];

test('an empty or whitespace query yields no hits', () => {
    expect(searchSettingsNav(SECTIONS, '')).toEqual([]);
    expect(searchSettingsNav(SECTIONS, '   ')).toEqual([]);
});

test('matches item labels case-insensitively and preserves section order', () => {
    const hits = searchSettingsNav(SECTIONS, 'PRO');
    expect(hits.map((hit) => hit.item.slug)).toEqual(['profile', 'prompts']);
    expect(hits.every((hit) => hit.itemMatch)).toBe(true);
});

test('matches item keywords', () => {
    const hits = searchSettingsNav(SECTIONS, 'alert');
    expect(hits.map((hit) => hit.item.slug)).toEqual(['notifications']);
});

test('a row-only match surfaces the item with just the matching rows', () => {
    const hits = searchSettingsNav(SECTIONS, 'footer');
    expect(hits).toHaveLength(1);
    expect(hits[0]?.item.slug).toBe('profile');
    expect(hits[0]?.itemMatch).toBe(false);
    expect(hits[0]?.rowHits.map((row) => row.id)).toEqual(['signature']);
});

test('an item match still lists the rows that match too', () => {
    const hits = searchSettingsNav(SECTIONS, 'signature');
    expect(hits[0]?.itemMatch).toBe(true);
    expect(hits[0]?.rowHits.map((row) => row.id)).toEqual(['signature']);
});

test('the Enter target is the row deep link only when the item itself did not match', () => {
    const [rowOnly] = searchSettingsNav(SECTIONS, 'draft');
    expect(rowOnly && settingsSearchHitHref(rowOnly)).toBe('/settings/prompts#automation-draft-only-support');

    const [itemAndRow] = searchSettingsNav(SECTIONS, 'signature');
    expect(itemAndRow && settingsSearchHitHref(itemAndRow)).toBe('/settings/profile');
});

test('nothing matches an unknown term', () => {
    expect(searchSettingsNav(SECTIONS, 'zzz')).toEqual([]);
});

test('findSettingsNavItem looks across sections and reports a miss as undefined', () => {
    expect(findSettingsNavItem(SECTIONS, 'prompts')?.href).toBe('/settings/prompts');
    expect(findSettingsNavItem(SECTIONS, 'nope')).toBeUndefined();
});
