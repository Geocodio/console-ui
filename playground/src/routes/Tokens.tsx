import { PACKAGE_VERSION } from '@geocodio/console-ui';

const SURFACES = [
    { name: 'app', css: 'var(--bg)' },
    { name: 'sidebar', css: 'var(--sidebar)' },
    { name: 'panel', css: 'var(--panel)' },
    { name: 'panel-2', css: 'var(--panel-2)' },
] as const;

/*
 * Full class strings, not `bg-${name}-soft`. Tailwind finds classes by
 * scanning source text, so a template literal produces nothing at all -- the
 * swatches would render unstyled and look exactly like a broken token layer.
 * The package's own `Badge` uses this same static-map shape.
 */
const SEMANTIC: ReadonlyArray<{ name: string; className: string }> = [
    { name: 'ok', className: 'bg-ok-soft text-ok' },
    { name: 'warn', className: 'bg-warn-soft text-warn' },
    { name: 'fail', className: 'bg-fail-soft text-fail' },
    { name: 'info', className: 'bg-info-soft text-info' },
    { name: 'idle', className: 'bg-idle-soft text-idle' },
];

export function Tokens() {
    return (
        <div className="text-body">
            <header className="mb-8 flex items-baseline gap-4">
                <h1 className="text-[21px] font-semibold">console-ui</h1>
                <span className="font-mono text-[12px] text-faint">v{PACKAGE_VERSION}</span>
            </header>

            <section className="mb-8">
                <h2 className="mb-2 text-[14px] font-semibold">Surfaces</h2>
                <div className="flex gap-3">
                    {SURFACES.map((surface) => (
                        <div key={surface.name} className="rounded-card border border-hair p-4 text-[12px]" style={{ background: surface.css }}>
                            {surface.name}
                        </div>
                    ))}
                </div>
            </section>

            <section className="mb-8">
                <h2 className="mb-2 text-[14px] font-semibold">Semantic</h2>
                <div className="flex gap-3">
                    {SEMANTIC.map((tone) => (
                        <span key={tone.name} className={`rounded-chip px-2 py-0.5 text-[11px] font-semibold ${tone.className}`}>
                            {tone.name}
                        </span>
                    ))}
                </div>
            </section>

            <section className="mb-8">
                <h2 className="mb-2 text-[14px] font-semibold">Type</h2>
                <p className="text-body">IBM Plex Sans renders this line.</p>
                <p className="font-mono text-muted">IBM Plex Mono renders this one — 0123456789.</p>
            </section>

            <section>
                <h2 className="mb-2 text-[14px] font-semibold">Elevation</h2>
                <div className="flex gap-4">
                    <div className="rounded-card bg-panel p-4 text-[12px] shadow-card">shadow-card</div>
                    <div className="rounded-card bg-panel p-4 text-[12px] shadow-overlay">shadow-overlay</div>
                </div>
            </section>
        </div>
    );
}
