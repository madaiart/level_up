import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

// Resolve paths relative to this config file (ESM has no __dirname).
const here = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: here,
  cacheDir: '../../node_modules/.vite/apps/api-e2e',
  test: {
    name: 'api-e2e',
    environment: 'node',
    include: ['src/**/__tests__/**/*.{spec,test}.ts'],
    globalSetup: ['src/support/global-setup.ts'],
    setupFiles: ['src/support/test-setup.ts'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reportsDirectory: '../../coverage/api-e2e',
    },
  },
});
