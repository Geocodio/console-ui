import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    // file: deps are symlinked; without this Vite may resolve a second copy of
    // React through the link and blow up with "invalid hook call".
    resolve: { dedupe: ['react', 'react-dom'] },
    // Default cssMinify (lightningcss) lowers light-dark() into
    // var(--lightningcss-light/dark) pairs and emits the prefers-color-scheme
    // and [data-theme] rules alongside it. That is correct and intentional --
    // verified in-browser across system light/dark and both attribute
    // overrides. Do not switch minifiers to keep the literal function in the
    // output; the compiled form is what ships.
});
