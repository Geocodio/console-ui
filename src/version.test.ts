import { expect, test } from 'vitest';
import { PACKAGE_VERSION } from './index';

test('exports a semver package version', () => {
    expect(PACKAGE_VERSION).toMatch(/^\d+\.\d+\.\d+/);
});
