import { type SettingsNavSection, SettingsShell, TextInput, Toggle } from '@geocodio/console-ui';
import type React from 'react';
import { useState } from 'react';
import { href, routePath } from '../paths';

function Dot({ tone }: { tone: string }) {
    return <span aria-hidden="true" className={`inline-block h-[15px] w-[15px] shrink-0 rounded-full ${tone}`} />;
}

const SECTIONS: SettingsNavSection[] = [
    {
        title: 'Personal',
        items: [
            {
                slug: 'profile',
                href: href('/settings'),
                label: 'Profile',
                icon: <Dot tone="bg-accent" />,
                description: 'Your personal signature, appended to everything you send.',
                keywords: ['signature', 'email', 'me'],
                rows: [
                    { id: 'signature', label: 'Signature', keywords: ['sign-off', 'footer'] },
                    { id: 'desktop-app', label: 'Desktop app', keywords: ['download', 'macos'] },
                ],
            },
            {
                slug: 'notifications',
                href: href('/settings/notifications'),
                label: 'Notifications',
                icon: <Dot tone="bg-warn" />,
                description: 'Choose which events reach you, on which channels.',
                keywords: ['alerts', 'push', 'slack'],
            },
        ],
    },
    {
        title: 'AI',
        items: [
            {
                slug: 'prompts',
                href: href('/settings/prompts'),
                label: 'Prompts & models',
                icon: <Dot tone="bg-info" />,
                description: 'The models and system prompts behind AI suggestions.',
                keywords: ['llm', 'model', 'ai'],
                rows: [
                    { id: 'model-drafting', label: 'Drafting model', keywords: ['opus'] },
                    { id: 'model-triage', label: 'Triage model', keywords: ['haiku'] },
                    { id: 'automation-draft-only-support', label: 'Draft only for support requests', keywords: ['draft', 'automation'] },
                ],
            },
        ],
    },
    {
        title: 'Workspace',
        items: [
            {
                slug: 'users',
                href: href('/settings/users'),
                label: 'Users & roles',
                icon: <Dot tone="bg-ok" />,
                description: 'Who can sign in and what they can do.',
                keywords: ['roles', 'permissions', 'admin'],
            },
        ],
    },
];

const SLUG_BY_PATH: Record<string, string> = {
    '/settings': 'profile',
    '/settings/notifications': 'notifications',
    '/settings/prompts': 'prompts',
    '/settings/users': 'users',
};

function Row({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
    return (
        <div id={id} data-testid={`row-${id}`} className="flex items-center justify-between gap-4 border-b border-hair py-3 last:border-b-0">
            <span className="text-[13px] text-body">{label}</span>
            {children}
        </div>
    );
}

function ProfilePage() {
    const [signature, setSignature] = useState('— Mathias');
    return (
        <div data-testid="settings-page-profile">
            <Row id="signature" label="Signature">
                <TextInput value={signature} onChange={(event) => setSignature(event.target.value)} className="w-56" />
            </Row>
            <Row id="desktop-app" label="Desktop app">
                <span className="text-[12px] text-muted">Not installed</span>
            </Row>
        </div>
    );
}

function PromptsPage() {
    const [autoTriage, setAutoTriage] = useState(true);
    return (
        <div data-testid="settings-page-prompts">
            <Row id="model-drafting" label="Drafting model">
                <span className="text-[12px] text-muted">claude-opus</span>
            </Row>
            <div className="h-[140vh]" />
            <Row id="model-triage" label="Triage model">
                <span className="text-[12px] text-muted">claude-haiku</span>
            </Row>
            <Row id="automation-draft-only-support" label="Draft only for support requests">
                <Toggle checked={autoTriage} onCheckedChange={setAutoTriage} label="Draft only for support requests" />
            </Row>
        </div>
    );
}

function PlaceholderPage({ slug }: { slug: string }) {
    return (
        <p data-testid={`settings-page-${slug}`} className="text-[13px] text-muted">
            Nothing to configure here in the playground.
        </p>
    );
}

export function SettingsRoute() {
    const currentPath = window.location.pathname;
    const slug = SLUG_BY_PATH[routePath()] ?? 'profile';
    const params = new URLSearchParams(window.location.search);

    return (
        <SettingsShell
            data-testid="settings-shell"
            sections={SECTIONS}
            slug={slug}
            currentPath={currentPath}
            backHref={href('/tokens')}
            {...(params.has('wide') ? { wide: true } : {})}
            {...(params.has('no-storage') ? { returnToStorageKey: null } : {})}
        >
            {slug === 'profile' && <ProfilePage />}
            {slug === 'prompts' && <PromptsPage />}
            {slug !== 'profile' && slug !== 'prompts' && <PlaceholderPage slug={slug} />}
        </SettingsShell>
    );
}
