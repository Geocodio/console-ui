import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    // Build then serve the real production output -- the theme system is
    // compiled by lightningcss at build time, so testing the dev server would
    // test something the apps never run.
    webServer: {
        command: 'npm run build && npx vite preview --port 4319',
        url: 'http://localhost:4319',
        reuseExistingServer: false,
        timeout: 120_000,
    },
    use: { baseURL: 'http://localhost:4319' },
});
